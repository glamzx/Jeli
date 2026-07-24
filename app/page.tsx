"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Moon, Sun, CheckCircle2, ChevronRight, Search, ShieldCheck } from "lucide-react";

interface Influencer {
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [cityFilter, setCityFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");

  // Form states
  const [businessDesc, setBusinessDesc] = useState(
    "Мы запускаем стартап Jeli — AI-платформу инфлюенс-маркетинга в Казахстане для автоматического выбора инфлюенсеров и проведения сделок через безопасный escrow. Ищем IT, бизнес и технологических блогеров для продвижения."
  );
  const [targetNiche, setTargetNiche] = useState("Все ниши");
  const [budget, setBudget] = useState("500,000 ₸");
  const [loading, setLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[] | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setInfluencers(data);
    } catch (err) {
      console.error("Error loading catalog:", err);
    }
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDesc,
          targetNiche,
          budget,
          influencers
        })
      });

      const data = await res.json();
      if (res.ok && data.matches) {
        setAiMatches(data.matches);
      } else {
        alert(data.error || "AI matching error");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to perform AI analysis");
    } finally {
      setLoading(false);
    }
  };

  const filteredInfluencers = influencers.filter((i) => {
    if (cityFilter !== "all" && i.city !== cityFilter) return false;
    if (nicheFilter !== "all" && !i.niche.includes(nicheFilter)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] transition-colors duration-300">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#F7F8FC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] tracking-tight text-slate-900 dark:text-white">
            Jeli.
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition">Как работает</a>
            <a href="#for-business" className="hover:text-slate-900 dark:hover:text-white transition">Бизнесу</a>
            <a href="#for-influencers" className="hover:text-slate-900 dark:hover:text-white transition">Инфлюенсерам</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition">Цены</a>
            <a href="#contacts" className="hover:text-slate-900 dark:hover:text-white transition">Контакты</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <Link href="/onboarding" className="text-sm font-semibold px-4 py-2 text-slate-900 dark:text-white hover:opacity-80">
              Войти
            </Link>

            <Link href="/onboarding" className="text-sm font-bold px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition">
              Начать бесплатно
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section matching Screenshot */}
      <section className="px-6 pt-16 pb-12 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-block px-4 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-7 shadow-sm">
            AI-платформа инфлюенс-маркетинга в Казахстане
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-4">
            Реклама через<br />
            инфлюенсеров — без<br />
            хаоса и посредников
          </h1>

          <p className="text-lg md:text-xl font-bold text-[#0064FF] mb-6">
            Будущее рекламы — без менеджеров.
          </p>

          <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mb-7">
            Jeli соединяет бизнес и инфлюенсеров напрямую: умный мэтчинг, весь цикл сделки внутри платформы и защита денег через escrow. Мы берём процент с успешных сделок и предлагаем подписку на полный функционал — чем больше честных интеграций, тем совпадают наши интересы с вашими.
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-9">
            <span>Подбор</span>
            <span className="text-slate-300">•</span>
            <span>Сделки</span>
            <span className="text-slate-300">•</span>
            <span>Аналитика</span>
            <span className="text-slate-300">•</span>
            <span>Безопасность</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <Link href="#ai-matcher" className="px-8 py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-base shadow-lg hover:-translate-y-0.5 transition">
              Запустить кампанию
            </Link>
            <Link href="/onboarding" className="px-8 py-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-50 transition">
              Я инфлюенсер
            </Link>
          </div>

          <p className="text-xs text-slate-500 max-w-md">
            Пример экрана: так может выглядеть карточка в каталоге (данные реальные, анализируются AI в режиме реального времени).
          </p>

        </div>
      </section>

      {/* AI Business Campaign Matcher Tool Section */}
      <section id="ai-matcher" className="max-w-4xl mx-auto px-6 my-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-[#0064FF] font-bold text-xs mb-3">
              <Sparkles className="w-4 h-4" />
              Умный AI-Мэтчинг Jeli
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Подберите идеальных инфлюенсеров для вашего бизнеса
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Опишите ваш продукт или стартап. AI спасёт вас от хаоса, автоматически проанализирует контент блогеров и рассчитает совпадение.
            </p>
          </div>

          <form onSubmit={handleMatchSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                Описание вашего бизнеса / стартапа:
              </label>
              <textarea
                rows={3}
                required
                value={businessDesc}
                onChange={(e) => setBusinessDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0064FF]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                  Целевая ниша:
                </label>
                <select
                  value={targetNiche}
                  onChange={(e) => setTargetNiche(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0064FF]"
                >
                  <option value="Все ниши">Все ниши</option>
                  <option value="IT, Гаджеты, AI & Технологии">IT & Технологии</option>
                  <option value="Бизнес, Финансы, Инвестиции">Бизнес & Финансы</option>
                  <option value="Развлечения, Челленджи, Шоу">Развлечения & Шоу</option>
                  <option value="Фитнес, ЗОЖ, Спорт & Мотивация">Фитнес & Спорт</option>
                  <option value="Красота, Уход, Косметика">Красота & Бьюти</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                  Планируемый бюджет (₸ / $):
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0064FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "✨ AI Проводит многокритериальный анализ..." : "Провести AI-анализ и подобрать блогеров"}
            </button>
          </form>

          {/* AI Matches Display */}
          {aiMatches && (
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-extrabold mb-4">🎯 Результаты многокритериального AI-анализа Jeli</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMatches.map((m, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                    <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1 bg-blue-500/10 text-[#0064FF] rounded-full">
                      {m.overall_alignment_score}% Совпадение
                    </span>
                    <h4 className="font-extrabold text-base mb-1">{m.nickname} ({m.username})</h4>
                    <p className="text-xs text-[#0064FF] font-semibold mb-3">{m.alignment_tier}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{m.ai_content_summary}</p>
                    <button 
                      onClick={() => alert(`🚀 Сделка с ${m.username} отправлена в escrow-модуль Jeli!`)}
                      className="w-full py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                    >
                      Запустить кампанию
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Catalog & Filter Bar matching screenshot */}
      <section className="max-w-6xl mx-auto px-6 my-16">
        
        <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3 mb-8 shadow-sm">
          
          <div className="flex items-center gap-2">
            <button className="px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
              Каталог
            </button>
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Город
            </button>
            <button className="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white">
              Ниша
            </button>
          </div>

          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Все города</option>
              <option value="Алматы">Алматы</option>
              <option value="Астана">Астана</option>
            </select>

            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="px-4 py-2 text-xs font-semibold rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Все ниши</option>
              <option value="IT">IT & Технологии</option>
              <option value="Бизнес">Бизнес</option>
              <option value="Развлечения">Развлечения</option>
              <option value="Фитнес">Фитнес</option>
              <option value="Красота">Красота</option>
            </select>
          </div>

        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredInfluencers.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
              
              <div className="flex items-center gap-4 mb-4">
                <img src={item.avatar} alt={item.nickname} className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <h3 className="font-extrabold text-base flex items-center gap-1.5">
                    {item.nickname}
                    {item.verified && <CheckCircle2 className="w-4 h-4 text-[#0064FF]" />}
                  </h3>
                  <span className="text-xs text-slate-500">{item.username} • {item.city}</span>
                </div>
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">
                🏷️ {item.niche}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center mb-5">
                <div>
                  <span className="block font-extrabold text-sm">{(item.followers / 1000).toFixed(0)}K</span>
                  <span className="text-[10px] text-slate-500">Подписчики</span>
                </div>
                <div>
                  <span className="block font-extrabold text-sm">{(item.totalLikes / 1000000).toFixed(1)}M</span>
                  <span className="text-[10px] text-slate-500">Лайки</span>
                </div>
                <div>
                  <span className="block font-extrabold text-sm">{item.totalVideos}</span>
                  <span className="text-[10px] text-slate-500">Видео</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => alert(`🚀 Сделка с ${item.username} оформлена!`)}
                  className="flex-1 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90"
                >
                  Запустить кампанию
                </button>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-6 bg-white dark:bg-slate-900 text-center md:text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-2xl font-extrabold italic font-['Outfit']">Jeli.</span>
            <p className="text-xs text-slate-500 mt-1">© 2026 Jeli Platform. AI-платформа инфлюенс-маркетинга в Казахстане.</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#how-it-works">Как работает</a>
            <a href="#for-business">Бизнесу</a>
            <a href="#for-influencers">Инфлюенсерам</a>
            <a href="#pricing">Цены</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
