import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { scrapeTikTokProfile } from '@/lib/tiktok-scraper';
import { calculateAlignment } from '@/lib/tiktok-analyzer';
import { getCachedProfile, saveProfile, listCachedProfiles, normalizeUsername } from '@/lib/scraped-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { businessDescription, targetNiche, budget, tiktokUsernames = [] } = await request.json();

    if (!businessDescription) {
      return NextResponse.json({ error: 'businessDescription is required' }, { status: 400 });
    }

    const matches: any[] = [];
    const seen = new Set<string>();

    // Scrape requested TikTok usernames
    const usernamesToScrape = (tiktokUsernames as string[])
      .map(u => normalizeUsername(u))
      .filter(Boolean)
      .slice(0, 5);

    for (const username of usernamesToScrape) {
      seen.add(username);
      let profile = await scrapeTikTokProfile(username);
      if (!profile) profile = await getCachedProfile(username);
      if (profile) {
        await saveProfile(username, profile);
        const alignment = calculateAlignment(
          profile.videoSamples.map(v => v.caption),
          profile.bio,
          businessDescription
        );
        matches.push(buildScrapedMatch(profile, alignment, businessDescription));
      }
    }

    // Registered influencers from Supabase
    if (isSupabaseConfigured) {
      const { data: profiles } = await supabase
        .from('influencer_profiles')
        .select('*, users!user_id(*), social_accounts(*)');

      for (const inf of profiles || []) {
        const user = inf.users || {};
        const socials = Array.isArray(inf.social_accounts) ? inf.social_accounts : [];
        const primary = socials.find((s: any) => s.platform === 'TIKTOK') || socials[0] || {};
        const handle = (primary.handle || '').replace(/^@/, '').toLowerCase();
        if (handle && seen.has(handle)) continue;

        const tiktokVerified = socials.some(
          (s: any) => s.platform === 'TIKTOK' && s.access_token && s.follower_count > 0
        );

        matches.push(buildRegisteredMatch(inf, user, primary, tiktokVerified, businessDescription, targetNiche));
      }
    }

    // Cached/catalog scraped profiles
    const cached = await listCachedProfiles(15);
    for (const profile of cached) {
      const key = normalizeUsername(profile.username);
      if (seen.has(key) || matches.some(m => normalizeUsername(m.username) === key)) continue;

      const alignment = calculateAlignment(
        profile.videoSamples.map(v => v.caption),
        profile.bio,
        businessDescription
      );
      matches.push(buildScrapedMatch(profile, alignment, businessDescription));
    }

    let filteredMatches = matches;
    if (targetNiche && targetNiche !== 'Все ниши') {
      filteredMatches = matches.filter(m =>
        m.niche.toLowerCase().includes(targetNiche.toLowerCase()) || m.overall_alignment_score >= 40
      );
    }

    filteredMatches.sort((a, b) => b.overall_alignment_score - a.overall_alignment_score);

    if (filteredMatches.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: usernamesToScrape.length === 0
          ? 'Укажите TikTok username для скрапинга (например: mrbeast, therock) или дождитесь регистрации инфлюенсеров.'
          : 'Не удалось просканировать указанные аккаунты. TikTok может блокировать запросы — попробуйте позже.'
      });
    }

    // Optional Gemini evaluation
    let aiEvaluationText = '';
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `AI аналитик Jeli. Бизнес: "${businessDescription}". Ниша: "${targetNiche || 'Все'}". Бюджет: "${budget || 'Не указан'}". Кандидаты: ${JSON.stringify(filteredMatches.slice(0, 5))}. Дай краткую рекомендацию на русском (2-3 предложения).`
                }]
              }]
            })
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiEvaluationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (e) {
        console.error('Gemini match warning:', e);
      }
    }

    if (aiEvaluationText) {
      filteredMatches = filteredMatches.map(m => ({
        ...m,
        ai_content_summary: aiEvaluationText.slice(0, 200)
      }));
    }

    return NextResponse.json({
      analyzed_at: new Date().toISOString(),
      business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
      matches: filteredMatches.slice(0, 15)
    });
  } catch (error: any) {
    console.error('AI Match route error:', error);
    return NextResponse.json({ error: 'AI Match evaluation error', details: error.message }, { status: 500 });
  }
}

function buildScrapedMatch(profile: any, alignment: any, businessDescription: string) {
  let score = Math.round(alignment.alignmentScorePct);
  if (profile.verified) score += 5;
  score = Math.min(Math.max(score, 10), 99);

  return {
    username: profile.username,
    nickname: profile.nickname,
    overall_alignment_score: score,
    alignment_tier: score >= 75 ? 'Высокое совпадение 🔥' : score >= 50 ? 'Умеренное совпадение ⚡' : 'Базовое совпадение ⚠️',
    followers: profile.metrics.followers,
    niche: profile.contentIntelligence.primaryNiche,
    bio: profile.bio,
    tiktokVerified: profile.verified,
    source: 'scraped',
    influencerTier: profile.metrics.influencerTier,
    engagementRate: profile.metrics.engagementRate,
    avatarUrl: profile.avatarUrl,
    multi_criteria_scores: {
      niche_topic_fit: Math.min(score + 5, 99),
      audience_demographics_reach: Math.min(Math.round(Math.log10(Math.max(profile.metrics.followers, 1)) * 15), 99),
      content_tone_aesthetics: Math.min(score, 95),
      commercial_conversion_potential: Math.min(score + 3, 97)
    },
    ai_content_summary: profile.contentIntelligence.contentSummary,
    recommended_campaign_angle: `Интеграция в роликах ${profile.nickname} с промокодом для: "${businessDescription.slice(0, 60)}"`,
    pros: [`Live scrape: ${profile.metrics.followers.toLocaleString()} подписчиков`, `Ниша: ${profile.contentIntelligence.primaryNiche}`],
    cons: profile.metrics.followers < 10000 ? ['⚠️ Micro/Nano — ограниченный охват'] : ['Рекомендуется связаться через Escrow'],
    detailUrl: `/influencer/${profile.username.replace(/^@/, '')}`
  };
}

function buildRegisteredMatch(inf: any, user: any, primary: any, tiktokVerified: boolean, businessDescription: string, targetNiche?: string) {
  const niche = Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное';
  const bio = inf.bio || '';
  const alignment = calculateAlignment([], bio, businessDescription);

  let score = Math.max(Math.round(alignment.alignmentScorePct), 50);
  const words = (businessDescription + ' ' + (targetNiche || '')).toLowerCase().split(/\s+/);
  words.forEach(w => { if (w.length > 3 && (bio + niche).toLowerCase().includes(w)) score += 8; });
  if (targetNiche && targetNiche !== 'Все ниши' && niche.toLowerCase().includes(targetNiche.toLowerCase())) score += 15;
  if (tiktokVerified) score += 10;
  score = Math.min(score, 98);

  return {
    username: primary.handle || `@${(user.full_name || 'influencer').toLowerCase().replace(/\s+/g, '')}`,
    nickname: user.full_name || 'Инфлюенсер',
    overall_alignment_score: score,
    alignment_tier: score >= 75 ? 'Высокое совпадение 🔥' : 'Умеренное совпадение ⚡',
    followers: Number(primary.follower_count || 0),
    niche,
    bio,
    tiktokVerified,
    source: 'registered',
    multi_criteria_scores: {
      niche_topic_fit: Math.min(score + 3, 99),
      audience_demographics_reach: Math.min(Math.round(Math.log10(Math.max(Number(primary.follower_count || 1), 1)) * 15), 99),
      content_tone_aesthetics: Math.min(score - 2, 95),
      commercial_conversion_potential: Math.min(score + 1, 97)
    },
    ai_content_summary: `Зарегистрированный инфлюенсер Jeli (${user.full_name}). Ниша: ${niche}.${tiktokVerified ? ' ✅ TikTok верифицирован' : ''}`,
    recommended_campaign_angle: `Прямая интеграция в роликах ${user.full_name} с промокодом.`,
    pros: [`Реальный профиль в нише "${niche}"`, tiktokVerified ? '✅ TikTok верифицирован' : 'Зарегистрирован на Jeli'],
    cons: [!tiktokVerified ? '⚠️ TikTok не подтверждён' : 'Связаться через Escrow']
  };
}
