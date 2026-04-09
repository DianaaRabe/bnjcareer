"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Search, Users, User, MoreVertical, Phone, Video, Smile } from "lucide-react";

const CONVERSATIONS = [
  {
    id: 1, type: "coach", name: "Sarah Martin", role: "Coach BNJ",
    avatar: "SM", color: "from-brand-primary to-brand-light",
    lastMessage: "N'oubliez pas de préparer des exemples concrets pour demain !",
    time: "14:32", unread: 2,
    messages: [
      { id: 1, me: false, text: "Bonjour Jean, comment se passe votre recherche d'emploi ?", time: "10:15" },
      { id: 2, me: true, text: "Bonjour Sarah, ça avance bien ! J'ai envoyé 3 candidatures cette semaine.", time: "10:18" },
      { id: 3, me: false, text: "Excellent ! Avez-vous pensé à personnaliser vos lettres de motivation ?", time: "10:20" },
      { id: 4, me: true, text: "Oui, j'utilise l'IA de la plateforme pour les adapter.", time: "10:22" },
      { id: 5, me: false, text: "Parfait ! On se retrouve vendredi pour l'atelier entretien.", time: "10:24" },
      { id: 6, me: false, text: "N'oubliez pas de préparer des exemples concrets pour demain !", time: "14:32" },
    ],
  },
  {
    id: 2, type: "community", name: "Communauté BNJ", role: "Chat général",
    avatar: "🏢", color: "from-blue-600 to-blue-800",
    lastMessage: "Claire: J'ai décroché un entretien chez Google ! 🎉",
    time: "11:05", unread: 5,
    messages: [
      { id: 1, me: false, sender: "Marc D.", text: "Bonjour la communauté ! Quelqu'un a des tips pour LinkedIn ?", time: "09:00" },
      { id: 2, me: false, sender: "Lucie P.", text: "Publiez régulièrement du contenu dans votre domaine, c'est clé.", time: "09:05" },
      { id: 3, me: true, text: "Merci pour le conseil Lucie ! Je vais tester ça.", time: "09:10" },
      { id: 4, me: false, sender: "Claire B.", text: "J'ai décroché un entretien chez Google ! 🎉", time: "11:05" },
      { id: 5, me: false, sender: "Marc D.", text: "Félicitations Claire, tu assures ! 🙌", time: "11:06" },
    ],
  },
  {
    id: 3, type: "coach", name: "Thomas Rivière", role: "Coach senior",
    avatar: "TR", color: "from-violet-600 to-purple-800",
    lastMessage: "Votre CV est maintenant très solide.",
    time: "Hier", unread: 0,
    messages: [
      { id: 1, me: false, text: "Bonjour Jean, j'ai regardé votre CV.", time: "Hier 16:00" },
      { id: 2, me: false, text: "Votre CV est maintenant très solide.", time: "Hier 16:01" },
      { id: 3, me: true, text: "Merci beaucoup Thomas !", time: "Hier 16:30" },
    ],
  },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = CONVERSATIONS.find((c) => c.id === activeId)!;

  useEffect(() => {
    setMessages(active.messages);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), me: true, text: input, time: "maintenant" }]);
    setInput("");
  };

  const filtered = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-0px)] lg:h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar conversations */}
        <div className="w-full sm:w-72 lg:w-80 bg-white border-r border-slate-100 flex flex-col shrink-0 hidden sm:flex">
          <div className="p-4 border-b border-slate-100">
            <h1 className="text-lg font-extrabold text-slate-900 mb-3">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveId(conv.id)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${
                  activeId === conv.id ? "bg-brand-100/50 border-l-4 border-l-brand-primary" : ""
                }`}
              >
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${conv.color} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
                  {conv.type === "community" ? <Users className="w-5 h-5" /> : conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 truncate">{conv.name}</p>
                    <span className="text-xs text-slate-400 shrink-0 ml-1">{conv.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat zone */}
        <div className="flex-1 flex flex-col bg-brand-bg min-w-0">
          {/* Chat header */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {active.type === "community" ? <Users className="w-4 h-4" /> : active.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900">{active.name}</p>
              <p className="text-xs text-green-500 font-medium">● En ligne</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.me ? "justify-end" : "justify-start"} animate-fade-in`}>
                {!msg.me && (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${active.color} flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0`}>
                    {active.type === "community" && msg.sender ? msg.sender.charAt(0) : active.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.me ? "" : ""}`}>
                  {active.type === "community" && !msg.me && msg.sender && (
                    <p className="text-xs text-slate-500 font-semibold mb-1 ml-1">{msg.sender}</p>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.me
                      ? "bg-brand-primary text-white rounded-tr-sm shadow-md shadow-brand-primary/20"
                      : "bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-xs text-slate-400 mt-1 ${msg.me ? "text-right" : "text-left ml-1"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="bg-white border-t border-slate-100 p-4 flex items-center gap-3">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/30 hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
