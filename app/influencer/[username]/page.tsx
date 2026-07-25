"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, ExternalLink, Heart, MessageCircle,
  Play, Share2, Users, Video, Hash, Sparkles, AlertCircle,
  TrendingUp, BarChart3, Target
} from "lucide-react";

interface ProfileData {
  username: string;
  nickname: string;
  bio: string;
  verified: boolean;
  avatarUrl: string;
  metrics: {
    followers: number;
    following: number;
    totalLikes: number;
    totalVideos: number;
    avgLikesPerVideo: number;
    influencerTier: string;
    engagementRate: number;
  };
  contentIntelligence: {
    primaryNiche: string;
    topKeywords: string[];
    topHashtags: string[];
    contentSummary: string;
  };
  videoSamples: {
    videoId: string;
    caption: string;
    videoUrl: string;
    plays: number;
    likes: number;
    comments: number;
    shares: number;
  }[];
  scrapedAt: string;
  source: string;
}

interface AlignmentData {
  alignmentScorePct: number;
  alignmentLevel: string;
  totalBusinessKeywords: number;
  matchedKeywordCount: number;
  matchedKeywords: { keyword: string; count: number }[];
}

function InfluencerDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = (params.username as string || "").replace(/^@/, "");
  const businessQuery = searchParams.get("business") || "";

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [alignment, setAlignment] = useState<AlignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async (live = false) => {
    setLoading(!profile);
    setError(null);
    try {
      const qs = new URLSearchParams({ username });
      if (live) qs.set("live", "true");
      if (businessQuery) qs.set("business", businessQuery);

      const res = await fetch(`/api/v1/scrape/tiktok?${qs}`);
      const data = await res.json();

      if (data.success) {
        setProfile(data.profile);
        setAlignment(data.alignment || null);
      } else {
        setError(data.message || "Профиль не найден");
      }
    } catch {
      setError("Ошибка загрузки данных профиля");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfile();
  }, [username, businessQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-500 text-sm flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin" />
          Анализ профиля @{username}...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Профиль не найден</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-[#0064FF] text-white text-sm font-bold">
            Вернуться в дашборд
          </Link>
        </div>
      </div>
    );
  }

  const tierColors: Record<string, string> = {
    Mega: "text-purple-500 bg-purple-500/10",
    Macro: "text-blue-500 bg-blue-500/10",
    Micro: "text-emerald-500 bg-emerald-500/10",
    Nano: "text-amber-500 bg-amber-500/10"
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F8FC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-3xl font-extrabold italic font-['Outfit']">Jeli.</Link>
            <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[#0064FF] rounded-full font-semibold">
              Анализ инфлюенсера
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              {refreshing ? "Обновление..." : "Обновить данные"}
            </button>
            <a
              href={`https://www.tiktok.com/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-full bg-black text-white hover:bg-gray-800 transition"
            >
              TikTok <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0064FF] to-blue-700 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
              ) : (
                profile.nickname.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-extrabold">{profile.nickname}</h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierColors[profile.metrics.influencerTier] || tierColors.Micro}`}>
                  {profile.metrics.influencerTier} Influencer
                </span>
              </div>
              <p className="text-[#0064FF] font-semibold mb-2">{profile.username}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{profile.bio || "Нет описания"}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="w-3.5 h-3.5" />
                Источник: {profile.source === "live" ? "Live scrape" : profile.source === "cache" ? "Кэш" : "Каталог"}
                · Обновлено: {new Date(profile.scrapedAt).toLocaleString("ru-RU")}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Подписчики", value: profile.metrics.followers.toLocaleString(), icon: Users, color: "text-[#0064FF]" },
            { label: "Лайки", value: profile.metrics.totalLikes.toLocaleString(), icon: Heart, color: "text-red-500" },
            { label: "Видео", value: profile.metrics.totalVideos.toLocaleString(), icon: Video, color: "text-purple-500" },
            { label: "Вовлечённость", value: `${profile.metrics.engagementRate}%`, icon: TrendingUp, color: "text-emerald-500" }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-slate-500 font-semibold">{stat.label}</span>
              </div>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Intelligence + Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-lg">Контент-анализ Jeli</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Основная ниша</p>
                <p className="font-bold text-[#0064FF]">{profile.contentIntelligence.primaryNiche}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Ключевые темы</p>
                <div className="flex flex-wrap gap-2">
                  {profile.contentIntelligence.topKeywords.length > 0 ? (
                    profile.contentIntelligence.topKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">{kw}</span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Нет данных</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Топ хэштеги</p>
                <div className="flex flex-wrap gap-2">
                  {profile.contentIntelligence.topHashtags.length > 0 ? (
                    profile.contentIntelligence.topHashtags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-[#0064FF] rounded-full text-xs font-medium">
                        <Hash className="w-3 h-3" />{tag.replace("#", "")}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Нет хэштегов</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">{profile.contentIntelligence.contentSummary}</p>
            </div>
          </div>

          {alignment ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#0064FF]" />
                <h2 className="font-bold text-lg">Соответствие бизнесу</h2>
              </div>
              <div className="text-center mb-6">
                <p className="text-5xl font-extrabold text-[#0064FF]">{alignment.alignmentScorePct}%</p>
                <p className="text-sm font-semibold mt-2">{alignment.alignmentLevel}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Совпало ключевых слов: {alignment.matchedKeywordCount} из {alignment.totalBusinessKeywords}
                </p>
                {alignment.matchedKeywords.map((mk, i) => (
                  <div key={i} className="flex justify-between text-sm px-3 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <span className="font-medium">{mk.keyword}</span>
                    <span className="text-slate-500">{mk.count} упоминаний</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
              <Target className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Укажите описание бизнеса при поиске, чтобы увидеть оценку соответствия</p>
            </div>
          )}
        </div>

        {/* Video Samples */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Video className="w-5 h-5 text-[#0064FF]" />
            <h2 className="font-bold text-lg">Анализ видео ({profile.videoSamples.length})</h2>
          </div>

          {profile.videoSamples.length > 0 ? (
            <div className="space-y-4">
              {profile.videoSamples.slice(0, 10).map((video, i) => (
                <div key={video.videoId || i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="text-sm flex-1">{video.caption || "Без описания"}</p>
                    {video.videoUrl && (
                      <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[#0064FF] flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Play className="w-3.5 h-3.5" /> {video.plays.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {video.likes.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {video.comments.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {video.shares.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              Видео недоступны — TikTok не вернул список роликов. Метрики профиля загружены успешно.
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center pb-8">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-full bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-sm transition"
          >
            Вернуться в дашборд
          </Link>
          <Link
            href={`/chat?influencer=${encodeURIComponent(profile.username)}`}
            className="px-8 py-3 rounded-full border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Связаться с инфлюенсером
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function InfluencerDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Загрузка...</div>
      </div>
    }>
      <InfluencerDetailContent />
    </Suspense>
  );
}
