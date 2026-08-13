import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { scrapeTikTokProfile } from '@/lib/tiktok-scraper';
import { calculateAlignment, TikTokProfileAnalysis, categorizeContent, NICHE_DICTIONARY } from '@/lib/tiktok-analyzer';
import { analyzeInfluencerMatches, GeminiMatchCandidate } from '@/lib/gemini';
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
  source: 'registered';
  overallAlignmentScore: number;
  alignmentTier: string;
  engagementRate: number;
  influencerTier: string;
  profileId: string;
  avatarUrl?: string;
  aiAnalysisStatus: 'verified' | 'unavailable';
  aiRecommendation?: string;
  aiEvidence?: string[];
  aiMissingInformation?: string[];
  aiScores?: {
    nicheFit: number;
    audienceFit: number;
    contentFit: number;
    commercialFit: number;
  };
}

interface EvidenceVideo {
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

interface OAuthVideo {
  videoId: string;
  caption: string;
  videoUrl: string;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
}

function baseScore(profile: TikTokProfileAnalysis, brief: string, targetNiche?: string) {
  const alignment = calculateAlignment(
    profile.videoSamples.map(video => video.caption),
    profile.bio,
    brief
  );
  let score = Math.round(alignment.alignmentScorePct);
  if (targetNiche && targetNiche !== 'Все ниши' && profile.contentIntelligence.primaryNiche.toLowerCase().includes(targetNiche.toLowerCase())) {
    score += 15;
  }
  return { score: Math.min(99, Math.max(0, score)), alignment };
}

function tier(score: number) {
  if (score >= 85) return 'Отличное совпадение';
  if (score >= 70) return 'Хорошее совпадение';
  if (score >= 40) return 'Возможное совпадение';
  return 'Низкое совпадение';
}

function nicheKeywords(label: string) {
  const normalized = label.toLowerCase();
  const entry = Object.entries(NICHE_DICTIONARY).find(([name]) => {
    const namePart = name.toLowerCase().split(' & ')[0];
    return normalized.includes(namePart) || namePart.includes(normalized);
  });
  if (entry) return entry[1];
  if (normalized.includes('it') || normalized.includes('tech')) return NICHE_DICTIONARY['Tech & Software'];
  if (normalized.includes('бизнес') || normalized.includes('финанс')) return NICHE_DICTIONARY['Business & Finance'];
  if (normalized.includes('фитнес') || normalized.includes('спорт')) return NICHE_DICTIONARY['Fitness & Health'];
  if (normalized.includes('красот') || normalized.includes('beauty')) return NICHE_DICTIONARY['Beauty & Skincare'];
  return [];
}

function hasRelevantContent(profile: TikTokProfileAnalysis, businessBrief: string, targetNiche: string, score: number) {
  if (score < 30) return false;
  const profileText = [
    profile.contentIntelligence.primaryNiche,
    profile.contentIntelligence.topKeywords.join(' '),
    profile.contentIntelligence.topHashtags.join(' '),
    profile.bio,
    ...profile.videoSamples.map(video => video.caption)
  ].join(' ').toLowerCase();
  const requestedNicheKeywords = nicheKeywords(targetNiche === 'Все ниши' ? businessBrief : targetNiche);
  if (requestedNicheKeywords.length > 0 && !requestedNicheKeywords.some(keyword => profileText.includes(keyword))) return false;
  return true;
}

function asProfile(influencer: any, user: any, social: any, scraped: TikTokProfileAnalysis | null): TikTokProfileAnalysis {
  const stored = influencer.ai_persona_config?.tiktokVideoAnalysis;
  const storedVideos = Array.isArray(stored?.videos) ? stored.videos : [];
  const oauthVideos: OAuthVideo[] = storedVideos.map((video: any) => ({
    videoId: String(video.id || ''),
    caption: (String(video.title || '') + ' ' + String(video.description || '')).trim(),
    videoUrl: video.shareUrl || video.embedLink || '',
    plays: Number(video.viewCount || 0),
    likes: Number(video.likeCount || 0),
    comments: Number(video.commentCount || 0),
    shares: Number(video.shareCount || 0)
  }));
  if (scraped) {
    return {
      ...scraped,
      verified: true,
      bio: scraped.bio || influencer.bio || '',
      avatarUrl: scraped.avatarUrl || user.avatar_url || '',
      videoSamples: [...scraped.videoSamples, ...oauthVideos].slice(0, 20)
    };
  }
  const followers = Number(social.follower_count || 0);
  const videoSamples = oauthVideos;
  const content = categorizeContent(videoSamples.map(video => video.caption));
  return {
    username: social.handle || '@creator',
    nickname: user.full_name || 'Инфлюенсер',
    bio: influencer.bio || '',
    verified: true,
    avatarUrl: user.avatar_url || '',
    metrics: {
      followers,
      following: 0,
      totalLikes: videoSamples.reduce((sum, video) => sum + video.likes, 0),
      totalVideos: videoSamples.length,
      avgLikesPerVideo: videoSamples.length ? Math.round(videoSamples.reduce((sum, video) => sum + video.likes, 0) / videoSamples.length) : 0,
      influencerTier: followers >= 1000000 ? 'Mega' : followers >= 100000 ? 'Macro' : followers >= 10000 ? 'Micro' : 'Nano',
      engagementRate: Number(social.engagement_rate || 0)
    },
    contentIntelligence: {
      primaryNiche: stored?.primaryNiche || content.primaryNiche || influencer.niches?.join(', ') || 'Разное',
      topKeywords: stored?.topKeywords || content.topKeywords,
      topHashtags: stored?.topHashtags || content.topHashtags,
      contentSummary: 'Анализ построен на данных TikTok OAuth и публичных видео.'
    },
    videoSamples,
    scrapedAt: new Date().toISOString(),
    source: 'cache'
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessDescription = sanitizeString(body.businessDescription || '', 1000);
    if (!businessDescription) return NextResponse.json({ error: 'businessDescription is required' }, { status: 400 });
    if (!isSupabaseConfigured) return NextResponse.json({ success: false, error: 'Supabase is not configured' }, { status: 503 });

    const targetNiche = sanitizeString(body.targetNiche || 'Все ниши', 100);
    const budget = sanitizeString(body.budget || 'Не указан', 100);
    const audience = sanitizeString(body.audience || 'Не указана', 500);
    const campaignGoal = sanitizeString(body.campaignGoal || 'Не указана', 300);
    const deliverables = sanitizeString(body.deliverables || 'Не указаны', 300);
    const tone = sanitizeString(body.tone || 'Не указан', 200);
    const location = sanitizeString(body.location || 'Не указана', 200);
    const requested = new Set((Array.isArray(body.tiktokUsernames) ? body.tiktokUsernames : [])
      .map((value: string) => value.replace(/^@/, '').trim().toLowerCase()).filter(Boolean));

    const { data: profiles, error } = await supabase
      .from('influencer_profiles')
      .select('*, users!user_id(*), social_accounts(*)');
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

    const matches: DiscoverMatch[] = [];
    const candidates: GeminiMatchCandidate[] = [];

    for (const influencer of profiles || []) {
      const user = influencer.users || {};
      const socials = Array.isArray(influencer.social_accounts) ? influencer.social_accounts : [];
      const social = socials.find((item: any) => item.platform === 'TIKTOK' && item.access_token);
      if (!social) continue;

      const handle = String(social.handle || '').replace(/^@/, '').toLowerCase();
      if (requested.size > 0 && !requested.has(handle)) continue;

      let scraped: TikTokProfileAnalysis | null = null;
      try {
        scraped = handle ? await scrapeTikTokProfile(handle) : null;
      } catch (scrapeError) {
        console.warn('Linked TikTok scrape warning:', scrapeError);
      }

      const profile = asProfile(influencer, user, social, scraped);
      const brief = [businessDescription, targetNiche, audience, campaignGoal, deliverables, tone, location].join(' ');
      const { score } = baseScore(profile, brief, targetNiche);
      if (!hasRelevantContent(profile, brief, targetNiche, score)) continue;
      const videos: EvidenceVideo[] = profile.videoSamples.slice(0, 20).map(video => ({
        title: video.caption.slice(0, 150),
        description: video.caption.slice(0, 500),
        views: video.plays,
        likes: video.likes,
        comments: video.comments,
        shares: video.shares
      }));

      candidates.push({
        username: profile.username,
        nickname: profile.nickname,
        bio: profile.bio,
        niche: profile.contentIntelligence.primaryNiche,
        followers: profile.metrics.followers,
        country: influencer.primary_country || '',
        videos
      });
      matches.push({
        username: profile.username,
        nickname: profile.nickname,
        followers: profile.metrics.followers,
        niche: profile.contentIntelligence.primaryNiche,
        bio: profile.bio,
        verified: true,
        tiktokVerified: true,
        source: 'registered',
        overallAlignmentScore: score,
        alignmentTier: tier(score),
        engagementRate: profile.metrics.engagementRate,
        influencerTier: profile.metrics.influencerTier,
        profileId: influencer.id,
        avatarUrl: profile.avatarUrl,
        aiAnalysisStatus: 'unavailable'
      });
    }

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        analyzedAt: new Date().toISOString(),
        totalFound: 0,
        matches: [],
        message: 'Нет инфлюенсеров с подтверждённым TikTok OAuth аккаунтом.'
      });
    }

    const ai = await analyzeInfluencerMatches({
      businessDescription,
      targetNiche,
      budget,
      audience,
      campaignGoal,
      deliverables,
      tone,
      location,
      candidates
    });
    const aiByUsername = new Map(ai.results.map(result => [result.username.replace(/^@/, '').toLowerCase(), result]));

    const finalMatches = matches.map(match => {
      const result = aiByUsername.get(match.username.replace(/^@/, '').toLowerCase());
      if (!result) return { ...match, aiAnalysisStatus: 'unavailable' as const };
      return {
        ...match,
        overallAlignmentScore: result.score,
        alignmentTier: tier(result.score),
        aiAnalysisStatus: 'verified' as const,
        aiRecommendation: result.recommendation,
        aiEvidence: result.evidence,
        aiMissingInformation: result.missingInformation,
        aiScores: {
          nicheFit: result.nicheFit,
          audienceFit: result.audienceFit,
          contentFit: result.contentFit,
          commercialFit: result.commercialFit
        }
      };
    }).sort((a, b) => b.overallAlignmentScore - a.overallAlignmentScore);

    return NextResponse.json({
      success: true,
      analyzedAt: new Date().toISOString(),
      businessSummary: businessDescription.slice(0, 120),
      totalFound: finalMatches.length,
      aiAvailable: ai.available,
      aiError: ai.available ? null : ai.error,
      matches: finalMatches.slice(0, 20)
    });
  } catch (error: any) {
    console.error('Discover error:', error);
    return NextResponse.json({ success: false, error: 'Influencer analysis failed' }, { status: 500 });
  }
}
