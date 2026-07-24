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
    influencerName: "Tech KZ (@tech_kazakhstan)",
    brandName: "Acme Corp (Brand)",
    niche: "IT & Технологии",
    escrowAmount: "250,000 ₸",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80"
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg_1",
      senderRole: "BRAND",
      senderName: "Acme Corp (Brand)",
      text: "Привет! Мы нашли ваш профиль через AI-мэтчинг Jeli и хотим предложить вам рекламную интеграцию нашего SaaS стартапа.",
      timestamp: "10:14 AM"
    },
    {
      id: "msg_2",
      senderRole: "INFLUENCER",
      senderName: "@tech_kazakhstan",
      text: "Здравствуйте! Отличная тема. Просмотрел параметры вашего бренда в системе. Готов провести посвященный интеграции интеграционный ролик.",
      timestamp: "10:16 AM"
    },
    {
      id: "msg_3",
      senderRole: "BRAND",
      senderName: "Acme Corp (Brand)",
      text: "Отлично! Я уже заблокировал контракт 250,000 ₸ в безопасном модуле Jeli Escrow. Ждём ваш сценарий!",
      timestamp: "10:18 AM"
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
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-800 transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="text-2xl font-extrabold italic font-['Outfit'] text-white">
            Jeli.
          </Link>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            Escrow Protected Chat
          </span>
        </div>

        {/* Role Switcher toggle for testing both perspectives */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-full text-xs">
          <button 
            onClick={() => setCurrentUserRole("BRAND")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'BRAND' ? 'bg-[#0064FF] text-white' : 'text-slate-400'}`}
          >
            Бизнес (Brand)
          </button>
          <button 
            onClick={() => setCurrentUserRole("INFLUENCER")}
            className={`px-3 py-1.5 rounded-full font-bold transition ${currentUserRole === 'INFLUENCER' ? 'bg-[#0064FF] text-white' : 'text-slate-400'}`}
          >
            Инфлюенсер
          </button>
        </div>
      </header>

      {/* Main Chat Interface Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-4 gap-0 overflow-hidden">
        
        {/* Sidebar Channels List */}
        <div className="border-r border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Активные Диалоги & Сделки</h3>
          
          <div 
            onClick={() => setActiveChannel({
              dealId: "deal_1",
              influencerName: "Tech KZ (@tech_kazakhstan)",
              brandName: "Acme Corp (Brand)",
              niche: "IT & Технологии",
              escrowAmount: "250,000 ₸",
              avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80"
            })}
            className="p-3 rounded-2xl bg-blue-500/10 border border-[#0064FF]/40 cursor-pointer flex items-center gap-3"
          >
            <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">Tech KZ (@tech_kazakhstan)</h4>
              <span className="text-xs text-emerald-400 font-semibold">Escrow: 250,000 ₸</span>
            </div>
          </div>

          <div 
            onClick={() => setActiveChannel({
              dealId: "deal_2",
              influencerName: "The Rock (@therock)",
              brandName: "Acme Corp (Brand)",
              niche: "Фитнес & ЗОЖ",
              escrowAmount: "500,000 ₸",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
            })}
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center gap-3"
          >
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold text-sm truncate">The Rock (@therock)</h4>
              <span className="text-xs text-slate-400">В процессе согласования</span>
            </div>
          </div>
        </div>

        {/* Chat Conversation View */}
        <div className="col-span-3 flex flex-col bg-slate-950 h-[calc(100vh-65px)]">
          
          {/* Active Channel Header */}
          <div className="border-b border-slate-800 p-4 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={activeChannel.avatar} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-base">{activeChannel.influencerName}</h3>
                <span className="text-xs text-slate-400">Ниша: {activeChannel.niche}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Escrow Защита: {activeChannel.escrowAmount}
              </div>
              <button 
                onClick={() => alert(`🚀 Гарантийный платеж Escrow ${activeChannel.escrowAmount} пополнен и заблокирован до выгрузки роликов!`)}
                className="px-4 py-2 rounded-full bg-[#0064FF] hover:bg-blue-600 font-bold text-xs"
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
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center gap-3">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Написать сообщение как ${currentUserRole === 'BRAND' ? 'Бизнес' : 'Инфлюенсер'}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0064FF]"
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
