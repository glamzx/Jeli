"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Briefcase, Sparkles, TrendingUp, BarChart3, CheckCircle2, MessageSquare, Send, ShieldCheck, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"CAMPAIGNS" | "ANALYTICS" | "AI_ASSISTANT">("CAMPAIGNS");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Привет! Я твой AI Менеджер Jeli. Чем могу помочь сегодня? Могу сгенерировать медиакит, рассчитать стоимость интеграции или проанализировать результаты кампаний." }
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInputMsg("");

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `Анализирую данные по запросу: "${userText}". Сгенерировал предложение по интеграции для блогеров в нише IT & Технологии. Потенциальный охват: 450,000 просмотров, прогнозный ROI: 3.4x.`
        }
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-3xl font-extrabold italic font-['Outfit'] text-white">
              Jeli.
            </Link>
            <span className="text-xs px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-[#0064FF] rounded-full font-semibold">
              Dashboard Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab("CAMPAIGNS")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'CAMPAIGNS' ? 'bg-[#0064FF] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Сделки & Кампании
            </button>
            <button 
              onClick={() => setActiveTab("ANALYTICS")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'ANALYTICS' ? 'bg-[#0064FF] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Аналитика
            </button>
            <button 
              onClick={() => setActiveTab("AI_ASSISTANT")}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition ${activeTab === 'AI_ASSISTANT' ? 'bg-[#0064FF] text-white' : 'text-slate-400 hover:text-white'}`}
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
                <p className="text-sm text-slate-400">Все сделки защищены модулем Jeli Escrow Guarantee.</p>
              </div>
              <button 
                onClick={() => alert("Создание новой кампании")}
                className="px-6 py-2.5 rounded-full bg-[#0064FF] hover:bg-blue-600 font-bold text-sm"
              >
                + Новая Кампания
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Всего Сделок</span>
                <p className="text-3xl font-extrabold mt-1">12</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Заблокировано в Escrow</span>
                <p className="text-3xl font-extrabold mt-1 text-emerald-400">1,450,000 ₸</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400">Выполнено интеграций</span>
                <p className="text-3xl font-extrabold mt-1 text-[#0064FF]">8</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Текущие интеграции</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm">SaaS Автоматизация x @tech_kazakhstan</h4>
                    <span className="text-xs text-slate-500">Формат: Видео-обзор (60 сек) • Депозит: 250,000 ₸</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold">
                    Escrow Активен ✅
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm">Продукт Jeli x @therock</h4>
                    <span className="text-xs text-slate-500">Формат: Брендовая интеграция • Депозит: 500,000 ₸</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold">
                    Согласование сценария ⚡
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ANALYTICS" && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Аналитика Охватов & Конверсий</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold mb-2">Охваты интеграций по нишам</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  [ График суммарных просмотров: 2.4M просмотров за последний месяц ]
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold mb-2">Эффективность по блогерам</h3>
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                  [ График ROI и конверсий из TikTok/Instagram ]
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "AI_ASSISTANT" && (
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[75vh] flex flex-col">
            <div className="border-b border-slate-800 pb-4 mb-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#0064FF]" />
              <h2 className="font-bold text-lg">AI Менеджер Jeli (GPT-4o Agent)</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                    m.role === 'user' 
                      ? 'ml-auto bg-[#0064FF] text-white' 
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Спросить AI Менеджера Jeli..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
              />
              <button 
                type="submit"
                className="px-5 rounded-xl bg-[#0064FF] hover:bg-blue-600 font-bold text-white flex items-center justify-center"
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
