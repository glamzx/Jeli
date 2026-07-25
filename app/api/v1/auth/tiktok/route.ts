import { NextResponse } from 'next/server';
import { getTikTokOAuthConfig, TIKTOK_AUTH_URL } from '@/lib/tiktok-oauth';

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

    const config = getTikTokOAuthConfig();

    if (!config.isConfigured) {
      return NextResponse.json(
        {
          error: 'TikTok API не настроен',
          message: 'Необходимо добавить TIKTOK_CLIENT_KEY и TIKTOK_REDIRECT_URI в переменные окружения Vercel.'
        },
        { status: 503 }
      );
    }

    const statePayload = JSON.stringify({
      userId,
      returnTo: returnTo === 'settings' ? 'settings' : 'dashboard',
      nonce: crypto.randomUUID(),
      timestamp: Date.now()
    });
    const state = Buffer.from(statePayload).toString('base64url');

    const authUrl = new URL(TIKTOK_AUTH_URL);
    authUrl.searchParams.set('client_key', config.clientKey!);
    authUrl.searchParams.set('scope', config.scopeString);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', config.redirectUri!);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('disable_auto_auth', '1');

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('TikTok OAuth initiation error:', error);
    return NextResponse.json({ error: 'Failed to initiate TikTok OAuth' }, { status: 500 });
  }
}
