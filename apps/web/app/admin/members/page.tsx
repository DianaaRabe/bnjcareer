"use client";

import { useState, useEffect } from "react";
import {
  Users, Search, Trash2, Loader2, AlertCircle,
  CheckCircle2, Shield, User, Mail, Calendar,
} from "lucide-react";

interface Member {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
  is_onboarded: boolean;
}

export default function AdminMembersPage() {
  const [members, setMembers]   = useState<Member[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [flash, setFlash]       = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm]   = useState<Member | null>(null);

  const showFlash = (ok: boolean, text: string) => {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setMembers(data.members ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m => {
    const q = search.toLowerCase();
    return (
      (m.first_name ?? "").toLowerCase().includes(q) ||
      (m.last_name  ?? "").toLowerCase().includes(q) ||
      (m.email      ?? "").toLowerCase().includes(q)
    );
  });

  const handleDelete = async (member: Member) => {
    setConfirm(null);
    setDeleting(member.id);
    try {
      const res = await fetch(`/api/admin/users/${member.id}`, { method: "DELETE" });
      if (!res.ok) {
        const e = await res.json();
        showFlash(false, `Erreur : ${e.error}`);
      } else {
        showFlash(true, `${member.first_name ?? member.email} supprimé avec succès.`);
        setMembers(prev => prev.filter(m => m.id !== member.id));
      }
    } catch {
      showFlash(false, "Erreur réseau");
    } finally {
      setDeleting(null);
    }
  };

  const roleLabel = (role: string) => {
    if (role === "admin")     return { label: "Admin",     cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    if (role === "coach")     return { label: "Coach",     cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
    return                           { label: "Candidat",  cls: "bg-slate-700/50 text-slate-400 border-slate-600/30" };
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-brand-light" /> Membres
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {members.length} membre{members.length !== 1 ? "s" : ""} inscrits
          </p>
        </div>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold border ${
          flash.ok
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {flash.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {flash.text}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-light transition-all"
        />
      </div>

      {/* Filtres par rôle */}
      <div className="flex gap-3 text-xs font-bold">
        {["Tous", "candidate", "coach", "admin"].map(r => (
          <span key={r} className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {r === "Tous" ? `Tous (${members.length})`
              : `${r === "candidate" ? "Candidats" : r === "coach" ? "Coachs" : "Admins"} (${members.filter(m => m.role === r).length})`}
          </span>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 text-brand-light animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Users className="w-12 h-12 text-slate-700" />
          <p className="text-slate-500 font-bold">Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(member => {
            const { label, cls } = roleLabel(member.role);
            const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ") || "—";
            const initials = (member.first_name?.[0] ?? member.email?.[0] ?? "?").toUpperCase();
            const isDeleting = deleting === member.id;

            return (
              <div
                key={member.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex items-center gap-5 hover:border-slate-600 transition-all group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center font-black text-brand-light shrink-0">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white truncate">{fullName}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cls}`}>
                      {label}
                    </span>
                    {!member.is_onboarded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-500 border border-slate-600/30">
                        Non onboardé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {member.email && (
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="w-3 h-3" /> {member.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(member.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => setConfirm(member)}
                  disabled={isDeleting}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {isDeleting
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-lg font-black text-white">Supprimer ce membre ?</h2>
              <p className="text-sm text-slate-400">
                <span className="font-bold text-white">
                  {[confirm.first_name, confirm.last_name].filter(Boolean).join(" ") || confirm.email}
                </span>{" "}
                sera définitivement supprimé. Il ne pourra plus se connecter, même via Google.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
