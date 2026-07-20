"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
  Save,
  RotateCcw,
  Briefcase,
  GraduationCap,
  Wrench,
  User,
  X,
  CheckCircle2,
} from "lucide-react";

// ── Structured CV shape (matches the cv-encryptor service output) ───────────
export interface CVExperience {
  title: string;
  company: string;
  period: string;
  missions: string[];
}
export interface CVFormation {
  title: string;
  school: string;
  year: string;
}
export interface CVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  description: string;
  experiences: CVExperience[];
  formations: CVFormation[];
  tools: string[];
}

// Normalize an arbitrary parsed object into the full CVData shape so every
// field is safely editable (never undefined-crashing a controlled input).
export function normalizeCVData(raw: any): CVData {
  return {
    firstName: raw?.firstName ?? "",
    lastName: raw?.lastName ?? "",
    email: raw?.email ?? "",
    phone: raw?.phone ?? "",
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    experiences: Array.isArray(raw?.experiences)
      ? raw.experiences.map((x: any) => ({
          title: x?.title ?? "",
          company: x?.company ?? "",
          period: x?.period ?? "",
          missions: Array.isArray(x?.missions)
            ? x.missions.map((m: any) => String(m ?? ""))
            : [],
        }))
      : [],
    formations: Array.isArray(raw?.formations)
      ? raw.formations.map((f: any) => ({
          title: f?.title ?? "",
          school: f?.school ?? "",
          year: f?.year ?? "",
        }))
      : [],
    tools: Array.isArray(raw?.tools)
      ? raw.tools.map((t: any) => String(t ?? "")).filter(Boolean)
      : [],
  };
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition";

const labelCls = "text-xs font-semibold text-slate-500 mb-1 block";

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-bold text-slate-800">{children}</h4>
    </div>
  );
}

export default function CVEditor({
  initialData,
  onSave,
}: {
  initialData: CVData;
  onSave: (data: CVData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<CVData>(initialData);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [toolInput, setToolInput] = useState("");

  // Re-sync when a fresh CV is parsed upstream (only while there are no
  // unsaved edits, to avoid clobbering the user's in-progress changes).
  useEffect(() => {
    if (!dirty) setDraft(initialData);
  }, [initialData, dirty]);

  const patch = (changes: Partial<CVData>) => {
    setDraft((d) => ({ ...d, ...changes }));
    setDirty(true);
    setJustSaved(false);
  };

  // ── Experiences ──────────────────────────────────────────────────────────
  const updateExp = (i: number, changes: Partial<CVExperience>) =>
    patch({
      experiences: draft.experiences.map((x, idx) =>
        idx === i ? { ...x, ...changes } : x
      ),
    });
  const addExp = () =>
    patch({
      experiences: [
        ...draft.experiences,
        { title: "", company: "", period: "", missions: [""] },
      ],
    });
  const removeExp = (i: number) =>
    patch({ experiences: draft.experiences.filter((_, idx) => idx !== i) });
  const updateMission = (ei: number, mi: number, value: string) =>
    updateExp(ei, {
      missions: draft.experiences[ei].missions.map((m, idx) =>
        idx === mi ? value : m
      ),
    });
  const addMission = (ei: number) =>
    updateExp(ei, { missions: [...draft.experiences[ei].missions, ""] });
  const removeMission = (ei: number, mi: number) =>
    updateExp(ei, {
      missions: draft.experiences[ei].missions.filter((_, idx) => idx !== mi),
    });

  // ── Formations ───────────────────────────────────────────────────────────
  const updateEdu = (i: number, changes: Partial<CVFormation>) =>
    patch({
      formations: draft.formations.map((f, idx) =>
        idx === i ? { ...f, ...changes } : f
      ),
    });
  const addEdu = () =>
    patch({
      formations: [...draft.formations, { title: "", school: "", year: "" }],
    });
  const removeEdu = (i: number) =>
    patch({ formations: draft.formations.filter((_, idx) => idx !== i) });

  // ── Tools ────────────────────────────────────────────────────────────────
  const addTool = () => {
    const v = toolInput.trim();
    if (!v || draft.tools.includes(v)) {
      setToolInput("");
      return;
    }
    patch({ tools: [...draft.tools, v] });
    setToolInput("");
  };
  const removeTool = (i: number) =>
    patch({ tools: draft.tools.filter((_, idx) => idx !== i) });

  const handleSave = () => {
    const cleaned: CVData = {
      ...draft,
      experiences: draft.experiences.map((x) => ({
        ...x,
        missions: x.missions.map((m) => m.trim()).filter(Boolean),
      })),
      tools: draft.tools.map((t) => t.trim()).filter(Boolean),
    };
    setDraft(cleaned);
    onSave(cleaned);
    setDirty(false);
    setJustSaved(true);
  };

  const handleReset = () => {
    setDraft(initialData);
    setDirty(false);
    setJustSaved(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900">Éditer les informations</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Corrigez ou complétez ce que l'IA a extrait avant l'optimisation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Modifications non enregistrées
            </span>
          )}
          {justSaved && !dirty && (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enregistré
            </span>
          )}
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-8 border-t border-slate-100 pt-6">
          {/* ── Personal info ─────────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={User}>Informations personnelles</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Prénom</label>
                <input
                  className={inputCls}
                  value={draft.firstName}
                  onChange={(e) => patch({ firstName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Nom</label>
                <input
                  className={inputCls}
                  value={draft.lastName}
                  onChange={(e) => patch({ lastName: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls}
                  value={draft.email}
                  onChange={(e) => patch({ email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Téléphone</label>
                <input
                  className={inputCls}
                  value={draft.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Titre / Poste visé</label>
                <input
                  className={inputCls}
                  value={draft.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Ex : Développeur Full-Stack"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Résumé professionnel</label>
                <textarea
                  className={`${inputCls} min-h-[80px] resize-y`}
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="2-3 phrases décrivant votre profil"
                />
              </div>
            </div>
          </section>

          {/* ── Experiences ───────────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={Briefcase}>
              Expériences professionnelles
            </SectionTitle>
            <div className="space-y-4">
              {draft.experiences.map((exp, ei) => (
                <div
                  key={ei}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-400">
                      Expérience {ei + 1}
                    </span>
                    <button
                      onClick={() => removeExp(ei)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Supprimer cette expérience"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Intitulé du poste</label>
                      <input
                        className={inputCls}
                        value={exp.title}
                        onChange={(e) =>
                          updateExp(ei, { title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Entreprise</label>
                      <input
                        className={inputCls}
                        value={exp.company}
                        onChange={(e) =>
                          updateExp(ei, { company: e.target.value })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Période</label>
                      <input
                        className={inputCls}
                        value={exp.period}
                        onChange={(e) =>
                          updateExp(ei, { period: e.target.value })
                        }
                        placeholder="Ex : Janvier 2023 — Présent"
                      />
                    </div>
                  </div>

                  {/* Missions */}
                  <div className="mt-3">
                    <label className={labelCls}>Missions / réalisations</label>
                    <div className="space-y-2">
                      {exp.missions.map((m, mi) => (
                        <div key={mi} className="flex items-start gap-2">
                          <textarea
                            className={`${inputCls} min-h-[38px] resize-y`}
                            value={m}
                            rows={1}
                            onChange={(e) =>
                              updateMission(ei, mi, e.target.value)
                            }
                          />
                          <button
                            onClick={() => removeMission(ei, mi)}
                            className="mt-1.5 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            title="Supprimer cette mission"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addMission(ei)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-dark"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter une mission
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addExp}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-primary bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une expérience
            </button>
          </section>

          {/* ── Formations ────────────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={GraduationCap}>Formations</SectionTitle>
            <div className="space-y-4">
              {draft.formations.map((edu, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-400">
                      Formation {i + 1}
                    </span>
                    <button
                      onClick={() => removeEdu(i)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Supprimer cette formation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Diplôme / Intitulé</label>
                      <input
                        className={inputCls}
                        value={edu.title}
                        onChange={(e) =>
                          updateEdu(i, { title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Établissement</label>
                      <input
                        className={inputCls}
                        value={edu.school}
                        onChange={(e) =>
                          updateEdu(i, { school: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Année</label>
                      <input
                        className={inputCls}
                        value={edu.year}
                        onChange={(e) => updateEdu(i, { year: e.target.value })}
                        placeholder="Ex : 2020 — 2023"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addEdu}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-primary bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une formation
            </button>
          </section>

          {/* ── Tools / skills ────────────────────────────────────────────── */}
          <section>
            <SectionTitle icon={Wrench}>Compétences & outils</SectionTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              {draft.tools.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-brand-50 text-brand-primary text-sm font-medium"
                >
                  {t}
                  <button
                    onClick={() => removeTool(i)}
                    className="hover:text-brand-dark"
                    title="Retirer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {draft.tools.length === 0 && (
                <span className="text-sm text-slate-400">
                  Aucune compétence pour le moment.
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTool();
                  }
                }}
                placeholder="Ex : React, Excel, Gestion de projet…"
              />
              <button
                onClick={addTool}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition-colors shrink-0"
              >
                Ajouter
              </button>
            </div>
          </section>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleReset}
              disabled={!dirty}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-brand-primary to-brand-dark rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
