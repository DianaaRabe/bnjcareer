"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Video,
  Play,
  Globe,
  ExternalLink,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  X,
  BookOpen,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Euro,
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
  is_published: boolean;
  is_locked: boolean;
  price: number;
  views_count: number;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "pdf",     label: "PDF",     color: "text-red-600 bg-red-50" },
  { value: "video",   label: "Vidéo",   color: "text-blue-600 bg-blue-50" },
  { value: "replay",  label: "Replay",  color: "text-purple-600 bg-purple-50" },
  { value: "article", label: "Article", color: "text-brand-primary bg-brand-50" },
  { value: "doc",     label: "Doc",     color: "text-indigo-600 bg-indigo-50" },
] as const;

const CATEGORIES = ["Tous", "Candidature", "Entretien", "Réseau", "Organisation", "Coaching", "Outils"];

function typeStyle(type: string) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.color ?? "text-slate-600 bg-slate-100";
}
function typeLabel(type: string) {
  return TYPE_OPTIONS.find((t) => t.value === type)?.label ?? type;
}
function TypeIcon({ type }: { type: string }) {
  if (type === "video" || type === "replay") return <Video className="w-6 h-6" />;
  if (type === "article") return <Globe className="w-6 h-6" />;
  return <FileText className="w-6 h-6" />;
}

const EMPTY_FORM = {
  title:          "",
  description:    "",
  type:           "pdf" as Resource["type"],
  category:       "Candidature",
  file_url:       "",
  size_label:     "",
  duration_label: "",
  is_published:   true,
  is_locked:      false,
  price:          0,
};
type FormState = typeof EMPTY_FORM;

interface Flash { ok: boolean; text: string }

export default function CoachResourcesPage() {
  const [resources, setResources]   = useState<Resource[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("Tous");
  const [flash, setFlash]           = useState<Flash | null>(null);

  const [modal, setModal]           = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Resource | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showFlash = (ok: boolean, text: string) => {
    setFlash({ ok, text });
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 3500);
  };

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resources?mine=true");
      if (res.ok) {
        const { resources: data } = await res.json();
        setResources(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    return () => clearTimeout(flashTimer.current);
  }, []);

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "Tous" || r.category === category;
    return matchSearch && matchCat;
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal("create");
  };

  const openEdit = (r: Resource) => {
    setForm({
      title:          r.title,
      description:    r.description ?? "",
      type:           r.type,
      category:       r.category,
      file_url:       r.file_url ?? "",
      size_label:     r.size_label ?? "",
      duration_label: r.duration_label ?? "",
      is_published:   r.is_published,
      is_locked:      r.is_locked,
      price:          r.price ?? 0,
    });
    setEditTarget(r);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        size_label:     form.size_label || null,
        duration_label: form.duration_label || null,
        price:          form.is_locked ? form.price : 0,
      };

      const isCreate = modal === "create";
      const url   = isCreate ? "/api/resources" : `/api/resources/${editTarget!.id}`;
      const method = isCreate ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        showFlash(false, err.error || "Erreur");
        return;
      }
      showFlash(true, isCreate ? "Ressource créée !" : "Ressource mise à jour !");
      closeModal();
      await loadResources();
    } catch {
      showFlash(false, "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Resource) => {
    if (!confirm(`Supprimer "${r.title}" ?`)) return;
    try {
      const res = await fetch(`/api/resources/${r.id}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((x) => x.id !== r.id));
        showFlash(true, "Ressource supprimée");
      } else {
        showFlash(false, "Erreur lors de la suppression");
      }
    } catch { showFlash(false, "Erreur réseau"); }
  };

  const togglePublish = async (r: Resource) => {
    try {
      await fetch(`/api/resources/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !r.is_published }),
      });
      setResources((prev) =>
        prev.map((x) => x.id === r.id ? { ...x, is_published: !r.is_published } : x)
      );
    } catch {}
  };

  const publishedCount = resources.filter((r) => r.is_published).length;
  const lockedCount    = resources.filter((r) => r.is_locked).length;
  const totalViews     = resources.reduce((acc, r) => acc + (r.views_count || 0), 0);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
            Bibliothèque de Ressources
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Partagez des documents et tutoriels avec vos candidats.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Ajouter une ressource
        </button>
      </div>

      {/* Flash */}
      {flash && (
        <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold border ${
          flash.ok ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        }`}>
          {flash.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {flash.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: resources.length, color: "bg-brand-50 text-brand-primary",  Icon: BookOpen },
          { label: "Publiées",  value: publishedCount,   color: "bg-green-50 text-green-600",       Icon: Globe },
          { label: "Payantes",  value: lockedCount,      color: "bg-amber-50 text-amber-600",       Icon: Lock },
          { label: "Vues",      value: totalViews,       color: "bg-blue-50 text-blue-600",         Icon: Eye },
        ].map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-black text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une ressource..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 shadow-sm transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${
                category === cat
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/40 hover:text-brand-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 gap-4">
          <BookOpen className="w-14 h-14 text-slate-200" />
          <p className="font-bold text-slate-400">Aucune ressource trouvée</p>
          <button onClick={openCreate} className="text-sm font-bold text-brand-primary hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4" /> Créer la première ressource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${typeStyle(res.type)} transition-transform group-hover:scale-110`}>
                  <TypeIcon type={res.type} />
                </div>
                <div className="flex items-center gap-1">
                  {/* Lock badge */}
                  {res.is_locked && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black mr-1">
                      <Lock className="w-3 h-3" /> {res.price > 0 ? `${res.price}€` : "Payant"}
                    </span>
                  )}
                  {/* Publish toggle */}
                  <button
                    onClick={() => togglePublish(res)}
                    className={`p-1.5 rounded-lg transition-all ${
                      res.is_published ? "text-green-600 hover:bg-green-50" : "text-slate-300 hover:bg-slate-50"
                    }`}
                    title={res.is_published ? "Publié — cliquer pour masquer" : "Brouillon — cliquer pour publier"}
                  >
                    {res.is_published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(res)}
                    className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-brand-50 rounded-lg transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(res)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${typeStyle(res.type).split(" ")[0]}`}>
                  {res.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors leading-tight">
                  {res.title}
                </h3>
                {res.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeStyle(res.type)}`}>
                    {typeLabel(res.type)}
                  </span>
                  {res.size_label && <span>{res.size_label}</span>}
                  {res.duration_label && <span>{res.duration_label}</span>}
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {res.views_count}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  res.is_published ? "text-green-600" : "text-amber-500"
                }`}>
                  {res.is_published ? "● Publiée" : "● Brouillon"}
                </span>
                {res.file_url && (
                  <a href={res.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-brand-primary transition-colors">
                    Voir <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between px-8 pt-8">
              <h2 className="text-xl font-black text-slate-900">
                {modal === "create" ? "Nouvelle ressource" : "Modifier la ressource"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Guide CV IA 2025"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Courte description..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Resource["type"] })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none"
                  >
                    {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none appearance-none"
                  >
                    {CATEGORIES.filter((c) => c !== "Tous").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien / URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.file_url}
                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Size + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taille</label>
                  <input type="text" value={form.size_label}
                    onChange={(e) => setForm({ ...form, size_label: e.target.value })}
                    placeholder="Ex: 2.4 Mo"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durée</label>
                  <input type="text" value={form.duration_label}
                    onChange={(e) => setForm({ ...form, duration_label: e.target.value })}
                    placeholder="Ex: 18 min"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none" />
                </div>
              </div>

              {/* Paywall section */}
              <div className="space-y-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.is_locked ? "bg-amber-500" : "bg-slate-300"}`}
                    onClick={() => setForm({ ...form, is_locked: !form.is_locked })}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_locked ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Ressource payante
                    </p>
                    <p className="text-[10px] text-slate-400">Les candidats verront la ressource mais devront payer pour y accéder</p>
                  </div>
                </label>

                {form.is_locked && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix (€)</label>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-11 pr-5 py-3 bg-white border border-amber-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Published toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-brand-primary/30 transition-colors">
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.is_published ? "bg-brand-primary" : "bg-slate-300"}`}
                  onClick={() => setForm({ ...form, is_published: !form.is_published })}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{form.is_published ? "Publiée" : "Brouillon"}</p>
                  <p className="text-[10px] text-slate-400">
                    {form.is_published ? "Visible par tous les candidats" : "Non visible"}
                  </p>
                </div>
              </label>
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button onClick={closeModal}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || !form.title.trim()}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (modal === "create" ? "Créer" : "Sauvegarder")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
