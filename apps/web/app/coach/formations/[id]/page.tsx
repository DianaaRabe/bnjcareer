"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronLeft,
  Video,
  BookOpen,
  Settings,
  Users,
  Loader2,
  X,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Exercise {
  type: "qcm" | "open";
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface FormationModule {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  transcript: string;
  duration_minutes: number;
  exercise_data: Exercise[];
  order_index: number;
  isNew?: boolean;
  isDirty?: boolean;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  level: string;
  duration_label: string;
  price: number;
  max_students: number;
  is_published: boolean;
}

type Tab = "info" | "modules" | "students";

export default function EditFormationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "Entretien",
    level: "débutant",
    duration_label: "",
    price: 0,
    max_students: 0,
    is_published: false,
  });

  const [modules, setModules] = useState<FormationModule[]>([]);
  const [editingModule, setEditingModule] = useState<number | null>(null);
  const [modulesSaving, setModulesSaving] = useState(false);

  // Load formation
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/formations/${id}`);
        if (!res.ok) {
          router.push("/coach/formations");
          return;
        }
        const { formation } = await res.json();

        setFormData({
          title: formation.title || "",
          description: formation.description || "",
          category: formation.category || "Entretien",
          level: formation.level || "débutant",
          duration_label: formation.duration_label || "",
          price: formation.price || 0,
          max_students: formation.max_students || 0,
          is_published: formation.is_published || false,
        });

        setModules(
          (formation.formation_modules || []).map((m: any) => ({
            id: m.id,
            title: m.title || "",
            description: m.description || "",
            video_url: m.video_url || "",
            transcript: m.transcript || "",
            duration_minutes: m.duration_minutes || 10,
            exercise_data: m.exercise_data || [],
            order_index: m.order_index ?? 0,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const flash = (ok: boolean, text: string) => {
    setSaveMsg({ ok, text });
    setTimeout(() => setSaveMsg(null), 3000);
  };

  // Save core formation info
  const saveInfo = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/formations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        flash(true, "Formation sauvegardée !");
      } else {
        const err = await res.json();
        flash(false, err.error || "Erreur lors de la sauvegarde");
      }
    } catch {
      flash(false, "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  // Toggle published
  const togglePublish = async () => {
    const next = !formData.is_published;
    setSaving(true);
    try {
      const res = await fetch(`/api/formations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: next }),
      });
      if (res.ok) {
        setFormData((prev) => ({ ...prev, is_published: next }));
        flash(true, next ? "Formation publiée !" : "Formation mise en brouillon");
      } else {
        flash(false, "Erreur lors du changement de statut");
      }
    } catch {
      flash(false, "Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  // Module CRUD via Supabase client
  const saveModule = async (idx: number) => {
    const mod = modules[idx];
    setModulesSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (mod.id) {
        // Update existing
        const { error } = await supabase
          .from("formation_modules")
          .update({
            title: mod.title,
            description: mod.description,
            video_url: mod.video_url,
            transcript: mod.transcript,
            duration_minutes: mod.duration_minutes,
            exercise_data: mod.exercise_data,
            order_index: mod.order_index,
          })
          .eq("id", mod.id);
        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("formation_modules")
          .insert({
            formation_id: id,
            title: mod.title,
            description: mod.description,
            video_url: mod.video_url,
            transcript: mod.transcript,
            duration_minutes: mod.duration_minutes,
            exercise_data: mod.exercise_data,
            order_index: mod.order_index,
          })
          .select("id")
          .single();
        if (error) throw error;
        // Assign the new ID
        setModules((prev) =>
          prev.map((m, i) => (i === idx ? { ...m, id: data.id, isNew: false } : m))
        );
      }

      // Update modules_count on formation
      await fetch(`/api/formations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules_count: modules.length }),
      });

      flash(true, "Module sauvegardé !");
    } catch (err: any) {
      flash(false, err.message || "Erreur sauvegarde module");
    } finally {
      setModulesSaving(false);
    }
  };

  const deleteModule = async (idx: number) => {
    const mod = modules[idx];
    if (!confirm(`Supprimer le module "${mod.title}" ?`)) return;

    setModulesSaving(true);
    try {
      if (mod.id) {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase
          .from("formation_modules")
          .delete()
          .eq("id", mod.id);
        if (error) throw error;
      }
      setModules((prev) => prev.filter((_, i) => i !== idx));
      if (editingModule === idx) setEditingModule(null);
      else if (editingModule !== null && editingModule > idx) {
        setEditingModule(editingModule - 1);
      }
      flash(true, "Module supprimé");
    } catch (err: any) {
      flash(false, err.message || "Erreur suppression module");
    } finally {
      setModulesSaving(false);
    }
  };

  const addModule = () => {
    const newMod: FormationModule = {
      title: `Module ${modules.length + 1}`,
      description: "",
      video_url: "",
      transcript: "",
      duration_minutes: 10,
      exercise_data: [],
      order_index: modules.length,
      isNew: true,
    };
    setModules((prev) => [...prev, newMod]);
    setEditingModule(modules.length);
  };

  const updateModule = (idx: number, data: Partial<FormationModule>) => {
    setModules((prev) => prev.map((m, i) => (i === idx ? { ...m, ...data } : m)));
  };

  const addExercise = (modIdx: number) => {
    setModules((prev) =>
      prev.map((m, i) =>
        i === modIdx
          ? {
              ...m,
              exercise_data: [
                ...m.exercise_data,
                {
                  type: "qcm" as const,
                  question: "",
                  options: ["Option A", "Option B"],
                  correct_answer: "Option A",
                  explanation: "",
                },
              ],
            }
          : m
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/coach/formations")}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold"
          >
            <ChevronLeft className="w-5 h-5" /> Retour
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 truncate max-w-xs sm:max-w-md">
              {formData.title || "Formation sans titre"}
            </h1>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {formData.is_published ? (
                <span className="text-green-600">● Publiée</span>
              ) : (
                <span className="text-amber-500">● Brouillon</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Publish Toggle */}
          <button
            onClick={togglePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
              formData.is_published
                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            }`}
          >
            {formData.is_published ? (
              <>
                <EyeOff className="w-4 h-4" /> Mettre en brouillon
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Publier
              </>
            )}
          </button>

          {/* Preview */}
          <Link
            href={`/dashboard/formations/${id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
          >
            <Eye className="w-4 h-4" /> Aperçu
          </Link>
        </div>
      </div>

      {/* Flash message */}
      {saveMsg && (
        <div
          className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold ${
            saveMsg.ok
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {saveMsg.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {saveMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {(["info", "modules", "students"] as Tab[]).map((t) => {
          const labels: Record<Tab, { label: string; icon: React.ReactNode }> = {
            info: { label: "Informations", icon: <Settings className="w-4 h-4" /> },
            modules: { label: `Modules (${modules.length})`, icon: <BookOpen className="w-4 h-4" /> },
            students: { label: "Étudiants", icon: <Users className="w-4 h-4" /> },
          };
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {labels[t].icon}
              {labels[t].label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Info ── */}
      {tab === "info" && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Titre de la formation
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Maîtriser l'entretien d'embauche technique"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Décrivez ce que les candidats vont apprendre..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none"
              >
                <option>Entretien</option>
                <option>CV</option>
                <option>Reconversion</option>
                <option>Soft Skills</option>
                <option>Technique</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Niveau
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none appearance-none"
              >
                <option value="débutant">Débutant</option>
                <option value="intermédiaire">Intermédiaire</option>
                <option value="avancé">Avancé</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Prix (€)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
              />
              <p className="text-[10px] text-slate-400 font-bold px-2">0 = Gratuit</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Durée estimée
              </label>
              <input
                type="text"
                value={formData.duration_label}
                onChange={(e) => setFormData({ ...formData, duration_label: e.target.value })}
                placeholder="Ex: 30 jours, 6 semaines..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Nombre max d'étudiants
              </label>
              <input
                type="number"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none"
              />
              <p className="text-[10px] text-slate-400 font-bold px-2">0 = Illimité</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={saveInfo}
              disabled={saving || !formData.title}
              className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* ── Tab: Modules ── */}
      {tab === "modules" && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar */}
            <aside className="lg:w-80 border-r border-slate-100 p-8 space-y-4 shrink-0 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Modules ({modules.length})
                </h3>
                {modulesSaving && (
                  <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                )}
              </div>

              <div className="space-y-2">
                {modules.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setEditingModule(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border text-left ${
                      editingModule === i
                        ? "bg-white border-brand-primary shadow-md text-brand-primary ring-1 ring-brand-primary"
                        : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/30"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        editingModule === i
                          ? "bg-brand-primary text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold truncate">{m.title}</span>
                    {m.isNew && (
                      <span className="ml-auto shrink-0 text-[8px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full uppercase">
                        Nouveau
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={addModule}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-50 transition-all text-xs font-bold"
                >
                  <Plus className="w-4 h-4" /> Ajouter un module
                </button>
              </div>
            </aside>

            {/* Editor */}
            <main className="flex-1 p-10 bg-white min-h-[600px]">
              {editingModule !== null && modules[editingModule] ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                      Édition du Module {editingModule + 1}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveModule(editingModule)}
                        disabled={modulesSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all disabled:opacity-50"
                      >
                        {modulesSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => deleteModule(editingModule)}
                        disabled={modulesSaving}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Titre du module
                      </label>
                      <input
                        type="text"
                        value={modules[editingModule].title}
                        onChange={(e) =>
                          updateModule(editingModule, { title: e.target.value })
                        }
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Lien Vidéo (YouTube / Vimeo)
                      </label>
                      <div className="relative">
                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={modules[editingModule].video_url}
                          onChange={(e) =>
                            updateModule(editingModule, { video_url: e.target.value })
                          }
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Durée (minutes)
                        </label>
                        <input
                          type="number"
                          value={modules[editingModule].duration_minutes}
                          onChange={(e) =>
                            updateModule(editingModule, {
                              duration_minutes: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Ordre
                        </label>
                        <input
                          type="number"
                          value={modules[editingModule].order_index}
                          onChange={(e) =>
                            updateModule(editingModule, {
                              order_index: Number(e.target.value),
                            })
                          }
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Transcription / Contenu texte
                      </label>
                      <textarea
                        value={modules[editingModule].transcript}
                        onChange={(e) =>
                          updateModule(editingModule, { transcript: e.target.value })
                        }
                        rows={6}
                        placeholder="Contenu du module, notes, ressources..."
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Exercises */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Exercices & Quiz ({modules[editingModule].exercise_data.length})
                        </label>
                        <button
                          onClick={() => addExercise(editingModule)}
                          className="text-[10px] font-black text-brand-primary flex items-center gap-1 hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Ajouter une question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {modules[editingModule].exercise_data.map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group"
                          >
                            <button
                              onClick={() => {
                                setModules((prev) =>
                                  prev.map((m, i) =>
                                    i === editingModule
                                      ? {
                                          ...m,
                                          exercise_data: m.exercise_data.filter(
                                            (_, ei) => ei !== exIdx
                                          ),
                                        }
                                      : m
                                  )
                                );
                              }}
                              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={ex.question}
                                placeholder="La question ?"
                                onChange={(e) => {
                                  setModules((prev) =>
                                    prev.map((m, i) =>
                                      i === editingModule
                                        ? {
                                            ...m,
                                            exercise_data: m.exercise_data.map((ex2, ei) =>
                                              ei === exIdx
                                                ? { ...ex2, question: e.target.value }
                                                : ex2
                                            ),
                                          }
                                        : m
                                    )
                                  );
                                }}
                                className="w-full bg-transparent border-b border-slate-200 py-1 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                {ex.options.map((opt, oIdx) => (
                                  <input
                                    key={oIdx}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      setModules((prev) =>
                                        prev.map((m, i) =>
                                          i === editingModule
                                            ? {
                                                ...m,
                                                exercise_data: m.exercise_data.map((ex2, ei) =>
                                                  ei === exIdx
                                                    ? {
                                                        ...ex2,
                                                        options: ex2.options.map((o, oi) =>
                                                          oi === oIdx ? e.target.value : o
                                                        ),
                                                      }
                                                    : ex2
                                                ),
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                    className={`px-3 py-2 rounded-lg text-[10px] border transition-all ${
                                      ex.correct_answer === opt
                                        ? "bg-green-50 border-green-200 text-green-700 font-bold"
                                        : "bg-white border-slate-100 text-slate-900"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="flex gap-2 items-center">
                                <select
                                  value={ex.correct_answer}
                                  onChange={(e) => {
                                    setModules((prev) =>
                                      prev.map((m, i) =>
                                        i === editingModule
                                          ? {
                                              ...m,
                                              exercise_data: m.exercise_data.map((ex2, ei) =>
                                                ei === exIdx
                                                  ? { ...ex2, correct_answer: e.target.value }
                                                  : ex2
                                              ),
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                  className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-900"
                                >
                                  {ex.options.map((opt, i) => (
                                    <option key={i} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-slate-400">= Bonne réponse</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="font-bold text-slate-400">
                    Sélectionnez un module pour l'éditer
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs">
                    Ajoutez du contenu vidéo, des textes et des quiz pour enrichir votre formation.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* ── Tab: Students ── */}
      {tab === "students" && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px] gap-6">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900">Suivi des étudiants</h3>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Consultez la progression et les inscriptions à cette formation.
            </p>
          </div>
          <Link
            href={`/coach/formations/${id}/students`}
            className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
          >
            <Users className="w-5 h-5" />
            Voir le tableau de bord étudiants
          </Link>
        </div>
      )}
    </div>
  );
}
