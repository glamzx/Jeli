"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "INFLUENCER" | "BRAND" | null;
type Step = "SELECT_ROLE" | "FORM" | "LINK_TIKTOK";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [step, setStep] = useState<Step>("SELECT_ROLE");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Influencer specific
  const [handle, setHandle] = useState("");
  const [niche, setNiche] = useState("IT");

  // Brand specific
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [budget, setBudget] = useState("250,000 ₸ – 1,000,000 ₸");

  const [loading, setLoading] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.12 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.02, translateY: -4, transition: { type: "spring", stiffness: 300 } },
    tap: { scale: 0.98 }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          role: selectedRole,
          handle,
          niche,
          companyName,
          websiteUrl,
          budget
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user) {
          localStorage.setItem("jeli_user", JSON.stringify(data.user));
        }
        setRegisteredUserId(data.user?.id || null);

        if (selectedRole === "INFLUENCER") {
          // Show TikTok linking step
          setStep("LINK_TIKTOK");
        } else {
          // Brands go directly to dashboard
          router.push("/dashboard");
        }
      } else {
        setFormError(data.message || "Ошибка при регистрации");
      }
    } catch (error) {
      console.error(error);
      setFormError("Не удалось завершить регистрацию. Проверьте подключение к интернету.");
    } finally {
      setLoading(false);
    }
  };

  const handleTikTokLink = () => {
    if (registeredUserId) {
      window.location.href = `/api/v1/auth/tiktok?userId=${registeredUserId}&returnTo=dashboard`;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">

      {/* Header logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] tracking-tight text-slate-900 dark:text-white">
          Jeli.
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {step === "SELECT_ROLE" ? (
          <motion.div
            key="role-selection"
            className="max-w-4xl w-full text-center space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-3">
              <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0064FF] text-sm font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                Портал регистрации Jeli
              </motion.div>
              <motion.h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Добро пожаловать в Jeli
              </motion.h1>
              <motion.p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto">
                Выберите тип аккаунта, чтобы настроить рабочий кабинет и подключиться к базе данных Jeli.
              </motion.p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-8">

              {/* Creator Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("INFLUENCER")}
                className={`cursor-pointer relative p-8 rounded-3xl border transition-all duration-300 ${
                  selectedRole === "INFLUENCER"
                    ? "border-[#0064FF] bg-blue-500/10 shadow-[0_0_35px_rgba(0,100,255,0.25)]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {selectedRole === "INFLUENCER" && (
                  <CheckCircle2 className="absolute top-4 right-4 text-[#0064FF] w-6 h-6" />
                )}
                <div className="p-3 bg-[#0064FF]/10 w-fit rounded-2xl text-[#0064FF] mb-6">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Креатор / Инфлюенсер</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Автоматизируйте рекламные запросы от брендов, получайте предложения по интеграциям и проводите сделки с гарантией оплаты через Jeli Escrow.
                </p>
                <span className="text-[#0064FF] font-semibold text-sm flex items-center gap-2">
                  Продолжить как Блогер <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

              {/* Brand Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("BRAND")}
                className={`cursor-pointer relative p-8 rounded-3xl border transition-all duration-300 ${
                  selectedRole === "BRAND"
                    ? "border-[#0064FF] bg-blue-500/10 shadow-[0_0_35px_rgba(0,100,255,0.25)]"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {selectedRole === "BRAND" && (
                  <CheckCircle2 className="absolute top-4 right-4 text-[#0064FF] w-6 h-6" />
                )}
                <div className="p-3 bg-[#0064FF]/10 w-fit rounded-2xl text-[#0064FF] mb-6">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Бизнес / Бренд</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                  Находите проверенных локальных инфлюенсеров, запускайте рекламные кампании с Gemini AI и защищайте бюджет безопасным депозитом.
                </p>
                <span className="text-[#0064FF] font-semibold text-sm flex items-center gap-2">
                  Продолжить как Бренд <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

            </div>

            {/* Proceed Button */}
            <motion.button
              disabled={!selectedRole}
              onClick={() => selectedRole && setStep("FORM")}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 mx-auto ${
                selectedRole
                  ? "bg-[#0064FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 cursor-pointer transform hover:-translate-y-0.5"
                  : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              Перейти к заполнению профиля <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : step === "FORM" ? (
          <motion.div
            key="registration-form"
            className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-6">
              <button
                onClick={() => setStep("SELECT_ROLE")}
                className="text-sm text-[#0064FF] font-semibold hover:underline mb-3 inline-block"
              >
                ← Назад к выбору роли
              </button>
              <h2 className="text-2xl font-bold">
                {selectedRole === "INFLUENCER" ? "Регистрация Инфлюенсера" : "Регистрация Бизнеса / Бренда"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Заполните данные профиля для интеграции с базой данных Jeli.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Полное Имя / Название
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Аскар Смагулов"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Рабочий Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="askar@company.kz"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Пароль (минимум 8 символов)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              {/* Influencer Form Fields */}
              {selectedRole === "INFLUENCER" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      TikTok Хэндл (@username)
                    </label>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@tech_kazakhstan"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      После регистрации вы сможете привязать реальный TikTok аккаунт для верификации
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Основная категория контента
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="IT">IT & Технологии</option>
                      <option value="Фитнес">Фитнес & ЗОЖ</option>
                      <option value="Бизнес">Бизнес & Финансы</option>
                      <option value="Красота">Красота & Бьюти</option>
                      <option value="Развлечения">Развлечения & Юмор</option>
                    </select>
                  </div>
                </>
              )}

              {/* Brand Form Fields */}
              {selectedRole === "BRAND" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Название компании
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="KazTech Solutions"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Сайт компании
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.kz"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Месячный бюджет на инфлюенс-маркетинг
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="до 250,000 ₸">до 250,000 ₸ / мес</option>
                      <option value="250,000 ₸ – 1,000,000 ₸">250,000 ₸ – 1,000,000 ₸ / мес</option>
                      <option value="более 1,000,000 ₸">более 1,000,000 ₸ / мес</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-xl font-bold bg-[#0064FF] hover:bg-blue-600 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Создание аккаунта..." : "Зарегистрироваться"}
              </button>
            </form>
          </motion.div>
        ) : (
          /* LINK_TIKTOK step — shown after successful influencer registration */
          <motion.div
            key="link-tiktok"
            className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Success checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Аккаунт создан! 🎉</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Теперь привяжите ваш TikTok аккаунт, чтобы подтвердить вашу личность и получить статус верифицированного инфлюенсера.
            </p>

            {/* TikTok Link Card */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4 justify-center">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold">Привязать TikTok</h3>
              </div>

              <ul className="text-left text-sm text-slate-600 dark:text-slate-400 space-y-2 mb-5">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                  Верификация вашего аккаунта
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                  Автоматическая загрузка статистики (подписчики, лайки)
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                  Значок ✅ «Верифицированный инфлюенсер» в каталоге
                </li>
              </ul>

              <button
                onClick={handleTikTokLink}
                className="w-full py-3.5 rounded-xl font-bold bg-black hover:bg-gray-800 text-white transition-all flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                </svg>
                Привязать TikTok аккаунт
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Skip button */}
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#0064FF] transition-colors font-medium"
              >
                Пропустить и перейти в кабинет →
              </button>

              <p className="mt-6 text-xs text-slate-400 max-w-sm mx-auto">
                Sandbox: добавьте ваш TikTok в Target Users на{" "}
                <a href="https://developers.tiktok.com/app/7666345825798391809" target="_blank" rel="noopener noreferrer" className="text-[#0064FF] underline">
                  developers.tiktok.com
                </a>
              </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
