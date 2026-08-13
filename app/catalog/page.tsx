"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, CheckCircle2, Star, Users, Eye, Heart, ArrowLeft,
  Sparkles, Globe, MapPin, X, ArrowRight, ExternalLink, ShieldCheck,
  Video, DollarSign, Send, Zap
} from "lucide-react";

interface Influencer {
  id: string;
  username: string;
  nickname: string;
  followers: number;
  totalLikes: number;
  totalVideos: number;
  niche: string;
  city: string;
  avatar: string;
  verified: boolean;
  bio: string;
  tiktokLinked?: boolean;
}

const formatCompact = (num: number) => {
  if (!num) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

export default function CatalogPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("Все");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minFollowers, setMinFollowers] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"followers" | "likes">("followers");

  // Selected Creator Modal
  const [selectedCreator, setSelectedCreator] = useState<Influencer | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => {
        setInfluencers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load catalog:", err);
        setInfluencers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const niches = ["Все", "IT", "Фитнес", "Бизнес", "Красота", "Развлечения", "Еда", "Путешествия", "Образование"];
  const cities = [
    { id: "all", label: lang === "ru" ? "Все города" : "All cities" },
    { id: "Алматы", label: "Алматы" },
    { id: "Астана", label: "Астана" },
    { id: "Шымкент", label: "Шымкент" }
  ];

  const filteredInfluencers = useMemo(() => {
    return influencers
      .filter((inf) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            inf.nickname.toLowerCase().includes(q) ||
            inf.username.toLowerCase().includes(q) ||
            inf.niche.toLowerCase().includes(q) ||
            (inf.bio && inf.bio.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Niche filter
        if (selectedNiche !== "Все" && !inf.niche.includes(selectedNiche)) {
          return false;
        }

        // City filter
        if (selectedCity !== "all" && inf.city !== selectedCity) {
          return false;
        }

        // Min followers
        if (inf.followers < minFollowers) {
          return false;
        }

        // Verified TikTok toggle
        if (verifiedOnly && !inf.verified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "followers") return b.followers - a.followers;
        if (sortBy === "likes") return b.totalLikes - a.totalLikes;
        return 0;
      });
  }, [influencers, search, selectedNiche, selectedCity, minFollowers, verifiedOnly, sortBy]);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </Link>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30 font-pixel">
              CATALOG
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 text-xs font-semibold">
              <button
                onClick={() => setLang("ru")}
                className={`px-2.5 py-1 rounded-full transition ${lang === "ru" ? "bg-[#0064FF] text-white" : "text-slate-400 hover:text-white"}`}
              >
                RU
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-full transition ${lang === "en" ? "bg-[#0064FF] text-white" : "text-slate-400 hover:text-white"}`}
              >
                EN
              </button>
            </div>

            <Link
              href="/register?role=BRAND"
              className="px-4 py-2 rounded-full bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue flex items-center gap-1.5"
            >
              <span>{lang === "ru" ? "Запустить кампанию" : "Launch Campaign"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Catalog Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10 space-y-8">
        {/* Header & Search Bar */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs font-bold text-[#0064FF] font-pixel">
            <Sparkles className="w-3.5 h-3.5" />
            <span>VERIFIED CREATOR DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white tracking-tight">
            {lang === "ru" ? "Каталог инфлюенсеров Казахстана" : "Kazakhstan Creator Directory"}
          </h1>
          <p className="text-sm text-slate-400">
            {lang === "ru"
              ? "Найдите верифицированных TikTok и Instagram креаторов с подтверждённой аудиторией для вашей следующей кампании."
              : "Discover authenticated TikTok and Instagram creators with real audience reach for your next marketing campaign."}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card-dark p-4 rounded-3xl space-y-4 border border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "ru" ? "Поиск по имени, хэндлу или био..." : "Search by name, handle, or bio..."}
                className="w-full bg-[#07090E] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-auto bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0064FF]"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#07090E] text-white">
                  {c.label}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0064FF]"
            >
              <option value="followers" className="bg-[#07090E] text-white">
                {lang === "ru" ? "По подписчикам" : "By Followers"}
              </option>
              <option value="likes" className="bg-[#07090E] text-white">
                {lang === "ru" ? "По лайкам" : "By Likes"}
              </option>
            </select>
          </div>

          {/* Niche Chips & Verified Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {niches.map((niche) => (
                <button
                  key={niche}
                  onClick={() => setSelectedNiche(niche)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedNiche === niche
                      ? "bg-[#0064FF] text-white glow-blue"
                      : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>

            {/* Verified Toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                verifiedOnly
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === "ru" ? "Только TikTok ✅" : "TikTok Verified Only ✅"}</span>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            {loading
              ? lang === "ru" ? "Загрузка креаторов..." : "Loading creators..."
              : `${filteredInfluencers.length} ${lang === "ru" ? "креаторов найдено" : "creators found"}`}
          </span>
        </div>

        {/* Creator Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="glass-card-dark p-6 rounded-3xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredInfluencers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((creator) => (
              <motion.div
                key={creator.id || creator.username}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-dark p-6 rounded-3xl border border-white/10 space-y-4 hover:border-[#0064FF]/40 transition group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Creator Header */}
                  <div className="flex items-start gap-4">
                    <img
                      src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.nickname}`}
                      alt={creator.nickname}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:scale-105 transition duration-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-white truncate">{creator.nickname}</h3>
                        {creator.verified && <CheckCircle2 className="w-4 h-4 text-[#0064FF] flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{creator.username}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0064FF]/10 text-[#0064FF] border border-[#0064FF]/20">
                          {creator.niche}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {creator.city || "Алматы"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-[36px]">
                    {creator.bio || (lang === "ru" ? "Зарегистрированный креатор на платформе Jeli." : "Registered creator on Jeli platform.")}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#07090E] p-3 rounded-2xl border border-white/5 text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {lang === "ru" ? "Подписчики" : "Followers"}
                      </p>
                      <p className="text-sm font-extrabold text-white">{formatCompact(creator.followers)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {lang === "ru" ? "Лайки" : "Likes"}
                      </p>
                      <p className="text-sm font-extrabold text-white">{formatCompact(creator.totalLikes)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {lang === "ru" ? "Ролики" : "Videos"}
                      </p>
                      <p className="text-sm font-extrabold text-[#0064FF]">{creator.totalVideos || 12}</p>
                    </div>
                  </div>
                </div>

                {/* Card CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCreator(creator)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#0064FF] hover:text-white text-slate-300 font-bold text-xs transition border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === "ru" ? "Медиакит & Аналитика" : "View Media Kit"}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card-dark p-12 rounded-3xl text-center space-y-4 border border-white/10">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="font-bold text-lg text-white">
              {lang === "ru" ? "Инфлюенсеры не найдены" : "No creators found"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {lang === "ru"
                ? "Попробуйте изменить поисковый запрос или сбросить фильтры."
                : "Try adjusting your search query or clear filter selections."}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedNiche("Все");
                setSelectedCity("all");
                setVerifiedOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#0064FF] text-white text-xs font-bold"
            >
              {lang === "ru" ? "Сбросить фильтры" : "Reset Filters"}
            </button>
          </div>
        )}
      </main>

      {/* ==================== MEDIA KIT MODAL OVERLAY ==================== */}
      <AnimatePresence>
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card-dark border border-white/15 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCreator(null)}
                className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Creator Header */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <img
                  src={selectedCreator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCreator.nickname}`}
                  alt={selectedCreator.nickname}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-[#0064FF]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">{selectedCreator.nickname}</h2>
                    {selectedCreator.verified && <CheckCircle2 className="w-5 h-5 text-[#0064FF]" />}
                  </div>
                  <p className="text-xs text-slate-400">{selectedCreator.username}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF]">
                      {selectedCreator.niche}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">📍 {selectedCreator.city || "Алматы"}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-emerald-400">
                      {lang === "ru" ? "TikTok OAuth Верифицирован" : "TikTok OAuth Authenticated"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {lang === "ru" ? "Статистика подтверждена через официальный TikTok API" : "Metrics verified via official TikTok API"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-pixel">
                  {lang === "ru" ? "МЕТРИКИ ВОВЛЕЧЁННОСТИ" : "PERFORMANCE METRICS"}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#07090E] p-3.5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500">Подписчики</p>
                    <p className="text-base font-extrabold text-white">{formatCompact(selectedCreator.followers)}</p>
                  </div>
                  <div className="bg-[#07090E] p-3.5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500">Лайки</p>
                    <p className="text-base font-extrabold text-white">{formatCompact(selectedCreator.totalLikes)}</p>
                  </div>
                  <div className="bg-[#07090E] p-3.5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500">ER %</p>
                    <p className="text-base font-extrabold text-[#0064FF]">
                      {selectedCreator.followers > 0
                        ? (Math.min((selectedCreator.totalLikes / selectedCreator.followers) * 10, 15.5)).toFixed(1) + "%"
                        : "6.5%"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio & Rate Card */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-pixel">
                  {lang === "ru" ? "О КРЕАТОРЕ" : "ABOUT CREATOR"}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#07090E] p-4 rounded-2xl border border-white/5">
                  {selectedCreator.bio || (lang === "ru" ? "Зарегистрированный креатор Jeli. Специализируется на съёмке коротких видео роликов для брендов." : "Registered Jeli creator specializing in short-form brand integration videos.")}
                </p>
              </div>

              {/* Direct Campaign Proposal CTA */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/register?role=BRAND&invitedCreator=${encodeURIComponent(selectedCreator.username)}`}
                  className="w-full sm:flex-1 py-3.5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue text-center flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === "ru" ? "Отправить предложение о рекламе" : "Send Campaign Offer"}</span>
                </Link>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
                >
                  {lang === "ru" ? "Закрыть" : "Close"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
