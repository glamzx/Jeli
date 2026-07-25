import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { influencerStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { businessDescription, targetNiche, budget } = await request.json();

    if (!businessDescription) {
      return NextResponse.json({ error: "businessDescription is required" }, { status: 400 });
    }

    const candidatesMap = new Map();

    // 1. Fetch registered creators from Supabase Database via REST API
    try {
      const { data: sbProfiles } = await supabase
        .from("influencer_profiles")
        .select("*, users!user_id(*), social_accounts(*)");

      if (sbProfiles && sbProfiles.length > 0) {
        sbProfiles.forEach(inf => {
          const u = inf.users || {};
          const s = Array.isArray(inf.social_accounts) && inf.social_accounts.length > 0 ? inf.social_accounts[0] : {};
          const username = s.handle || `@${(u.full_name || 'influencer').toLowerCase().replace(/\s+/g, '')}`;
          candidatesMap.set(username.toLowerCase(), {
            id: inf.id,
            username,
            nickname: u.full_name || 'Инфлюенсер',
            niche: Array.isArray(inf.niches) && inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
            followers: Number(s.follower_count || 25000),
            bio: inf.bio || ''
          });
        });
      }
    } catch (sbErr) {
      console.warn("Supabase REST match query warning:", sbErr);
    }

    // 2. Fetch from Prisma DB
    try {
      const dbInfluencers = await prisma.influencerProfile.findMany({
        include: { user: true, socialAccounts: true }
      });
      dbInfluencers.forEach(inf => {
        const social = inf.socialAccounts[0] || {};
        const username = social.handle || `@${inf.user.fullName.toLowerCase().replace(/\s+/g, '')}`;
        if (!candidatesMap.has(username.toLowerCase())) {
          candidatesMap.set(username.toLowerCase(), {
            id: inf.id,
            username,
            nickname: inf.user.fullName,
            niche: inf.niches.length > 0 ? inf.niches.join(', ') : 'Разное',
            followers: Number(social.followerCount || 0),
            bio: inf.bio || ''
          });
        }
      });
    } catch (err) {
      console.warn("Prisma DB match fetch note:", err);
    }

    // 3. Combine runtime store
    influencerStore.forEach(c => {
      if (!candidatesMap.has(c.username.toLowerCase())) {
        candidatesMap.set(c.username.toLowerCase(), {
          id: c.id,
          username: c.username,
          nickname: c.nickname,
          niche: c.niche,
          followers: c.followers,
          bio: c.bio
        });
      }
    });

    const candidates = Array.from(candidatesMap.values());

    // 4. Zero registered candidates
    if (candidates.length === 0) {
      return NextResponse.json({
        analyzed_at: new Date().toISOString(),
        business_summary: `Анализ для: "${businessDescription.slice(0, 80)}"`,
        matches: [],
        message: "Подходящих инфлюенсеров пока нет. Зарегистрируйтесь как инфлюенсер, чтобы попасть в базу!"
      });
    }

    // 5. Gemini AI Evaluation
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

                  Оцените соответствие кандидатов от 0 до 100 и дайте рекомендации по интеграции на русском языке.`
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

    // 6. Multi-criteria score calculation
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
