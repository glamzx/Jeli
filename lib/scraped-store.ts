import { supabaseAdmin, isSupabaseAdminConfigured } from './supabase';
import { TikTokProfileAnalysis } from './tiktok-analyzer';
import catalogData from '../jeli_influencer_catalog.json';

const memoryCache = new Map<string, { profile: TikTokProfileAnalysis; cachedAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function normalizeUsername(username: string): string {
  return username.replace(/^@/, '').trim().toLowerCase();
}

function catalogToProfile(entry: any): TikTokProfileAnalysis {
  const inf = entry.influencer || {};
  const metrics = inf.metrics || {};
  const ci = entry.content_intelligence || {};
  const username = (inf.username || '').replace(/^@/, '');

  return {
    username: inf.username?.startsWith('@') ? inf.username : `@${username}`,
    nickname: inf.nickname || username,
    bio: inf.bio || '',
    verified: Boolean(inf.verified),
    avatarUrl: inf.avatar_url || '',
    metrics: {
      followers: metrics.followers || 0,
      following: metrics.following || 0,
      totalLikes: metrics.total_likes || 0,
      totalVideos: metrics.total_videos || 0,
      avgLikesPerVideo: metrics.avg_likes_per_video || 0,
      influencerTier: metrics.influencer_tier || 'Micro',
      engagementRate: metrics.followers > 0
        ? Math.round(((metrics.avg_likes_per_video || 0) / metrics.followers) * 10000) / 100
        : 0
    },
    contentIntelligence: {
      primaryNiche: ci.primary_niche || 'General Content',
      topKeywords: ci.top_keywords || [],
      topHashtags: ci.top_hashtags || [],
      contentSummary: ci.content_summary || ''
    },
    videoSamples: (entry.video_samples || []).map((v: any) => ({
      videoId: String(v.video_id || ''),
      caption: v.caption || '',
      videoUrl: v.video_id ? `https://www.tiktok.com/@${username}/video/${v.video_id}` : '',
      plays: v.plays || 0,
      likes: v.likes || 0,
      comments: v.comments || 0,
      shares: 0
    })),
    scrapedAt: new Date().toISOString(),
    source: 'catalog'
  };
}

function getCatalogProfile(username: string): TikTokProfileAnalysis | null {
  const key = normalizeUsername(username);
  const entry = (catalogData as any[]).find(e => {
    const u = (e.influencer?.username || '').replace(/^@/, '').toLowerCase();
    return u === key;
  });
  return entry ? catalogToProfile(entry) : null;
}

export async function getCachedProfile(username: string): Promise<TikTokProfileAnalysis | null> {
  const key = normalizeUsername(username);

  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.cachedAt < CACHE_TTL_MS) {
    return { ...mem.profile, source: 'cache' };
  }

  if (isSupabaseAdminConfigured) {
    try {
      const { data } = await supabaseAdmin
        .from('scraped_influencers')
        .select('profile_data, scraped_at')
        .eq('username', key)
        .maybeSingle();

      if (data?.profile_data) {
        const profile = data.profile_data as TikTokProfileAnalysis;
        memoryCache.set(key, { profile, cachedAt: Date.now() });
        return { ...profile, source: 'cache' };
      }
    } catch {
      // Table may not exist yet — fall through
    }
  }

  return getCatalogProfile(username);
}

export async function saveProfile(
  username: string,
  profile: TikTokProfileAnalysis,
  scrapedBy?: string
): Promise<void> {
  const key = normalizeUsername(username);
  memoryCache.set(key, { profile, cachedAt: Date.now() });

  if (!isSupabaseAdminConfigured) return;

  try {
    await supabaseAdmin.from('scraped_influencers').upsert(
      {
        username: key,
        profile_data: profile,
        scraped_by: scrapedBy || null,
        scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'username' }
    );
  } catch {
    // Graceful — memory cache still works
  }
}

export async function listCachedProfiles(limit = 50): Promise<TikTokProfileAnalysis[]> {
  const profiles: TikTokProfileAnalysis[] = [];

  if (isSupabaseAdminConfigured) {
    try {
      const { data } = await supabaseAdmin
        .from('scraped_influencers')
        .select('profile_data')
        .order('scraped_at', { ascending: false })
        .limit(limit);

      if (data?.length) {
        return data.map(d => d.profile_data as TikTokProfileAnalysis);
      }
    } catch {
      // fall through
    }
  }

  for (const entry of catalogData as any[]) {
    profiles.push(catalogToProfile(entry));
  }

  for (const [, cached] of memoryCache) {
    profiles.push(cached.profile);
  }

  const seen = new Set<string>();
  return profiles.filter(p => {
    const key = normalizeUsername(p.username);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export { normalizeUsername, getCatalogProfile };
