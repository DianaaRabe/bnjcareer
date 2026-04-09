"use client";

import React, { useState } from "react";
import { BookOpen, FileText, Video, Play, Download, Search, BrainCircuit, Send, MessageCircle, Sparkles, X } from "lucide-react";

const RESOURCES = [
  { id: 1, type: "pdf", title: "Guide complet de la recherche d'emploi", category: "Candidature", size: "2.4 Mo", date: "Mars 2025" },
  { id: 2, type: "pdf", title: "Les 50 questions d'entretien les plus posées", category: "Entretien", size: "1.1 Mo", date: "Fév. 2025" },
  { id: 3, type: "video", title: "Comment optimiser son profil LinkedIn", category: "Réseau", duration: "18 min", date: "Avr. 2025" },
  { id: 4, type: "pdf", title: "Modèles de lettres de motivation", category: "Candidature", size: "3.2 Mo", date: "Jan. 2025" },
  { id: 5, type: "replay", title: "Atelier : Négocier son salaire", category: "Entretien", duration: "1h 12min", date: "28 Mar. 2025" },
  { id: 6, type: "video", title: "Construire son personal branding", category: "Réseau", duration: "24 min", date: "Mars 2025" },
  { id: 7, type: "pdf", title: "Template de suivi des candidatures", category: "Organisation", size: "0.8 Mo", date: "Avr. 2025" },
  { id: 8, type: "replay", title: "Atelier : Préparer ses entretiens", category: "Entretien", duration: "58 min", date: "15 Mar. 2025" },
];

const CATEGORIES = ["Tous", "Candidature", "Entretien", "Réseau", "Organisation"];

const CHATBOT_REPLIES: Record<string, string> = {
  cv: "Pour un CV percutant, concentrez-vous sur 3 points clés : 1️⃣ Un titre accrocheur adapté au poste, 2️⃣ Des missions chiffrées (ex: « Augmenté le CA de 20% »), 3️⃣ Un format clair et aéré. Utilisez notre module CV IA pour l'optimiser automatiquement !",
  entretien: "Pour réussir un entretien : préparez la méthode STAR (Situation, Tâche, Action, Résultat) pour vos exemples. Renseignez-vous sur l'entreprise, préparez 3 questions à poser. Arrivez 10 min en avance et souriez !",
  salaire: "Pour négocier votre salaire : faites vos recherches sur les fourchettes du marché (LinkedIn Salary, Glassdoor), attendez que l'employeur parle en premier, et proposez une fourchette haute en vous basant sur votre valeur.",
  default: "Je suis votre assistant carrière BNJ ! Posez-moi une question sur votre recherche d'emploi, votre CV, vos entretiens ou votre négociation salariale. Je suis là pour vous aider ! 💼",
};

interface Message { id: number; me: boolean; text: string; }

export default function RessourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 1, me: false, text: "Bonjour ! Je suis votre assistant IA BNJ Career. Comment puis-je vous aider aujourd'hui ?" },
  ]);

  const filtered = RESOURCES.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "Tous" || r.category === category;
    return matchSearch && matchCat;
  });

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg: Message = { id: Date.now(), me: true, text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);

    const lower = chatInput.toLowerCase();
    const reply =
      lower.includes("cv") ? CHATBOT_REPLIES.cv :
      lower.includes("entretien") ? CHATBOT_REPLIES.entretien :
      lower.includes("salaire") || lower.includes("négocia") ? CHATBOT_REPLIES.salaire :
      CHATBOT_REPLIES.default;

    setTimeout(() => {
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, me: false, text: reply }]);
    }, 800);

    setChatInput("");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ressources & IA</h1>
        <p className="text-slate-500 text-sm mt-1">Bibliothèque de contenus et assistant IA personnalisé</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Library */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une ressource..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all shadow-sm"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    res.type === "pdf" ? "bg-red-50 text-red-600" :
                    res.type === "video" ? "bg-blue-50 text-blue-600" :
                    "bg-purple-50 text-purple-600"
                  }`}>
                    {res.type === "pdf" ? <FileText className="w-5 h-5" /> :
                     res.type === "video" ? <Video className="w-5 h-5" /> :
                     <Play className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    res.type === "pdf" ? "bg-red-50 text-red-600" :
                    res.type === "video" ? "bg-blue-50 text-blue-600" :
                    "bg-purple-50 text-purple-600"
                  }`}>
                    {res.type === "pdf" ? "PDF" : res.type === "video" ? "Vidéo" : "Replay"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-tight">{res.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{res.category}</span>
                    <span className="text-xs text-slate-400">{res.size || res.duration}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors">
                  {res.type === "pdf" ? <Download className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {res.type === "pdf" ? "Télécharger" : "Regarder"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chatbot IA */}
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
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              />
              <button type="submit" disabled={!chatInput.trim()}
                className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center disabled:opacity-50 hover:bg-brand-dark transition-all hover:scale-105">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
