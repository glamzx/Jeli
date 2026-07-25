import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { influencerStore, brandStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let totalUsers = influencerStore.length + brandStore.length;
    let totalInfluencers = influencerStore.length;
    let totalBrands = brandStore.length;
    let totalCampaigns = 0;
    let totalDeals = 0;
    let recentDeals: any[] = [];

    // Query Supabase REST API
    try {
      const { count: sbUsersCount } = await supabase.from("users").select("*", { count: "exact", head: true });
      const { count: sbInfCount } = await supabase.from("influencer_profiles").select("*", { count: "exact", head: true });
      const { count: sbBrandCount } = await supabase.from("brand_profiles").select("*", { count: "exact", head: true });

      if (sbUsersCount !== null) totalUsers = Math.max(totalUsers, sbUsersCount);
      if (sbInfCount !== null) totalInfluencers = Math.max(totalInfluencers, sbInfCount);
      if (sbBrandCount !== null) totalBrands = Math.max(totalBrands, sbBrandCount);
    } catch (sbErr) {
      console.warn("Supabase REST stats fetch note:", sbErr);
    }

    // Query Prisma DB fallback
    try {
      const dbUsersCount = await prisma.user.count();
      const dbInfCount = await prisma.influencerProfile.count();
      const dbBrandCount = await prisma.brandProfile.count();
      const dbCampCount = await prisma.campaign.count();
      const dbDealCount = await prisma.deal.count();

      totalUsers = Math.max(totalUsers, dbUsersCount);
      totalInfluencers = Math.max(totalInfluencers, dbInfCount);
      totalBrands = Math.max(totalBrands, dbBrandCount);
      totalCampaigns = dbCampCount;
      totalDeals = dbDealCount;
    } catch (prismaErr) {
      console.warn("Prisma stats fetch note:", prismaErr);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalInfluencers,
        totalBrands,
        totalCampaigns,
        totalDeals,
        escrowLockedAmount: totalDeals * 150000
      },
      recentDeals
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      stats: {
        totalUsers: 0,
        totalInfluencers: 0,
        totalBrands: 0,
        totalCampaigns: 0,
        totalDeals: 0,
        escrowLockedAmount: 0
      },
      recentDeals: []
    });
  }
}
