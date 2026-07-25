"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Briefcase, Sparkles, TrendingUp, BarChart3, CheckCircle2, MessageSquare, Send, ShieldCheck, DollarSign, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"CAMPAIGNS" | "ANALYTICS" | "AI_ASSISTANT">("CAMPAIGNS");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInfluencers: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    totalDeals: 0,
    escrowLockedAmount: 0
  });
  const [deals, setDeals] = useState<any[]>([]);

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Привет! Я твой AI Менеджер Jeli (Gemini AI). Чем могу помочь? Могу сгенерировать рекламное предложение, рассчитать бюджет или подобрать локальных инфлюенсеров." }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/v1/dashboard");
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.recentDeals) {
        setDeals(data.recentDeals);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || aiLoading) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInputMsg("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: data.reply || `Анализирую данные по запросу: "${userText}".`
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "Произошла ошибка при обращении к AI Менеджеру. Попробуйте еще раз."
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-[#F7F8FC]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] text-slate-900 dark:text-white">
              Jeli.
            </Link>
            <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[#0064FF] rounded-full font-semibold">
              Рабочий Дашборд
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab("CAMPAIGNS")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'CAMPAIGNS' ? 'bg-[#0064FF] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Сделки & Кампании
            </button>
            <button 
              onClick={() => setActiveTab("ANALYTICS")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'ANALYTICS' ? 'bg-[#0064FF] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Аналитика
            </button>
            <button 
              onClick={() => setActiveTab("AI_ASSISTANT")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'AI_ASSISTANT' ? 'bg-[#0064FF] text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              AI Менеджер
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        
        {activeTab === "CAMPAIGNS" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Активные Кампании и Escrow Сделки</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Все сделки защищены модулем Jeli Escrow Guarantee.</p>
              </div>
              <Link 
                href="/#ai-matcher"
                className="px-6 py-2.5 rounded-full bg-[#0064FF] hover:bg-blue-600 font-bold text-sm text-white transition"
              >
                + Запустить Кампанию
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Зарегистрировано Инфлюенсеров</span>
                <p className="text-3xl font-extrabold mt-1 text-slate-900 dark:text-white">{stats.totalInfluencers}</p>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Заблокировано в Escrow</span>
                <p className="text-3xl font-extrabold mt-1 text-emerald-500">{stats.escrowLockedAmount.toLocaleString()} ₸</p>
              </div>
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Всего Активных Сделок</span>
                <p className="text-3xl font-extrabold mt-1 text-[#0064FF]">{stats.totalDeals}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Текущие интеграции</h3>
              
              {deals.length > 0 ? (
                <div className="space-y-3">
                  {deals.map((d: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <h4 className="font-bold text-sm">{d.campaign?.title || 'Интеграция'}</h4>
                        <span className="text-xs text-slate-500">Депозит: {d.agreedPayout || '150,000'} ₸</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold">
                        Escrow Активен ✅
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <AlertCircle className="w-8 h-8 text-[#0064FF] mx-auto mb-2" />
                  <h4 className="font-bold text-sm mb-1">Пока нет активных сделок</h4>
                  <p className="text-xs text-slate-500 mb-4">Все показатели начинаются с нуля. Выберите инфлюенсера в каталоге, чтобы оформить первую сделку.</p>
                  <Link href="/#ai-matcher" className="inline-block px-5 py-2 rounded-full bg-[#0064FF] text-white text-xs font-bold hover:bg-blue-600">
                    Найти Инфлюенсера
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "ANALYTICS" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Аналитика Охватов & Конверсий</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold mb-2">Охваты интеграций по зарегистрированным блогерам</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  {stats.totalInfluencers > 0 ? "[ График суммарных просмотров по базе ]" : "[ Нет данных: 0 зарегистрированных блогеров ]"}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold mb-2">Прогнозный ROI и конверсии</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  [ Расчет ROI для локального рынка Казахстана ]
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "AI_ASSISTANT" && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 h-[75vh] flex flex-col shadow-xl">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-lg">AI Менеджер Jeli (Gemini AI)</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                    m.role === 'user' 
                      ? 'ml-auto bg-[#0064FF] text-white' 
                      : 'bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {aiLoading && (
                <div className="p-4 rounded-2xl text-sm max-w-[85%] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 italic">
                  ✨ Gemini AI печатает ответ...
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Спросить AI Менеджера Jeli..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
              />
              <button 
                type="submit"
                disabled={aiLoading}
                className="px-5 rounded-xl bg-[#0064FF] hover:bg-blue-600 font-bold text-white flex items-center justify-center transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
