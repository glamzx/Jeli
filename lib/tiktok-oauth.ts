export function getTikTokOAuthConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  const redirectUri = process.env.TIKTOK_REDIRECT_URI?.trim();

  // Default to basic scope only — extra scopes must be enabled in TikTok Developer Portal
  const scopes = (process.env.TIKTOK_SCOPES || 'user.info.basic')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return {
    clientKey,
    clientSecret,
    redirectUri,
    scopes,
    scopeString: scopes.join(','),
    isConfigured: Boolean(clientKey && redirectUri),
    isFullyConfigured: Boolean(clientKey && clientSecret && redirectUri)
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
