"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ShieldCheck, Search, ChevronRight, UserPlus, ArrowRight,
  CheckCircle2, Lock, Zap, Star, Globe, TrendingUp, DollarSign,
  Users, Building2, HelpCircle, Layers, Check, MessageSquare, Play
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

// Translations dictionary
const content = {
  ru: {
    nav: {
      product: "Продукт",
      aiMatch: "AI Матчер",
      catalog: "Каталог",
      escrow: "Escrow Сделки",
      pricing: "Тарифы",
      resources: "Ресурсы",
      login: "Войти",
      getStarted: "Начать бесплатно"
    },
    hero: {
      rating: "4.9/5 на базе 150+ успешных кампаний в Казахстане",
      titlePart1: "Выбирайте",
      titleHighlight: "реальное",
      titlePart2: "",
      titlePixel: "влияние",
      subtitle: "Первый в Центральной Азии AI-маркетплейс для работы брендов с TikTok и Instagram креаторами. Умный поиск за 30 секунд и 100% защита бюджета через Escrow.",
      ctaBrand: "Найти креаторов",
      ctaCreator: "Присоединиться как инфлюенсер",
      demoTitle: "Попробуйте AI-подбор в реальном времени:",
      demoPlaceholder: "Например: Кофейня в Алматы ищет 3 TikTok-блогеров с охватом от 15K под акцию...",
      demoButton: "Анализировать",
      demoAnalyzing: "AI Анализирует базу..."
    },
    logos: "ПЛАТФОРМЕ ДОВЕРЯЮТ ВЕДУЩИЕ БРЕНДЫ И СТАРТАПЫ КАЗАХСТАНА",
    audience: {
      tag: "ДВУХСТОРОННИЙ МАРКЕТПЛЕЙС",
      title: "Платформа, созданная для обоих участников",
      tabBrand: "Брендам & Маркетологам",
      tabCreator: "Креаторам & Инфлюенсерам",
      brandFeature1: "AI-подбор за 30 секунд на основе 12 параметров совпадения",
      brandFeature2: "Верификация аккаунтов через TikTok OAuth — 0% фейков и накруток",
      brandFeature3: "Escrow-защита: деньги переводятся креатору только после проверки поста",
      brandFeature4: "Автоматический расчет ROI и аналитика по вовлечённости",
      creatorFeature1: "Бренды сами отправляют вам коммерческие офферы",
      creatorFeature2: "Гарантия выплаты 100%: деньги за работу уже заморожены в Escrow",
      creatorFeature3: "Верифицированный значок ✅ повышает доверие брендов в 3 раза",
      creatorFeature4: "Бесплатное создание авто-медиакита со статистикой в 1 клик"
    },
    escrow: {
      tag: "БЕЗОПАСНЫЕ СДЕЛКИ",
      title: "Как Escrow гарантирует честность сделок",
      step1Title: "1. Депонирование средств",
      step1Desc: "Бренд выбирает креатора и замораживает бюджет в защищённом Escrow-счёте Jeli.",
      step2Title: "2. Создание & Публикация",
      step2Desc: "Креатор делает контент, согласует бриф и публикует ролик в TikTok / Instagram.",
      step3Title: "3. Авто-выплата",
      step3Desc: "AI проверяет ссылку на пост. Замороженные средства автоматически поступают креатору."
    },
    catalog: {
      tag: "БАЗА КРЕАТОРОВ",
      title: "Верифицированные инфлюенсеры Казахстана",
      subtitle: "Все креаторы проходят проверку через TikTok OAuth и подтверждают реальную вовлечённость",
      viewAll: "Смотреть весь каталог"
    },
    pricing: {
      tag: "ТАРИФНЫЕ ПЛАНЫ",
      title: "Прозрачные условия для бизнеса любого масштаба",
      freeTitle: "Free",
      freePrice: "0 ₸",
      freeDesc: "Для ознакомления и разовых запусков",
      freeF1: "3 AI-запроса в день",
      freeF2: "Доступ к публичному каталогу",
      freeF3: "1 активная Escrow-сделка",
      proTitle: "Pro",
      proPrice: "15 000 ₸",
      proPeriod: "/ мес",
      proDesc: "Для активных SMM-команд и брендов",
      proF1: "Безлимитные AI-матчинги",
      proF2: "Глубокая аналитика аудитории",
      proF3: "До 15 активных сделок одновременно",
      proF4: "Приоритетная поддержка 24/7",
      enterpriseTitle: "Enterprise",
      enterprisePrice: "По запросу",
      enterpriseDesc: "Для крупных агентств и корпораций",
      enterpriseF1: "Персональный менеджера",
      enterpriseF2: "White-label отчёты",
      enterpriseF3: "API доступ & Безналичный расчёт"
    },
    faq: {
      title: "Часто задаваемые вопросы",
      q1: "Как AI подбирает инфлюенсеров?",
      a1: "Наш AI-алгоритм на базе Gemini анализирует описание вашего бизнеса, целевую аудиторию, нишу и budget. Затем сравнивает с базой креаторов по 12 метрикам, включая вовлечённость, геолокацию и тональность контента.",
      q2: "Как работает защита Escrow?",
      a2: "Бренд оплачивает кампанию заранее, но деньги хранятся на независимом счёте Jeli. Креатор получает выплату только после успешной публикации ролика и проверки ссылки.",
      q3: "Как креатору подтвердить свой TikTok?",
      a3: "В личной кабинете нажмите 'Привязать TikTok'. Вы перейдёте на официальный сайт TikTok для авторизации OAuth. Мы не получаем доступ к вашему паролю, только открытую статистику."
    },
    footer: {
      rights: "© 2026 Jeli Platform Inc. Все права защищены.",
      tagline: "Первый AI-маркетплейс инфлюенс-маркетинга в Центральной Азии."
    }
  },
  en: {
    nav: {
      product: "Product",
      aiMatch: "AI Matcher",
      catalog: "Catalog",
      escrow: "Escrow Deals",
      pricing: "Pricing",
      resources: "Resources",
      login: "Log in",
      getStarted: "Get Started"
    },
    hero: {
      rating: "4.9/5 based on 150+ successful campaigns in Kazakhstan",
      titlePart1: "Choose",
      titleHighlight: "real",
      titlePart2: "",
      titlePixel: "impact",
      subtitle: "Central Asia's #1 AI-powered marketplace for brands & TikTok/Instagram creators. Instant matching in 30 seconds with 100% Escrow budget protection.",
      ctaBrand: "Find Creators",
      ctaCreator: "Join as Creator",
      demoTitle: "Try Live AI Matching Engine:",
      demoPlaceholder: "e.g., Coffee shop in Almaty looking for 3 TikTok creators (15K+ reach) for promo...",
      demoButton: "Analyze Now",
      demoAnalyzing: "AI Analyzing Database..."
    },
    logos: "TRUSTED BY LEADING BRANDS & STARTUPS ACROSS CENTRAL ASIA",
    audience: {
      tag: "DUAL-SIDED MARKETPLACE",
      title: "Built for both sides of the creator economy",
      tabBrand: "For Brands & Marketers",
      tabCreator: "For Creators & Influencers",
      brandFeature1: "30-second AI matching based on 12 multi-criteria metrics",
      brandFeature2: "TikTok OAuth verification — 0% fake bots or inflated stats",
      brandFeature3: "Escrow safety: Funds released to creators only after post verification",
      brandFeature4: "Automated ROI calculation & engagement analytics",
      creatorFeature1: "Brands send commercial offers directly to your inbox",
      creatorFeature2: "100% payment guarantee: Funds pre-locked in Escrow before shooting",
      creatorFeature3: "Verified badge ✅ increases brand trust by 3x",
      creatorFeature4: "1-click automated media kit generation with live stats"
    },
    escrow: {
      tag: "TRUST & SAFETY",
      title: "How Escrow protects every collaboration",
      step1Title: "1. Lock Funds",
      step1Desc: "Brand selects creator and locks campaign funds in Jeli's secure Escrow vault.",
      step2Title: "2. Create & Publish",
      step2Desc: "Creator produces content, aligns on brief, and posts video to TikTok / Instagram.",
      step3Title: "3. Auto-Payout",
      step3Desc: "AI verifies post URL. Funds are instantly unlocked and transferred to creator."
    },
    catalog: {
      tag: "CREATOR DIRECTORY",
      title: "Verified Influencers in Kazakhstan",
      subtitle: "All creators are authenticated via TikTok OAuth API with verified metrics",
      viewAll: "Explore Full Catalog"
    },
    pricing: {
      tag: "FLEXIBLE PLANS",
      title: "Transparent pricing for companies of any size",
      freeTitle: "Free",
      freePrice: "0 ₸",
      freeDesc: "Best for trial and single campaigns",
      freeF1: "3 AI Matches per day",
      freeF2: "Public directory access",
      freeF3: "1 Active Escrow deal",
      proTitle: "Pro",
      proPrice: "15,000 ₸",
      proPeriod: "/ mo",
      proDesc: "For active marketing teams & brands",
      proF1: "Unlimited AI Matches",
      proF2: "Deep audience demographics",
      proF3: "Up to 15 concurrent deals",
      proF4: "Priority 24/7 Support",
      enterpriseTitle: "Enterprise",
      enterprisePrice: "Custom",
      enterpriseDesc: "For agencies & large corporations",
      enterpriseF1: "Dedicated Account Manager",
      enterpriseF2: "White-label PDF reports",
      enterpriseF3: "API Access & Bank Invoicing"
    },
    faq: {
      title: "Frequently Asked Questions",
      q1: "How does AI Creator Matching work?",
      a1: "Our Gemini-based AI engine parses your campaign description, target niche, and budget, comparing it against creator profiles across 12 metrics like engagement, location, and content tone.",
      q2: "How does Escrow payment safety work?",
      a2: "The brand locks campaign funds upfront into Jeli's secure vault. Funds are only paid out to the creator once the post URL is verified by our system.",
      q3: "How do creators verify their TikTok account?",
      a3: "In your dashboard, click 'Link TikTok'. You'll be redirected to TikTok OAuth. We never access your password, only public performance stats."
    },
    footer: {
      rights: "© 2026 Jeli Platform Inc. All rights reserved.",
      tagline: "The #1 AI Influencer Marketplace in Central Asia."
    }
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<"ru" | "en">("ru");
  const [activeTab, setActiveTab] = useState<"brand" | "creator">("brand");
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // AI Form states
  const [businessDesc, setBusinessDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[] | null>(null);
  const [noMatchesMessage, setNoMatchesMessage] = useState<string | null>(null);

  const t = content[lang];

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/catalog");
      const data = await res.json();
      setInfluencers(data || []);
    } catch {
      setInfluencers([]);
    }
  };

  const handleMatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessDesc.trim()) return;
    setLoading(true);
    setAiMatches(null);
    setNoMatchesMessage(null);

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
      if (res.ok && data.matches && data.matches.length > 0) {
        setAiMatches(data.matches);
      } else {
        setNoMatchesMessage(data.message || (lang === "ru" ? "Подходящих инфлюенсеров не найдено" : "No matching creators found"));
      }
    } catch {
      setNoMatchesMessage(lang === "ru" ? "Ошибка подключения к AI-сервису" : "AI Service Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-[#0064FF] selection:text-white font-sans relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* Radial Gradient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0064FF]/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[160px] pointer-events-none rounded-full" />

      {/* ==================== TOP NAVIGATION ==================== */}
      <nav className="relative z-50 sticky top-0 border-b border-white/10 bg-[#07090E]/80 backdrop-blur-xl px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-extrabold italic tracking-tight font-outfit text-white group-hover:text-[#0064FF] transition">
                Jeli<span className="text-[#0064FF] group-hover:text-white">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 glass-pill px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
              <Link href="#product" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                {t.nav.product}
              </Link>
              <Link href="#ai-matcher" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0064FF]" />
                {t.nav.aiMatch}
              </Link>
              <Link href="#catalog" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                {t.nav.catalog}
              </Link>
              <Link href="#escrow" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                {t.nav.escrow}
              </Link>
              <Link href="#pricing" className="px-3 py-1 rounded-full hover:text-white hover:bg-white/10 transition">
                {t.nav.pricing}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
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

            <Link href="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition hidden sm:inline-block">
              {t.nav.login}
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue flex items-center gap-1.5"
            >
              {t.nav.getStarted}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION (DOVETAIL STYLE) ==================== */}
      <section className="relative z-10 pt-20 pb-24 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Star Rating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-300"
          >
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>{t.hero.rating}</span>
          </motion.div>

          {/* Main Title with Pixel Typography & 3D Key Icon */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-outfit tracking-tight text-white leading-[1.1] max-w-4xl mx-auto"
          >
            {t.hero.titlePart1}{" "}
            <span className="text-[#0064FF] underline decoration-[#0064FF]/40 underline-offset-8">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.titlePart2}{" "}
            <span className="inline-flex items-center align-middle gap-2 mx-1 px-3 py-1 bg-[#0064FF] text-white rounded-2xl shadow-lg shadow-blue-600/40 border border-blue-400/30 transform -rotate-1">
              <span className="text-xl">🕹️</span>
              <span className="font-pixel text-xl tracking-wider uppercase text-white">
                {t.hero.titlePixel}
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Dual Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              href="/register?role=BRAND"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-sm transition glow-blue flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              {t.hero.ctaBrand}
            </Link>
            <Link
              href="/register?role=INFLUENCER"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-card-dark text-white hover:bg-white/10 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4 text-[#0064FF]" />
              {t.hero.ctaCreator}
            </Link>
          </motion.div>

          {/* Live AI Matcher Studio Interactive Bar */}
          <motion.div
            id="ai-matcher"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-10 max-w-3xl mx-auto text-left"
          >
            <div className="glass-card-dark p-4 sm:p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#0064FF] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-pixel">
                  {t.hero.demoTitle}
                </span>
              </div>

              <form onSubmit={handleMatchSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={businessDesc}
                    onChange={(e) => setBusinessDesc(e.target.value)}
                    placeholder={t.hero.demoPlaceholder}
                    rows={2}
                    className="w-full bg-[#07090E]/90 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF] resize-none transition"
                  />
                  <button
                    type="submit"
                    disabled={loading || !businessDesc.trim()}
                    className="sm:absolute right-3 bottom-3 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t.hero.demoAnalyzing}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.hero.demoButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* AI Matches Result Display */}
              <AnimatePresence>
                {aiMatches && aiMatches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-3"
                  >
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ru" ? "AI нашёл подящих инфлюенсеров:" : "AI Found Suitable Matches:"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiMatches.slice(0, 2).map((match, idx) => (
                        <div key={idx} className="bg-[#07090E] border border-white/10 rounded-2xl p-3.5 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#0064FF]/20 border border-[#0064FF]/40 flex items-center justify-center font-bold text-sm text-[#0064FF]">
                            {match.nickname?.charAt(0) || "I"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-sm text-white truncate">{match.nickname}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF]">
                                {match.overall_alignment_score || 95}% Match
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{match.username} • {match.niche}</p>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{match.ai_content_summary}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {noMatchesMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300"
                  >
                    {noMatchesMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== LOGO TICKER (SOCIAL PROOF) ==================== */}
      <section className="border-y border-white/5 py-8 bg-[#07090E]/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="text-[11px] font-bold tracking-widest text-slate-500 font-pixel uppercase">
            {t.logos}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition duration-500">
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">Kaspi.kz</span>
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">MOST Hub</span>
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">Choco</span>
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">TikTok PK</span>
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">SDU University</span>
            <span className="text-lg font-bold font-outfit tracking-wider text-slate-400">SmartPoint</span>
          </div>
        </div>
      </section>

      {/* ==================== DUAL AUDIENCE SECTION ==================== */}
      <section id="product" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <span className="text-xs font-bold text-[#0064FF] uppercase tracking-wider font-pixel">
            {t.audience.tag}
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white">
            {t.audience.title}
          </h2>

          {/* Toggle Switch */}
          <div className="inline-flex p-1.5 rounded-full bg-white/5 border border-white/10 mt-6">
            <button
              onClick={() => setActiveTab("brand")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition ${activeTab === "brand" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400 hover:text-white"}`}
            >
              {t.audience.tabBrand}
            </button>
            <button
              onClick={() => setActiveTab("creator")}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition ${activeTab === "creator" ? "bg-[#0064FF] text-white glow-blue" : "text-slate-400 hover:text-white"}`}
            >
              {t.audience.tabCreator}
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            {activeTab === "brand" ? (
              <>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2 border-l-4 border-l-[#0064FF]">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0064FF]" />
                    AI-Матчинг 360°
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.brandFeature1}</p>
                </div>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    TikTok OAuth Верификация
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.brandFeature2}</p>
                </div>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Escrow Депонирование
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.brandFeature3}</p>
                </div>
              </>
            ) : (
              <>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2 border-l-4 border-l-[#0064FF]">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Прямые Заказы от Брендов
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.creatorFeature1}</p>
                </div>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#0064FF]" />
                    100% Гарантия Выплаты
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.creatorFeature2}</p>
                </div>
                <div className="glass-card-dark p-6 rounded-3xl space-y-2">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400" />
                    Значок Верификации ✅
                  </h3>
                  <p className="text-sm text-slate-400">{t.audience.creatorFeature3}</p>
                </div>
              </>
            )}
          </div>

          {/* Visual Showcase Block */}
          <div className="glass-card-dark p-8 rounded-3xl border border-white/10 relative overflow-hidden min-h-[350px] flex items-center justify-center">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#0064FF]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-3xl bg-[#0064FF]/20 border border-[#0064FF]/40 text-[#0064FF] flex items-center justify-center mx-auto text-2xl font-bold">
                {activeTab === "brand" ? "🏢" : "🤳"}
              </div>
              <h4 className="font-bold text-xl text-white">
                {activeTab === "brand" ? "Запустите кампанию за 3 минуты" : "Создайте авто-медиакит бесплатно"}
              </h4>
              <p className="text-xs text-slate-400">
                {activeTab === "brand"
                  ? "Доступ к верифицированным TikTok-блогерам Казахстана с автоматическим анализом эффективности."
                  : "Привяжите TikTok в 1 клик и получайте входящие предложения от брендов без холодных писем."}
              </p>
              <Link
                href={activeTab === "brand" ? "/register?role=BRAND" : "/register?role=INFLUENCER"}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#0064FF] hover:underline pt-2"
              >
                <span>{lang === "ru" ? "Зарегистрироваться сейчас" : "Register Now"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ESCROW TRUST SECTION ==================== */}
      <section id="escrow" className="py-20 px-6 border-t border-white/5 bg-[#0A0E17]/60">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-pixel">
              {t.escrow.tag}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white">
              {t.escrow.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card-dark p-8 rounded-3xl space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[#0064FF] flex items-center justify-center font-bold text-xl">
                1
              </div>
              <h3 className="font-bold text-xl text-white">{t.escrow.step1Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t.escrow.step1Desc}</p>
            </div>

            <div className="glass-card-dark p-8 rounded-3xl space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <h3 className="font-bold text-xl text-white">{t.escrow.step2Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t.escrow.step2Desc}</p>
            </div>

            <div className="glass-card-dark p-8 rounded-3xl space-y-4 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <h3 className="font-bold text-xl text-white">{t.escrow.step3Title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t.escrow.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CREATOR DIRECTORY SHOWCASE ==================== */}
      <section id="catalog" className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#0064FF] uppercase tracking-wider font-pixel">
              {t.catalog.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">
              {t.catalog.title}
            </h2>
            <p className="text-sm text-slate-400">{t.catalog.subtitle}</p>
          </div>
          <Link
            href="/catalog"
            className="px-6 py-3 rounded-2xl glass-card-dark text-white hover:border-[#0064FF] text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{t.catalog.viewAll}</span>
            <ArrowRight className="w-4 h-4 text-[#0064FF]" />
          </Link>
        </div>

        {/* Creator Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.slice(0, 3).map((creator, i) => (
            <div key={i} className="glass-card-dark p-6 rounded-3xl border border-white/10 space-y-4 group">
              <div className="flex items-center gap-4">
                <img
                  src={creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.nickname}`}
                  alt={creator.nickname}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-white">{creator.nickname}</h3>
                    {creator.verified && <CheckCircle2 className="w-4 h-4 text-[#0064FF]" />}
                  </div>
                  <p className="text-xs text-slate-400">{creator.username}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                    {creator.niche}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-center">
                <div className="bg-white/5 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">Подписчики</p>
                  <p className="text-sm font-extrabold text-white">{(creator.followers || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <p className="text-[10px] text-slate-400">Город</p>
                  <p className="text-sm font-extrabold text-white">{creator.city || "Алматы"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5 bg-[#0A0E17]/80">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold text-[#0064FF] uppercase tracking-wider font-pixel">
              {t.pricing.tag}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white">
              {t.pricing.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="glass-card-dark p-8 rounded-3xl space-y-6 border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-white">{t.pricing.freeTitle}</h3>
                <div className="text-3xl font-extrabold text-white">{t.pricing.freePrice}</div>
                <p className="text-xs text-slate-400">{t.pricing.freeDesc}</p>
                <ul className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.freeF1}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.freeF2}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.freeF3}</li>
                </ul>
              </div>
              <Link href="/register?role=BRAND" className="w-full py-3 rounded-xl glass-pill hover:bg-white/10 font-bold text-xs text-center text-white transition block">
                {t.nav.getStarted}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="glass-card-dark p-8 rounded-3xl space-y-6 border-2 border-[#0064FF] relative glow-blue flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0064FF] text-white text-[10px] font-bold tracking-wider font-pixel">
                POPULAR
              </span>
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-white">{t.pricing.proTitle}</h3>
                <div className="text-3xl font-extrabold text-white">
                  {t.pricing.proPrice} <span className="text-xs font-normal text-slate-400">{t.pricing.proPeriod}</span>
                </div>
                <p className="text-xs text-slate-400">{t.pricing.proDesc}</p>
                <ul className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.proF1}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.proF2}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.proF3}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.proF4}</li>
                </ul>
              </div>
              <Link href="/register?role=BRAND" className="w-full py-3 rounded-xl bg-[#0064FF] hover:bg-blue-600 font-bold text-xs text-center text-white transition block">
                {t.nav.getStarted}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card-dark p-8 rounded-3xl space-y-6 border border-white/10 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-white">{t.pricing.enterpriseTitle}</h3>
                <div className="text-3xl font-extrabold text-white">{t.pricing.enterprisePrice}</div>
                <p className="text-xs text-slate-400">{t.pricing.enterpriseDesc}</p>
                <ul className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.enterpriseF1}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.enterpriseF2}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#0064FF]" /> {t.pricing.enterpriseF3}</li>
                </ul>
              </div>
              <a href="mailto:support@jeli.kz" className="w-full py-3 rounded-xl glass-pill hover:bg-white/10 font-bold text-xs text-center text-white transition block">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ ACCORDION ==================== */}
      <section className="py-24 px-6 max-w-4xl mx-auto space-y-12">
        <h2 className="text-3xl font-extrabold font-outfit text-center text-white">
          {t.faq.title}
        </h2>

        <div className="space-y-4">
          {[
            { q: t.faq.q1, a: t.faq.a1 },
            { q: t.faq.q2, a: t.faq.a2 },
            { q: t.faq.q3, a: t.faq.a3 }
          ].map((item, idx) => (
            <div key={idx} className="glass-card-dark rounded-2xl overflow-hidden border border-white/10">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-6 text-left font-bold text-sm text-white flex items-center justify-between gap-4"
              >
                <span>{item.q}</span>
                <ChevronRight className={`w-4 h-4 text-[#0064FF] transition-transform ${openFaq === idx ? "rotate-90" : ""}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#05070A] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </span>
            <p className="text-slate-500">{t.footer.tagline}</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="hover:text-white transition">Catalog</Link>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <Link href="/login" className="hover:text-white transition">Log in</Link>
            <Link href="/register" className="hover:text-white transition">Sign up</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-slate-600">
          {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}
