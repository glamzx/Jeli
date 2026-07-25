import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Check TikTok link status for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Find influencer profile
    const { data: profile } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ linked: false, message: 'Профиль инфлюенсера не найден' });
    }

    // Check social account
    const { data: social } = await supabase
      .from('social_accounts')
      .select('handle, follower_count, engagement_rate, access_token, platform_user_id')
      .eq('influencer_id', profile.id)
      .eq('platform', 'TIKTOK')
      .maybeSingle();

    if (!social || !social.access_token) {
      return NextResponse.json({
        linked: false,
        handle: social?.handle || null,
        message: 'TikTok аккаунт не привязан'
      });
    }

    return NextResponse.json({
      linked: true,
      handle: social.handle,
      follower_count: Number(social.follower_count || 0),
      engagement_rate: Number(social.engagement_rate || 0),
      message: 'TikTok аккаунт привязан и верифицирован'
    });
  } catch (error: any) {
    console.error('TikTok status check error:', error);
    return NextResponse.json({ linked: false, error: error.message }, { status: 500 });
  }
}
