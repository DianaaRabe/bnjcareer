"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Search,
  Plus,
  Users,
  MoreVertical,
  Trash2,
  X,
  UserPlus,
  CheckCircle2,
  MessageSquare,
  Loader2,
  ChevronLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  user_id: string;
  full_name: string;
  role: string | null;
  avatar_url: string | null;
  last_read_at: string | null;
}

interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  last_message: string | null;
  last_message_at: string | null;
  unread: number;
  participants: Participant[];
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_mine: boolean;
  sender_name: string;
  sender_avatar: string | null;
  sender_role: string | null;
}

interface UserResult {
  id: string;
  full_name: string;
  role: string | null;
  avatar_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Hier";
  if (days < 7) return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "from-brand-primary to-brand-dark",
  "from-violet-500 to-purple-700",
  "from-emerald-500 to-teal-700",
  "from-orange-400 to-rose-600",
  "from-sky-500 to-blue-700",
];
function avatarColor(id: string): string {
  const n = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[n];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ id, name, size = "md" }: { id: string; name: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs";
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${avatarColor(id)} flex items-center justify-center text-white font-bold shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ─── New Conversation Modal ────────────────────────────────────────────────────

function NewConversationModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (convId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<UserResult[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 1) { setUsers([]); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/messages/users?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchUsers]);

  const toggle = (u: UserResult) => {
    setSelected((prev) =>
      prev.find((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u]
    );
  };

  const isGroup = selected.length > 1;

  const create = async () => {
    if (!selected.length) return;
    setCreating(true);
    try {
      const r = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_ids: selected.map((u) => u.id),
          is_group: isGroup,
          name: isGroup ? groupName || "Nouveau groupe" : undefined,
        }),
      });
      const data = await r.json();
      if (data.conversation?.id) {
        onCreated(data.conversation.id);
        onClose();
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base font-bold text-slate-900">Nouvelle conversation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span key={u.id} className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  {u.full_name}
                  <button onClick={() => toggle(u)} className="hover:text-brand-dark">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Group name (only if >1 selected) */}
          {isGroup && (
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nom du groupe..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 placeholder:text-slate-400"
            />
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
              </div>
            )}
            {!loading && query.length >= 1 && users.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">Aucun utilisateur trouvé</p>
            )}
            {users.map((u) => {
              const isSelected = !!selected.find((x) => x.id === u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => toggle(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    isSelected ? "bg-brand-primary/10" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar id={u.id} name={u.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{u.full_name}</p>
                    <p className="text-xs text-slate-400 capitalize">{u.role ?? "utilisateur"}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Annuler
          </button>
          <button
            onClick={create}
            disabled={!selected.length || creating}
            className="px-5 py-2 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isGroup ? "Créer le groupe" : "Démarrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message Item ──────────────────────────────────────────────────────────────

function MessageItem({
  msg,
  isGroup,
  onDelete,
}: {
  msg: Message;
  isGroup: boolean;
  onDelete: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`flex gap-2 group ${msg.is_mine ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!msg.is_mine && (
        <Avatar id={msg.sender_id} name={msg.sender_name} size="sm" />
      )}

      <div className={`max-w-[72%] ${msg.is_mine ? "items-end" : "items-start"} flex flex-col`}>
        {!msg.is_mine && isGroup && (
          <p className="text-xs text-slate-500 font-semibold mb-1 ml-1">{msg.sender_name}</p>
        )}
        <div className="flex items-end gap-2">
          {msg.is_mine && hovered && (
            <button
              onClick={() => onDelete(msg.id)}
              className="p-1 text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.is_mine
                ? "bg-brand-primary text-white rounded-tr-sm shadow-md shadow-brand-primary/20"
                : "bg-white text-slate-800 rounded-tl-sm shadow-sm border border-slate-100"
            }`}
          >
            {msg.content}
          </div>
        </div>
        <p className={`text-[10px] text-slate-400 mt-1 ${msg.is_mine ? "text-right" : "text-left ml-1"}`}>
          {formatMessageTime(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Main MessagingUI ──────────────────────────────────────────────────────────

export default function MessagingUI() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const r = await fetch("/api/messages/conversations");
      const data = await r.json();
      setConversations(data.conversations ?? []);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // ── Load messages for active conversation
  const loadMessages = useCallback(async (id: string) => {
    setLoadingMsgs(true);
    try {
      const r = await fetch(`/api/messages/conversations/${id}/messages`);
      const data = await r.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoadingMsgs(false);
    }
    // Mark as read
    fetch(`/api/messages/conversations/${id}/read`, { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);

    // Poll every 5 seconds for new messages
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(activeId), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (id: string) => {
    setActiveId(id);
    setShowMobileChat(true);
  };

  const active = conversations.find((c) => c.id === activeId);

  // ── Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeId || sending) return;
    const content = input.trim();
    setSending(true);
    setInput("");

    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender_id: "me",
      content,
      created_at: new Date().toISOString(),
      is_mine: true,
      sender_name: "Moi",
      sender_avatar: null,
      sender_role: null,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await fetch(`/api/messages/conversations/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      await loadMessages(activeId);
      await loadConversations();
    } finally {
      setSending(false);
    }
  };

  // ── Delete message
  const deleteMessage = async (id: string) => {
    if (id.startsWith("temp-")) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/messages/messages/${id}`, { method: "DELETE" });
    await loadConversations();
  };

  // ── Conversation created callback
  const handleConversationCreated = async (convId: string) => {
    await loadConversations();
    selectConversation(convId);
  };

  // ── Filter conversations
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {showModal && (
        <NewConversationModal
          onClose={() => setShowModal(false)}
          onCreated={handleConversationCreated}
        />
      )}

      <div className="h-[calc(100vh-64px)] lg:h-screen flex overflow-hidden">
        <div className="flex-1 bg-white lg:rounded-3xl shadow-sm border border-slate-100 flex overflow-hidden">

          {/* ── LEFT SIDEBAR ── */}
          <div
            className={`w-full sm:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 shrink-0 ${
              showMobileChat ? "hidden sm:flex" : "flex"
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-black text-slate-900">Messages</h1>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-9 h-9 bg-brand-primary text-white rounded-xl flex items-center justify-center hover:bg-brand-dark transition-colors shadow-md shadow-brand-primary/20"
                  title="Nouvelle conversation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {loadingConvs && (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                </div>
              )}

              {!loadingConvs && filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                  <MessageSquare className="w-10 h-10 opacity-30" />
                  <p className="text-sm font-medium text-center">
                    {search ? "Aucune conversation trouvée" : "Aucune conversation"}
                  </p>
                  {!search && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      Démarrer une conversation
                    </button>
                  )}
                </div>
              )}

              {filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                    activeId === conv.id
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                      : "hover:bg-white text-slate-600"
                  }`}
                >
                  {/* Avatar */}
                  {conv.is_group ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      activeId === conv.id ? "bg-white/20" : "bg-slate-200"
                    }`}>
                      <Users className={`w-5 h-5 ${activeId === conv.id ? "text-white" : "text-slate-500"}`} />
                    </div>
                  ) : (
                    <Avatar id={conv.id} name={conv.name} />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-bold truncate ${activeId === conv.id ? "text-white" : "text-slate-900"}`}>
                        {conv.name}
                      </p>
                      <span className={`text-[10px] shrink-0 ml-1 ${activeId === conv.id ? "text-white/70" : "text-slate-400"}`}>
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${activeId === conv.id ? "text-white/80" : "text-slate-500"}`}>
                      {conv.last_message ?? "Aucun message"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread > 0 && activeId !== conv.id && (
                    <span className="w-5 h-5 bg-brand-accent text-brand-dark rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── CHAT AREA ── */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              !showMobileChat ? "hidden sm:flex" : "flex"
            }`}
          >
            {!active ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 opacity-40" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-600">Sélectionnez une conversation</p>
                  <p className="text-sm mt-1">ou démarrez-en une nouvelle</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-md shadow-brand-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle conversation
                </button>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center gap-3 shadow-sm shrink-0">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="sm:hidden p-1.5 hover:bg-slate-100 rounded-xl transition-colors mr-1"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                  </button>

                  {active.is_group ? (
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                  ) : (
                    <Avatar id={active.id} name={active.name} size="sm" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{active.name}</p>
                    <p className="text-xs text-slate-400">
                      {active.is_group
                        ? `${active.participants.length} participants`
                        : active.participants.find((p) => p.user_id !== active.id)?.role ?? ""}
                    </p>
                  </div>

                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/30">
                  {loadingMsgs && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                    </div>
                  )}
                  {!loadingMsgs && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
                      <p className="text-sm">Aucun message. Soyez le premier à écrire !</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      msg={msg}
                      isGroup={active.is_group}
                      onDelete={deleteMessage}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={sendMessage}
                  className="bg-white border-t border-slate-100 p-4 flex items-center gap-3 shrink-0"
                >
                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Écrivez un message..."
                      className="w-full pl-4 pr-12 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-brand-primary/30 focus:border rounded-2xl text-sm transition-all text-slate-900 placeholder:text-slate-400 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
