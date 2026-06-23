"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Briefcase, Plus, Search, Pencil, Trash2, Building2,
  Loader2, X, CheckCircle2, AlertCircle, Globe, Eye, EyeOff,
} from "lucide-react";

interface Company { id: string; name: string; logo_url: string | null }
interface Job {
  id: string; title: string; location: string | null;
  contract_type: string | null; salary_label: string | null;
  experience_level: string | null; remote: string | null;
  is_active: boolean; created_at: string;
  companies: Company | null;
}
interface Flash { ok: boolean; text: string }

const CONTRACT_TYPES = ["CDI", "CDD", "Alternance", "Stage", "Freelance", "Mission"];
const REMOTE_OPTIONS = ["Non", "Partiel", "Complet"];
const EXP_LEVELS     = ["Junior (0-2 ans)", "Confirmé (3-5 ans)", "Senior (6+ ans)", "Expert"];

const EMPTY_FORM = {
  title: "", company_id: "", description: "", location: "",
  contract_type: "CDI", salary_label: "", experience_level: "",
  remote: "Non", application_url: "", application_email: "",
  skills: [] as string[], is_active: true,
};
type FormState = typeof EMPTY_FORM;

export default function AdminJobsPage() {
  const [jobs, setJobs]           = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [target, setTarget]       = useState<Job | null>(null);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [skillInput, setSkillInput] = useState("");
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
      const [jobsRes, companiesRes] = await Promise.all([
        fetch(`/api/admin/jobs?active=false${search ? `&search=${encodeURIComponent(search)}` : ""}`),
        fetch("/api/admin/companies"),
      ]);
      const { jobs: jobData } = await jobsRes.json();
      const { companies: compData } = await companiesRes.json();
      setJobs(jobData ?? []);
      setCompanies(compData ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); return () => clearTimeout(timer.current); }, []);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search]);

  const openCreate = () => { setForm(EMPTY_FORM); setTarget(null); setModal("create"); };
  const openEdit = (j: Job) => {
    setForm({
      title: j.title, company_id: j.companies?.id ?? "",
      description: "", location: j.location ?? "",
      contract_type: j.contract_type ?? "CDI", salary_label: j.salary_label ?? "",
      experience_level: j.experience_level ?? "", remote: j.remote ?? "Non",
      application_url: "", application_email: "", skills: [], is_active: j.is_active,
    });
    setTarget(j); setModal("edit");
  };
  const closeModal = () => { setModal(null); setTarget(null); };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };
  const removeSkill = (s: string) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const save = async () => {
    if (!form.title?.trim() || !form.company_id) return;
    setSaving(true);
    try {
      const isCreate = modal === "create";
      const url    = isCreate ? "/api/admin/jobs" : `/api/admin/jobs/${target!.id}`;
      const method = isCreate ? "POST" : "PATCH";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const e = await res.json(); showFlash(false, e.error); return; }
      showFlash(true, isCreate ? "Offre publiée !" : "Offre mise à jour !");
      closeModal(); load();
    } catch { showFlash(false, "Erreur réseau"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (j: Job) => {
    const res = await fetch(`/api/admin/jobs/${j.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !j.is_active }),
    });
    if (res.ok) { setJobs(p => p.map(x => x.id === j.id ? { ...x, is_active: !j.is_active } : x)); }
  };

  const remove = async (j: Job) => {
    if (!confirm(`Supprimer "${j.title}" ?`)) return;
    const res = await fetch(`/api/admin/jobs/${j.id}`, { method: "DELETE" });
    if (res.ok) { setJobs(p => p.filter(x => x.id !== j.id)); showFlash(true, "Supprimée"); }
  };

  const inp = "w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-light transition-all";
  const lbl = "text-[10px] font-black text-slate-400 uppercase tracking-widest";
  const sel = `${inp} appearance-none`;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-brand-light" /> Offres d'emploi
          </h1>
          <p className="text-slate-400 text-sm mt-1">Publiez et gérez les offres de la communauté.</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all">
          <Plus className="w-4 h-4" /> Publier une offre
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
          placeholder="Rechercher une offre..."
          className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand-light transition-all" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <span className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full font-bold text-xs">
          {jobs.filter(j => j.is_active).length} actives
        </span>
        <span className="px-3 py-1.5 bg-slate-700/50 text-slate-400 rounded-full font-bold text-xs">
          {jobs.filter(j => !j.is_active).length} inactives
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-brand-light animate-spin" /></div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Briefcase className="w-12 h-12 text-slate-700" />
          <p className="text-slate-500 font-bold">Aucune offre publiée</p>
          <button onClick={openCreate} className="text-sm text-brand-light hover:underline font-bold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Publier la première offre
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <div key={j.id} className={`bg-slate-800/50 border rounded-2xl p-5 flex items-center gap-5 hover:border-slate-600 transition-all group ${j.is_active ? "border-slate-700/50" : "border-slate-800 opacity-60"}`}>
              {/* Company logo */}
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                {j.companies?.logo_url
                  ? <img src={j.companies.logo_url} alt="" className="w-8 h-8 object-contain" />
                  : <Building2 className="w-4 h-4 text-slate-500" />}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{j.title}</p>
                <p className="text-[10px] text-slate-500">{j.companies?.name} • {j.location}</p>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  {j.contract_type  && <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">{j.contract_type}</span>}
                  {j.salary_label   && <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">{j.salary_label}</span>}
                  {j.remote && j.remote !== "Non" && <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-primary/10 text-brand-light rounded-full">{j.remote === "Complet" ? "Full remote" : "Hybride"}</span>}
                </div>
              </div>
              {/* Status */}
              <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${j.is_active ? "text-green-400" : "text-slate-600"}`}>
                {j.is_active ? "● Active" : "● Inactive"}
              </span>
              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => toggleActive(j)} className={`p-1.5 rounded-lg transition-all ${j.is_active ? "text-slate-500 hover:text-amber-400 hover:bg-amber-500/10" : "text-slate-500 hover:text-green-400 hover:bg-green-500/10"}`}>
                  {j.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(j)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(j)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-[28px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
              <h2 className="text-lg font-black text-white">
                {modal === "create" ? "Nouvelle offre" : "Modifier l'offre"}
              </h2>
              <button onClick={closeModal} className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div className="space-y-1.5">
                <label className={lbl}>Titre <span className="text-red-400">*</span></label>
                <input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Développeur Full-Stack React/Node" />
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className={lbl}>Entreprise <span className="text-red-400">*</span></label>
                <select className={sel} value={form.company_id} onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}>
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Location + Contract */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={lbl}>Localisation</label>
                  <input className={inp} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Paris, Lyon..." />
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Type de contrat</label>
                  <select className={sel} value={form.contract_type} onChange={e => setForm(f => ({ ...f, contract_type: e.target.value }))}>
                    {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Salary + Experience + Remote */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={lbl}>Salaire</label>
                  <input className={inp} value={form.salary_label} onChange={e => setForm(f => ({ ...f, salary_label: e.target.value }))} placeholder="45-55k€" />
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Expérience</label>
                  <select className={sel} value={form.experience_level} onChange={e => setForm(f => ({ ...f, experience_level: e.target.value }))}>
                    <option value="">Tous niveaux</option>
                    {EXP_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Télétravail</label>
                  <select className={sel} value={form.remote} onChange={e => setForm(f => ({ ...f, remote: e.target.value }))}>
                    {REMOTE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={lbl}>Description</label>
                <textarea className={`${inp} resize-none`} rows={5} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description du poste, missions, profil recherché..." />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className={lbl}>Compétences</label>
                <div className="flex gap-2">
                  <input className={`${inp} flex-1`} value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="React, TypeScript... (Entrée pour ajouter)" />
                  <button onClick={addSkill} className="px-4 py-2 bg-brand-primary/20 text-brand-light rounded-xl text-sm font-bold hover:bg-brand-primary/30 transition-all">+</button>
                </div>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map(s => (
                      <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-light rounded-full text-xs font-bold">
                        {s} <button onClick={() => removeSkill(s)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Apply */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={lbl}>Lien de candidature</label>
                  <input className={inp} value={form.application_url} onChange={e => setForm(f => ({ ...f, application_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className={lbl}>Email de candidature</label>
                  <input className={inp} type="email" value={form.application_email} onChange={e => setForm(f => ({ ...f, application_email: e.target.value }))} placeholder="recrutement@..." />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-700/30 rounded-xl border border-slate-700">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-green-500" : "bg-slate-600"}`}
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{form.is_active ? "Offre active" : "Offre inactive"}</p>
                  <p className="text-[10px] text-slate-500">{form.is_active ? "Visible par les candidats" : "Non visible"}</p>
                </div>
              </label>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3 shrink-0">
              <button onClick={closeModal} className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-600 transition-all">Annuler</button>
              <button onClick={save} disabled={saving || !form.title?.trim() || !form.company_id}
                className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-brand-dark transition-all">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (modal === "create" ? "Publier" : "Sauvegarder")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
