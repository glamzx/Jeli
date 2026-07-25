import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// TikTok OAuth 2.0 callback — exchanges code for token and fetches user info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle user denial or TikTok error
    if (error) {
      console.error('TikTok OAuth error:', error, searchParams.get('error_description'));
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
      return NextResponse.redirect(`${appUrl}/dashboard?tiktok=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    // Decode and validate state (CSRF protection)
    let stateData: { userId: string; nonce: string; timestamp: number };
    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf-8');
      stateData = JSON.parse(decoded);

      // Check state is not older than 10 minutes
      if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
        return NextResponse.redirect(`${appUrl}/dashboard?tiktok=error&reason=expired`);
      }
    } catch {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI;

    if (!clientKey || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'TikTok API not configured' }, { status: 503 });
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error('TikTok token exchange error:', tokenData);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
      return NextResponse.redirect(`${appUrl}/dashboard?tiktok=error&reason=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in; // seconds
    const openId = tokenData.open_id;
    const tokenExpiresAt = new Date(Date.now() + (expiresIn || 86400) * 1000).toISOString();

    // Fetch TikTok user info
    const userInfoRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=username,display_name,follower_count,following_count,likes_count,bio_description,avatar_url',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const userInfoData = await userInfoRes.json();
    const tiktokUser = userInfoData?.data?.user || {};

    const tiktokUsername = tiktokUser.username || '';
    const tiktokDisplayName = tiktokUser.display_name || '';
    const tiktokFollowers = tiktokUser.follower_count || 0;
    const tiktokLikes = tiktokUser.likes_count || 0;
    const tiktokBio = tiktokUser.bio_description || '';
    const tiktokAvatar = tiktokUser.avatar_url || '';

    // Find user's influencer profile
    const { data: profile } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', stateData.userId)
      .single();

    if (!profile) {
      console.error('No influencer profile found for user:', stateData.userId);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
      return NextResponse.redirect(`${appUrl}/dashboard?tiktok=error&reason=no_profile`);
    }

    // Check if social account already exists for this influencer
    const { data: existingSocial } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('influencer_id', profile.id)
      .eq('platform', 'TIKTOK')
      .maybeSingle();

    if (existingSocial) {
      // Update existing social account with real TikTok data
      await supabase
        .from('social_accounts')
        .update({
          handle: `@${tiktokUsername}`,
          platform_user_id: openId || tiktokUsername,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          token_expires_at: tokenExpiresAt,
          follower_count: tiktokFollowers,
          engagement_rate: tiktokFollowers > 0 ? Math.round((tiktokLikes / Math.max(tiktokFollowers, 1)) * 100) / 100 : 0
        })
        .eq('id', existingSocial.id);
    } else {
      // Create new social account with real TikTok data
      await supabase
        .from('social_accounts')
        .insert({
          influencer_id: profile.id,
          platform: 'TIKTOK',
          handle: `@${tiktokUsername}`,
          platform_user_id: openId || tiktokUsername,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          token_expires_at: tokenExpiresAt,
          follower_count: tiktokFollowers,
          engagement_rate: tiktokFollowers > 0 ? Math.round((tiktokLikes / Math.max(tiktokFollowers, 1)) * 100) / 100 : 0
        });
    }

    // Update influencer profile bio with TikTok data if available
    const bioUpdate: any = {};
    if (tiktokBio) bioUpdate.bio = tiktokBio;
    if (Object.keys(bioUpdate).length > 0) {
      await supabase
        .from('influencer_profiles')
        .update(bioUpdate)
        .eq('id', profile.id);
    }

    // Update user avatar if available
    if (tiktokAvatar) {
      await supabase
        .from('users')
        .update({ avatar_url: tiktokAvatar })
        .eq('id', stateData.userId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
    return NextResponse.redirect(
      `${appUrl}/dashboard?tiktok=linked&username=${encodeURIComponent(tiktokUsername)}&followers=${tiktokFollowers}`
    );
  } catch (error: any) {
    console.error('TikTok callback error:', error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
    return NextResponse.redirect(`${appUrl}/dashboard?tiktok=error&reason=server_error`);
  }
}
