import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const influencers = await prisma.influencerProfile.findMany({
      include: {
        user: true,
        socialAccounts: true
      }
    });

    return NextResponse.json({
      success: true,
      total: influencers.length,
      influencers
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, total: 0, influencers: [], error: error.message });
  }
}
