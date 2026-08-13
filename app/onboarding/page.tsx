"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Briefcase, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, ExternalLink, ArrowLeft } from "lucide-react";
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
          setStep("LINK_TIKTOK");
        } else {
          router.push("/dashboard");
        }
      } else {
        setFormError(data.message || "Ошибка при регистрации");
      }
    } catch {
      setFormError("Не удалось завершить регистрацию. Проверьте подключение.");
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
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#0064FF] selection:text-white">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0064FF]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header logo */}
      <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
        <Link href="/" className="text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link href="/" className="text-3xl font-extrabold italic font-outfit tracking-tight text-white">
          Jeli<span className="text-[#0064FF]">.</span>
        </Link>
      </div>

      <AnimatePresence mode="wait">
        {step === "SELECT_ROLE" ? (
          <motion.div
            key="role-selection"
            className="max-w-4xl w-full text-center space-y-8 relative z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-3">
              <motion.div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-[#0064FF] text-[10px] font-bold font-pixel uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                JOIN THE ECOSYSTEM
              </motion.div>
              <motion.h1 className="text-4xl md:text-5xl font-extrabold font-outfit tracking-tight text-white">
                Создать рабочий аккаунт Jeli
              </motion.h1>
              <motion.p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
                Выберите вашу роль для доступа к персональному рабочему кабинету
              </motion.p>

              <a
                href="/api/v1/auth/tiktok?mode=login&returnTo=dashboard"
                className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                </svg>
                Зарегистрироваться через TikTok
              </a>
            </div>

            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-8">
              {/* Creator Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("INFLUENCER")}
                className={`cursor-pointer relative p-8 rounded-3xl border transition-all duration-300 glass-card-dark ${
                  selectedRole === "INFLUENCER"
                    ? "border-[#0064FF] bg-[#0064FF]/10 glow-blue"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {selectedRole === "INFLUENCER" && (
                  <CheckCircle2 className="absolute top-6 right-6 text-[#0064FF] w-6 h-6" />
                )}
                <div className="p-3.5 bg-[#0064FF]/20 border border-[#0064FF]/30 w-fit rounded-2xl text-[#0064FF] mb-6">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold font-outfit text-white mb-2">Креатор / Инфлюенсер</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Получайте прямые коммерческие предложения от брендов, верифицируйте статистику и проводите сделки с гарантией оплаты через Escrow.
                </p>
                <span className="text-[#0064FF] font-bold text-xs flex items-center gap-2">
                  Продолжить как Блогер <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

              {/* Brand Card */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setSelectedRole("BRAND")}
                className={`cursor-pointer relative p-8 rounded-3xl border transition-all duration-300 glass-card-dark ${
                  selectedRole === "BRAND"
                    ? "border-[#0064FF] bg-[#0064FF]/10 glow-blue"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {selectedRole === "BRAND" && (
                  <CheckCircle2 className="absolute top-6 right-6 text-[#0064FF] w-6 h-6" />
                )}
                <div className="p-3.5 bg-[#0064FF]/20 border border-[#0064FF]/30 w-fit rounded-2xl text-[#0064FF] mb-6">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-extrabold font-outfit text-white mb-2">Бизнес / Бренд</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  Находите идеальных локальных инфлюенсеров за 30 секунд с помощью AI, запускайте кампании и защищайте рекламный бюджет.
                </p>
                <span className="text-[#0064FF] font-bold text-xs flex items-center gap-2">
                  Продолжить как Бренд <ArrowRight className="w-4 h-4" />
                </span>
              </motion.div>
            </div>

            {/* Proceed Button */}
            <motion.button
              disabled={!selectedRole}
              onClick={() => selectedRole && setStep("FORM")}
              className={`px-8 py-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center gap-2 mx-auto ${
                selectedRole
                  ? "bg-[#0064FF] hover:bg-blue-600 text-white glow-blue cursor-pointer"
                  : "bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              Перейти к заполнению профиля <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : step === "FORM" ? (
          <motion.div
            key="registration-form"
            className="max-w-xl w-full glass-card-dark border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <button
                onClick={() => setStep("SELECT_ROLE")}
                className="text-xs text-[#0064FF] font-bold hover:underline mb-2 inline-block"
              >
                ← Назад к выбору роли
              </button>
              <h2 className="text-2xl font-extrabold font-outfit text-white">
                {selectedRole === "INFLUENCER" ? "Регистрация Инфлюенсера" : "Регистрация Бизнеса / Бренда"}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Заполните данные для создания профиля на платформе Jeli.
              </p>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Полное Имя / Название
                </label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Аскар Смагулов"
                  className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Рабочий Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="askar@company.kz"
                  className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Пароль (минимум 8 символов)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                />
              </div>

              {/* Influencer Specific Fields */}
              {selectedRole === "INFLUENCER" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      TikTok Хэндл (@username)
                    </label>
                    <input
                      type="text"
                      required
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="@tech_kazakhstan"
                      className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Основная категория контента
                    </label>
                    <select
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="IT" className="bg-[#07090E] text-white">IT & Технологии</option>
                      <option value="Фитнес" className="bg-[#07090E] text-white">Фитнес & ЗОЖ</option>
                      <option value="Бизнес" className="bg-[#07090E] text-white">Бизнес & Финансы</option>
                      <option value="Красота" className="bg-[#07090E] text-white">Красота & Бьюти</option>
                      <option value="Развлечения" className="bg-[#07090E] text-white">Развлечения & Юмор</option>
                    </select>
                  </div>
                </>
              )}

              {/* Brand Specific Fields */}
              {selectedRole === "BRAND" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Название компании
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="KazTech Solutions"
                      className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Сайт компании
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.kz"
                      className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Месячный бюджет
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                    >
                      <option value="до 250,000 ₸" className="bg-[#07090E] text-white">до 250,000 ₸ / мес</option>
                      <option value="250,000 ₸ – 1,000,000 ₸" className="bg-[#07090E] text-white">250,000 ₸ – 1,000,000 ₸ / мес</option>
                      <option value="более 1,000,000 ₸" className="bg-[#07090E] text-white">более 1,000,000 ₸ / мес</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 rounded-2xl font-bold bg-[#0064FF] hover:bg-blue-600 text-white glow-blue transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {loading ? "Создание аккаунта..." : "Зарегистрироваться в Jeli"}
              </button>
            </form>
          </motion.div>
        ) : (
          /* LINK_TIKTOK Step */
          <motion.div
            key="link-tiktok"
            className="max-w-md w-full glass-card-dark border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center relative z-10 space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold font-outfit text-white">Подключение TikTok</h2>
              <p className="text-xs text-slate-400">
                Привяжите аккаунт, чтобы подтвердить подписчиков и получить значок ✅
              </p>
            </div>

            <button
              onClick={handleTikTokLink}
              className="w-full py-3.5 rounded-2xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
              </svg>
              Привязать TikTok OAuth
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
