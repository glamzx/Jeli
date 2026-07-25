import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { influencerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let catalogData: any[] = [];
    const combinedMap = new Map();

    // 1. Fetch from Supabase Database via REST API
    try {
      const { data: sbProfiles } = await supabase
        .from("influencer_profiles")
        .select("*, users!user_id(*), social_accounts(*)");

      if (sbProfiles && sbProfiles.length > 0) {
        sbProfiles.forEach(inf => {
          const u = inf.users || {};
          const s = Array.isArray(inf.social_accounts) && inf.social_accounts.length > 0 ? inf.social_accounts[0] : {};
          const followers = Number(s.follower_count || 25000);
          const fullName = u.full_name || 'Инфлюенсер';
          const username = s.handle || `@${fullName.toLowerCase().replace(/\s+/g, '')}`;

          const item = {
            id: inf.id,
            username: username,
            nickname: fullName,
            followers: followers,
            totalLikes: Math.round(followers * 12.5),
            totalVideos: Math.floor(followers / 400) + 5,
            niche: Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
            city: inf.primary_country === 'Казахстан' ? 'Алматы' : (inf.primary_country || 'Алматы'),
            avatar: u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
            verified: true,
            bio: inf.bio || 'Зарегистрированный инфлюенсер на Jeli'
          };
          combinedMap.set(username.toLowerCase(), item);
        });
      }
    } catch (sbErr) {
      console.warn("Supabase REST catalog fetch warning:", sbErr);
    }

    // 2. Fetch from Prisma DB (if reachable)
    try {
      const dbInfluencers = await prisma.influencerProfile.findMany({
        include: { user: true, socialAccounts: true }
      });
      dbInfluencers.forEach(inf => {
        const social = inf.socialAccounts[0] || {};
        const followers = Number(social.followerCount || 0);
        const username = social.handle || `@${inf.user.fullName.toLowerCase().replace(/\s+/g, '')}`;
        if (!combinedMap.has(username.toLowerCase())) {
          combinedMap.set(username.toLowerCase(), {
            id: inf.id,
            username: username,
            nickname: inf.user.fullName,
            followers: followers,
            totalLikes: Math.round(followers * 12.5),
            totalVideos: Math.floor(followers / 400) + 5,
            niche: inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
            city: 'Алматы',
            avatar: inf.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(inf.user.fullName)}`,
            verified: true,
            bio: inf.bio || 'Зарегистрированный инфлюенсер на Jeli'
          });
        }
      });
    } catch (prismaErr) {
      console.warn("Prisma catalog fetch note:", prismaErr);
    }

    // 3. Merge runtime store items
    influencerStore.forEach(item => {
      if (!combinedMap.has(item.username.toLowerCase())) {
        combinedMap.set(item.username.toLowerCase(), item);
      }
    });

    catalogData = Array.from(combinedMap.values());
    return NextResponse.json(catalogData);

  } catch (error: any) {
    console.error("Error in catalog GET route:", error);
    return NextResponse.json(influencerStore);
  }
}
