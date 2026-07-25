"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles, Send, AlertCircle, CheckCircle2, XCircle,
  Search, Users, ExternalLink, Loader2
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
    const storedUser = localStorage.getItem("jeli_user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setSessionUser(parsed);
      if (parsed.role === "BRAND") {
        setActiveTab("INFLUENCER_FINDER");
      }
    } catch {
      localStorage.removeItem("jeli_user");
      router.replace("/login");
      return;
    }

    setCheckingSession(false);
    fetchDashboardData();

    const tiktokParam = searchParams.get("tiktok");
    if (tiktokParam === "linked") {
      const username = searchParams.get("username") || "";
      const followers = searchParams.get("followers") || "0";
      setTiktokNotification({
        type: "success",
        message: `TikTok @${username} привязан! Подписчики: ${Number(followers).toLocaleString()}`
      });
      window.history.replaceState({}, "", "/dashboard");
    } else if (tiktokParam === "error") {
      setTiktokNotification({
        type: "error",
        message: `Не удалось привязать TikTok: ${searchParams.get("reason") || "unknown"}`
      });
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [router, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("jeli_user");
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
          tiktokUsernames: usernames,
          includeRegistered: true,
          userId: sessionUser?.id
        })
      });
      const data = await res.json();

      if (data.success && data.matches?.length > 0) {
        setDiscoverResults(data.matches);
      } else if (data.success) {
        setDiscoverError("Инфлюенсеры не найдены. Укажите TikTok username (например: mrbeast, therock) для скрапинга.");
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
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Проверка сессии...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F8FC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-3xl font-extrabold italic font-['Outfit']">Jeli.</Link>
            <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[#0064FF] rounded-full font-semibold">
              Рабочий Дашборд
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {sessionUser && (
              <div className="hidden lg:block text-right mr-2">
                <p className="text-sm font-bold">{sessionUser.fullName || sessionUser.email}</p>
                <p className="text-xs text-slate-500">{sessionUser.role === "BRAND" ? "Бренд" : sessionUser.role === "INFLUENCER" ? "Инфлюенсер" : "Пользователь"}</p>
              </div>
            )}
            {(["INFLUENCER_FINDER", "CAMPAIGNS", "ANALYTICS", "AI_ASSISTANT"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  activeTab === tab ? "bg-[#0064FF] text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab === "INFLUENCER_FINDER" ? "Поиск Инфлюенсеров" :
                 tab === "CAMPAIGNS" ? "Сделки" :
                 tab === "ANALYTICS" ? "Аналитика" : "AI Менеджер"}
              </button>
            ))}
            <Link href="/settings" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Настройки
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Выйти
            </button>
          </div>
        </div>
      </header>

      {tiktokNotification && (
        <div className={`px-6 py-3 border-b ${tiktokNotification.type === "success" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              {tiktokNotification.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              {tiktokNotification.message}
            </div>
            <button onClick={() => setTiktokNotification(null)} className="text-sm text-slate-500">✕</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* INFLUENCER FINDER */}
        {activeTab === "INFLUENCER_FINDER" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Поиск & Скрапинг TikTok Инфлюенсеров</h1>
              <p className="text-sm text-slate-500 mt-1">
                Найдите инфлюенсеров из базы Jeli или просканируйте любой TikTok аккаунт в реальном времени.
              </p>
            </div>

            <form onSubmit={handleDiscover} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Описание бизнеса / кампании</label>
                <textarea
                  value={businessDesc}
                  onChange={e => setBusinessDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF] resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Ниша</label>
                  <select value={targetNiche} onChange={e => setTargetNiche(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]">
                    <option>Все ниши</option>
                    <option>Tech & Software</option>
                    <option>Fitness & Health</option>
                    <option>Beauty & Skincare</option>
                    <option>Business & Finance</option>
                    <option>Gaming & Esports</option>
                    <option>Food & Cooking</option>
                    <option>Travel & Lifestyle</option>
                    <option>Comedy & Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Бюджет</label>
                  <select value={budget} onChange={e => setBudget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]">
                    <option>до 250,000 ₸</option>
                    <option>250,000 ₸ – 1,000,000 ₸</option>
                    <option>500,000 ₸</option>
                    <option>более 1,000,000 ₸</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">TikTok usernames (через запятую)</label>
                  <input
                    type="text"
                    value={tiktokUsernames}
                    onChange={e => setTiktokUsernames(e.target.value)}
                    placeholder="mrbeast, therock, khaby.lame"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button type="submit" disabled={discoverLoading}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-sm transition disabled:opacity-50">
                  {discoverLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {discoverLoading ? "Сканирование..." : "Найти & Просканировать"}
                </button>
                {tiktokUsernames.trim() && (
                  <button type="button"
                    onClick={() => handleQuickScrape(tiktokUsernames.split(/[,\s]+/)[0])}
                    disabled={!!scrapeLoading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50">
                    {scrapeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Быстрый скрапинг первого аккаунта
                  </button>
                )}
              </div>
            </form>

            {discoverError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {discoverError}
              </div>
            )}

            {discoverResults && discoverResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg">Найдено: {discoverResults.length} инфлюенсеров</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoverResults.map((match, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0064FF] to-blue-700 flex items-center justify-center text-white font-bold overflow-hidden">
                            {match.avatarUrl ? (
                              <img src={match.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (match.nickname || "?").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{match.nickname}</h3>
                            <p className="text-xs text-[#0064FF]">{match.username}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0064FF] bg-blue-500/10 px-2 py-1 rounded-full">
                          {match.overallAlignmentScore}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{match.niche}</span>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{match.influencerTier}</span>
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                          {match.followers?.toLocaleString()} подписчиков
                        </span>
                        {match.source === "registered" && (
                          <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">Jeli ✓</span>
                        )}
                        {match.tiktokVerified && (
                          <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full">TikTok ✓</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{match.bio || match.alignmentTier}</p>
                      <div className="flex gap-2">
                        <Link
                          href={`/influencer/${match.username.replace(/^@/, "")}?business=${encodeURIComponent(businessDesc)}`}
                          className="flex-1 text-center py-2 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white text-xs font-bold transition"
                        >
                          Детальный обзор
                        </Link>
                        <button
                          onClick={() => handleQuickScrape(match.username)}
                          disabled={scrapeLoading === match.username.replace(/^@/, "")}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                        >
                          {scrapeLoading === match.username.replace(/^@/, "") ? "..." : "↻"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "CAMPAIGNS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Активные Кампании и Escrow Сделки</h1>
                <p className="text-sm text-slate-500">Все сделки защищены модулем Jeli Escrow Guarantee.</p>
              </div>
              <button onClick={() => setActiveTab("INFLUENCER_FINDER")} className="px-6 py-2.5 rounded-full bg-[#0064FF] hover:bg-blue-600 font-bold text-sm text-white transition">
                + Запустить Кампанию
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Инфлюенсеров", value: stats.totalInfluencers, color: "text-slate-900 dark:text-white" },
                { label: "Верифицировано (TikTok)", value: stats.totalVerified, color: "text-emerald-500" },
                { label: "Заблокировано в Escrow", value: `${stats.escrowLockedAmount.toLocaleString()} ₸`, color: "text-emerald-500" },
                { label: "Активных Сделок", value: stats.totalDeals, color: "text-[#0064FF]" }
              ].map((s, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                  <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <h3 className="font-bold text-lg mb-4">Текущие интеграции</h3>
              {deals.length > 0 ? deals.map((d: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-3">
                  <div>
                    <h4 className="font-bold text-sm">{d.campaign?.title || "Интеграция"}</h4>
                    <span className="text-xs text-slate-500">Депозит: {d.agreedPayout || "150,000"} ₸</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">Escrow Активен ✅</span>
                </div>
              )) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <AlertCircle className="w-8 h-8 text-[#0064FF] mx-auto mb-2" />
                  <h4 className="font-bold text-sm mb-1">Пока нет активных сделок</h4>
                  <p className="text-xs text-slate-500 mb-4">Найдите инфлюенсера через скрапинг TikTok аккаунтов.</p>
                  <button onClick={() => setActiveTab("INFLUENCER_FINDER")} className="px-5 py-2 rounded-full bg-[#0064FF] text-white text-xs font-bold hover:bg-blue-600">
                    Найти Инфлюенсера
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ANALYTICS" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Аналитика Охватов & Конверсий</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold mb-2">Охваты интеграций</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  {stats.totalInfluencers > 0 ? `${stats.totalInfluencers} зарегистрированных блогеров` : "Нет данных"}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                <h3 className="font-bold mb-2">Верификация TikTok</h3>
                <div className="h-48 flex flex-col items-center justify-center text-sm">
                  <p className="text-3xl font-extrabold text-[#0064FF] mb-2">
                    {stats.totalInfluencers > 0 ? Math.round((stats.totalVerified / stats.totalInfluencers) * 100) : 0}%
                  </p>
                  <p className="text-slate-500">{stats.totalVerified} из {stats.totalInfluencers} привязали TikTok</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "AI_ASSISTANT" && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-[75vh] flex flex-col shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-lg">AI Менеджер Jeli (Gemini AI)</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div key={idx} className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                  m.role === "user" ? "ml-auto bg-[#0064FF] text-white" : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                }`}>{m.text}</div>
              ))}
              {aiLoading && <div className="p-4 rounded-2xl text-sm bg-slate-100 dark:bg-slate-950 text-slate-500 italic">✨ Gemini AI печатает ответ...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input type="text" value={inputMsg} onChange={e => setInputMsg(e.target.value)} placeholder="Спросить AI Менеджера Jeli..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]" />
              <button type="submit" disabled={aiLoading} className="px-5 rounded-xl bg-[#0064FF] hover:bg-blue-600 font-bold text-white">
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
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-500 text-sm">Загрузка дашборда...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
