"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, Send, AlertCircle, CheckCircle2, XCircle,
  Search, Users, ExternalLink, Loader2, ArrowLeft, ShieldCheck,
  Building2, Lock, TrendingUp, BarChart3, Settings, LogOut, LayoutDashboard
} from "lucide-react";

interface SessionUser {
  id: string;
  email: string;
  fullName?: string;
  role?: "INFLUENCER" | "BRAND" | "ADMIN";
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"CAMPAIGNS" | "INFLUENCER_FINDER" | "ANALYTICS" | "AI_ASSISTANT">("CAMPAIGNS");
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInfluencers: 0,
    totalBrands: 0,
    totalVerified: 0,
    totalCampaigns: 0,
    totalDeals: 0,
    escrowLockedAmount: 0
  });
  const [deals, setDeals] = useState<any[]>([]);

  // Influencer finder
  const [businessDesc, setBusinessDesc] = useState(
    "Ищем IT и технологических блогеров в Казахстане для продвижения AI-платформы Jeli."
  );
  const [targetNiche, setTargetNiche] = useState("Все ниши");
  const [budget, setBudget] = useState("500,000 ₸");
  const [audience, setAudience] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [tone, setTone] = useState("");
  const [location, setLocation] = useState("Казахстан");
  const [tiktokUsernames, setTiktokUsernames] = useState("");
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverResults, setDiscoverResults] = useState<any[] | null>(null);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState<string | null>(null);

  // AI assistant
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Привет! Я твой AI Менеджер Jeli (Gemini AI). Чем могу помочь? Могу сгенерировать рекламное предложение, рассчитать бюджет или подобрать локальных инфлюенсеров."
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [tiktokNotification, setTiktokNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      let parsed: SessionUser | null = null;
      try {
        const response = await fetch("/api/v1/auth/session", { cache: "no-store" });
        const data = await response.json();
        if (data.authenticated && data.user) {
          parsed = data.user;
          localStorage.setItem("jeli_user", JSON.stringify(parsed));
        }
      } catch { /* use legacy local session below */ }
      if (!parsed) {
        const storedUser = localStorage.getItem("jeli_user");
        if (storedUser) {
          try { parsed = JSON.parse(storedUser); } catch { localStorage.removeItem("jeli_user"); }
        }
      }
      if (!parsed) { router.replace("/login"); return; }
      setSessionUser(parsed);
      if (parsed.role === "BRAND") setActiveTab("INFLUENCER_FINDER");
      setCheckingSession(false);
      fetchDashboardData();

      const tiktokParam = searchParams.get("tiktok");
      if (tiktokParam === "linked") {
        const username = searchParams.get("username") || "";
        const followers = searchParams.get("followers") || "0";
        setTiktokNotification({ type: "success", message: `TikTok @${username} привязан! Подписчики: ${Number(followers).toLocaleString()}` });
        window.history.replaceState({}, "", "/dashboard");
      } else if (tiktokParam === "error") {
        const reason = searchParams.get("reason") || "unknown";
        setTiktokNotification({ type: "error", message: `Не удалось привязать TikTok: ${reason}` });
        window.history.replaceState({}, "", "/dashboard");
      }
    };
    restoreSession();
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("jeli_user");
    fetch("/api/v1/auth/session", { method: "DELETE" }).catch(() => undefined);
    router.replace("/login");
  };

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/v1/dashboard");
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recentDeals) setDeals(data.recentDeals);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || aiLoading) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInputMsg("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.reply || `Анализирую: "${userText}".` }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Произошла ошибка при обращении к AI Менеджеру." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscoverLoading(true);
    setDiscoverResults(null);
    setDiscoverError(null);

    const usernames = tiktokUsernames
      .split(/[,\s\n]+/)
      .map(u => u.trim().replace(/^@/, ""))
      .filter(Boolean);

    try {
      const res = await fetch("/api/v1/influencers/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDesc,
          targetNiche,
          budget,
          audience,
          campaignGoal,
          deliverables,
          tone,
          location,
          tiktokUsernames: usernames,
          includeRegistered: true,
          userId: sessionUser?.id
        })
      });
      const data = await res.json();

      if (data.success && data.matches?.length > 0) {
        setDiscoverResults(data.matches);
      } else if (data.success) {
        setDiscoverError("Инфлюенсеры не найдены. Укажите TikTok username для скрапинга.");
      } else {
        setDiscoverError(data.error || "Ошибка поиска");
      }
    } catch {
      setDiscoverError("Ошибка подключения к серверу");
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleQuickScrape = async (username: string) => {
    const clean = username.replace(/^@/, "");
    setScrapeLoading(clean);
    setDiscoverError(null);
    try {
      const res = await fetch("/api/v1/scrape/tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: clean,
          businessDescription: businessDesc,
          userId: sessionUser?.id
        })
      });
      const data = await res.json();
      if (data.success && data.results?.[0]?.profile) {
        router.push(`/influencer/${clean}?business=${encodeURIComponent(businessDesc)}`);
      } else {
        setDiscoverError(data.results?.[0]?.error || data.message || `Не удалось просканировать @${clean}`);
      }
    } catch {
      setDiscoverError("Ошибка скрапинга");
    } finally {
      setScrapeLoading(null);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#0064FF] mr-2" />
        Проверка авторизации...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </Link>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30 font-pixel">
              DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-3">
            {sessionUser && (
              <div className="hidden lg:block text-right mr-3">
                <p className="text-xs font-bold text-white">{sessionUser.fullName || sessionUser.email}</p>
                <p className="text-[10px] text-slate-400">
                  {sessionUser.role === "BRAND" ? "Бизнес Аккаунт" : sessionUser.role === "INFLUENCER" ? "Профиль Инфлюенсера" : "Пользователь"}
                </p>
              </div>
            )}

            <div className="flex items-center glass-pill p-1 rounded-full text-xs font-semibold">
              {(["INFLUENCER_FINDER", "CAMPAIGNS", "ANALYTICS", "AI_ASSISTANT"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-full transition ${
                    activeTab === tab ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab === "INFLUENCER_FINDER" ? "AI Матчер" :
                   tab === "CAMPAIGNS" ? "Сделки Escrow" :
                   tab === "ANALYTICS" ? "Аналитика" : "AI Менеджер"}
                </button>
              ))}
            </div>

            <Link href="/settings" className="p-2 rounded-full glass-pill hover:text-white text-slate-400 transition" title="Настройки">
              <Settings className="w-4 h-4" />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-full glass-pill hover:text-red-400 text-slate-400 transition" title="Выйти">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Notification Banner */}
      {tiktokNotification && (
        <div className={`px-6 py-3 border-b ${tiktokNotification.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              {tiktokNotification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {tiktokNotification.message}
            </div>
            <button onClick={() => setTiktokNotification(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 relative z-10 space-y-6">

        {/* AI INFLUENCER FINDER & MATCHER */}
        {activeTab === "INFLUENCER_FINDER" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs font-bold text-[#0064FF] font-pixel">
                <Sparkles className="w-3.5 h-3.5" />
                GEMINI AI MATCHING ENGINE
              </div>
              <h1 className="text-3xl font-extrabold font-outfit text-white">AI-Подбор & Скрапинг Креаторов</h1>
              <p className="text-xs text-slate-400">
                Задайте параметры кампании для умного скоринга или просканируйте любой TikTok хэндл в реальном времени.
              </p>
            </div>

            <form onSubmit={handleDiscover} className="glass-card-dark p-6 rounded-3xl space-y-4 border border-white/10">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Описание продукта / рекламной кампании
                </label>
                <textarea
                  value={businessDesc}
                  onChange={e => setBusinessDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#07090E] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Ниша</label>
                  <select value={targetNiche} onChange={e => setTargetNiche(e.target.value)}
                    className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]">
                    <option className="bg-[#07090E] text-white">Все ниши</option>
                    <option className="bg-[#07090E] text-white">Tech & Software</option>
                    <option className="bg-[#07090E] text-white">Fitness & Health</option>
                    <option className="bg-[#07090E] text-white">Beauty & Skincare</option>
                    <option className="bg-[#07090E] text-white">Business & Finance</option>
                    <option className="bg-[#07090E] text-white">Food & Cooking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Бюджет</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}
                    className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]">
                    <option className="bg-[#07090E] text-white">до 250,000 ₸</option>
                    <option className="bg-[#07090E] text-white">250,000 ₸ – 1,000,000 ₸</option>
                    <option className="bg-[#07090E] text-white">более 1,000,000 ₸</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">TikTok usernames для скрапинга</label>
                  <input
                    type="text"
                    value={tiktokUsernames}
                    onChange={e => setTiktokUsernames(e.target.value)}
                    placeholder="khaby.lame, therock..."
                    className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={discoverLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue disabled:opacity-50">
                  {discoverLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {discoverLoading ? "AI Сканирование..." : "Запустить AI-Анализ"}
                </button>
              </div>
            </form>

            {discoverError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {discoverError}
              </div>
            )}

            {discoverResults && discoverResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-lg text-white">Результаты AI-подбора ({discoverResults.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoverResults.map((match, i) => (
                    <div key={i} className="glass-card-dark border border-white/10 rounded-3xl p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#0064FF]/20 border border-[#0064FF]/40 flex items-center justify-center text-white font-bold overflow-hidden">
                            {match.avatarUrl ? <img src={match.avatarUrl} alt="" className="w-full h-full object-cover" /> : (match.nickname || "?").charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{match.nickname}</h4>
                            <p className="text-xs text-[#0064FF]">{match.username}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0064FF] bg-[#0064FF]/20 px-2.5 py-1 rounded-full border border-[#0064FF]/30">
                          {match.overallAlignmentScore}% Match 🔥
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{match.aiRecommendation || match.bio}</p>
                      <Link
                        href={`/influencer/${match.username.replace(/^@/, "")}?business=${encodeURIComponent(businessDesc)}`}
                        className="block text-center py-2.5 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white text-xs font-bold transition"
                      >
                        Обзор медиакита →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ESCROW CAMPAIGNS TRACKER */}
        {activeTab === "CAMPAIGNS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold font-outfit text-white">Активные Сделки & Escrow</h1>
                <p className="text-xs text-slate-400">Все платежи заблокированы в гарантийном сейфе Jeli Escrow.</p>
              </div>
              <button onClick={() => setActiveTab("INFLUENCER_FINDER")} className="px-5 py-2.5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 font-bold text-xs text-white transition glow-blue">
                + Новый Заказ
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Креаторов в Базе", value: stats.totalInfluencers, icon: Users, color: "text-white" },
                { label: "TikTok Verified ✅", value: stats.totalVerified, icon: ShieldCheck, color: "text-emerald-400" },
                { label: "Заморожено в Escrow", value: `${stats.escrowLockedAmount.toLocaleString()} ₸`, icon: Lock, color: "text-emerald-400" },
                { label: "Активных Сделок", value: stats.totalDeals, icon: TrendingUp, color: "text-[#0064FF]" }
              ].map((s, i) => (
                <div key={i} className="glass-card-dark p-5 rounded-3xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                    <s.icon className="w-4 h-4 text-[#0064FF]" />
                  </div>
                  <p className={`text-2xl font-extrabold font-outfit ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Deals List */}
            <div className="glass-card-dark border border-white/10 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-base text-white">Текущие интеграции</h3>
              {deals.length > 0 ? (
                deals.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-[#07090E] border border-white/5">
                    <div>
                      <h4 className="font-bold text-sm text-white">{d.campaign?.title || "Интеграция"}</h4>
                      <span className="text-xs text-slate-400">Заблокировано: {d.agreedPayout || "150,000"} ₸</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                      Escrow Защита Активна ✅
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-[#07090E] rounded-2xl border border-white/5 space-y-3">
                  <AlertCircle className="w-8 h-8 text-[#0064FF] mx-auto" />
                  <h4 className="font-bold text-sm text-white">Пока нет активных сделок</h4>
                  <p className="text-xs text-slate-400">Выберите подходящего креатора через AI Матчер для создания первого депозита.</p>
                  <button onClick={() => setActiveTab("INFLUENCER_FINDER")} className="px-4 py-2 rounded-xl bg-[#0064FF] text-white text-xs font-bold">
                    Найти Инфлюенсера
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "ANALYTICS" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-extrabold font-outfit text-white">Аналитика Охватов & Конверсий</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card-dark border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-sm text-white mb-2">Охваты интеграций</h3>
                <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                  {stats.totalInfluencers > 0 ? `${stats.totalInfluencers} зарегистрированных блогеров` : "Нет данных"}
                </div>
              </div>
              <div className="glass-card-dark border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-sm text-white mb-2">Верификация TikTok</h3>
                <div className="h-48 flex flex-col items-center justify-center text-xs space-y-2">
                  <p className="text-4xl font-extrabold font-outfit text-[#0064FF]">
                    {stats.totalInfluencers > 0 ? Math.round((stats.totalVerified / stats.totalInfluencers) * 100) : 0}%
                  </p>
                  <p className="text-slate-400">{stats.totalVerified} из {stats.totalInfluencers} привязали TikTok OAuth</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI MANAGER CHAT TAB */}
        {activeTab === "AI_ASSISTANT" && (
          <div className="max-w-3xl mx-auto glass-card-dark border border-white/10 rounded-3xl p-6 h-[75vh] flex flex-col shadow-2xl">
            <div className="border-b border-white/10 pb-4 mb-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-base text-white">AI Менеджер Jeli (Gemini AI)</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
              {messages.map((m, idx) => (
                <div key={idx} className={`p-4 rounded-2xl text-xs max-w-[85%] ${
                  m.role === "user" ? "ml-auto bg-[#0064FF] text-white" : "bg-[#07090E] border border-white/10 text-slate-200"
                }`}>
                  {m.text}
                </div>
              ))}
              {aiLoading && <div className="p-4 rounded-2xl text-xs bg-[#07090E] text-slate-500 italic">✨ Gemini AI пишет ответ...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder="Спросить AI Менеджера..."
                className="flex-1 bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
              />
              <button type="submit" disabled={aiLoading} className="px-5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 font-bold text-white text-xs glow-blue">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-400 text-xs">
        Загрузка дашборда...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
