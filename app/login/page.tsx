"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, LogIn, Sparkles, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
        // Save user info in localStorage for client state persistence
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

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0064FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header logo */}
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] tracking-tight text-slate-900 dark:text-white">
          Jeli.
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#0064FF] text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Авторизация в системе
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Вход в кабинет
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Введите ваши данные для доступа к платформе Jeli
          </p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Email адрес
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.kz"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF] focus:ring-2 focus:ring-[#0064FF]/20 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Пароль
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#0064FF] focus:ring-2 focus:ring-[#0064FF]/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl font-bold bg-[#0064FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-base transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Проверка данных...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Войти в кабинет
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ещё нет аккаунта?{" "}
            <Link href="/onboarding" className="text-[#0064FF] font-bold hover:underline">
              Зарегистрироваться →
            </Link>
          </p>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
              ← На главную страницу
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Security badge footer */}
      <div className="mt-8 text-center text-xs text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        Безопасное соединение через SSL & Supabase Auth
      </div>

    </div>
  );
}
