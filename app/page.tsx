"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, Search, ChevronRight, UserPlus, ArrowRight,
  CheckCircle2, Lock, Zap, Star, Globe, TrendingUp, DollarSign,
  Users, Building2, HelpCircle, Layers, Check, MessageSquare, Play,
  ArrowUpRight, FileText, Cpu, Database, Share2, Video, MessageCircle, Infinity
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
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live AI Matcher form
  const [businessDesc, setBusinessDesc] = useState("Coffee shop in Almaty looking for 3 TikTok creators for promo");
  const [loading, setLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((res) => res.json())
      .then((data) => setInfluencers(data || []))
      .catch(() => setInfluencers([]));
  }, []);

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDesc.trim()) return;
    setLoading(true);
    setAiMatches(null);

    try {
      const res = await fetch("/api/v1/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDesc,
          targetNiche: "Все ниши",
          budget: "500,000 ₸"
        })
      });

      const data = await res.json();
      if (res.ok && data.matches) {
        setAiMatches(data.matches);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC] font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Dovetail Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* Top Background Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[#0064FF]/10 blur-[180px] pointer-events-none rounded-full" />

      {/* ==================== TOP NAVIGATION (DOVETAIL STYLE) ==================== */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070A]/85 backdrop-blur-xl px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-extrabold italic tracking-tight font-outfit text-white group-hover:text-[#0064FF] transition">
                Jeli<span className="text-[#0064FF] group-hover:text-white">.</span>
              </span>
            </Link>

            {/* Floating Nav Pills */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
              <Link href="#product" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                Product
              </Link>
              <Link href="#how-it-works" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                Solutions
              </Link>
              <Link href="#catalog" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                Catalog
              </Link>
              <Link href="#impact" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                Enterprise
              </Link>
              <Link href="#pricing" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 text-[11px] font-bold">
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

            <Link href="/login" className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white transition hidden sm:inline-block">
              Log in
            </Link>

            <Link
              href="/register?role=BRAND"
              className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs transition shadow-lg flex items-center gap-1.5"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION (IMAGE 1 SPEC) ==================== */}
      <section className="relative z-10 pt-20 pb-20 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Dual Capterra & G2 Rating Badge */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300 font-pixel tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs">★★★★★</span>
              <span>4.9/5 G2</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs">★★★★★</span>
              <span>4.8/5 CAPTERRA</span>
            </div>
          </div>

          {/* Headline (STRICT USER REQUIREMENT: EXACTLY "Choose Impact" IN BOTH LANGUAGES) */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold font-outfit tracking-tight text-white leading-[1.05] max-w-4xl mx-auto">
            Choose{" "}
            <span className="inline-flex items-center align-middle gap-2 mx-1 px-4 py-1 bg-[#0064FF] text-white rounded-2xl shadow-xl shadow-blue-600/40 border border-blue-400/40 transform -rotate-1">
              <span className="text-2xl sm:text-3xl">⚡</span>
              <span className="font-pixel text-2xl sm:text-3xl tracking-widest uppercase text-white">
                Impact
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            One platform for every creator signal. Jeli&apos;s AI turns TikTok analytics, campaign briefs, and creator matching into answers your whole organization can act on.
          </p>

          {/* Dovetail Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register?role=BRAND"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-200 text-black font-bold text-xs transition shadow-xl flex items-center justify-center gap-2"
            >
              Contact sales
            </Link>
            <Link
              href="/register?role=INFLUENCER"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center justify-center gap-2"
            >
              Try Jeli free
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== MONOCHROME LOGO TICKER ==================== */}
      <section className="border-y border-white/5 py-8 bg-[#05070A]/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-40 grayscale hover:grayscale-0 transition duration-500 text-slate-300 font-outfit text-sm sm:text-base font-extrabold tracking-widest uppercase">
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

      {/* ==================== PRODUCT DASHBOARD FRAME ==================== */}
      <section id="product" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-[#0A0D14] p-4 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

          {/* Top Bar Mockup */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-bold text-white">Voice of Creator Dashboard</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>+</span>
              <span>⤓</span>
              <span>•••</span>
            </div>
          </div>

          {/* Dashboard Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 relative z-10">
            {/* Left Box 1: NPS / Alignment Gauge */}
            <div className="bg-[#05070A] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="font-semibold text-white">AI Alignment Score</span>
                <span>This month</span>
              </div>
              <div className="flex items-center justify-center py-4 relative">
                <div className="w-36 h-36 rounded-full border-8 border-[#0064FF] border-t-amber-500 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold font-outfit text-white">94%</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+12% vs avg</span>
                </div>
              </div>
              <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0064FF]" /> High Match</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate</span>
              </div>
            </div>

            {/* Left Box 2: Support Ticket Sentiment Graph */}
            <div className="bg-[#05070A] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="font-semibold text-white">Sentiment from Creator Posts</span>
                <span>Jan - Mar</span>
              </div>
              <div className="h-36 flex items-end justify-between gap-2 pt-6 border-b border-white/5 pb-2">
                {[40, 65, 45, 80, 55, 95, 75, 90].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#0064FF]/20 hover:bg-[#0064FF] rounded-t transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
              </div>
            </div>
          </div>

          {/* Floating Emerging Themes Drawer Overlay */}
          <div className="mt-6 bg-[#0E121B] border border-white/15 rounded-2xl p-6 space-y-4 relative z-20 shadow-2xl">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0064FF]" />
                Emerging AI Themes & TikTok Insights
              </h4>
              <span className="text-slate-500">✕</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-[#05070A] p-4 rounded-xl border border-white/5">
              &quot;Customers value the ease of TikTok video integrations but report friction when negotiating rates manually. Jeli&apos;s 100% Escrow safe system eliminates all rate friction.&quot;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center font-bold text-xs text-white">
                  🎬
                </div>
                <div>
                  <p className="text-xs font-bold text-white">TikTok Integration Clip</p>
                  <p className="text-[10px] text-slate-400">12.4K Views • Verified ✅</p>
                </div>
              </div>
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center font-bold text-xs text-white">
                  📈
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Campaign ROI Analysis</p>
                  <p className="text-[10px] text-emerald-400 font-bold">+2.3x Conversion Payback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== IMPACT & METRICS SECTION ==================== */}
      <section id="impact" className="py-24 px-6 max-w-7xl mx-auto space-y-16 border-t border-white/5">
        <div className="max-w-4xl space-y-6">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-outfit text-white leading-[1.15]">
            Jeli transforms 📁 fragmented influencer marketing into decision-ready ⚡ intelligence automatically, across your whole organization.
          </h2>
        </div>

        {/* 3 Metric Columns with Blue Pixel Up-Arrows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <div className="text-4xl sm:text-5xl font-extrabold font-outfit text-white flex items-center gap-2">
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>2.3x</span>
            </div>
            <h3 className="font-bold text-sm text-white">Return on investment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              More than double your campaign ROI. Payback in under six months with verified creator matching.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-4xl sm:text-5xl font-extrabold font-outfit text-white flex items-center gap-2">
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>30hrs</span>
            </div>
            <h3 className="font-bold text-sm text-white">Weekly time saved per user</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A full workweek back, every week. Powered by automated Gemini AI analysis and Escrow payouts.
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-4xl sm:text-5xl font-extrabold font-outfit text-white flex items-center gap-2">
              <span className="font-pixel text-3xl text-[#0064FF]">↑</span>
              <span>66%</span>
            </div>
            <h3 className="font-bold text-sm text-white">Faster campaign shipping</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faster from creator discovery to content delivery — without sacrificing audience quality.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-white">Faster decisions. Less guesswork. Verified by Jeli Data Engine.</p>
          <a href="#how-it-works" className="inline-flex items-center gap-1 text-[#0064FF] hover:underline font-semibold">
            <span>Explore the Total Economic Impact™ Study</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* ==================== NUMBERED FEATURE STEPS (01 - 04 COMPLETE NARRATIVE) ==================== */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 space-y-24">
        
        {/* STEP 01: Centralize */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Centralize{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">01</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                38 native integrations plus API, TikTok OAuth, and AI tools
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Every signal, in context — who said it, when, and why it matters. Jeli connects every creator-facing tool and touchpoint, enriching feedback with account metadata automatically.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 pt-2">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">TikTok OAuth</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Instagram Graph</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Kaspi Pay</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Gemini 1.5 AI</span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">Supabase DB</span>
            </div>

            <div className="pt-2">
              <Link href="/catalog" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0064FF] hover:underline">
                <span>Discover all integrations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Network Node Diagram */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0A0D14] p-8 min-h-[380px] flex items-center justify-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

            <div className="relative z-10 w-24 h-24 rounded-3xl bg-[#0064FF] shadow-2xl shadow-blue-600/50 flex flex-col items-center justify-center text-white border-2 border-white/30">
              <span className="text-2xl font-extrabold italic font-outfit">Jeli.</span>
              <span className="text-[9px] font-pixel uppercase tracking-widest text-blue-200">CORE</span>
            </div>

            <div className="absolute top-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>♪</span> TikTok
            </div>
            <div className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>📸</span> Instagram
            </div>
            <div className="absolute bottom-8 left-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>🛡️</span> Escrow
            </div>
            <div className="absolute bottom-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center gap-2">
              <span>✨</span> Gemini AI
            </div>
          </div>
        </div>

        {/* STEP 02: Analyze (IMAGE 1 & 2 NEW ATTACHMENTS MATCH) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-white/5 pt-20">
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
              What once took weeks happens in minutes. Jeli&apos;s AI automatically surfaces trends, creator signals, and engagement rates across thousands of TikTok profiles—so your team spends time on decisions, not manual synthesis.
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

          {/* Dual Side-by-side Dark Product UI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Video className="w-4 h-4 text-[#0064FF]" />
                Customer Interview Video
              </div>
              <div className="aspect-video bg-black rounded-xl border border-white/5 flex items-center justify-center text-2xl">
                👤 🎬
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                Background on creator Anne-Marie&apos;s engagement stats and video retention timeline...
              </p>
            </div>

            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <FileText className="w-4 h-4 text-emerald-400" />
                Support Tickets & Evidence
              </div>
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">In Progress</span>
                <p className="text-xs font-bold text-white">Fix login flow for returning users</p>
                <p className="text-[10px] text-slate-400">Evidence 204 • Sources 2 • ARR $2.4M</p>
              </div>
            </div>
          </div>
        </div>

        {/* TESTIMONIAL BANNER 1 (IMAGE 2 NEW ATTACHMENTS MATCH) */}
        <div className="border-y border-white/10 py-12 px-6 my-12 bg-[#080B12] rounded-3xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <p className="text-base sm:text-lg font-medium text-slate-200 italic leading-relaxed">
                &quot;Jeli enables us to access all of Breville&apos;s creator insights gathered from around the globe—all in one place. This is incredibly valuable and saves us from losing or repeating invaluable budget on unverified influencers.&quot;
              </p>
              <p className="text-xs font-bold text-slate-400 font-pixel tracking-wider">
                CONSTANCE DOCOS <span className="text-slate-600">|</span> SENIOR UX DESIGNER, BREVILLE / KASPI
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-[#0064FF]/20 border-2 border-[#0064FF] flex items-center justify-center text-3xl flex-shrink-0">
              👩🏻‍💼
            </div>
          </div>
        </div>

        {/* STEP 03: Query (IMAGE 3 & 4 NEW ATTACHMENTS MATCH) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Query{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">03</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                Chat, search, and explore creator insights
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              Chat with your data like you&apos;d message the expert on your team. Ask what&apos;s driving engagement, what objections creators are hearing, or what your target audience actually wants. Patterns that no single team could see on their own, answered instantly.
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

          {/* AI Chat Drawer Showcase Card */}
          <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-[#0064FF]" />
              Jeli AI Chat Assistant
            </div>
            <div className="bg-[#05070A] p-4 rounded-2xl border border-white/5 space-y-3">
              <p className="text-xs text-slate-300 font-medium">
                &quot;What are the top performing content angles for coffee brands in Almaty this month?&quot;
              </p>
              <div className="p-3 rounded-xl bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs text-blue-200 space-y-1">
                <p className="font-bold text-[#0064FF]">✨ Gemini AI Answer:</p>
                <p>1. Behind-the-scenes barista ASMR videos (15.2K avg views)</p>
                <p>2. Morning routine vlogs targeting students & remote workers</p>
              </div>
            </div>
          </div>
        </div>

        {/* MORE WAYS TO QUERY YOUR DATA GRID (IMAGE 4 NEW ATTACHMENTS MATCH) */}
        <div className="space-y-8 pt-8">
          <h4 className="text-xs font-bold tracking-widest text-slate-400 font-pixel uppercase">
            MORE WAYS TO QUERY YOUR DATA
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-6 space-y-3">
              <Search className="w-5 h-5 text-[#0064FF]" />
              <h5 className="font-bold text-sm text-white">Search</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lightning fast keyword and semantic search with RAG enables your team to find insights in seconds.
              </p>
            </div>

            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-6 space-y-3">
              <Infinity className="w-5 h-5 text-purple-400" />
              <h5 className="font-bold text-sm text-white">Explore</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual results, smart summaries, and advanced segmentation—for teams that need the full picture.
              </p>
            </div>

            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-6 space-y-3">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h5 className="font-bold text-sm text-white">Chat in Telegram & WhatsApp</h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simply tag @JeliBot for instant answers pulled from your data—creator intelligence across every team.
              </p>
            </div>
          </div>

          {/* Testimonial Quote 2 */}
          <div className="border-t border-white/10 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm sm:text-base italic text-slate-300">
                &quot;I want to literally chat with nine hours of the TikTok footage that we have—like, &lsquo;What do they think about this product? What tone works best?&rsquo; Jeli lets me test my assumptions instantly.&quot;
              </p>
              <p className="text-xs font-bold text-slate-400 font-pixel">
                MARTIN JERKOVIC <span className="text-slate-600">|</span> LEAD GROWTH DESIGNER, CHOCO
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
              👨🏻‍💻
            </div>
          </div>
        </div>

        {/* STEP 04: Act (IMAGE 5 NEW ATTACHMENTS MATCH) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-white/5 pt-20">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white flex items-center gap-3">
                Act{" "}
                <span className="font-pixel text-3xl text-[#0064FF]">04</span>
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-200">
                Creator context in every tool, across every team
              </h3>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed">
              From discovery to delivery, the campaign context is in the room. Jeli Escrow plugs directly into your existing infrastructure, so every team works with locked budget safety.
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

          {/* Dual Side-by-side Dark Product UI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0064FF]">
                <Cpu className="w-4 h-4" />
                AI Agent Automation
              </div>
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/5 text-[11px] space-y-2 text-slate-300 font-mono">
                <p className="text-[#0064FF] font-bold">Instructions:</p>
                <p>Create doc in Go-To-Market folder, summarize engagement, lock Escrow budget.</p>
              </div>
            </div>

            <div className="bg-[#0A0D14] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Lock className="w-4 h-4" />
                Password Protected Links
              </div>
              <div className="bg-[#05070A] p-3 rounded-xl border border-white/5 text-[11px] space-y-2 text-slate-300">
                <p className="font-bold text-white">Summary:</p>
                <p className="text-slate-400">Analysis of sales conversations reveals specific customer interest in Escrow budget protection.</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ==================== EQUIP TEAM BANNER ==================== */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto border-t border-white/5">
        <div className="space-y-8">
          <h2 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white leading-tight">
            Equip{" "}
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-white text-black font-pixel text-2xl align-middle">
              ENTER ↵
            </span>{" "}
            every team with creator{" "}
            <span className="text-[#0064FF]">⚡ insights</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Influencer data lives across dozens of tools, belongs to different teams, and takes weeks to make sense of. Jeli is the Creator Intelligence Platform that unifies it all.
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

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#030508] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </span>
            <p className="text-slate-500">The #1 Creator Intelligence & Escrow Platform in Central Asia.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="hover:text-white transition">Catalog</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/resources" className="hover:text-white transition">Resources</Link>
            <Link href="/login" className="hover:text-white transition">Log in</Link>
            <Link href="/register" className="hover:text-white transition">Sign up</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-slate-600">
          © 2026 Jeli Platform Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
