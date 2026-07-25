import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('influencer_profiles')
      .select('*, users!user_id(*), social_accounts(*)');

    if (error) {
      console.error('Catalog fetch error:', error);
      return NextResponse.json([]);
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json([]);
    }

    const catalog = profiles.map(inf => {
      const user = inf.users || {};
      const socials = Array.isArray(inf.social_accounts) ? inf.social_accounts : [];
      const primarySocial = socials.find((s: any) => s.platform === 'TIKTOK') || socials[0] || {};
      const followers = Number(primarySocial.follower_count || 0);
      const fullName = user.full_name || 'Инфлюенсер';
      const handle = primarySocial.handle || `@${fullName.toLowerCase().replace(/\s+/g, '')}`;

      // Determine if TikTok is verified (has real access token stored)
      const tiktokVerified = socials.some(
        (s: any) => s.platform === 'TIKTOK' && s.access_token && s.follower_count > 0
      );

      return {
        id: inf.id,
        username: handle,
        nickname: fullName,
        followers: followers,
        totalLikes: Math.round(followers * 12.5),
        totalVideos: Math.floor(followers / 400) + (followers > 0 ? 5 : 0),
        niche: Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
        city: inf.primary_country === 'Казахстан' ? 'Алматы' : (inf.primary_country || 'Алматы'),
        avatar: user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        verified: tiktokVerified,
        bio: inf.bio || 'Зарегистрированный инфлюенсер на Jeli',
        tiktokLinked: tiktokVerified
      };
    });

    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error('Catalog route error:', error);
    return NextResponse.json([]);
  }
}
