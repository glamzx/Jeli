export const NICHE_DICTIONARY: Record<string, string[]> = {
  'Tech & Software': ['code', 'tech', 'coding', 'developer', 'software', 'ai', 'python', 'app', 'gadget', 'computer', 'saas', 'cyber', 'web', 'data', 'robot', 'crypto'],
  'Fitness & Health': ['workout', 'gym', 'fitness', 'bodybuilding', 'health', 'exercise', 'diet', 'protein', 'training', 'muscle', 'abs', 'fit', 'cardio', 'run', 'sport'],
  'Beauty & Skincare': ['makeup', 'skincare', 'beauty', 'hair', 'cosmetics', 'glow', 'dermatology', 'fashion', 'style', 'outfit', 'glam', 'routine', 'skin'],
  'Business & Finance': ['business', 'money', 'investing', 'stocks', 'finance', 'entrepreneur', 'startup', 'marketing', 'realestate', 'wealth', 'sales'],
  'Gaming & Esports': ['gaming', 'gamer', 'playstation', 'xbox', 'pcgaming', 'streamer', 'twitch', 'gameplay', 'fortnite', 'minecraft', 'esports', 'nintendo'],
  'Food & Cooking': ['food', 'recipe', 'cooking', 'chef', 'eat', 'delicious', 'kitchen', 'bake', 'dinner', 'yummy', 'snack', 'restaurant', 'taste'],
  'Travel & Lifestyle': ['travel', 'vlog', 'explore', 'vacation', 'trip', 'adventure', 'lifestyle', 'nature', 'hotel', 'beach', 'city', 'tour'],
  'Comedy & Entertainment': ['funny', 'comedy', 'joke', 'lol', 'meme', 'prank', 'humor', 'react', 'entertainment', 'challenge', 'viral']
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'this', 'that',
  'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'it', 'you',
  'we', 'they', 'me', 'him', 'them', 'what', 'which', 'who', 'whom', 'how', 'when',
  'where', 'why', 'not', 'no', 'just', 'so', 'more', 'like', 'get', 'got', 'can', 'will',
  'video', 'content', 'tiktok', 'make', 'new', 'out', 'all', 'one'
]);

export interface VideoSample {
  videoId: string;
  caption: string;
  videoUrl: string;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface TikTokProfileAnalysis {
  username: string;
  nickname: string;
  bio: string;
  verified: boolean;
  avatarUrl: string;
  metrics: {
    followers: number;
    following: number;
    totalLikes: number;
    totalVideos: number;
    avgLikesPerVideo: number;
    influencerTier: 'Mega' | 'Macro' | 'Micro' | 'Nano';
    engagementRate: number;
  };
  contentIntelligence: {
    primaryNiche: string;
    topKeywords: string[];
    topHashtags: string[];
    contentSummary: string;
  };
  videoSamples: VideoSample[];
  scrapedAt: string;
  source: 'live' | 'cache' | 'catalog';
}

export interface AlignmentResult {
  alignmentScorePct: number;
  alignmentLevel: string;
  totalBusinessKeywords: number;
  matchedKeywordCount: number;
  matchedKeywords: { keyword: string; count: number }[];
}

function cleanText(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b[a-zA-Z]{3,}\b/g) || [];
  return words.filter(w => !STOP_WORDS.has(w));
}

function extractHashtags(text: string): string[] {
  if (!text) return [];
  return (text.toLowerCase().match(/#(\w+)/g) || []).map(h => h.slice(1));
}

export function categorizeContent(textCorpus: string[]): {
  primaryNiche: string;
  topKeywords: string[];
  topHashtags: string[];
} {
  const combinedText = textCorpus.join(' ');
  const words = cleanText(combinedText);
  const hashtags = extractHashtags(combinedText);
  const allTokens = [...words, ...hashtags];

  const nicheScores: Record<string, number> = {};
  for (const token of allTokens) {
    for (const [niche, keywords] of Object.entries(NICHE_DICTIONARY)) {
      if (keywords.includes(token)) {
        nicheScores[niche] = (nicheScores[niche] || 0) + 1;
      }
    }
  }

  const sortedNiches = Object.entries(nicheScores).sort((a, b) => b[1] - a[1]);
  const primaryNiche = sortedNiches[0]?.[0] || 'General Content';

  const wordCounts: Record<string, number> = {};
  for (const w of words) wordCounts[w] = (wordCounts[w] || 0) + 1;
  const topKeywords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  const hashtagCounts: Record<string, number> = {};
  for (const h of hashtags) hashtagCounts[h] = (hashtagCounts[h] || 0) + 1;
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => `#${tag}`);

  return { primaryNiche, topKeywords, topHashtags };
}

export function getInfluencerTier(followers: number): 'Mega' | 'Macro' | 'Micro' | 'Nano' {
  if (followers >= 1_000_000) return 'Mega';
  if (followers >= 100_000) return 'Macro';
  if (followers >= 10_000) return 'Micro';
  return 'Nano';
}

export function calculateAlignment(
  videoCaptions: string[],
  bio: string,
  businessRequest: string
): AlignmentResult {
  const businessTokens = [...new Set(cleanText(businessRequest))];
  if (businessTokens.length === 0) {
    return {
      alignmentScorePct: 0,
      alignmentLevel: 'No Alignment ❌ (Unrelated Content)',
      totalBusinessKeywords: 0,
      matchedKeywordCount: 0,
      matchedKeywords: []
    };
  }

  const combinedContent = `${bio} ${videoCaptions.join(' ')}`;
  const contentTokens = cleanText(combinedContent);
  const contentCounts: Record<string, number> = {};
  for (const t of contentTokens) contentCounts[t] = (contentCounts[t] || 0) + 1;

  const matchedKeywords: { keyword: string; count: number }[] = [];
  let totalMatchedOccurrences = 0;

  for (const token of businessTokens) {
    const count = contentCounts[token] || 0;
    if (count > 0) {
      matchedKeywords.push({ keyword: token, count });
      totalMatchedOccurrences += count;
    }
  }

  const coverageRatio = matchedKeywords.length / businessTokens.length;
  const densityScore = Math.min((totalMatchedOccurrences / Math.max(contentTokens.length, 1)) * 10, 1.0);
  const rawScore = (coverageRatio * 0.7 + densityScore * 0.3) * 100;
  const alignmentScorePct = Math.round(Math.min(Math.max(rawScore, 0), 100) * 100) / 100;

  let alignmentLevel: string;
  if (alignmentScorePct >= 50) alignmentLevel = 'High Alignment 🔥 (Strong Marketing Fit)';
  else if (alignmentScorePct >= 20) alignmentLevel = 'Moderate Alignment ⚡ (Potential Ambassador)';
  else if (alignmentScorePct > 0) alignmentLevel = 'Low Alignment ⚠️ (Limited Keyword Overlap)';
  else alignmentLevel = 'No Alignment ❌ (Unrelated Content)';

  return {
    alignmentScorePct,
    alignmentLevel,
    totalBusinessKeywords: businessTokens.length,
    matchedKeywordCount: matchedKeywords.length,
    matchedKeywords
  };
}

export function buildProfileAnalysis(
  user: Record<string, any>,
  stats: Record<string, any>,
  itemList: Record<string, any>[],
  source: 'live' | 'cache' | 'catalog' = 'live'
): TikTokProfileAnalysis {
  const username = user.uniqueId || '';
  const bio = user.signature || '';
  const followers = Number(stats.followerCount || 0);
  const following = Number(stats.followingCount || 0);
  const totalLikes = Number(stats.heartCount || 0);
  const totalVideos = Number(stats.videoCount || 0);

  const videoCaptions = [bio];
  const videoSamples: VideoSample[] = [];

  for (const item of itemList || []) {
    const caption = item.desc || '';
    if (caption) videoCaptions.push(caption);
    const vStats = item.stats || {};
    videoSamples.push({
      videoId: String(item.id || ''),
      caption,
      videoUrl: `https://www.tiktok.com/@${username}/video/${item.id}`,
      plays: Number(vStats.playCount || 0),
      likes: Number(vStats.diggCount || 0),
      comments: Number(vStats.commentCount || 0),
      shares: Number(vStats.shareCount || 0)
    });
  }

  const { primaryNiche, topKeywords, topHashtags } = categorizeContent(videoCaptions);
  const avgLikesPerVideo = totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0;
  const avgEngagement = videoSamples.length > 0
    ? videoSamples.reduce((sum, v) => sum + v.likes + v.comments, 0) / videoSamples.length
    : avgLikesPerVideo;
  const engagementRate = followers > 0
    ? Math.round((avgEngagement / followers) * 10000) / 100
    : 0;

  return {
    username: `@${username}`,
    nickname: user.nickname || username,
    bio,
    verified: Boolean(user.verified),
    avatarUrl: user.avatarMedium || user.avatarLarger || '',
    metrics: {
      followers,
      following,
      totalLikes,
      totalVideos,
      avgLikesPerVideo,
      influencerTier: getInfluencerTier(followers),
      engagementRate
    },
    contentIntelligence: {
      primaryNiche,
      topKeywords,
      topHashtags,
      contentSummary: `Influencer @${username} creates content primarily focused on ${primaryNiche}.`
    },
    videoSamples,
    scrapedAt: new Date().toISOString(),
    source
  };
}
