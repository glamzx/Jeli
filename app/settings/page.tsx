"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Lock, Shield, Eye, EyeOff, Save, Trash2,
  ExternalLink, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, Sparkles, ArrowLeft, LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tab = "profile" | "security" | "connections" | "danger";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  followerCount: number;
  engagementRate: number;
  linked: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // User state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [budget, setBudget] = useState("");

  // Security fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Danger zone
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("jeli_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (!parsed.id) {
        router.push("/login");
        return;
      }
      fetchSettings(parsed.id);
    } catch {
      router.push("/login");
    }

    // TikTok OAuth callback notification
    const params = new URLSearchParams(window.location.search);
    const tiktokParam = params.get("tiktok");
    if (tiktokParam === "linked") {
      const username = params.get("username") || "";
      const followers = params.get("followers") || "0";
      setMessage({
        type: "success",
        text: `TikTok @${username} успешно привязан! Подписчики: ${Number(followers).toLocaleString()}`
      });
      setActiveTab("connections");
      window.history.replaceState({}, "", "/settings");
    } else if (tiktokParam === "error") {
      setMessage({
        type: "error",
        text: `Не удалось привязать TikTok: ${params.get("reason") || "unknown"}`
      });
      window.history.replaceState({}, "", "/settings");
    }
  }, [router]);

  const fetchSettings = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/settings?userId=${userId}`);
      const data = await res.json();

      if (data.success) {
        setUserData(data.user);
        setProfile(data.profile);
        setSocialAccounts(data.socialAccounts || []);

        setFullName(data.user.fullName || "");
        setEmail(data.user.email || "");

        if (data.user.role === "INFLUENCER" && data.profile) {
          setBio(data.profile.bio || "");
          setNiche(Array.isArray(data.profile.niches) ? data.profile.niches[0] || "" : "");
        } else if (data.user.role === "BRAND" && data.profile) {
          setCompanyName(data.profile.companyName || "");
          setWebsiteUrl(data.profile.websiteUrl || "");
          setIndustry(data.profile.industry || "");
          setBudget(data.profile.monthlyBudget || "");
        }
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userData) return;
    setSaving(true);
    setMessage(null);

    try {
      const payload: any = { userId: userData.id, fullName, email };

      if (userData.role === "INFLUENCER") {
        payload.bio = bio;
        payload.niches = niche ? [niche] : [];
      } else {
        payload.companyName = companyName;
        payload.websiteUrl = websiteUrl;
        payload.industry = industry;
        payload.budget = budget;
      }

      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Профиль успешно обновлён" });
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem("jeli_user") || "{}");
        stored.fullName = fullName;
        stored.email = email;
        localStorage.setItem("jeli_user", JSON.stringify(stored));
      } else {
        setMessage({ type: "error", text: data.message || "Ошибка при сохранении" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userData) return;
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Пароли не совпадают" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Пароль должен быть минимум 8 символов" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Пароль успешно изменён" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.message || "Ошибка при смене пароля" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    } finally {
      setSaving(false);
    }
  };

  const handleTikTokLink = () => {
    if (userData) {
      window.location.href = `/api/v1/auth/tiktok?userId=${userData.id}&returnTo=settings`;
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData || !deletePassword) return;
    setSaving(true);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData.id, password: deletePassword })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("jeli_user");
        router.push("/");
      } else {
        setMessage({ type: "error", text: data.message || "Ошибка при удалении" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jeli_user");
    router.push("/login");
  };

  const tiktokAccount = socialAccounts.find(s => s.platform === "TIKTOK");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin" />
          Загрузка настроек...
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as Tab, label: "Профиль", icon: User },
    { id: "security" as Tab, label: "Безопасность", icon: Lock },
    { id: "connections" as Tab, label: "Подключения", icon: ExternalLink },
    { id: "danger" as Tab, label: "Удаление", icon: Trash2 }
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F8FC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] text-slate-900 dark:text-white">
              Jeli.
            </Link>
            <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[#0064FF] rounded-full font-semibold">
              Настройки
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition font-medium">
              Дашборд
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Notification banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-2 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto text-xs opacity-60 hover:opacity-100">✕</button>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-1">
              {/* Avatar & Name */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#0064FF] to-blue-700 flex items-center justify-center text-white text-2xl font-bold mb-2">
                  {(userData?.fullName || "U").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-sm">{userData?.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userData?.email}</p>
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-semibold ${
                  userData?.role === "INFLUENCER"
                    ? "bg-blue-500/10 text-[#0064FF]"
                    : "bg-purple-500/10 text-purple-500"
                }`}>
                  {userData?.role === "INFLUENCER" ? "Инфлюенсер" : "Бренд"}
                </span>
              </div>

              {/* Tabs */}
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-[#0064FF] text-white"
                      : tab.id === "danger"
                        ? "text-red-500 hover:bg-red-500/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8"
            >
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Профиль</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Редактируйте информацию вашего аккаунта</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Полное имя</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    {/* Role-specific fields */}
                    {userData?.role === "INFLUENCER" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Био / Описание</label>
                          <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF] resize-none"
                          />
                          <p className="text-xs text-slate-400 mt-1">{bio.length}/500 символов</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Категория контента</label>
                          <select
                            value={niche}
                            onChange={e => setNiche(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
                          >
                            <option value="IT">IT & Технологии</option>
                            <option value="Фитнес">Фитнес & ЗОЖ</option>
                            <option value="Бизнес">Бизнес & Финансы</option>
                            <option value="Красота">Красота & Бьюти</option>
                            <option value="Развлечения">Развлечения & Юмор</option>
                            <option value="Еда">Еда & Кулинария</option>
                            <option value="Путешествия">Путешествия</option>
                            <option value="Образование">Образование</option>
                          </select>
                        </div>
                      </>
                    )}

                    {userData?.role === "BRAND" && (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Название компании</label>
                          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Сайт</label>
                          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Индустрия</label>
                          <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Месячный бюджет</label>
                          <select value={budget} onChange={e => setBudget(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]">
                            <option value="до 250,000 ₸">до 250,000 ₸</option>
                            <option value="250,000 ₸ – 1,000,000 ₸">250,000 ₸ – 1,000,000 ₸</option>
                            <option value="более 1,000,000 ₸">более 1,000,000 ₸</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-sm transition disabled:opacity-50"
                  >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Сохранение..." : "Сохранить изменения"}
                  </button>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Безопасность</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Измените пароль вашего аккаунта</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Текущий пароль</label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#0064FF]"
                        />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Новый пароль</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#0064FF]"
                        />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Подтвердите новый пароль</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
                      />
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Shield className="w-4 h-4" />
                    {saving ? "Обновление..." : "Обновить пароль"}
                  </button>
                </div>
              )}

              {/* CONNECTIONS TAB */}
              {activeTab === "connections" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Подключённые аккаунты</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {userData?.role === "INFLUENCER"
                        ? "Привяжите ваши социальные сети для верификации и получения статистики"
                        : "Интеграции с внешними сервисами"}
                    </p>
                  </div>

                  {/* TikTok Card */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-base">TikTok</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {tiktokAccount?.linked ? `Привязан: ${tiktokAccount.handle}` : "Аккаунт не привязан"}
                          </p>
                        </div>
                      </div>

                      {tiktokAccount?.linked ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Верифицирован
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Не привязан
                        </span>
                      )}
                    </div>

                    {tiktokAccount?.linked ? (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Подписчики</p>
                          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{tiktokAccount.followerCount.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Вовлечённость</p>
                          <p className="text-xl font-extrabold text-[#0064FF]">{tiktokAccount.engagementRate}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                          Верификация вашего аккаунта
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                          Автоматическая загрузка статистики
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ShieldCheck className="w-4 h-4 text-[#0064FF] flex-shrink-0" />
                          Значок ✅ в каталоге инфлюенсеров
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleTikTokLink}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                        tiktokAccount?.linked
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"
                          : "bg-black hover:bg-gray-800 text-white"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                      </svg>
                      {tiktokAccount?.linked ? "Переподключить TikTok" : "Привязать TikTok аккаунт"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === "danger" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-red-500 mb-1">Зона удаления</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Удаление аккаунта необратимо. Все данные будут стёрты.</p>
                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-red-600 dark:text-red-400">Удалить аккаунт навсегда</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Все ваши данные, профиль, подключения и история будут безвозвратно удалены.
                        </p>
                      </div>
                    </div>

                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold text-sm transition"
                      >
                        Удалить мой аккаунт
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Введите пароль для подтверждения:</p>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Ваш пароль"
                          className="w-full bg-white dark:bg-slate-900 border border-red-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword || saving}
                            className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition disabled:opacity-50"
                          >
                            {saving ? "Удаление..." : "Подтвердить удаление"}
                          </button>
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); }}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
