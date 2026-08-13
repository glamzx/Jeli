"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, ExternalLink, Heart, MessageCircle,
  Play, Share2, Users, Video, Hash, Sparkles, AlertCircle,
  TrendingUp, BarChart3, Target, ShieldCheck, DollarSign
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
      <div className="min-h-screen bg-[#05070A] text-slate-100 flex items-center justify-center text-xs">
        <div className="w-5 h-5 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin mr-2" />
        Анализ профиля @{username}...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#05070A] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold font-outfit text-white">Профиль не найден</h1>
          <p className="text-xs text-slate-400">{error}</p>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-[#0064FF] text-white text-xs font-bold glow-blue inline-block">
            Вернуться в дашборд
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070A]/85 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/catalog" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </Link>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30 font-pixel">
              CREATOR ANALYTICS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 text-xs font-bold rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              {refreshing ? "Обновление..." : "Обновить данные"}
            </button>
            <a
              href={`https://www.tiktok.com/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-white text-black hover:bg-slate-200 transition"
            >
              TikTok <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 relative z-10 space-y-6">
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-dark border border-white/10 rounded-3xl p-8 space-y-4"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <img
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.nickname}`}
              alt={profile.nickname}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-[#0064FF]"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold font-outfit text-white">{profile.nickname}</h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified ✅
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30">
                  {profile.metrics.influencerTier} Creator
                </span>
              </div>
              <p className="text-xs text-[#0064FF] font-bold">{profile.username}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{profile.bio || "Зарегистрированный креатор Jeli."}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-2 border-t border-white/5">
                <Sparkles className="w-3.5 h-3.5 text-[#0064FF]" />
                Источник: {profile.source === "live" ? "Live Scrape" : "Verified API"} · Обновлено: {new Date(profile.scrapedAt).toLocaleDateString("ru-RU")}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4 Performance Metric Columns (Identical to Image 3 Spec) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Подписчики", value: profile.metrics.followers.toLocaleString(), color: "text-white" },
            { label: "Лайки", value: profile.metrics.totalLikes.toLocaleString(), color: "text-white" },
            { label: "Всего Роликов", value: profile.metrics.totalVideos.toLocaleString(), color: "text-white" },
            { label: "Engagement Rate", value: `${profile.metrics.engagementRate}%`, color: "text-[#0064FF]" }
          ].map((stat, i) => (
            <div key={i} className="glass-card-dark p-5 rounded-3xl border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <p className={`text-2xl font-extrabold font-outfit ${stat.color} flex items-center gap-1`}>
                <span className="font-pixel text-lg text-[#0064FF]">↑</span>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Content Intelligence & Alignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card-dark border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-base text-white">Контент-аналитика Jeli AI</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Основная ниша</p>
                <p className="text-sm font-extrabold text-[#0064FF]">{profile.contentIntelligence.primaryNiche}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ключевые темы</p>
                <div className="flex flex-wrap gap-2">
                  {profile.contentIntelligence.topKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {alignment && (
            <div className="glass-card-dark border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0064FF]" />
                <h2 className="font-bold text-base text-white">Оценка соответствия бизнесу</h2>
              </div>
              <div className="text-center py-2">
                <p className="text-4xl font-extrabold font-outfit text-white flex items-center justify-center gap-2">
                  <span className="font-pixel text-2xl text-[#0064FF]">↑</span>
                  {alignment.alignmentScorePct}%
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-1">{alignment.alignmentLevel}</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Samples List */}
        <div className="glass-card-dark border border-white/10 rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-[#0064FF]" />
            Примеры TikTok видео ({profile.videoSamples.length})
          </h2>

          <div className="space-y-3">
            {profile.videoSamples.slice(0, 5).map((video, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#07090E] border border-white/5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-white font-medium line-clamp-1">{video.caption || "TikTok интеграция"}</p>
                  <div className="flex gap-4 text-[11px] text-slate-400">
                    <span>👁️ {video.plays.toLocaleString()}</span>
                    <span>❤️ {video.likes.toLocaleString()}</span>
                  </div>
                </div>
                {video.videoUrl && (
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 text-[#0064FF] hover:bg-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex gap-4 justify-center pt-4 pb-8">
          <Link
            href="/register?role=BRAND"
            className="px-8 py-3.5 rounded-full bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue"
          >
            Предложить рекламный контракт
          </Link>
          <Link
            href="/catalog"
            className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition"
          >
            Вернуться в каталог
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function InfluencerDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center text-slate-400 text-xs">
        Загрузка...
      </div>
    }>
      <InfluencerDetailContent />
    </Suspense>
  );
}
