"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Send, ShieldCheck, DollarSign, ArrowLeft, CheckCheck, Paperclip, Sparkles, User, Briefcase } from "lucide-react";

interface Message {
  id: string;
  senderRole: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export default function RealtimeChatPage() {
  const [activeChannel, setActiveChannel] = useState({
    dealId: "deal_1",
    influencerName: "Инфлюенсер в базе Jeli",
    brandName: "Зарегистрированный Бренд",
    niche: "IT & Технологии",
    escrowAmount: "150,000 ₸",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeli"
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      senderRole: "BRAND",
      senderName: "Бизнес / Бренд",
      text: "Здравствуйте! Мы нашли ваш зарегистрированный профиль в базе Jeli и хотим предложить интеграцию.",
      timestamp: "10:14"
    },
    {
      id: "msg_2",
      senderRole: "INFLUENCER",
      senderName: "Инфлюенсер Jeli",
      text: "Здравствуйте! Согласен обсудить условия. Готов заблокировать контракт в безопасном Escrow модуле.",
      timestamp: "10:16"
    }
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState<"BRAND" | "INFLUENCER">("BRAND");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const textToSend = inputMsg;
    const newMsg: Message = {
      id: "msg_" + Date.now(),
      senderRole: currentUserRole,
      senderName: currentUserRole === "BRAND" ? activeChannel.brandName : activeChannel.influencerName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg("");

    try {
      await fetch("/api/v1/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: activeChannel.dealId,
          senderRole: currentUserRole,
          senderName: newMsg.senderName,
          text: textToSend
        })
      });
    } catch (err) {
      console.error("Error persisting message:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="text-2xl font-extrabold italic font-['Outfit'] text-slate-900 dark:text-white">
            Jeli.
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
            Escrow Protected Chat
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-full text-xs">
          <button 
            onClick={() => setCurrentUserRole("BRAND")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'BRAND' ? 'bg-[#0064FF] text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Бизнес (Brand)
          </button>
          <button 
            onClick={() => setCurrentUserRole("INFLUENCER")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'INFLUENCER' ? 'bg-[#0064FF] text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Инфлюенсер
          </button>
        </div>
      </header>

      {/* Main Chat Interface Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 overflow-hidden">
        
        {/* Sidebar Channels List */}
        <div className="border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Активные Чат-Сделки</h3>
          
          <div 
            className="p-3 rounded-2xl bg-blue-500/10 border border-[#0064FF]/40 cursor-pointer flex items-center gap-3"
          >
            <img src={activeChannel.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">{activeChannel.influencerName}</h4>
              <span className="text-xs text-emerald-500 font-semibold">Escrow: {activeChannel.escrowAmount}</span>
            </div>
          </div>
        </div>

        {/* Chat Conversation View */}
        <div className="col-span-3 flex flex-col bg-slate-50 dark:bg-slate-950 h-[calc(100vh-65px)]">
          
          {/* Active Channel Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeChannel.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
              <div>
                <h3 className="font-bold text-base">{activeChannel.influencerName}</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">Ниша: {activeChannel.niche}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Escrow: {activeChannel.escrowAmount}
              </div>
              <button 
                onClick={() => alert(`🚀 Гарантийный платеж Escrow ${activeChannel.escrowAmount} заблокирован на безопасном счете до выполнения роликов!`)}
                className="px-4 py-2 rounded-full bg-[#0064FF] hover:bg-blue-600 font-bold text-xs text-white"
              >
                Пополнить Escrow
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isMe = m.senderRole === currentUserRole;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[11px] text-slate-500 mb-1 px-1">{m.senderName} • {m.timestamp}</span>
                  <div className={`p-4 rounded-2xl text-sm max-w-xl leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-[#0064FF] text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center gap-3">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Написать сообщение как ${currentUserRole === 'BRAND' ? 'Бизнес' : 'Инфлюенсер'}...`}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0064FF]"
            />
            <button 
              type="submit"
              className="p-3.5 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold transition flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
