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

interface TikTokVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  coverImageUrl: string;
  embedLink: string;
  shareUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
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
  const [tiktokConfig, setTiktokConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/tiktok/config")
      .then(r => r.json())
      .then(setTiktokConfig)
      .catch(() => {});
  }, []);

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
      const reason = params.get("reason") || "unknown";
      let text = `Не удалось привязать TikTok: ${reason}`;
      if (reason.toLowerCase().includes("client_key") || reason.toLowerCase().includes("client key")) {
        text = "TikTok: ошибка client_key. Добавьте ваш TikTok аккаунт в Target Users (Sandbox) в Developer Portal.";
      }
      setMessage({ type: "error", text });
      setActiveTab("connections");
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
  const tiktokVideoAnalysis = profile?.tiktokVideoAnalysis as {
    videos?: TikTokVideo[];
    analyzedAt?: string;
    primaryNiche?: string;
    topKeywords?: string[];
  } | null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-slate-400 text-xs">
        <div className="w-5 h-5 border-2 border-[#0064FF]/30 border-t-[#0064FF] rounded-full animate-spin mr-2" />
        Загрузка настроек...
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
    <div className="min-h-screen bg-[#05070A] text-slate-100 font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-[#0064FF]/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070A]/85 backdrop-blur-xl px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
              Jeli<span className="text-[#0064FF]">.</span>
            </Link>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30 font-pixel">
              SETTINGS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white transition">
              Дашборд
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-bold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 relative z-10">
        {/* Notification banner */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
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
            <div className="glass-card-dark border border-white/10 rounded-3xl p-4 space-y-1">
              {/* Avatar & Name */}
              <div className="text-center pb-4 border-b border-white/10 mb-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#0064FF]/20 border-2 border-[#0064FF] flex items-center justify-center text-white text-2xl font-bold mb-2">
                  {(userData?.fullName || "U").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-sm text-white">{userData?.fullName}</h3>
                <p className="text-xs text-slate-400">{userData?.email}</p>
                <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  userData?.role === "INFLUENCER"
                    ? "bg-[#0064FF]/20 text-[#0064FF] border border-[#0064FF]/30"
                    : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                }`}>
                  {userData?.role === "INFLUENCER" ? "Инфлюенсер" : "Бренд"}
                </span>
              </div>

              {/* Navigation Tabs */}
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-[#0064FF] text-white glow-blue"
                      : tab.id === "danger"
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="glass-card-dark border border-white/10 rounded-3xl p-6 md:p-8 space-y-6"
            >
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold font-outfit text-white mb-1">Профиль пользователя</h2>
                    <p className="text-xs text-slate-400">Редактируйте персональные данные вашего аккаунта</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Полное имя</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    {userData?.role === "INFLUENCER" && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Био / Описание</label>
                          <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={3}
                            maxLength={500}
                            className="w-full bg-[#07090E] border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-[#0064FF] resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Категория контента</label>
                          <select
                            value={niche}
                            onChange={e => setNiche(e.target.value)}
                            className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                          >
                            <option value="IT" className="bg-[#07090E] text-white">IT & Технологии</option>
                            <option value="Фитнес" className="bg-[#07090E] text-white">Фитнес & ЗОЖ</option>
                            <option value="Бизнес" className="bg-[#07090E] text-white">Бизнес & Финансы</option>
                            <option value="Красота" className="bg-[#07090E] text-white">Красота & Бьюти</option>
                          </select>
                        </div>
                      </>
                    )}

                    {userData?.role === "BRAND" && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Название компании</label>
                          <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                            className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Сайт</label>
                          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)}
                            className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]" />
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue disabled:opacity-50"
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
                    <h2 className="text-xl font-extrabold font-outfit text-white mb-1">Безопасность</h2>
                    <p className="text-xs text-slate-400">Измените пароль вашего аккаунта</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Текущий пароль</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Новый пароль</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Подтвердите пароль</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#0064FF]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue disabled:opacity-50"
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
                    <h2 className="text-xl font-extrabold font-outfit text-white mb-1">Подключённые аккаунты</h2>
                    <p className="text-xs text-slate-400">Верификация социальных сетей и получение статистики</p>
                  </div>

                  {/* TikTok OAuth Card */}
                  <div className="bg-[#07090E] border border-white/10 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-white">TikTok OAuth</h3>
                          <p className="text-xs text-slate-400">
                            {tiktokAccount?.linked ? `Привязан: ${tiktokAccount.handle}` : "Аккаунт не привязан"}
                          </p>
                        </div>
                      </div>

                      {tiktokAccount?.linked ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Верифицирован
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Не привязан
                        </span>
                      )}
                    </div>

                    {tiktokAccount?.linked && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[10px] text-slate-400">Подписчики</p>
                          <p className="text-xl font-extrabold text-white">{tiktokAccount.followerCount.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                          <p className="text-[10px] text-slate-400">Вовлечённость</p>
                          <p className="text-xl font-extrabold text-[#0064FF]">{tiktokAccount.engagementRate}%</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleTikTokLink}
                      className="w-full py-3 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold text-xs transition glow-blue flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88A2.89 2.89 0 0 1 9.5 12.4c.28 0 .55.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.16 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.75 1.52V7.43a4.85 4.85 0 0 1-1-.74z"/>
                      </svg>
                      {tiktokAccount?.linked ? "Переподключить TikTok OAuth" : "Привязать TikTok OAuth"}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* DANGER ZONE TAB */}
              {activeTab === "danger" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold font-outfit text-red-500 mb-1">Зона удаления</h2>
                    <p className="text-xs text-slate-400">Удаление аккаунта необратимо.</p>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-4">
                    <p className="text-xs text-red-300">
                      Все ваши данные, профиль и активные интеграции будут безвозвратно удалены.
                    </p>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/20 text-xs font-bold transition"
                      >
                        Удалить аккаунт
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={e => setDeletePassword(e.target.value)}
                          placeholder="Введите пароль для подтверждения"
                          className="w-full bg-[#07090E] border border-red-500/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword || saving}
                            className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold text-xs"
                          >
                            Подтвердить
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-5 py-2 rounded-xl bg-white/10 text-slate-400 text-xs font-bold"
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
