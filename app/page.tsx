"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Moon, Sun, CheckCircle2, ChevronRight, Search, ShieldCheck, UserPlus, AlertCircle } from "lucide-react";

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [cityFilter, setCityFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");

  // Form states
  const [businessDesc, setBusinessDesc] = useState(
    "Ищем IT, бизнес и технологических блогеров в Казахстане для продвижения AI-платформы Jeli."
  );
  const [targetNiche, setTargetNiche] = useState("Все ниши");
  const [budget, setBudget] = useState("500,000 ₸");
  const [loading, setLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[] | null>(null);
  const [noMatchesMessage, setNoMatchesMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setInfluencers(data || []);
    } catch (err) {
      console.error("Error loading catalog:", err);
      setInfluencers([]);
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
    setAiMatches(null);
    setNoMatchesMessage(null);

    try {
      const res = await fetch("/api/v1/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessDescription: businessDesc,
          targetNiche,
          budget
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.matches && data.matches.length > 0) {
          setAiMatches(data.matches);
        } else {
          setNoMatchesMessage(data.message || "Подходящих инфлюенсеров пока нет");
        }
      } else {
        setNoMatchesMessage(data.error || "Ошибка при проведении AI-анализа");
      }
    } catch (err) {
      console.error(err);
      setNoMatchesMessage("Подходящих инфлюенсеров пока нет");
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
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
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
            <a href="#catalog" className="hover:text-slate-900 dark:hover:text-white transition">Каталог</a>
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">Дашборд</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:scale-105 transition"
              title="Переключить тему"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <Link href="/onboarding" className="text-sm font-semibold px-4 py-2 text-slate-900 dark:text-white hover:opacity-80">
              Войти
            </Link>

            <Link href="/onboarding" className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#0064FF] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition">
              Регистрация
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-12 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs md:text-sm font-semibold text-[#0064FF] mb-7 shadow-sm">
            <Sparkles className="w-4 h-4" />
            AI-платформа инфлюенс-маркетинга в Казахстане
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-4">
            Реклама через<br />
            инфлюенсеров — без<br />
            хаоса и посредников
          </h1>

          <p className="text-lg md:text-xl font-bold text-[#0064FF] mb-6">
            Прямой AI-мэтчинг и защита сделок через Escrow.
          </p>

          <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mb-7">
            Jeli связывает бизнес и реальных зарегистрированных инфлюенсеров: умный поиск на базе Gemini AI, полная интеграция в базу данных и прозрачная работа без комиссий посредников.
          </p>

          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-9">
            <span>Подбор</span>
            <span className="text-slate-300">•</span>
            <span>Escrow-Сделки</span>
            <span className="text-slate-300">•</span>
            <span>Gemini AI</span>
            <span className="text-slate-300">•</span>
            <span>Безопасность</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <a href="#ai-matcher" className="px-8 py-3.5 rounded-full bg-[#0064FF] text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 transition">
              Запустить кампанию
            </a>
            <Link href="/onboarding" className="px-8 py-3.5 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Я инфлюенсер
            </Link>
          </div>

        </div>
      </section>

      {/* AI Business Campaign Matcher Tool Section */}
      <section id="ai-matcher" className="max-w-4xl mx-auto px-6 my-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-[#0064FF] font-bold text-xs mb-3">
              <Sparkles className="w-4 h-4" />
              Умный AI-Мэтчинг Jeli (Gemini API)
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Подберите инфлюенсеров из реальной базы данных
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Введите описание вашего продукта. AI автоматически сопоставит ваши требования с профилями реальных зарегистрированных блогеров.
            </p>
          </div>

          <form onSubmit={handleMatchSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                Описание вашего бизнеса / продукта:
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
                  <option value="IT">IT & Технологии</option>
                  <option value="Бизнес">Бизнес & Финансы</option>
                  <option value="Развлечения">Развлечения & Шоу</option>
                  <option value="Фитнес">Фитнес & Спорт</option>
                  <option value="Красота">Красота & Бьюти</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                  Планируемый бюджет (₸):
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
              {loading ? "✨ Gemini AI Анализирует реальную базу данных..." : "Провести AI-поиск по базе зарегистрированных блогеров"}
            </button>
          </form>

          {/* AI Matches Result or No Matches Notice */}
          {aiMatches && aiMatches.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-extrabold mb-4">🎯 Результаты AI-анализа зарегистрированных инфлюенсеров</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMatches.map((m, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                    <span className="absolute top-4 right-4 text-xs font-extrabold px-3 py-1 bg-blue-500/10 text-[#0064FF] rounded-full">
                      {m.overall_alignment_score}% Совпадение
                    </span>
                    <h4 className="font-extrabold text-base mb-1">{m.nickname} ({m.username})</h4>
                    <p className="text-xs text-[#0064FF] font-semibold mb-3">{m.alignment_tier}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{m.ai_content_summary}</p>
                    <Link
                      href="/dashboard"
                      className="block w-full text-center py-2.5 rounded-full bg-[#0064FF] text-white text-xs font-bold hover:bg-blue-600"
                    >
                      Запустить кампанию
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {noMatchesMessage && (
            <div className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <AlertCircle className="w-8 h-8 text-[#0064FF] mx-auto mb-2" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {noMatchesMessage}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                В базе данных появятся блогеры сразу после их регистрации на платформе.
              </p>
              <Link 
                href="/onboarding" 
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0064FF] text-white text-xs font-bold hover:bg-blue-600"
              >
                <UserPlus className="w-4 h-4" /> Зарегистрироваться как инфлюенсер
              </Link>
            </div>
          )}

        </div>
      </section>

      {/* Real Catalog & Filter Bar */}
      <section id="catalog" className="max-w-6xl mx-auto px-6 my-16">
        
        <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3 mb-8 shadow-sm">
          
          <div className="flex items-center gap-2">
            <span className="px-5 py-2 rounded-full bg-[#0064FF] text-sm font-semibold text-white">
              База Инфлюенсеров ({filteredInfluencers.length})
            </span>
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

        {/* Real Catalog Grid */}
        {filteredInfluencers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredInfluencers.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                
                <div className="flex items-center gap-4 mb-4">
                  <img src={item.avatar} alt={item.nickname} className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-1.5">
                      {item.nickname}
                      {item.verified && <CheckCircle2 className="w-4 h-4 text-[#0064FF]" />}
                    </h3>
                    <span className="text-xs text-slate-500">{item.username} • {item.city}</span>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-xs font-semibold text-[#0064FF] mb-4">
                  🏷️ {item.niche}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl text-center mb-5 border border-slate-200/50 dark:border-slate-800/50">
                  <div>
                    <span className="block font-extrabold text-sm">{(item.followers / 1000).toFixed(1)}K</span>
                    <span className="text-[10px] text-slate-500">Подписчики</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm">{(item.totalLikes / 1000).toFixed(0)}K</span>
                    <span className="text-[10px] text-slate-500">Лайки</span>
                  </div>
                  <div>
                    <span className="block font-extrabold text-sm">{item.totalVideos}</span>
                    <span className="text-[10px] text-slate-500">Видео</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href="/dashboard"
                    className="flex-1 text-center py-2.5 rounded-full bg-[#0064FF] text-white text-xs font-bold hover:bg-blue-600 transition"
                  >
                    Запустить кампанию
                  </Link>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <UserPlus className="w-12 h-12 text-[#0064FF] mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">В базе пока нет зарегистрированных инфлюенсеров</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Все фейковые данные удалены. Зарегистрируйте первый профиль инфлюенсера, и он появится в каталоге!
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0064FF] text-white font-bold text-sm hover:bg-blue-600 transition"
            >
              Зарегистрировать инфлюенсера
            </Link>
          </div>
        )}

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
            <Link href="/onboarding">Регистрация</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
