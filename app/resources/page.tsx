"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowRight, BookOpen, Video, TrendingUp, Users } from "lucide-react";

export default function ResourcesPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");

  const articles = [
    {
      title: lang === "ru" ? "Как запустить первую коллаборацию в TikTok за 3 шага" : "How to launch your first TikTok campaign in 3 steps",
      category: "Guides",
      readTime: "5 min",
      desc: lang === "ru" ? "Пошаговый гайд для казахстанских брендов: от написания ТЗ до проверки ролика." : "Step-by-step guide for brands in Kazakhstan."
    },
    {
      title: lang === "ru" ? "Почему 80% рекламы у блогеров не окупается и как это исправить" : "Why 80% of influencer ads fail and how to fix it",
      category: "Analytics",
      readTime: "8 min",
      desc: lang === "ru" ? "Разбор главных ошибок в подборе инфлюенсеров и подсчёте ROI." : "Deep dive into influencer targeting errors and ROI calculation."
    },
    {
      title: lang === "ru" ? "Кейс Jeli: Как кофейня в Алматы получила 150K просмотров" : "Jeli Case Study: How an Almaty coffee shop got 150K views",
      category: "Case Study",
      readTime: "4 min",
      desc: lang === "ru" ? "Реальные цифры, бюджет и результаты работы с 3 нано-блогерами." : "Real numbers and budget breakdown of 3 nano-influencer collabs."
    }
  ];

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
              RESOURCES
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
            <Link href="/catalog" className="px-4 py-2 rounded-full bg-[#0064FF] text-white text-xs font-bold glow-blue">
              {lang === "ru" ? "Каталог" : "Catalog"}
            </Link>
          </div>
        </div>
      </nav>

      {/* Resources Main Header */}
      <main className="max-w-7xl mx-auto px-6 py-16 relative z-10 space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-xs font-bold text-[#0064FF] font-pixel">
            <Sparkles className="w-3.5 h-3.5" />
            KNOWLEDGE BASE
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-outfit text-white tracking-tight">
            {lang === "ru" ? "Гайды, Кейсы & Тренды TikTok" : "Guides, Case Studies & TikTok Trends"}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            {lang === "ru"
              ? "Всё про инфлюенс-маркетинг в Казахстане: как запускать интеграции, анализировать конверсии и растить продажи."
              : "Everything about influencer marketing in Kazakhstan and Central Asia."}
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item, idx) => (
            <div key={idx} className="glass-card-dark p-6 rounded-3xl border border-white/10 space-y-4 hover:border-[#0064FF]/40 transition group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/10 text-[#0064FF] border border-[#0064FF]/20">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-slate-500">{item.readTime}</span>
                </div>
                <h3 className="font-bold text-lg text-white group-hover:text-[#0064FF] transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <button className="text-xs font-bold text-[#0064FF] flex items-center gap-1 hover:underline pt-2">
                <span>{lang === "ru" ? "Читать статью" : "Read Article"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
