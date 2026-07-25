import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { influencerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let dbCatalog: any[] = [];
    try {
      const dbInfluencers = await prisma.influencerProfile.findMany({
        include: {
          user: true,
          socialAccounts: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      dbCatalog = dbInfluencers.map(inf => {
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
    } catch (err) {
      console.warn("Prisma catalog fetch warning (Handled):", err);
    }

    // Combine DB catalog and runtime store, removing duplicates by username
    const combinedMap = new Map();
    dbCatalog.forEach(item => combinedMap.set(item.username.toLowerCase(), item));
    influencerStore.forEach(item => {
      if (!combinedMap.has(item.username.toLowerCase())) {
        combinedMap.set(item.username.toLowerCase(), item);
      }
    });

    const catalogData = Array.from(combinedMap.values());
    return NextResponse.json(catalogData);
  } catch (error: any) {
    console.error("Error fetching catalog:", error);
    return NextResponse.json(influencerStore);
  }
}
