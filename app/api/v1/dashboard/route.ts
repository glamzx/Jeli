import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();
    const totalInfluencers = await prisma.influencerProfile.count();
    const totalBrands = await prisma.brandProfile.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalDeals = await prisma.deal.count();

    const deals = await prisma.deal.findMany({
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
      recentDeals: deals
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
