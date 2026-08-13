"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [lang, setLang] = useState<"ru" | "en">("ru");

  return (
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070A]/85 backdrop-blur-xl px-6 py-4">
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

      {/* Main Pricing Hero (Matching Screenshot 3 Spec) */}
      <main className="max-w-6xl mx-auto px-6 py-16 relative z-10 space-y-16">
        
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 font-pixel uppercase">
            PRICING
          </span>

          <h1 className="text-5xl sm:text-7xl font-extrabold font-outfit text-white tracking-tight">
            Start free.<br />
            <span className="text-[#0064FF]">Upgrade to scale</span>
          </h1>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-white/5 border border-white/10 p-1 rounded-full flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full transition ${billingCycle === "monthly" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400 hover:text-white"}`}
              >
                {lang === "ru" ? "Ежемесячно" : "Monthly"}
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-5 py-2 rounded-full transition flex items-center gap-1.5 ${billingCycle === "annual" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400 hover:text-white"}`}
              >
                <span>{lang === "ru" ? "Ежегодно" : "Annual"}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2 Large Side-by-Side Pricing Cards (Screenshot 3 Spec) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card 1: Free Plan */}
          <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg text-slate-300">
                ⤛
              </div>
              <div>
                <h3 className="text-3xl font-extrabold font-outfit text-white">Free</h3>
                <p className="text-xs text-slate-400 mt-1">$0, no card required</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For individuals and creators to make sense of campaign briefs, TikTok analytics, and creator matching.
              </p>
              
              <Link
                href="/register?role=INFLUENCER"
                className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs transition flex items-center justify-center"
              >
                Try Jeli free
              </Link>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-pixel">WHAT&apos;S INCLUDED</p>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="text-slate-500">■</span>
                    <span>One channel to automatically classify your voice of creator data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-500">■</span>
                    <span>One project to analyze customer calls, TikTok clips, and surveys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-slate-500">■</span>
                    <span>Chat with and summarize your data to uncover trends</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Enterprise / Pro Plan (Firm Blue Accent Colors) */}
          <div className="bg-[#0A0D14] border-2 border-[#0064FF] rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-blue-600/20">
            
            <div className="absolute -top-3.5 right-8 bg-[#0064FF] text-white text-[10px] font-pixel font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              RECOMMENDED FOR BRANDS
            </div>

            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#0064FF]/20 border border-[#0064FF]/40 flex items-center justify-center text-lg text-[#0064FF]">
                ⬡
              </div>
              <div>
                <h3 className="text-3xl font-extrabold font-outfit text-white">Enterprise / Pro</h3>
                <p className="text-xs text-[#0064FF] font-bold mt-1">
                  {billingCycle === "monthly" ? "25,000 ₸ / month" : "20,000 ₸ / month (Billed annually)"}
                </p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For organizations scaling creator campaigns, securing budget via 100% Escrow, and standardizing across marketing teams.
              </p>
              
              <Link
                href="/register?role=BRAND"
                className="w-full py-3.5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition shadow-xl shadow-blue-600/30 flex items-center justify-center glow-blue"
              >
                Contact sales
              </Link>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#0064FF] font-pixel">EVERYTHING IN FREE, PLUS</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>Unlimited Agents track every creator signal</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>Unlimited channels & automatic classification</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>Dashboards visualizing signals 24/7</span>
                    </li>
                  </ul>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>Unlimited free chat queries in Telegram & WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>Advanced AI features like semantic search</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#0064FF]">■</span>
                      <span>100% Guaranteed Escrow payment protection</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
