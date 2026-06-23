"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Building2, Plus, Search, Pencil, Trash2, Globe,
  Loader2, X, CheckCircle2, AlertCircle, ExternalLink,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  sector: string | null;
  size_label: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

const EMPTY: Partial<Company> = {
  name: "", description: "", sector: "", size_label: "",
  location: "", logo_url: "", website_url: "", is_active: true,
};

interface Flash { ok: boolean; text: string }

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [target, setTarget]       = useState<Company | null>(null);
  const [form, setForm]           = useState<Partial<Company>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [flash, setFlash]         = useState<Flash | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showFlash = (ok: boolean, text: string) => {
    setFlash({ ok, text });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/companies${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      const { companies: data } = await res.json();
      setCompanies(data ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); return () => clearTimeout(timer.current); }, []);
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => { setForm(EMPTY); setTarget(null); setModal("create"); };
  const openEdit   = (c: Company) => { setForm({ ...c }); setTarget(c); setModal("edit"); };
  const closeModal = () => { setModal(null); setTarget(null); };

  const save = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      const isCreate = modal === "create";
      const url    = isCreate ? "/api/admin/companies" : `/api/admin/companies/${target!.id}`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const e = await res.json(); showFlash(false, e.error); return; }
      showFlash(true, isCreate ? "Entreprise créée !" : "Entreprise mise à jour !");
      closeModal(); load();
    } catch { showFlash(false, "Erreur réseau"); }
    finally { setSaving(false); }
  };

  const remove = async (c: Company) => {
    if (!confirm(`Supprimer "${c.name}" ? Toutes les offres associées seront supprimées.`)) return;
    const res = await fetch(`/api/admin/companies/${c.id}`, { method: "DELETE" });
    if (res.ok) { setCompanies(p => p.filter(x => x.id !== c.id)); showFlash(true, "Supprimée"); }
    else showFlash(false, "Erreur suppression");
  };

  const input = "w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-light focus:ring-2 focus:ring-brand-primary/20 transition-all";
  const label = "text-[10px] font-black text-slate-400 uppercase tracking-widest";

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-400" /> Entreprises
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gérez les entreprises partenaires de la communauté.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {flash && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold ${flash.ok ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {flash.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {flash.text}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une entreprise..."
          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-light transition-all" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-brand-light animate-spin" /></div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Building2 className="w-12 h-12 text-slate-700" />
          <p className="text-slate-500 font-bold">Aucune entreprise</p>
          <button onClick={openCreate} className="text-sm text-brand-light hover:underline font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Ajouter la première entreprise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {companies.map(c => (
            <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4 hover:border-slate-600 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={c.name} className="w-10 h-10 rounded-xl object-contain bg-white p-1" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{c.name}</p>
                    {c.sector && <p className="text-[10px] text-slate-500">{c.sector}</p>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(c)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {c.description && <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>}
              <div className="flex flex-wrap gap-2">
                {c.location && <span className="text-[10px] font-bold px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full">{c.location}</span>}
                {c.size_label && <span className="text-[10px] font-bold px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full">{c.size_label}</span>}
              </div>
              {c.website_url && (
                <a href={c.website_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-brand-light transition-colors">
                  <Globe className="w-3 h-3" /> Site web <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-[28px] w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-black text-white">
                {modal === "create" ? "Nouvelle entreprise" : "Modifier l'entreprise"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className={label}>Nom <span className="text-red-400">*</span></label>
                <input className={input} value={form.name ?? ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom de l'entreprise" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={label}>Secteur</label>
                  <input className={input} value={form.sector ?? ""} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="Tech, Finance..." />
                </div>
                <div className="space-y-1.5">
                  <label className={label}>Taille</label>
                  <input className={input} value={form.size_label ?? ""} onChange={e => setForm({ ...form, size_label: e.target.value })} placeholder="50-200 employés" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={label}>Localisation</label>
                <input className={input} value={form.location ?? ""} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Paris, France" />
              </div>
              <div className="space-y-1.5">
                <label className={label}>Description</label>
                <textarea className={`${input} resize-none`} rows={3} value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Présentation de l'entreprise..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={label}>Logo URL</label>
                  <input className={input} value={form.logo_url ?? ""} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className={label}>Site web</label>
                  <input className={input} value={form.website_url ?? ""} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all">Annuler</button>
              <button onClick={save} disabled={saving || !form.name?.trim()} className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-brand-dark transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (modal === "create" ? "Créer" : "Sauvegarder")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
