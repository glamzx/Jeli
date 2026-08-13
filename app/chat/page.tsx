"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Send, ShieldCheck, ArrowLeft, Lock, Sparkles, User, Briefcase, CheckCircle2 } from "lucide-react";

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
      text: "Здравствуйте! Мы нашли ваш верифицированный профиль в базе Jeli и хотим предложить видео-интеграцию.",
      timestamp: "10:14"
    },
    {
      id: "msg_2",
      senderRole: "INFLUENCER",
      senderName: "Инфлюенсер Jeli",
      text: "Здравствуйте! Отлично, готов обсудить ТЗ. Бюджет депонируется через Escrow?",
      timestamp: "10:16"
    },
    {
      id: "msg_3",
      senderRole: "BRAND",
      senderName: "Бизнес / Бренд",
      text: "Да, депозит 150,000 ₸ заблокирован в сейфе Jeli Escrow. Ждём согласования брифа!",
      timestamp: "10:18"
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
    <div className="min-h-screen bg-[#05070A] text-slate-100 flex flex-col font-sans selection:bg-[#0064FF] selection:text-white relative overflow-x-hidden">
      {/* Background Dark Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070A]/85 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="text-2xl font-extrabold italic tracking-tight font-outfit text-white">
            Jeli<span className="text-[#0064FF]">.</span>
          </Link>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-pixel">
            ESCROW CHAT
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 glass-pill p-1 rounded-full text-xs">
          <button 
            onClick={() => setCurrentUserRole("BRAND")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'BRAND' ? 'bg-[#0064FF] text-white glow-blue' : 'text-slate-400 hover:text-white'}`}
          >
            Бизнес (Brand)
          </button>
          <button 
            onClick={() => setCurrentUserRole("INFLUENCER")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'INFLUENCER' ? 'bg-[#0064FF] text-white glow-blue' : 'text-slate-400 hover:text-white'}`}
          >
            Инфлюенсер
          </button>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 overflow-hidden relative z-10">
        
        {/* Sidebar Channels List */}
        <div className="border-r border-white/10 glass-card-dark p-4 space-y-3 hidden md:block">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-pixel mb-2">Активные Сделки</h3>
          
          <div className="p-3.5 rounded-2xl bg-[#0064FF]/10 border border-[#0064FF]/30 cursor-pointer flex items-center gap-3">
            <img src={activeChannel.avatar} alt={activeChannel.influencerName} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-xs text-white truncate">{activeChannel.influencerName}</h4>
              <span className="text-[10px] text-emerald-400 font-semibold">Escrow: {activeChannel.escrowAmount}</span>
            </div>
          </div>
        </div>

        {/* Chat Stream View */}
        <div className="col-span-3 flex flex-col bg-[#07090E]/60 h-[calc(100vh-65px)]">
          
          {/* Active Channel Header */}
          <div className="border-b border-white/10 p-4 bg-[#07090E]/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeChannel.avatar} alt={activeChannel.influencerName} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
              <div>
                <h3 className="font-bold text-sm text-white">{activeChannel.influencerName}</h3>
                <span className="text-[11px] text-slate-400 font-semibold">Ниша: {activeChannel.niche}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Escrow: {activeChannel.escrowAmount}
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-none">
            {messages.map((m) => {
              const isMe = m.senderRole === currentUserRole;
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-slate-500 mb-1 px-1">{m.senderName} • {m.timestamp}</span>
                  <div className={`p-4 rounded-2xl text-xs max-w-md leading-relaxed ${
                    isMe 
                      ? 'bg-[#0064FF] text-white rounded-br-none glow-blue' 
                      : 'glass-card-dark border border-white/10 text-slate-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-[#07090E]/80 backdrop-blur-md flex items-center gap-3">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Написать сообщение как ${currentUserRole === 'BRAND' ? 'Бизнес' : 'Инфлюенсер'}...`}
              className="flex-1 bg-[#07090E] border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0064FF]"
            />
            <button 
              type="submit"
              className="p-3.5 rounded-2xl bg-[#0064FF] hover:bg-blue-600 text-white font-bold transition flex items-center justify-center cursor-pointer glow-blue"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
