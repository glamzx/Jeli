"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, LogIn, Sparkles, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user) {
          localStorage.setItem("jeli_user", JSON.stringify(data.user));
        }
        router.push("/dashboard");
      } else {
        setErrorMessage(data.message || "Неверный email или пароль");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Ошибка подключения к серверу. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  const handleTikTokLogin = () => {
    window.location.href = "/api/v1/auth/tiktok?mode=login&returnTo=dashboard";
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#0064FF] selection:text-white">
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

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full glass-card-dark border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0064FF]/10 border border-[#0064FF]/20 text-[#0064FF] text-[10px] font-bold font-pixel uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AUTH PORTAL
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">
            Вход в кабинет
          </h1>
          <p className="text-slate-400 text-xs">
            Введите ваши данные для доступа к платформе Jeli
          </p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email адрес
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.kz"
                className="w-full bg-[#07090E] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#07090E] border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl font-bold bg-[#0064FF] hover:bg-blue-600 text-white glow-blue transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Проверка данных...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Войти в рабочий кабинет
              </>
            )}
          </button>
        </form>

        {/* TikTok OAuth Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleTikTokLogin}
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
            </svg>
            Войти через TikTok OAuth
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Ещё нет аккаунта?{" "}
            <Link href="/register" className="text-[#0064FF] font-bold hover:underline">
              Зарегистрироваться →
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Security Footer */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        Защищённое подключение SSL & Supabase Auth
      </div>
    </div>
  );
}
