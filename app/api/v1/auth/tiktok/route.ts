import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// TikTok OAuth 2.0 initiation — redirects user to TikTok authorization page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const returnTo = searchParams.get('returnTo') || 'dashboard';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !redirectUri) {
      return NextResponse.json(
        {
          error: 'TikTok API не настроен',
          message: 'Необходимо добавить TIKTOK_CLIENT_KEY и TIKTOK_REDIRECT_URI в переменные окружения Vercel.'
        },
        { status: 503 }
      );
    }

    // Generate CSRF state token with user ID embedded
    const statePayload = JSON.stringify({
      userId,
      returnTo: returnTo === 'settings' ? 'settings' : 'dashboard',
      nonce: crypto.randomUUID(),
      timestamp: Date.now()
    });
    const state = Buffer.from(statePayload).toString('base64url');

    // TikTok v2 OAuth authorization URL
    const scopes = ['user.info.basic', 'user.info.profile', 'user.info.stats'];
    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', clientKey);
    authUrl.searchParams.set('scope', scopes.join(','));
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('TikTok OAuth initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate TikTok OAuth' }, { status: 500 });
  }
}
