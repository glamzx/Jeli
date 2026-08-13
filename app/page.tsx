"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, Search, ChevronRight, UserPlus, ArrowRight,
  CheckCircle2, Lock, Zap, Star, Globe, TrendingUp, DollarSign,
  Users, Building2, HelpCircle, Layers, Check, MessageSquare, Play,
  ArrowUpRight, FileText, Cpu, Database, Share2, Video, MessageCircle, Infinity,
  Sun, Moon, Laptop, MousePointer, Compass, PhoneCall, Megaphone
} from "lucide-react";

interface Influencer {
  id?: string;
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
}

export default function LandingPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeRole, setActiveRole] = useState<string>("pm");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => setInfluencers(data || []))
      .catch(() => setInfluencers([]));
  }, []);

  const roles = [
    {
      id: "pm",
      icon: "🖥️",
      title: "Product Management",
      desc: lang === "ru" 
        ? "Перестаньте угадывать, что запускать дальше. Jeli находит тренды по всем сигналам креаторов, чтобы продакт-менеджеры расставляли приоритеты с уверенностью и писали брифы на основе фактов."
        : "Stop guessing what to build next. Jeli surfaces themes and trends across every creator signal so PMs can prioritize with confidence, write briefs grounded in evidence, and ship what customers actually need."
    },
    {
      id: "design",
      icon: "🎨",
      title: "Product Design & Creative",
      desc: lang === "ru"
        ? "Визуальный анализ трендов TikTok и демографии аудитории. Проектируйте рекламные подачи, которые попадают точно в интерес вашей целевой аудитории."
        : "Visual trend analysis and audience demographic breakdown. Design creative ad concepts that resonate directly with target viewers."
    },
    {
      id: "research",
      icon: "🔬",
      title: "User Research & Insights",
      desc: lang === "ru"
        ? "Синтезируйте отзывы тысяч пользователей из верифицированных видео-обзоров за считанные минуты вместо недель ручного поиска."
        : "Synthesize thousands of video reviews and user comments in minutes rather than spending weeks on manual research."
    },
    {
      id: "cx",
      icon: "👁️",
      title: "Customer Experience",
      desc: lang === "ru"
        ? "Отслеживайте тональность публикаций и уровень лояльности покупателей к вашей платформе или бренду в режиме реального времени."
        : "Track creator sentiment, post engagement rates, and customer brand loyalty in real-time across social campaigns."
    },
    {
      id: "sales",
      icon: "📞",
      title: "Sales & Client Success",
      desc: lang === "ru"
        ? "Согласовывайте бюджеты рекламных кампаний на основе прозрачных конверсий и 100% гарантии защиты средств через сейф Escrow."
        : "Align deal budgets with real conversion data and 100% Escrow safe financial guarantees for every client partnership."
    },
    {
      id: "marketing",
      icon: "📣",
      title: "Marketing & Growth",
      desc: lang === "ru"
        ? "Масштабируйте перформанс-маркетинг с помощью AI-подбора инфлюенсеров за 30 секунд и автоматической проверки публикаций."
        : "Scale performance influencer marketing with 30-second AI creator matching and automated post URL verification."
    }
  ];

  const activeRoleData = roles.find(r => r.id === activeRole) || roles[0];
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden transition-colors duration-300 ${
      isDark ? "bg-[#05070A] text-[#F8FAFC]" : "bg-[#FAFAFA] text-slate-900"
    }`}>
      {/* Grid Overlay */}
      <div className={`absolute inset-0 bg-grid-pattern pointer-events-none z-0 ${isDark ? "opacity-40" : "opacity-10"}`} />

      {/* Top Background Glow */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] blur-[180px] pointer-events-none rounded-full ${
        isDark ? "bg-[#0064FF]/10" : "bg-[#0064FF]/5"
      }`} />

      {/* ==================== TOP NAVIGATION ==================== */}
      <nav className={`sticky top-0 z-50 border-b px-6 py-3.5 backdrop-blur-xl transition-colors ${
        isDark ? "border-white/10 bg-[#05070A]/85" : "border-slate-200 bg-white/85"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className={`text-2xl font-extrabold italic tracking-tight font-outfit ${isDark ? "text-white" : "text-slate-900"}`}>
                Jeli<span className="text-[#0064FF]">.</span>
              </span>
            </Link>

            {/* Floating Nav Pills */}
            <div className={`hidden md:flex items-center gap-1 border px-3 py-1.5 rounded-full text-xs font-medium ${
              isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
            }`}>
              <Link href="#product" className="px-3 py-1 rounded-full hover:text-white hover:bg-[#0064FF] transition">
                Product
              </Link>
              <Link href="#how-it-works" className="px-3 py-1 rounded-full hover:text-white hover:bg-[#0064FF] transition">
                Solutions
              </Link>
              <Link href="/catalog" className="px-3 py-1 rounded-full hover:text-white hover:bg-[#0064FF] transition">
                Catalog
              </Link>
              <Link href="/customers" className="px-3 py-1 rounded-full hover:text-white hover:bg-[#0064FF] transition">
                Customers
              </Link>
              <Link href="/pricing" className="px-3 py-1 rounded-full hover:text-white hover:bg-[#0064FF] transition">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-full border transition flex items-center justify-center ${
                isDark ? "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10" : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language Switcher Toggle */}
            <div className={`flex items-center border rounded-full p-1 text-[11px] font-bold ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
            }`}>
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

            <Link href="/login" className={`px-4 py-2 rounded-full text-xs font-bold transition hidden sm:inline-block ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}>
              Log in
            </Link>

            <Link
              href="/register?role=BRAND"
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition shadow-lg flex items-center gap-1.5 ${
                isDark ? "bg-white hover:bg-slate-200 text-black" : "bg-[#0064FF] hover:bg-blue-600 text-white"
              }`}
            >
              Contact sales
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION (EXACT "Choose Impact" HEADLINE) ==================== */}
      <section className="relative z-10 pt-24 pb-20 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Headline */}
          <h1 className={`text-5xl sm:text-7xl md:text-8xl font-extrabold font-outfit tracking-tight leading-[1.05] max-w-4xl mx-auto ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Choose{" "}
            <span className="inline-flex items-center align-middle gap-2 mx-1 px-4 py-1 bg-[#0064FF] text-white rounded-2xl shadow-xl shadow-blue-600/40 border border-blue-400/40 transform -rotate-1">
              <span className="text-2xl sm:text-3xl">⚡</span>
              <span className="font-pixel text-2xl sm:text-3xl tracking-widest uppercase text-white">
                Impact
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            One platform for every customer signal. Jeli&apos;s AI turns TikTok analytics, campaign briefs, and creator matching into answers your whole organization can act on.
          </p>

          {/* Dovetail Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register?role=BRAND"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-xs transition shadow-xl flex items-center justify-center gap-2 ${
                isDark ? "bg-white hover:bg-slate-200 text-black" : "bg-[#0064FF] hover:bg-blue-600 text-white"
              }`}
            >
              Contact sales
            </Link>
            <Link
              href="/register?role=INFLUENCER"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-full border font-bold text-xs transition flex items-center justify-center gap-2 ${
                isDark ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
              }`}
            >
              Try Jeli free
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== MONOCHROME LOGO TICKER ==================== */}
      <section className={`border-y py-8 ${isDark ? "border-white/5 bg-[#05070A]/80" : "border-slate-200 bg-slate-100/80"}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-50 grayscale hover:grayscale-0 transition duration-500 font-outfit text-sm sm:text-base font-extrabold tracking-widest uppercase ${
            isDark ? "text-slate-300" : "text-slate-600"
          }`}>
            <span>QANTAS</span>
            <span>AWS</span>
            <span>TOYOTA</span>
            <span>CANVA</span>
            <span>NOTION</span>
            <span>SALESFORCE</span>
            <span>VISA</span>
            <span>KPMG</span>
            <span>WISE</span>
            <span>KASPI.KZ</span>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT DASHBOARD FRAME (IMAGE 1 SPEC) ==================== */}
      <section id="product" className="py-20 px-6 max-w-6xl mx-auto">
        <div className={`relative rounded-3xl border p-4 sm:p-8 shadow-2xl overflow-hidden ${
          isDark ? "border-white/10 bg-[#0A0D14]" : "border-slate-200 bg-white"
        }`}>
          <div className={`absolute inset-0 bg-grid-pattern pointer-events-none ${isDark ? "opacity-20" : "opacity-5"}`} />

          {/* Top Bar Mockup */}
          <div className={`flex items-center justify-between pb-6 border-b relative z-10 text-xs ${
            isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Voice of Customer Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span>+</span>
              <span>⤓</span>
              <span>•••</span>
            </div>
          </div>

          {/* Dashboard Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 relative z-10">
            <div className={`border rounded-2xl p-6 space-y-4 ${isDark ? "bg-[#05070A] border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between text-xs text-slate-400">
                <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>NPS from Voice of customer</span>
                <span>This month</span>
              </div>
              <div className="flex items-center justify-center py-4 relative">
                <div className="w-36 h-36 rounded-full border-8 border-[#0064FF] border-t-amber-500 flex flex-col items-center justify-center text-center">
                  <span className={`text-3xl font-extrabold font-outfit ${isDark ? "text-white" : "text-slate-900"}`}>72</span>
                  <span className="text-[10px] text-blue-400 font-bold">-5% vs avg</span>
                </div>
              </div>
            </div>

            <div className={`border rounded-2xl p-6 space-y-4 ${isDark ? "bg-[#05070A] border-white/10" : "bg-slate-50 border-slate-200"}`}>
              <div className="flex justify-between text-xs text-slate-400">
                <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Sentiment from Support tickets</span>
                <span>Jan - Mar</span>
              </div>
              <div className="h-36 flex items-end justify-between gap-2 pt-6 border-b border-white/5 pb-2">
                {[40, 65, 45, 80, 55, 95, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#0064FF]/30 hover:bg-[#0064FF] rounded-t transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Floating Emerging Themes Drawer Overlay (Image 1 Spec) */}
          <div className="mt-6 bg-[#0E121B] border border-white/15 rounded-2xl p-6 space-y-4 relative z-20 shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0064FF]" />
                Emerging themes
              </h4>
              <span className="text-slate-500">✕</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#05070A] p-4 rounded-xl border border-white/5">
              &quot;Customers value the ease of collaborative playlists but report recurring friction as more people contribute. Unclear permissions and ownership.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* ==================== TRANSFORM HEADLINE + METRICS SECTION (IMAGE 1 & 2 SPEC) ==================== */}
      <section id="impact" className={`py-24 px-6 max-w-7xl mx-auto space-y-16 border-t ${
        isDark ? "border-white/5" : "border-slate-200"
      }`}>
        <div className="max-w-4xl space-y-6">
          <h2 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold font-outfit leading-[1.15] ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Jeli transforms 📁 fragmented customer feedback into decision-ready ✦ intelligence automatically, across your whole organization.
          </h2>
        </div>

        {/* 3 Metric Columns with Blue Pixel Up-Arrows (Image 2 Spec) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <div className={`text-4xl sm:text-5xl font-extrabold font-outfit flex items-center gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>2.3x</span>
            </div>
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Return on investment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              More than double your campaign ROI. Payback in under six months.
            </p>
          </div>

          <div className="space-y-3">
            <div className={`text-4xl sm:text-5xl font-extrabold font-outfit flex items-center gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>30hrs</span>
            </div>
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Weekly time saved per user</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A full workweek back, every week. Powered by automated AI analysis.
            </p>
          </div>

          <div className="space-y-3">
            <div className={`text-4xl sm:text-5xl font-extrabold font-outfit flex items-center gap-2 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>66%</span>
            </div>
            <h3 className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>Faster shipping</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faster from discovery to delivery — without sacrificing quality.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-white">Faster decisions. Less guesswork. Verified by Forrester.</p>
          <a href="#how-it-works" className="inline-flex items-center gap-1 text-[#0064FF] hover:underline font-semibold">
            <span>Download the Forrester Total Economic Impact™ Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ==================== EQUIP TEAM BANNER (IMAGE 2 & 3 SPEC) ==================== */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto border-t border-white/5">
        <div className="space-y-8">
          <h2 className={`text-4xl sm:text-6xl font-extrabold font-outfit leading-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Equip{" "}
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-white text-black font-pixel text-2xl align-middle">
              ENTER ↵
            </span>{" "}
            every team with customer{" "}
            <span className="text-[#0064FF]">⚡ insights</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Customer feedback lives across dozens of tools, belongs to different teams, and takes weeks to make sense of. Jeli is the Customer Intelligence Platform that unifies it all.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register?role=BRAND"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs transition shadow-xl"
            >
              Contact sales
            </Link>
            <Link
              href="/register?role=INFLUENCER"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition"
            >
              Try Jeli free
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== NUMBERED STEPS: 01 CENTRALIZE (IMAGE 3 SPEC) ==================== */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Centralize{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">01</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                38 native integrations plus API, MCP, and CLI tools
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Every signal, in context—who said it, when, and why it matters. Jeli connects every customer-facing tool and touchpoint, enriching feedback with account metadata automatically.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Salesforce</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Intercom</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Zendesk</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">OpenAI</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Slack</span>
            </div>

            <div className="pt-2">
              <Link href="/catalog" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0064FF] hover:underline">
                <span>Discover all integrations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Central Node Diagram (Image 3 Spec) */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0A0D14] p-8 min-h-[380px] flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

            <div className="relative z-10 w-24 h-24 rounded-3xl bg-[#0064FF] shadow-2xl shadow-blue-600/50 flex flex-col items-center justify-center text-white border-2 border-white/30">
              <span className="text-2xl font-extrabold italic font-outfit">Jeli.</span>
              <span className="text-[9px] font-pixel uppercase tracking-widest text-blue-200">CORE</span>
            </div>

            <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>▶</span> Google Play
            </div>
            <div className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>📹</span> Zoom
            </div>
            <div className="absolute bottom-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>💬</span> Zendesk
            </div>
            <div className="absolute bottom-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span></span> App Store
            </div>
          </div>
        </div>
      </section>

      {/* ==================== NUMBERED STEPS: 02 ANALYZE (IMAGE 4 SPEC) ==================== */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Analyze{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">02</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                AI analysis grounded in evidence
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              What once took weeks happens in minutes. Jeli&apos;s AI automatically surfaces trends, themes, and signals across thousands of customer touchpoints—so your team spends time on decisions, not synthesis.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/register?role=BRAND" className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition">
                Contact sales
              </Link>
              <Link href="/register?role=INFLUENCER" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition">
                Try Jeli free
              </Link>
            </div>
          </div>

          {/* Dual Side-by-side Dark Product UI Cards (Image 4 Spec) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Video className="w-4 h-4 text-[#0064FF]" />
                Customer Interview
              </div>
              <div className="aspect-video bg-black rounded-xl border border-white/5 flex items-center justify-center text-2xl">
                👤 🎬
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Background on Anne-Marie&apos;s customer feedback...
              </p>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-[#0064FF]">⚙ AI Projects</span>
                <p className="text-[10px] text-slate-400">Transform calls into concise reports...</p>
              </div>
            </div>

            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-emerald-400" />
                Support tickets
              </div>
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">In progress</span>
                <p className="text-xs font-bold text-white">Fix the login flow for returning users</p>
                <p className="text-[10px] text-slate-400">Evidence 204 ↑ 8.8% • Sources 2 • Sum of ARR $2.4m</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-emerald-400">⚡ AI Channels 2.0 BETA</span>
                <p className="text-[10px] text-slate-400">Automatically classify tickets and reviews...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CUSTOMER TESTIMONIAL BANNER (IMAGE 5 SPEC) ==================== */}
      <div className="border-y border-white/10 py-12 px-6 my-12 bg-[#080B12] rounded-3xl relative overflow-hidden max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <p className="text-base sm:text-lg font-medium text-slate-200 italic leading-relaxed">
              &quot;Jeli enables us to access all of Breville&apos;s insights gathered from around the globe—all in one place. This is incredibly valuable and saves us from losing or repeating invaluable information about our customers.&quot;
            </p>
            <p className="text-xs font-bold text-slate-400 font-pixel tracking-wider">
              CONSTANCE DOCOS <span className="text-slate-600">|</span> SENIOR UX DESIGNER, BREVILLE
            </p>
          </div>
          <div className="w-20 h-20 rounded-full bg-[#0064FF]/20 border-2 border-[#0064FF] flex items-center justify-center text-3xl flex-shrink-0">
            👩🏻‍💼
          </div>
        </div>
      </div>

      {/* ==================== NUMBERED STEPS: 03 QUERY (IMAGE 5 SPEC) ==================== */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Query{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">03</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                Chat, search, and explore customer insights
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Chat with your data like you&apos;d message the expert on your team. Ask what&apos;s driving churn, what objections sales are hearing, or what your EMEA customers actually want. Patterns that no single team could see on their own, answered instantly.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link href="/register?role=BRAND" className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs hover:bg-slate-200 transition">
                Contact sales
              </Link>
              <Link href="/register?role=INFLUENCER" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition">
                Try Jeli free
              </Link>
            </div>
          </div>

          {/* AI Chat Drawer Showcase */}
          <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-[#0064FF]" />
              AI Chat Assistant
            </div>
            <div className="bg-[#05070A] p-4 rounded-2xl border border-white/5 space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                &quot;What are the emerging themes across recent support tickets?&quot;
              </p>
              <div className="p-3 rounded-xl bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs text-blue-200 space-y-1">
                <p className="font-bold text-[#0064FF]">✨ AI Answer:</p>
                <p>1. Unclear permissions and ownership on shared playlists</p>
                <p>2. Difficulty maintaining consistent vibe as contributors increase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== JELI FOR [ROLES] SECTION ==================== */}
      <section className={`py-24 px-6 max-w-7xl mx-auto border-t ${isDark ? "border-white/5" : "border-slate-200"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="space-y-4">
            <h2 className={`text-4xl sm:text-6xl font-extrabold font-outfit leading-none ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Jeli for
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empower every role across your marketing, product, and growth teams with unified customer intelligence.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className={`border rounded-3xl p-8 space-y-4 transition ${
              isDark ? "bg-[#0A0D14] border-[#0064FF]/40 shadow-2xl" : "bg-white border-[#0064FF] shadow-lg"
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeRoleData.icon}</span>
                <h3 className={`text-2xl font-extrabold font-outfit ${isDark ? "text-white" : "text-slate-900"}`}>
                  {activeRoleData.title}
                </h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {activeRoleData.desc}
              </p>
              <div className="pt-2">
                <Link href="/register?role=BRAND" className="inline-flex items-center gap-1 text-xs font-bold text-[#0064FF] hover:underline">
                  <span>Learn more about {activeRoleData.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition ${
                    activeRole === r.id
                      ? "bg-[#0064FF]/10 border-[#0064FF] text-white"
                      : isDark
                        ? "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                        : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-xs font-bold truncate">{r.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className={`border-t py-12 px-6 text-xs ${
        isDark ? "border-white/10 bg-[#030508] text-slate-400" : "border-slate-200 bg-slate-100 text-slate-600"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className={`text-2xl font-extrabold italic tracking-tight font-outfit ${isDark ? "text-white" : "text-slate-900"}`}>
              Jeli<span className="text-[#0064FF]">.</span>
            </span>
            <p className="text-slate-500">The #1 Creator Intelligence & Escrow Platform in Central Asia.</p>
          </div>
          <div className="flex items-center gap-6 font-semibold">
            <Link href="/catalog" className="hover:text-[#0064FF] transition">Catalog</Link>
            <Link href="/customers" className="hover:text-[#0064FF] transition">Customers</Link>
            <Link href="/pricing" className="hover:text-[#0064FF] transition">Pricing</Link>
            <Link href="/resources" className="hover:text-[#0064FF] transition">Resources</Link>
            <Link href="/login" className="hover:text-[#0064FF] transition">Log in</Link>
            <Link href="/register" className="hover:text-[#0064FF] transition">Sign up</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-slate-500">
          © 2026 Jeli Platform Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
