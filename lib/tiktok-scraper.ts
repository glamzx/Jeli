import { buildProfileAnalysis, TikTokProfileAnalysis } from './tiktok-analyzer';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function parseRehydrationPayload(html: string): Record<string, any> | null {
  const patterns = [
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/,
    /<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        continue;
      }
    }
  }
  return null;
}

function extractUserDetail(data: Record<string, any>) {
  const defaultScope = data.__DEFAULT_SCOPE__ || {};
  const userDetail = defaultScope['webapp.user-detail'] || {};

  if (userDetail.userInfo?.user?.uniqueId) {
    return userDetail;
  }

  // SIGI_STATE fallback
  const userModule = data.UserModule?.users || {};
  const statsModule = data.UserModule?.stats || {};
  const firstKey = Object.keys(userModule)[0];
  if (firstKey) {
    return {
      userInfo: {
        user: userModule[firstKey],
        stats: statsModule[firstKey] || {}
      },
      itemList: data.ItemModule ? Object.values(data.ItemModule) : []
    };
  }

  return userDetail;
}

export async function scrapeTikTokProfile(username: string): Promise<TikTokProfileAnalysis | null> {
  const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
  if (!cleanUsername || !/^[a-z0-9_.]+$/.test(cleanUsername)) {
    return null;
  }

  const url = `https://www.tiktok.com/@${cleanUsername}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(25000)
    });

    if (!res.ok) {
      console.warn(`TikTok fetch failed for @${cleanUsername}: HTTP ${res.status}`);
      return null;
    }

    const html = await res.text();
    const data = parseRehydrationPayload(html);
    if (!data) {
      console.warn(`No rehydration payload found for @${cleanUsername}`);
      return null;
    }

    const userDetail = extractUserDetail(data);
    const userInfo = userDetail.userInfo || {};
    const user = userInfo.user || {};
    const stats = userInfo.stats || {};
    const itemList = userDetail.itemList || [];

    if (!user.uniqueId) {
      return null;
    }

    return buildProfileAnalysis(user, stats, itemList, 'live');
  } catch (error) {
    console.error(`TikTok scrape error for @${cleanUsername}:`, error);
    return null;
  }
}

export async function scrapeMultipleProfiles(
  usernames: string[],
  concurrency = 3
): Promise<{ username: string; profile: TikTokProfileAnalysis | null; error?: string }[]> {
  const results: { username: string; profile: TikTokProfileAnalysis | null; error?: string }[] = [];
  const queue = [...usernames];

  async function worker() {
    while (queue.length > 0) {
      const username = queue.shift();
      if (!username) break;
      const profile = await scrapeTikTokProfile(username);
      results.push({
        username,
        profile,
        error: profile ? undefined : 'Profile not found or scrape blocked'
      });
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, usernames.length) }, () => worker()));
  return results;
}
