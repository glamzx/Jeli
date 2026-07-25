import { NextResponse } from 'next/server';
import { scrapeTikTokProfile } from '@/lib/tiktok-scraper';
import { calculateAlignment } from '@/lib/tiktok-analyzer';
import { getCachedProfile, saveProfile, normalizeUsername } from '@/lib/scraped-store';
import { sanitizeString } from '@/lib/validate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// GET — fetch scraped profile (cache or live scrape)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const forceLive = searchParams.get('live') === 'true';
    const businessRequest = searchParams.get('business');

    if (!username) {
      return NextResponse.json({ success: false, message: 'username is required' }, { status: 400 });
    }

    let profile = forceLive ? null : await getCachedProfile(username);

    if (!profile || forceLive) {
      profile = await scrapeTikTokProfile(username);
      if (profile) {
        await saveProfile(username, profile);
      }
    }

    if (!profile) {
      return NextResponse.json({
        success: false,
        message: `Не удалось получить данные профиля @${normalizeUsername(username)}. Аккаунт не найден или TikTok заблокировал запрос.`
      }, { status: 404 });
    }

    let alignment = null;
    if (businessRequest) {
      const captions = profile.videoSamples.map(v => v.caption);
      alignment = calculateAlignment(captions, profile.bio, businessRequest);
    }

    return NextResponse.json({ success: true, profile, alignment });
  } catch (error: any) {
    console.error('Scrape GET error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST — scrape one or multiple TikTok accounts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, usernames, businessDescription, userId } = body;

    const targets: string[] = usernames
      ? usernames.map((u: string) => normalizeUsername(u))
      : username
        ? [normalizeUsername(username)]
        : [];

    if (targets.length === 0) {
      return NextResponse.json({ success: false, message: 'username or usernames required' }, { status: 400 });
    }

    if (targets.length > 10) {
      return NextResponse.json({ success: false, message: 'Maximum 10 accounts per request' }, { status: 400 });
    }

    const results = [];

    for (const target of targets) {
      let profile = await scrapeTikTokProfile(target);

      if (!profile) {
        profile = await getCachedProfile(target);
      }

      if (profile) {
        await saveProfile(target, profile, userId);
      }

      let alignment = null;
      if (businessDescription && profile) {
        alignment = calculateAlignment(
          profile.videoSamples.map(v => v.caption),
          profile.bio,
          sanitizeString(businessDescription, 1000)
        );
      }

      results.push({
        username: target,
        success: !!profile,
        profile,
        alignment
      });
    }

    return NextResponse.json({
      success: true,
      scrapedAt: new Date().toISOString(),
      results,
      businessDescription: businessDescription || null
    });
  } catch (error: any) {
    console.error('Scrape POST error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
