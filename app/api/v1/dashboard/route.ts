import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

      recentDeals = await prisma.deal.findMany({
        take: 5,
        include: {
          campaign: true,
          influencer: {
            include: {
              user: true,
              socialAccounts: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
    } catch (err) {
      console.warn("Prisma dashboard fetch warning (Handled):", err);
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
