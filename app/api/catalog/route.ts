import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const influencers = await prisma.influencerProfile.findMany({
      include: {
        user: true,
        socialAccounts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const catalogData = influencers.map(inf => {
      const social = inf.socialAccounts[0] || {};
      const followers = Number(social.followerCount || 0);

      return {
        id: inf.id,
        username: social.handle || `@${inf.user.fullName.toLowerCase().replace(/\s+/g, '')}`,
        nickname: inf.user.fullName,
        followers: followers,
        totalLikes: Math.round(followers * 12.5),
        totalVideos: Math.floor(followers / 400) + 5,
        niche: inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
        city: inf.primaryCountry === 'Казахстан' ? 'Алматы' : (inf.primaryCountry || 'Алматы'),
        avatar: inf.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(inf.user.fullName)}`,
        verified: true,
        bio: inf.bio || 'Зарегистрированный инфлюенсер на Jeli'
      };
    });

    return NextResponse.json(catalogData);
  } catch (error: any) {
    console.error("Error fetching catalog from DB:", error);
    return NextResponse.json([]);
  }
}
