import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { scrapeTikTokProfile } from '@/lib/tiktok-scraper';
import { calculateAlignment, TikTokProfileAnalysis } from '@/lib/tiktok-analyzer';
import { getCachedProfile, saveProfile, listCachedProfiles, normalizeUsername } from '@/lib/scraped-store';
import { sanitizeString } from '@/lib/validate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface DiscoverMatch {
  username: string;
  nickname: string;
  followers: number;
  niche: string;
  bio: string;
  verified: boolean;
  tiktokVerified: boolean;
  source: 'registered' | 'scraped';
  overallAlignmentScore: number;
  alignmentTier: string;
  engagementRate: number;
  influencerTier: string;
  profileId?: string;
  avatarUrl?: string;
}

function scoreMatch(
  profile: TikTokProfileAnalysis,
  businessDescription: string,
  targetNiche?: string
): { score: number; tier: string; alignment: ReturnType<typeof calculateAlignment> } {
  const alignment = calculateAlignment(
    profile.videoSamples.map(v => v.caption),
    profile.bio,
    businessDescription
  );

  let score = Math.round(alignment.alignmentScorePct);

  if (targetNiche && targetNiche !== 'Все ниши') {
    const nicheLower = targetNiche.toLowerCase();
    const profileNiche = profile.contentIntelligence.primaryNiche.toLowerCase();
    if (profileNiche.includes(nicheLower) || nicheLower.includes(profileNiche.split(' ')[0])) {
      score += 15;
    }
  }

  if (profile.verified) score += 5;
  if (profile.metrics.followers >= 100_000) score += 5;

  score = Math.min(Math.max(score, 0), 99);

  let tier = 'Высокое совпадение 🔥';
  if (score < 75) tier = 'Умеренное совпадение ⚡';
  if (score < 50) tier = 'Базовое совпадение ⚠️';

  return { score, tier, alignment };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessDescription,
      targetNiche,
      budget,
      tiktokUsernames = [],
      includeRegistered = true,
      userId
    } = body;

    if (!businessDescription) {
      return NextResponse.json({ error: 'businessDescription is required' }, { status: 400 });
    }

    const cleanDesc = sanitizeString(businessDescription, 1000);
    const matches: DiscoverMatch[] = [];
    const scrapedUsernames = new Set<string>();

    // 1. Scrape requested TikTok usernames
    const usernamesToScrape = (tiktokUsernames as string[])
      .map(u => normalizeUsername(u))
      .filter(Boolean)
      .slice(0, 10);

    for (const username of usernamesToScrape) {
      scrapedUsernames.add(username);
      let profile = await scrapeTikTokProfile(username);
      if (!profile) profile = await getCachedProfile(username);
      if (profile) {
        await saveProfile(username, profile, userId);
        const { score, tier } = scoreMatch(profile, cleanDesc, targetNiche);
        matches.push({
          username: profile.username,
          nickname: profile.nickname,
          followers: profile.metrics.followers,
          niche: profile.contentIntelligence.primaryNiche,
          bio: profile.bio,
          verified: profile.verified,
          tiktokVerified: profile.verified,
          source: 'scraped',
          overallAlignmentScore: score,
          alignmentTier: tier,
          engagementRate: profile.metrics.engagementRate,
          influencerTier: profile.metrics.influencerTier,
          avatarUrl: profile.avatarUrl
        });
      }
    }

    // 2. Include registered influencers from Supabase
    if (includeRegistered && isSupabaseConfigured) {
      const { data: profiles } = await supabase
        .from('influencer_profiles')
        .select('*, users!user_id(*), social_accounts(*)');

      for (const inf of profiles || []) {
        const user = inf.users || {};
        const socials = Array.isArray(inf.social_accounts) ? inf.social_accounts : [];
        const primary = socials.find((s: any) => s.platform === 'TIKTOK') || socials[0] || {};
        const handle = (primary.handle || '').replace(/^@/, '').toLowerCase();

        if (handle && scrapedUsernames.has(handle)) continue;

        const tiktokVerified = socials.some(
          (s: any) => s.platform === 'TIKTOK' && s.access_token && s.follower_count > 0
        );

        const registeredProfile: TikTokProfileAnalysis = {
          username: primary.handle || `@${handle}`,
          nickname: user.full_name || 'Инфлюенсер',
          bio: inf.bio || '',
          verified: tiktokVerified,
          avatarUrl: user.avatar_url || '',
          metrics: {
            followers: Number(primary.follower_count || 0),
            following: 0,
            totalLikes: 0,
            totalVideos: 0,
            avgLikesPerVideo: 0,
            influencerTier: Number(primary.follower_count || 0) >= 1_000_000 ? 'Mega'
              : Number(primary.follower_count || 0) >= 100_000 ? 'Macro' : 'Micro',
            engagementRate: Number(primary.engagement_rate || 0)
          },
          contentIntelligence: {
            primaryNiche: Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
            topKeywords: [],
            topHashtags: [],
            contentSummary: inf.bio || ''
          },
          videoSamples: [],
          scrapedAt: new Date().toISOString(),
          source: 'cache'
        };

        const { score, tier } = scoreMatch(registeredProfile, cleanDesc, targetNiche);
        const finalScore = Math.min(score + (tiktokVerified ? 10 : 0), 99);

        matches.push({
          username: registeredProfile.username,
          nickname: registeredProfile.nickname,
          followers: registeredProfile.metrics.followers,
          niche: registeredProfile.contentIntelligence.primaryNiche,
          bio: registeredProfile.bio,
          verified: tiktokVerified,
          tiktokVerified,
          source: 'registered',
          overallAlignmentScore: finalScore,
          alignmentTier: tier,
          engagementRate: registeredProfile.metrics.engagementRate,
          influencerTier: registeredProfile.metrics.influencerTier,
          profileId: inf.id,
          avatarUrl: registeredProfile.avatarUrl
        });
      }
    }

    // 3. Include previously scraped profiles from cache
    const cached = await listCachedProfiles(20);
    for (const profile of cached) {
      const key = normalizeUsername(profile.username);
      if (scrapedUsernames.has(key)) continue;
      if (matches.some(m => normalizeUsername(m.username) === key)) continue;

      const { score, tier } = scoreMatch(profile, cleanDesc, targetNiche);
      matches.push({
        username: profile.username,
        nickname: profile.nickname,
        followers: profile.metrics.followers,
        niche: profile.contentIntelligence.primaryNiche,
        bio: profile.bio,
        verified: profile.verified,
        tiktokVerified: profile.verified,
        source: 'scraped',
        overallAlignmentScore: score,
        alignmentTier: tier,
        engagementRate: profile.metrics.engagementRate,
        influencerTier: profile.metrics.influencerTier,
        avatarUrl: profile.avatarUrl
      });
    }

    matches.sort((a, b) => b.overallAlignmentScore - a.overallAlignmentScore);

    let filtered = matches;
    if (targetNiche && targetNiche !== 'Все ниши') {
      filtered = matches.filter(
        m => m.niche.toLowerCase().includes(targetNiche.toLowerCase()) || m.overallAlignmentScore >= 40
      );
    }

    return NextResponse.json({
      success: true,
      analyzedAt: new Date().toISOString(),
      businessSummary: cleanDesc.slice(0, 120),
      budget: budget || null,
      targetNiche: targetNiche || 'Все ниши',
      totalFound: filtered.length,
      matches: filtered.slice(0, 20)
    });
  } catch (error: any) {
    console.error('Discover error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
