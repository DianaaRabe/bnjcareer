"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Video,
  Play,
  Download,
  Search,
  BrainCircuit,
  Send,
  Sparkles,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  BookOpen,
  MessageCircle,
  X,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: "pdf" | "video" | "replay" | "article" | "doc";
  category: string;
  file_url: string | null;
  size_label: string | null;
  duration_label: string | null;
  is_locked: boolean;
  price: number;
  views_count: number;
}

const CATEGORIES = ["Tous", "Candidature", "Entretien", "Réseau", "Organisation", "Coaching", "Outils"];

function TypeIcon({ type }: { type: string }) {
  if (type === "video" || type === "replay") return <Video className="w-5 h-5" />;
  if (type === "article") return <Globe className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

function typeColor(type: string) {
  switch (type) {
    case "pdf":     return "bg-red-50 text-red-600";
    case "video":   return "bg-blue-50 text-blue-600";
    case "replay":  return "bg-purple-50 text-purple-600";
    case "article": return "bg-brand-50 text-brand-primary";
    default:        return "bg-indigo-50 text-indigo-600";
  }
}

function typeLabel(type: string) {
  switch (type) {
    case "pdf":     return "PDF";
    case "video":   return "Vidéo";
    case "replay":  return "Replay";
    case "article": return "Article";
    default:        return "Doc";
  }
}

interface Message { id: number; me: boolean; text: string }

export default function RessourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("Tous");
  const [lockedModal, setLockedModal] = useState<Resource | null>(null);

  // Chat
  const [chatInput, setChatInput]       = useState("");
  const [isTyping, setIsTyping]         = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 1, me: false, text: "Bonjour ! Je suis votre assistant IA BNJ Skills Maker. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "Tous") params.set("category", category);
        if (search) params.set("search", search);
        const res = await fetch(`/api/resources?${params}`);
        if (res.ok) {
          const { resources: data } = await res.json();
          setResources(data ?? []);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search, category]);

  const trackAndOpen = async (res: Resource) => {
    if (res.is_locked) {
      setLockedModal(res);
      return;
    }
    if (!res.file_url) return;
    await fetch(`/api/resources/${res.id}`, { method: "POST" }).catch(() => {});
    window.open(res.file_url, "_blank", "noopener,noreferrer");
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput;
    const userMsg: Message = { id: Date.now(), me: true, text: userText };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    const botMsgId = Date.now() + 1;
    setChatMessages((prev) => [...prev, { id: botMsgId, me: false, text: "..." }]);

    try {
      const msgsData = chatMessages
        .filter((m) => m.id !== 1 && m.text !== "...")
        .map((m) => ({ role: m.me ? "user" : "assistant", content: m.text }));
      msgsData.push({ role: "user", content: userText });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgsData }),
      });
      if (!res.ok) throw new Error("API Error");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const delta = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content || "";
                accumulated += delta;
                setChatMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulated } : m))
                );
              } catch {}
            }
          }
        }
      }
    } catch {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, text: "Oups ! Une erreur s'est produite. Veuillez réessayer." } : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ressources & IA</h1>
        <p className="text-slate-500 text-sm mt-1">Bibliothèque de contenus et assistant IA personnalisé</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Library — 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une ressource..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                    category === cat
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/30"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-brand-light hover:text-brand-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 gap-3">
              <BookOpen className="w-12 h-12 text-slate-200" />
              <p className="text-slate-400 font-bold text-sm">Aucune ressource disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all group flex flex-col gap-3 ${
                    res.is_locked
                      ? "border-amber-100 hover:shadow-md hover:border-amber-200"
                      : "border-slate-100 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(res.type)} ${res.is_locked ? "opacity-60" : ""}`}>
                      <TypeIcon type={res.type} />
                    </div>
                    <div className="flex items-center gap-2">
                      {res.is_locked && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black border border-amber-100">
                          <Lock className="w-3 h-3" />
                          {res.price > 0 ? `${res.price}€` : "Premium"}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${typeColor(res.type)}`}>
                        {typeLabel(res.type)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className={`text-sm font-bold leading-tight transition-colors ${
                      res.is_locked ? "text-slate-600" : "text-slate-900 group-hover:text-brand-primary"
                    }`}>
                      {res.title}
                    </p>
                    {res.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{res.category}</span>
                      {res.size_label && <span className="text-xs text-slate-400">{res.size_label}</span>}
                      {res.duration_label && <span className="text-xs text-slate-400">{res.duration_label}</span>}
                    </div>
                  </div>

                  {res.is_locked ? (
                    <button
                      onClick={() => setLockedModal(res)}
                      className="flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {res.price > 0 ? `Débloquer — ${res.price}€` : "Accès Premium"}
                    </button>
                  ) : res.file_url ? (
                    <button
                      onClick={() => trackAndOpen(res)}
                      className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      {res.type === "pdf" || res.type === "doc" ? (
                        <><Download className="w-3.5 h-3.5" /> Télécharger</>
                      ) : res.type === "article" ? (
                        <><ExternalLink className="w-3.5 h-3.5" /> Lire l'article</>
                      ) : (
                        <><Play className="w-3.5 h-3.5" /> Regarder</>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium">Bientôt disponible</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chatbot IA — 1/3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px]">
          <div className="bg-gradient-to-r from-brand-dark to-brand-primary p-4 rounded-t-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Assistant IA BNJ</p>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-accent" />
                <p className="text-xs text-white/70">Powered by AI</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
                {!msg.me && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <BrainCircuit className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                )}
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.me
                    ? "bg-brand-primary text-white rounded-tr-sm"
                    : "bg-slate-50 text-slate-800 rounded-tl-sm border border-slate-100"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-slate-100">
            <div className="flex gap-2 mb-2 flex-wrap">
              {["Conseils CV", "Préparer entretien", "Négocier salaire"].map((q) => (
                <button key={q} onClick={() => setChatInput(q)}
                  className="text-xs bg-brand-100 text-brand-primary px-2.5 py-1 rounded-full font-medium hover:bg-brand-200 transition-colors">
                  {q}
                </button>
              ))}
            </div>
            <form onSubmit={sendChat} className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Posez votre question..."
                className="flex-1 px-3 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all disabled:opacity-50"
                disabled={isTyping}
              />
              <button type="submit" disabled={!chatInput.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-brand-dark transition-all hover:scale-105">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Locked Resource Modal ── */}
      {lockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-8 flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-white">Ressource Premium</h2>
              <p className="text-white/80 text-sm">{lockedModal.title}</p>
            </div>

            <div className="p-8 space-y-5">
              <div className="text-center space-y-2">
                {lockedModal.price > 0 ? (
                  <>
                    <p className="text-3xl font-black text-slate-900">{lockedModal.price}€</p>
                    <p className="text-sm text-slate-500">Accès unique à cette ressource</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Cette ressource est réservée aux membres premium.</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Pour y accéder</p>
                <a
                  href="/dashboard/messages"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contacter mon coach
                </a>
              </div>

              <button
                onClick={() => setLockedModal(null)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
