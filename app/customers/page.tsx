"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowRight, ShieldCheck, Star, Users, Building2, TrendingUp } from "lucide-react";

export default function CustomersPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    "All", "Technology", "Consumer Goods", "Manufacturing", "Health", "Finance",
    "Nonprofit", "Airlines and Aviation", "Life Sciences", "Retail", "Professional Services"
  ];

  const caseStudies = [
    {
      title: "Kaspi.kz",
      category: "Finance",
      impact: "2.3x ROI",
      quote: "Jeli enables us to access all creator insights gathered from across Kazakhstan—all in one place.",
      author: "Constance Docos, Marketing Lead",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kaspi"
    },
    {
      title: "Choco",
      category: "Consumer Goods",
      impact: "30hrs saved / wk",
      quote: "I want to literally chat with hours of TikTok footage—Jeli lets me test our marketing assumptions instantly.",
      author: "Martin Jerkovic, Growth Lead",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Choco"
    },
    {
      title: "SDU Hub",
      category: "Technology",
      impact: "+30% Capacity",
      quote: "Escrow budget safety eliminated all rate negotiation friction with student creators.",
      author: "Arman Aliyev, Innovation Director",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SDU"
    }
  ];

  const filtered = selectedCategory === "All"
    ? caseStudies
    : caseStudies.filter(c => c.category === selectedCategory);

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
              CUSTOMERS
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
            <Link href="/register?role=BRAND" className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-slate-200 transition">
              Contact sales
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Matching Screenshot 4 Spec) */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10 space-y-20 text-center">
        
        {/* Floating User Avatars Hero Headline */}
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 font-pixel uppercase">
            CUSTOMERS
          </span>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold font-outfit tracking-tight text-white leading-[1.05]">
            100,000+{" "}
            <span className="inline-flex items-center align-middle gap-1 mx-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" className="w-12 h-12 rounded-xl border border-white/20 inline-block" />
            </span>{" "}
            users from the world&apos;s best teams{" "}
            <span className="inline-flex items-center align-middle gap-1 mx-1">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User" className="w-12 h-12 rounded-xl border border-white/20 inline-block" />
            </span>
          </h1>
        </div>

        {/* 3 Layered Stat Cards (Matching Screenshot 5 Spec) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-8">
          
          <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl transform -rotate-1 hover:rotate-0 transition duration-300">
            <span className="text-5xl font-extrabold font-outfit text-white">2.3x</span>
            <h3 className="font-bold text-sm text-white">Return on investment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              See more than double the return on your Jeli investment—with a payback period of less than six months.
            </p>
          </div>

          <div className="bg-[#0D111A] border border-[#0064FF]/40 rounded-3xl p-8 space-y-4 shadow-2xl transform translate-y-[-10px] hover:translate-y-0 transition duration-300">
            <span className="text-5xl font-extrabold font-outfit text-[#0064FF]">30hrs</span>
            <h3 className="font-bold text-sm text-white">Time saved per user, per week</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reclaim almost a full workweek with AI-powered analysis and centralized access to creator signals.
            </p>
          </div>

          <div className="bg-[#0A0D14] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl transform rotate-1 hover:rotate-0 transition duration-300">
            <span className="text-5xl font-extrabold font-outfit text-emerald-400">30%</span>
            <h3 className="font-bold text-sm text-white">Team capacity increase</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuous, always-on intelligence shortens campaign cycles and unlocks bandwidth across roles.
            </p>
          </div>

        </div>

        {/* Category Filter Chips (Matching Screenshot 5 Bottom Spec) */}
        <div className="pt-12 space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-white text-black shadow-lg"
                    : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-6">
            {filtered.map((item, i) => (
              <div key={i} className="bg-[#0A0D14] border border-white/10 rounded-3xl p-6 space-y-4 hover:border-[#0064FF]/50 transition">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-white font-outfit">{item.title}</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#0064FF]/20 text-[#0064FF] text-[10px] font-bold">{item.impact}</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">&quot;{item.quote}&quot;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <img src={item.avatar} alt={item.author} className="w-8 h-8 rounded-full border border-white/10" />
                  <span className="text-[11px] font-semibold text-slate-400">{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#030508] text-slate-400 text-xs mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
            Jeli<span className="text-[#0064FF]">.</span>
          </span>
          <p className="text-slate-500">© 2026 Jeli Platform Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
