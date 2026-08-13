"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [lang, setLang] = useState<"ru" | "en">("ru");

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
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
              PRICING
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
            <Link href="/register?role=BRAND" className="px-4 py-2 rounded-full bg-[#0064FF] text-white text-xs font-bold glow-blue">
              {lang === "ru" ? "Начать бесплатно" : "Get Started"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Pricing Hero */}
      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs font-bold text-[#0064FF] font-pixel">
            <Sparkles className="w-3.5 h-3.5" />
            TRANSPARENT PLANS
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white tracking-tight">
            {lang === "ru" ? "Прозрачные тарифы для роста бизнеса" : "Transparent Pricing for Business Growth"}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {lang === "ru"
              ? "Выберите подходящий план для работы с инфлюенсерами. От стартапов до крупного бизнеса."
              : "Choose the right plan to power your influencer marketing campaigns."}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-white/5 border border-white/10 mt-6">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition ${billingCycle === "monthly" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400"}`}
            >
              {lang === "ru" ? "Ежемесячно" : "Monthly"}
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${billingCycle === "annual" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400"}`}
            >
              <span>{lang === "ru" ? "Ежегодно" : "Annual"}</span>
              <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-pixel">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card-dark p-8 rounded-3xl space-y-6 border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">Free Starter</h3>
              <div className="text-4xl font-extrabold font-outfit text-white">0 ₸</div>
              <p className="text-xs text-slate-400">
                {lang === "ru" ? "Для разовых запусков и знакомства с платформой." : "Best for trying out creator discovery."}
              </p>
              <ul className="space-y-3 pt-6 border-t border-white/5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> 3 AI-поиска в день</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> Публичный каталог креаторов</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> 1 активная Escrow-сделка</li>
                <li className="flex items-center gap-2 text-slate-500"><Check className="w-4 h-4 text-slate-600" /> Без глубинного AI-скоринга</li>
              </ul>
            </div>
            <Link href="/register?role=BRAND" className="w-full py-3.5 rounded-2xl glass-pill hover:bg-white/10 font-bold text-xs text-center text-white transition block">
              {lang === "ru" ? "Начать бесплатно" : "Start Free"}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="glass-card-dark p-8 rounded-3xl space-y-6 border-2 border-[#0064FF] relative glow-blue flex flex-col justify-between">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0064FF] text-white text-[10px] font-bold tracking-wider font-pixel">
              MOST POPULAR
            </span>
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">Business Pro</h3>
              <div className="text-4xl font-extrabold font-outfit text-white">
                {billingCycle === "annual" ? "12,000 ₸" : "15,000 ₸"}
                <span className="text-xs font-normal text-slate-400">/ мес</span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === "ru" ? "Для активных отделов маркетинга и стартапов." : "Designed for marketing teams and growing brands."}
              </p>
              <ul className="space-y-3 pt-6 border-t border-white/5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> Безлимитный Gemini AI-матчинг</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> TikTok OAuth верификация аудитории</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> До 15 активных Escrow-сделок</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> Приоритетный саппорт 24/7</li>
              </ul>
            </div>
            <Link href="/register?role=BRAND" className="w-full py-3.5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 font-bold text-xs text-center text-white transition block">
              {lang === "ru" ? "Подключить Pro" : "Upgrade to Pro"}
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="glass-card-dark p-8 rounded-3xl space-y-6 border border-white/10 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">Enterprise</h3>
              <div className="text-4xl font-extrabold font-outfit text-white">Custom</div>
              <p className="text-xs text-slate-400">
                {lang === "ru" ? "Для крупных компаний и рекламных агентств." : "For agencies and large corporate brands."}
              </p>
              <ul className="space-y-3 pt-6 border-t border-white/5 text-xs text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> Персональный менеджер кампаний</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> White-label отчётность в PDF</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> API доступ & Кастомные контракты</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> Безналичный расчет для юр. лиц</li>
              </ul>
            </div>
            <a href="mailto:support@jeli.kz" className="w-full py-3.5 rounded-2xl glass-pill hover:bg-white/10 font-bold text-xs text-center text-white transition block">
              Contact Sales
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
