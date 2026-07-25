import { NextResponse } from 'next/server';
import { getTikTokOAuthConfig } from '@/lib/tiktok-oauth';

export const dynamic = 'force-dynamic';

// Public setup diagnostics (no secrets exposed)
export async function GET() {
  const config = getTikTokOAuthConfig();

  return NextResponse.json({
    configured: config.isConfigured,
    fullyConfigured: config.isFullyConfigured,
    useSandbox: config.useSandbox,
    clientKeyPreview: config.clientKeyPreview,
    redirectUri: config.redirectUri,
    scopes: config.scopeString,
    appId: process.env.TIKTOK_APP_ID || '7666345825798391809',
    setupSteps: [
      'Open https://developers.tiktok.com/app/7666345825798391809',
      'Switch toggle to SANDBOX mode (top of app page)',
      'Copy Client Key + Client Secret from Credentials (Sandbox credentials)',
      'Add Login Kit product if missing → Web → Redirect URI:',
      config.redirectUri,
      'Sandbox settings → Target users → Add your TikTok account',
      'Set TIKTOK_SANDBOX_CLIENT_KEY and TIKTOK_SANDBOX_CLIENT_SECRET in Vercel',
      'Set TIKTOK_USE_SANDBOX=true in Vercel'
    ]
  });
}
