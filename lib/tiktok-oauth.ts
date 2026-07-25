export function getTikTokOAuthConfig() {
  const useSandbox = process.env.TIKTOK_USE_SANDBOX !== 'false';

  const clientKey = (
    useSandbox
      ? process.env.TIKTOK_SANDBOX_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY
      : process.env.TIKTOK_CLIENT_KEY
  )?.trim();

  const clientSecret = (
    useSandbox
      ? process.env.TIKTOK_SANDBOX_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET
      : process.env.TIKTOK_CLIENT_SECRET
  )?.trim();

  // TikTok docs examples use trailing slash; mismatch causes misleading client_key errors
  let redirectUri = (
    process.env.TIKTOK_REDIRECT_URI ||
    'https://jeli-six.vercel.app/api/v1/auth/tiktok/callback/'
  ).trim();

  if (!redirectUri.endsWith('/')) {
    redirectUri = `${redirectUri}/`;
  }

  const scopes = (process.env.TIKTOK_SCOPES || 'user.info.basic')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    clientKey,
    clientSecret,
    redirectUri,
    useSandbox,
    scopes,
    scopeString: scopes.join(','),
    isConfigured: Boolean(clientKey && redirectUri),
    isFullyConfigured: Boolean(clientKey && clientSecret && redirectUri),
    // Safe preview for diagnostics (never expose full secret)
    clientKeyPreview: clientKey ? `${clientKey.slice(0, 4)}...${clientKey.slice(-4)}` : null
  };
}

export function getUserInfoFields(scopes: string[]): string {
  const fields = new Set<string>(['open_id', 'display_name', 'avatar_url']);

  if (scopes.includes('user.info.profile')) {
    fields.add('username');
    fields.add('bio_description');
    fields.add('is_verified');
  }

  if (scopes.includes('user.info.stats')) {
    fields.add('follower_count');
    fields.add('following_count');
    fields.add('likes_count');
    fields.add('video_count');
  }

  return Array.from(fields).join(',');
}

export const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
export const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
export const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/';
