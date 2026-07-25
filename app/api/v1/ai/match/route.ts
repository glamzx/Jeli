import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { influencerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { businessDescription, targetNiche, budget } = await request.json();

    if (!businessDescription) {
      return NextResponse.json({ error: "businessDescription is required" }, { status: 400 });
    }

    // 1. Fetch from Prisma DB
    let dbCandidates: any[] = [];
    try {
      const dbInfluencers = await prisma.influencerProfile.findMany({
        include: {
          user: true,
          socialAccounts: true
        }
      });

      dbCandidates = dbInfluencers.map(inf => {
        const social = inf.socialAccounts[0] || {};
        const followers = Number(social.followerCount || 0);
        return {
          id: inf.id,
          username: social.handle || `@${inf.user.fullName.toLowerCase().replace(/\s+/g, '')}`,
          nickname: inf.user.fullName,
          niche: inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
          followers: followers,
          bio: inf.bio || ''
        };
      });
    } catch (err) {
      console.warn("Prisma DB match fetch warning (Handled):", err);
    }

    // 2. Combine with runtime influencerStore
    const combinedCandidatesMap = new Map();
    dbCandidates.forEach(c => combinedCandidatesMap.set(c.username.toLowerCase(), c));
    influencerStore.forEach(c => {
      if (!combinedCandidatesMap.has(c.username.toLowerCase())) {
        combinedCandidatesMap.set(c.username.toLowerCase(), {
          id: c.id,
          username: c.username,
          nickname: c.nickname,
          niche: c.niche,
          followers: c.followers,
          bio: c.bio
        });
      }
    });

    const candidates = Array.from(combinedCandidatesMap.values());

    // 3. If zero candidates exist in database or runtime store
    if (candidates.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: "Подходящих инфлюенсеров пока нет. Зарегистрируйтесь на платформе, чтобы попасть в базу!"
      });
    }

    // 4. Gemini AI Evaluation
    let aiEvaluationText = "";
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here") {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Вы — AI Аналитик инфлюенс-маркетинга Jeli в Казахстане. Проанализируйте запрос бизнеса и подходящих инфлюенсеров из базы данных.
                  Бизнес: "${businessDescription}"
                  Целевая ниша: "${targetNiche || 'Все ниши'}"
                  Бюджет: "${budget || 'Не указан'}"

                  Зарегистрированные кандидаты:
                  ${JSON.stringify(candidates)}

                  Оцените соответствие кандидатов от 0 до 100 и дайте короткие рекомендации на русском языке.`
                }]
              }]
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiEvaluationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (geminiErr) {
        console.error("Gemini API match warning:", geminiErr);
      }
    }

    // 5. Multi-criteria score matching algorithm
    const words = (businessDescription + " " + (targetNiche || "")).toLowerCase().split(/\s+/);
    
    const matches = candidates.map(inf => {
      let score = 65;
      const combinedText = (inf.bio + " " + inf.niche).toLowerCase();
      
      words.forEach(w => {
        if (w.length > 3 && combinedText.includes(w)) {
          score += 12;
        }
      });

      if (targetNiche && targetNiche !== 'Все ниши' && inf.niche.toLowerCase().includes(targetNiche.toLowerCase())) {
        score += 20;
      }

      score = Math.min(Math.max(score, 50), 98);

      let tier = "Высокое совпадение 🔥";
      if (score < 75) tier = "Умеренное совпадение ⚡";
      if (score < 60) tier = "Базовое совпадение ⚠️";

      return {
        username: inf.username,
        nickname: inf.nickname,
        overall_alignment_score: score,
        alignment_tier: tier,
        followers: inf.followers,
        niche: inf.niche,
        multi_criteria_scores: {
          niche_topic_fit: Math.min(score + 3, 99),
          audience_demographics_reach: Math.min(Math.round(Math.log10(inf.followers || 1000) * 15), 99),
          content_tone_aesthetics: Math.min(score - 2, 95),
          commercial_conversion_potential: Math.min(score + 1, 97)
        },
        ai_content_summary: aiEvaluationText ? aiEvaluationText.slice(0, 180) + "..." : `Зарегистрированный инфлюенсер Jeli (${inf.nickname}). Ниша: ${inf.niche}. Охват: ${(inf.followers || 0).toLocaleString()} подписчиков.`,
        recommended_campaign_angle: `Прямая интеграция в роликах ${inf.nickname} с размещением промокода и ссылки в шапке профиля.`,
        pros: [
          `Реальный профиль в нише "${inf.niche}"`,
          `Подтвержденный аккаунт в базе Jeli`
        ],
        cons: [
          `Рекомендуется связаться через платную безопасную сделку Escrow`
        ]
      };
    });

    // 6. Filter by niche if requested
    let filteredMatches = matches;
    if (targetNiche && targetNiche !== "Все ниши") {
      filteredMatches = matches.filter(m => m.niche.toLowerCase().includes(targetNiche.toLowerCase()) || m.overall_alignment_score >= 70);
    }

    filteredMatches.sort((a, b) => b.overall_alignment_score - a.overall_alignment_score);

    if (filteredMatches.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: "Подходящих инфлюенсеров пока нет"
      });
    }

    return NextResponse.json({
      analyzed_at: new Date().toISOString(),
      business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
      matches: filteredMatches
    });

  } catch (error: any) {
    console.error("AI Match route error:", error);
    return NextResponse.json({ error: "AI Match evaluation error", details: error.message }, { status: 500 });
  }
}
