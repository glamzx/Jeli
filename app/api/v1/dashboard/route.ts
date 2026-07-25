import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Query all counts from Supabase REST API
    const [usersRes, infRes, brandRes] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('influencer_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('brand_profiles').select('*', { count: 'exact', head: true })
    ]);

    const totalUsers = usersRes.count ?? 0;
    const totalInfluencers = infRes.count ?? 0;
    const totalBrands = brandRes.count ?? 0;

    // Get verified influencers count (those with TikTok access token)
    const { count: verifiedCount } = await supabase
      .from('social_accounts')
      .select('*', { count: 'exact', head: true })
      .not('access_token', 'is', null);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalInfluencers,
        totalBrands,
        totalVerified: verifiedCount ?? 0,
        totalCampaigns: 0,
        totalDeals: 0,
        escrowLockedAmount: 0
      },
      recentDeals: []
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      stats: {
        totalUsers: 0,
        totalInfluencers: 0,
        totalBrands: 0,
        totalVerified: 0,
        totalCampaigns: 0,
        totalDeals: 0,
        escrowLockedAmount: 0
      },
      recentDeals: []
    });
  }
}
