import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: false,
        total: 0,
        influencers: [],
        error: 'Supabase is not configured'
      });
    }

    const { data: profiles, error } = await supabase
      .from('influencer_profiles')
      .select('*, users!user_id(*), social_accounts(*)');

    if (error) {
      console.error('Influencers fetch error:', error);
      return NextResponse.json({ success: false, total: 0, influencers: [], error: error.message });
    }

    const influencers = (profiles || []).map(inf => {
      const user = inf.users || {};
      const socials = Array.isArray(inf.social_accounts) ? inf.social_accounts : [];
      const tiktokVerified = socials.some(
        (s: any) => s.platform === 'TIKTOK' && s.access_token && s.follower_count > 0
      );

      return {
        id: inf.id,
        userId: inf.user_id,
        fullName: user.full_name,
        email: user.email,
        bio: inf.bio,
        niches: inf.niches,
        primaryCountry: inf.primary_country,
        tiktokVerified,
        socialAccounts: socials.map((s: any) => ({
          platform: s.platform,
          handle: s.handle,
          followerCount: Number(s.follower_count || 0),
          engagementRate: Number(s.engagement_rate || 0),
          hasAccessToken: !!s.access_token
        }))
      };
    });

    return NextResponse.json({
      success: true,
      total: influencers.length,
      influencers
    });
  } catch (error: any) {
    console.error('Influencers route error:', error);
    return NextResponse.json({ success: false, total: 0, influencers: [], error: error.message });
  }
}
