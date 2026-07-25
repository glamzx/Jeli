import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { businessDescription, targetNiche, budget } = await request.json();

    if (!businessDescription) {
      return NextResponse.json({ error: 'businessDescription is required' }, { status: 400 });
    }

    // Fetch registered creators from Supabase
    const { data: profiles } = await supabase
      .from('influencer_profiles')
      .select('*, users!user_id(*), social_accounts(*)');

    const candidates = (profiles || []).map(inf => {
      const user = inf.users || {};
      const socials = Array.isArray(inf.social_accounts) ? inf.social_accounts : [];
      const primary = socials.find((s: any) => s.platform === 'TIKTOK') || socials[0] || {};
      const tiktokVerified = socials.some(
        (s: any) => s.platform === 'TIKTOK' && s.access_token && s.follower_count > 0
      );

      return {
        id: inf.id,
        username: primary.handle || `@${(user.full_name || 'influencer').toLowerCase().replace(/\s+/g, '')}`,
        nickname: user.full_name || 'Инфлюенсер',
        niche: Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
        followers: Number(primary.follower_count || 0),
        bio: inf.bio || '',
        tiktokVerified
      };
    });

    // No registered candidates
    if (candidates.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: 'Подходящих инфлюенсеров пока нет. Зарегистрируйтесь как инфлюенсер, чтобы попасть в базу!'
      });
    }

    // Gemini AI Evaluation
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
                  text: `Вы — AI Аналитик инфлюенс-маркетинга Jeli в Казахстане. Проанализируйте запрос бизнеса и подходящих инфлюенсеров из базы данных.
                  Бизнес: "${businessDescription}"
                  Целевая ниша: "${targetNiche || 'Все ниши'}"
                  Бюджет: "${budget || 'Не указан'}"

                  Зарегистрированные кандидаты:
                  ${JSON.stringify(candidates)}

                  Оцените соответствие кандидатов от 0 до 100 и дайте рекомендации по интеграции на русском языке.`
                }]
              }]
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiEvaluationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (geminiErr) {
        console.error('Gemini API match warning:', geminiErr);
      }
    }

    // Multi-criteria score calculation
    const words = (businessDescription + ' ' + (targetNiche || '')).toLowerCase().split(/\s+/);

    const matches = candidates.map(inf => {
      let score = 65;
      const combinedText = (inf.bio + ' ' + inf.niche).toLowerCase();

      words.forEach(w => {
        if (w.length > 3 && combinedText.includes(w)) {
          score += 12;
        }
      });

      if (targetNiche && targetNiche !== 'Все ниши' && inf.niche.toLowerCase().includes(targetNiche.toLowerCase())) {
        score += 20;
      }

      // Bonus for TikTok verified creators
      if (inf.tiktokVerified) score += 10;

      score = Math.min(Math.max(score, 50), 98);

      let tier = 'Высокое совпадение 🔥';
      if (score < 75) tier = 'Умеренное совпадение ⚡';
      if (score < 60) tier = 'Базовое совпадение ⚠️';

      return {
        username: inf.username,
        nickname: inf.nickname,
        overall_alignment_score: score,
        alignment_tier: tier,
        followers: inf.followers,
        niche: inf.niche,
        tiktokVerified: inf.tiktokVerified,
        multi_criteria_scores: {
          niche_topic_fit: Math.min(score + 3, 99),
          audience_demographics_reach: Math.min(Math.round(Math.log10(Math.max(inf.followers, 1)) * 15), 99),
          content_tone_aesthetics: Math.min(score - 2, 95),
          commercial_conversion_potential: Math.min(score + 1, 97)
        },
        ai_content_summary: aiEvaluationText
          ? aiEvaluationText.slice(0, 180) + '...'
          : `Зарегистрированный инфлюенсер Jeli (${inf.nickname}). Ниша: ${inf.niche}. Охват: ${(inf.followers || 0).toLocaleString()} подписчиков.${inf.tiktokVerified ? ' ✅ TikTok верифицирован' : ''}`,
        recommended_campaign_angle: `Прямая интеграция в роликах ${inf.nickname} с размещением промокода и ссылки в шапке профиля.`,
        pros: [
          `Реальный профиль в нише "${inf.niche}"`,
          inf.tiktokVerified ? '✅ TikTok аккаунт верифицирован' : 'Зарегистрирован на Jeli'
        ],
        cons: [
          !inf.tiktokVerified ? '⚠️ TikTok аккаунт ещё не подтверждён' : 'Рекомендуется связаться через Escrow'
        ]
      };
    });

    let filteredMatches = matches;
    if (targetNiche && targetNiche !== 'Все ниши') {
      filteredMatches = matches.filter(m =>
        m.niche.toLowerCase().includes(targetNiche.toLowerCase()) || m.overall_alignment_score >= 70
      );
    }

    filteredMatches.sort((a, b) => b.overall_alignment_score - a.overall_alignment_score);

    if (filteredMatches.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: 'Подходящих инфлюенсеров пока нет'
      });
    }

    return NextResponse.json({
      analyzed_at: new Date().toISOString(),
      business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
      matches: filteredMatches
    });
  } catch (error: any) {
    console.error('AI Match route error:', error);
    return NextResponse.json({ error: 'AI Match evaluation error', details: error.message }, { status: 500 });
  }
}
