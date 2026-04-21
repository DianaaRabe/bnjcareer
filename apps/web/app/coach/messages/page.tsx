"use client";

import { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Circle,
} from "lucide-react";

const CONTACTS = [
  { id: "1", name: "Marc Dupont", lastMessage: "Merci pour le retour sur mon CV !", time: "10:30", online: true, unread: 2 },
  { id: "2", name: "Sophie Martin", lastMessage: "Quand est notre prochaine session ?", time: "09:45", online: true, unread: 0 },
  { id: "3", name: "Emma Petit", lastMessage: "J'ai envoyé ma candidature à Canal+", time: "Hier", online: false, unread: 0 },
  { id: "4", name: "Lucas Bernard", lastMessage: "Je suis un peu bloqué sur le test React", time: "Hier", online: false, unread: 1 },
  { id: "5", name: "Julie Morel", lastMessage: "Génial, merci pour l'article !", time: "Lun", online: true, unread: 0 },
];

const MOCK_MESSAGES = [
  { id: 1, text: "Bonjour Marc, j'ai bien reçu tes modifications sur le CV.", sender: "coach", time: "10:00" },
  { id: 2, text: "C'est beaucoup mieux, surtout la partie expérience.", sender: "coach", time: "10:01" },
  { id: 3, text: "Salut ! Ravi de l'entendre. Qu'en est-il du score AI ?", sender: "user", time: "10:15" },
  { id: 4, text: "Le score est monté à 92% (contre 74% hier). C'est parfait pour postuler.", sender: "coach", time: "10:25" },
  { id: 5, text: "Merci pour le retour sur mon CV !", sender: "user", time: "10:30" },
];

export default function MessagingPage() {
  const [activeContact, setActiveContact] = useState(CONTACTS[0]);
  const [inputText, setInputText] = useState("");

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen p-0 lg:p-6 lg:pl-0 flex">
      <div className="flex-1 bg-white lg:rounded-3xl shadow-2xl border border-slate-100 flex overflow-hidden">
        
        {/* Contacts List (left sidebar) */}
        <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-6">
            <h1 className="text-xl font-black text-slate-900 mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-1 focus:ring-brand-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={`w-full p-4 rounded-2xl flex items-start gap-3 transition-all ${
                  activeContact.id === contact.id
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "hover:bg-white text-slate-600"
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    activeContact.id === contact.id ? "bg-white/20" : "bg-slate-200 text-slate-500"
                  }`}>
                    {contact.name.charAt(0)}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-bold truncate ${activeContact.id === contact.id ? "text-white" : "text-slate-900"}`}>
                      {contact.name}
                    </p>
                    <span className={`text-[10px] ${activeContact.id === contact.id ? "text-white/70" : "text-slate-400"}`}>
                      {contact.time}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${activeContact.id === contact.id ? "text-white/80" : "text-slate-500"}`}>
                    {contact.lastMessage}
                  </p>
                </div>
                {contact.unread > 0 && activeContact.id !== contact.id && (
                  <div className="w-5 h-5 bg-brand-accent text-brand-dark rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                    {contact.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area (main) */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* Main header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-500">
                   {activeContact.name.charAt(0)}
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-900">{activeContact.name}</p>
                   <div className="flex items-center gap-1">
                      <Circle className={`w-2 h-2 fill-current ${activeContact.online ? "text-green-500" : "text-slate-300"}`} />
                      <span className="text-[10px] text-slate-500 font-medium">
                        {activeContact.online ? "En ligne" : "Hors ligne"}
                      </span>
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-50 rounded-lg transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Messages loop */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
             {MOCK_MESSAGES.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === "coach" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm transition-all shadow-sm ${
                    msg.sender === "coach"
                      ? "bg-brand-primary text-white rounded-br-none"
                      : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                  }`}>
                    {msg.text}
                    <p className={`text-[10px] mt-1 text-right font-medium ${msg.sender === "coach" ? "text-white/60" : "text-slate-400"}`}>
                      {msg.time}
                    </p>
                  </div>
               </div>
             ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-slate-100 flex items-center gap-3">
             <button className="p-2 text-slate-400 hover:text-brand-primary transition-colors">
                <Paperclip className="w-5 h-5" />
             </button>
             <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tapez votre message..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-brand-primary/30 rounded-2xl text-sm transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-colors">
                  <Send className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
