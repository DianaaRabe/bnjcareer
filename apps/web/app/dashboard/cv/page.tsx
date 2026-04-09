"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud, FileText, CheckCircle, BrainCircuit,
  Download, Trash2, Plus, Pencil, X, ChevronDown, ChevronUp,
} from "lucide-react";

interface CvExperience {
  title: string; company: string; period: string; missions: string[];
}
interface CvFormation {
  title: string; school: string; year: string;
}
interface CvData {
  firstName?: string; lastName?: string; email?: string; phone?: string;
  title?: string; description?: string; linkedinurl?: string;
  experiences?: CvExperience[]; formations?: CvFormation[]; tools?: string[];
}

export default function CvPage() {
  const [step, setStep] = useState<"upload" | "analyzing" | "edit" | "preview">("upload");
  const [cv, setCv] = useState<CvData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStep("analyzing");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("https://cv-encryptor.onrender.com/api/extract-cv-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur API");
      const data: CvData = await res.json();
      setCv(data);
      localStorage.setItem("user_cv_parsed", JSON.stringify(data));
      setStep("edit");
    } catch {
      alert("Erreur lors de l'analyse du CV. Vérifiez que le fichier est un PDF valide.");
      setStep("upload");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handlePrint = () => window.print();

  const updateField = (field: keyof CvData, value: any) => {
    setCv((prev) => prev ? { ...prev, [field]: value } : prev);
  };

  const removeExp = (i: number) => {
    setCv((prev) => prev ? { ...prev, experiences: prev.experiences?.filter((_, idx) => idx !== i) } : prev);
  };

  const removeTool = (t: string) => {
    setCv((prev) => prev ? { ...prev, tools: prev.tools?.filter((tool) => tool !== t) } : prev);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Mon CV</h1>
        <p className="text-slate-500 text-sm mt-1">Analysez, éditez et exportez votre CV grâce à l'IA</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-2">
        {["Importer", "Analyse IA", "Éditer", "Exporter"].map((label, i) => {
          const stepIndex = ["upload", "analyzing", "edit", "preview"].indexOf(step);
          const done = stepIndex > i;
          const active = stepIndex === i;
          return (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-1.5 ${active ? "text-brand-primary" : done ? "text-green-600" : "text-slate-400"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  done ? "border-green-500 bg-green-50" : active ? "border-brand-primary bg-brand-100" : "border-slate-200 bg-white"
                }`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 rounded ${done || active ? "bg-brand-light" : "bg-slate-200"}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Upload */}
      {step === "upload" && (
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleUpload}>
            <div
              className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragOver ? "border-brand-primary bg-brand-100" : "border-slate-200 bg-white hover:border-brand-light hover:bg-brand-100/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8 text-brand-primary" />
              </div>
              <p className="text-base font-bold text-slate-800 mb-1">
                {file ? file.name : "Glissez ou cliquez pour importer votre CV"}
              </p>
              <p className="text-sm text-slate-400">PDF, DOC, DOCX — Max 10 Mo</p>
            </div>
            {file && (
              <button type="submit"
                className="mt-4 w-full py-4 bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold rounded-2xl shadow-lg shadow-brand-primary/30 hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                Analyser avec l'IA
              </button>
            )}
          </form>
        </div>
      )}

      {/* Analyzing */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
              <BrainCircuit className="w-10 h-10 text-brand-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-brand-light border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Analyse en cours...</h2>
          <p className="text-slate-500 max-w-sm">Notre IA extrait vos expériences, compétences et formations depuis votre CV</p>
        </div>
      )}

      {/* Edit */}
      {step === "edit" && cv && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              CV extrait avec succès
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep("upload")}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Recommencer
              </button>
              <button onClick={handlePrint}
                className="px-4 py-2 text-sm font-bold bg-brand-primary text-white rounded-xl hover:bg-brand-dark transition-colors flex items-center gap-1.5 shadow">
                <Download className="w-4 h-4" /> Exporter PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Infos personnelles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" /> Informations personnelles
              </h2>
              <div className="space-y-3">
                {(["firstName", "lastName", "email", "phone", "title"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                      {field === "firstName" ? "Prénom" : field === "lastName" ? "Nom" : field === "email" ? "Email" : field === "phone" ? "Téléphone" : "Titre"}
                    </label>
                    <input
                      value={cv[field] || ""}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Résumé</label>
                  <textarea
                    rows={3}
                    value={cv.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Compétences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="font-bold text-slate-900 mb-4">Compétences & Outils</h2>
              <div className="flex flex-wrap gap-2">
                {cv.tools?.map((tool) => (
                  <div key={tool} className="flex items-center gap-1.5 bg-brand-100 text-brand-primary px-3 py-1.5 rounded-full text-xs font-semibold group">
                    {tool}
                    <button onClick={() => removeTool(tool)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button className="flex items-center gap-1 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-200 transition-colors">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>

              {/* Formations */}
              <h2 className="font-bold text-slate-900 mt-6 mb-4">Formations</h2>
              <div className="space-y-3">
                {cv.formations?.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-800">{f.title}</p>
                    <p className="text-xs text-slate-500">{f.school} — {f.year}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expériences */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Expériences professionnelles</h2>
              <span className="text-xs text-slate-400">{cv.experiences?.length || 0} expérience(s)</span>
            </div>
            <div className="space-y-3">
              {cv.experiences?.map((exp, i) => (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                    onClick={() => setExpandedExp(expandedExp === i ? null : i)}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                      <p className="text-xs text-slate-500">{exp.company} · {exp.period}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); removeExp(i); }} className="text-slate-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedExp === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedExp === i && (
                    <div className="px-4 pb-4 space-y-2">
                      {exp.missions.map((m, j) => (
                        <div key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
