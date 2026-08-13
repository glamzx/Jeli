import { NextResponse } from 'next/server';
import { isSupabaseAdminConfigured, supabaseAdmin } from '@/lib/supabase';
import {
  getTikTokOAuthConfig,
  getUserInfoFields,
  TIKTOK_TOKEN_URL,
  TIKTOK_USER_INFO_URL
} from '@/lib/tiktok-oauth';
import { scrapeTikTokProfile } from '@/lib/tiktok-scraper';
import { categorizeContent } from '@/lib/tiktok-analyzer';
import { listTikTokVideos } from '@/lib/tiktok-videos';
import { setSessionCookie } from '@/lib/auth-session';

export const dynamic = 'force-dynamic';

function getRedirectBase(stateData?: { returnTo?: string; authMode?: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeli-six.vercel.app';
  if (stateData?.authMode === 'login') return `${appUrl}/auth/tiktok/success`;
  const path = stateData?.returnTo === 'settings' ? '/settings' : '/dashboard';
  return `${appUrl}${path}`;
}

// TikTok OAuth 2.0 callback — exchanges code for token and fetches user info
export async function GET(request: Request) {
  let stateData: { userId?: string | null; authMode?: string; returnTo?: string; nonce: string; timestamp: number } | undefined;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description') || '';

    if (state) {
      try {
        const decoded = Buffer.from(state, 'base64url').toString('utf-8');
        stateData = JSON.parse(decoded);
      } catch {}
    }

    if (error) {
      console.error('TikTok OAuth error:', error, errorDescription);
      const reason = errorDescription || error;
      return NextResponse.redirect(
        `${getRedirectBase(stateData)}?tiktok=error&reason=${encodeURIComponent(reason)}`
      );
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state parameter' }, { status: 400 });
    }

    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf-8');
      stateData = JSON.parse(decoded);

      if (Date.now() - stateData!.timestamp > 10 * 60 * 1000) {
        return NextResponse.redirect(`${getRedirectBase(stateData)}?tiktok=error&reason=expired`);
      }
    } catch {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const config = getTikTokOAuthConfig();

    if (!config.isFullyConfigured || !isSupabaseAdminConfigured) {
      return NextResponse.json({ error: 'TikTok API not configured' }, { status: 503 });
    }

    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: config.clientKey!,
        client_secret: config.clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.redirectUri!
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error('TikTok token exchange error:', tokenData);
      const reason = tokenData.error_description || tokenData.error || 'token_exchange_failed';
      return NextResponse.redirect(
        `${getRedirectBase(stateData)}?tiktok=error&reason=${encodeURIComponent(reason)}`
      );
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    const openId = tokenData.open_id;
    const grantedScopes = (tokenData.scope || config.scopeString).split(',').map((s: string) => s.trim());
    const tokenExpiresAt = new Date(Date.now() + (expiresIn || 86400) * 1000).toISOString();

    const fields = getUserInfoFields(grantedScopes);
    const userInfoRes = await fetch(`${TIKTOK_USER_INFO_URL}?fields=${fields}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userInfoData = await userInfoRes.json();
    const tiktokUser = userInfoData?.data?.user || {};

    let tiktokUsername = tiktokUser.username || '';
    let tiktokFollowers = Number(tiktokUser.follower_count || 0);
    let tiktokLikes = Number(tiktokUser.likes_count || 0);
    const tiktokDisplayName = tiktokUser.display_name || '';
    const tiktokBio = tiktokUser.bio_description || '';
    const tiktokAvatar = tiktokUser.avatar_url || '';
    const tiktokFollowing = Number(tiktokUser.following_count || 0);
    const tiktokVideoCount = Number(tiktokUser.video_count || 0);
    const tiktokVerified = Boolean(tiktokUser.is_verified);
    const tiktokProfileDeepLink = tiktokUser.profile_deep_link || '';

    // If stats scope not granted, try public scrape for username/stats
    if (!tiktokUsername || tiktokFollowers === 0) {
      const handleGuess = tiktokUsername || tiktokDisplayName.replace(/\s+/g, '').toLowerCase();
      if (handleGuess) {
        const scraped = await scrapeTikTokProfile(handleGuess);
        if (scraped) {
          tiktokUsername = scraped.username.replace(/^@/, '');
          tiktokFollowers = scraped.metrics.followers;
          tiktokLikes = scraped.metrics.totalLikes;
        }
      }
    }

    if (!tiktokUsername && openId) {
      tiktokUsername = `user_${openId.slice(0, 8)}`;
    }

    let userId = stateData!.userId || null;

    // TikTok-first auth: find an existing account by TikTok open_id or create
    // an influencer account before saving the social connection.
    if (!userId && openId) {
      const { data: connectedSocial } = await supabaseAdmin
        .from('social_accounts')
        .select('influencer_id')
        .eq('platform', 'TIKTOK')
        .eq('platform_user_id', openId)
        .maybeSingle();

      if (connectedSocial?.influencer_id) {
        const { data: connectedProfile } = await supabaseAdmin
          .from('influencer_profiles')
          .select('user_id')
          .eq('id', connectedSocial.influencer_id)
          .single();
        userId = connectedProfile?.user_id || null;
      }
    }

    if (!userId) {
      if (!openId) {
        return NextResponse.redirect(`${getRedirectBase(stateData)}?tiktok=error&reason=missing_open_id`);
      }

      const oauthEmail = `tiktok-${openId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)}@accounts.jeli.local`;
      const { data: existingOauthUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', oauthEmail)
        .maybeSingle();

      if (existingOauthUser) {
        userId = existingOauthUser.id;
      } else {
        const { data: newUser, error: newUserError } = await supabaseAdmin
          .from('users')
          .insert({
            email: oauthEmail,
            full_name: tiktokDisplayName || tiktokUsername || `TikTok creator ${openId.slice(0, 8)}`,
            role: 'INFLUENCER',
            status: 'ACTIVE',
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (newUserError || !newUser) {
          console.error('TikTok-first user creation error:', newUserError);
          return NextResponse.redirect(`${getRedirectBase(stateData)}?tiktok=error&reason=account_creation_failed`);
        }
        userId = newUser.id;
      }

      await supabaseAdmin.from('influencer_profiles').upsert({
        user_id: userId,
        bio: tiktokBio || null,
        niches: [],
        primary_country: 'Казахстан'
      }, { onConflict: 'user_id' });
    }

    const { data: profile } = await supabaseAdmin
      .from('influencer_profiles')
      .select('id, ai_persona_config')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      console.error('No influencer profile found for user:', userId);
      return NextResponse.redirect(`${getRedirectBase(stateData)}?tiktok=error&reason=no_profile`);
    }

    const existingConfig = profile.ai_persona_config && typeof profile.ai_persona_config === 'object'
      ? profile.ai_persona_config
      : {};
    const oauthProfile = {
      openId,
      username: tiktokUsername,
      displayName: tiktokDisplayName,
      bio: tiktokBio,
      avatarUrl: tiktokAvatar,
      isVerified: tiktokVerified,
      followerCount: tiktokFollowers,
      followingCount: tiktokFollowing,
      likesCount: tiktokLikes,
      videoCount: tiktokVideoCount,
      profileDeepLink: tiktokProfileDeepLink,
      grantedScopes,
      updatedAt: new Date().toISOString()
    };
    await supabaseAdmin.from('influencer_profiles').update({
      ai_persona_config: {
        ...existingConfig,
        tiktokProfile: oauthProfile
      }
    }).eq('id', profile.id);

    const { data: existingSocial } = await supabaseAdmin
      .from('social_accounts')
      .select('id')
      .eq('influencer_id', profile.id)
      .eq('platform', 'TIKTOK')
      .maybeSingle();

    const socialPayload = {
      handle: `@${tiktokUsername}`,
      platform_user_id: openId || tiktokUsername,
      access_token: accessToken,
      refresh_token: refreshToken || null,
      token_expires_at: tokenExpiresAt,
      follower_count: tiktokFollowers,
      engagement_rate: tiktokFollowers > 0
        ? Math.round((tiktokLikes / Math.max(tiktokFollowers, 1)) * 100) / 100
        : 0
    };

    if (existingSocial) {
      await supabaseAdmin.from('social_accounts').update(socialPayload).eq('id', existingSocial.id);
    } else {
      await supabaseAdmin.from('social_accounts').insert({
        influencer_id: profile.id,
        platform: 'TIKTOK',
        ...socialPayload
      });
    }

    if (grantedScopes.includes('video.list')) {
      try {
        const videos = await listTikTokVideos(accessToken);
        const content = categorizeContent(videos.map(video => `${video.title} ${video.description}`));
        const existingConfig = profile.ai_persona_config && typeof profile.ai_persona_config === 'object'
          ? profile.ai_persona_config
          : {};

        await supabaseAdmin
          .from('influencer_profiles')
          .update({
            ai_persona_config: {
              ...existingConfig,
              tiktokProfile: oauthProfile,
              tiktokVideoAnalysis: {
                videos,
                analyzedAt: new Date().toISOString(),
                primaryNiche: content.primaryNiche,
                topKeywords: content.topKeywords,
                topHashtags: content.topHashtags
              }
            }
          })
          .eq('id', profile.id);
      } catch (videoError) {
        // Linking the account remains useful even if TikTok has no public videos to return.
        console.warn('TikTok video analysis unavailable:', videoError);
      }
    }

    if (tiktokBio) {
      await supabaseAdmin.from('influencer_profiles').update({ bio: tiktokBio }).eq('id', profile.id);
    }

    if (tiktokAvatar) {
      await supabaseAdmin.from('users').update({ avatar_url: tiktokAvatar }).eq('id', userId);
    }

    await supabaseAdmin.from('users').update({
      status: 'ACTIVE',
      updated_at: new Date().toISOString()
    }).eq('id', userId);

    if (!userId) {
      return NextResponse.redirect(`${getRedirectBase(stateData)}?tiktok=error&reason=missing_user`);
    }

    const successParams = new URLSearchParams({
      tiktok: 'linked',
      userId,
      username: tiktokUsername,
      followers: String(tiktokFollowers)
    });
    const response = NextResponse.redirect(`${getRedirectBase(stateData)}?${successParams.toString()}`);
    setSessionCookie(response, {
      id: userId,
      email: `tiktok-${openId}@accounts.jeli.local`,
      fullName: tiktokDisplayName || tiktokUsername,
      role: 'INFLUENCER',
      status: 'ACTIVE',
      avatarUrl: tiktokAvatar || undefined
    });
    return response;
  } catch (error: any) {
    console.error('TikTok callback error:', error);
    return NextResponse.redirect(
      `${getRedirectBase(stateData)}?tiktok=error&reason=${encodeURIComponent('server_error')}`
    );
  }
}
