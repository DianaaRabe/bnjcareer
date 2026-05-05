"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Video,
  FileText,
  PenTool,
  CheckCircle2,
  BookOpen,
  Settings,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

interface Exercise {
  type: "qcm" | "open";
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Module {
  title: string;
  description: string;
  video_url: string;
  transcript: string;
  duration_minutes: number;
  exercise_data: Exercise[];
}

interface Milestone {
  title: string;
  description: string;
}

export default function CreateFormationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Entretien",
    level: "débutant",
    duration_label: "",
    price: 0,
    max_students: 0,
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Module Editor State
  const [editingModule, setEditingModule] = useState<number | null>(null);

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: `Module ${modules.length + 1}`,
        description: "",
        video_url: "",
        transcript: "",
        duration_minutes: 10,
        exercise_data: [],
      },
    ]);
    setEditingModule(modules.length);
  };

  const removeModule = (idx: number) => {
    setModules(modules.filter((_, i) => i !== idx));
    if (editingModule === idx) setEditingModule(null);
  };

  const updateModule = (idx: number, data: Partial<Module>) => {
    setModules(modules.map((m, i) => (i === idx ? { ...m, ...data } : m)));
  };

  const addExercise = (modIdx: number) => {
    const updatedModules = [...modules];
    updatedModules[modIdx].exercise_data.push({
      type: "qcm",
      question: "",
      options: ["Option A", "Option B"],
      correct_answer: "Option A",
      explanation: "",
    });
    setModules(updatedModules);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          modules,
          milestones,
        }),
      });

      if (res.ok) {
        router.push("/coach/formations");
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de la création");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold"
        >
          <ChevronLeft className="w-5 h-5" /> Retour
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-all ${
                step >= i ? "bg-brand-primary" : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900">Nouvelle Formation</h1>
              <p className="text-slate-500 font-medium">Commencez par définir les informations de base de votre programme.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Titre de la formation</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Maîtriser l'entretien d'embauche technique"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez ce que les candidats vont apprendre..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none appearance-none"
                >
                  <option>Entretien</option>
                  <option>CV</option>
                  <option>Reconversion</option>
                  <option>Soft Skills</option>
                  <option>Technique</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Niveau</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none appearance-none"
                >
                  <option value="débutant">Débutant</option>
                  <option value="intermédiaire">Intermédiaire</option>
                  <option value="avancé">Avancé</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Prix (€)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                />
                <p className="text-[10px] text-slate-400 font-bold px-2">0 = Gratuit</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Durée estimée</label>
                <input
                  type="text"
                  value={formData.duration_label}
                  onChange={(e) => setFormData({ ...formData, duration_label: e.target.value })}
                  placeholder="Ex: 30 jours, 6 semaines..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                ÉTAPE SUIVANTE : MODULES
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Modules */}
        {step === 2 && (
          <div className="flex flex-col lg:flex-row min-h-[600px] animate-in fade-in duration-500">
            {/* Module List Sidebar */}
            <aside className="lg:w-80 border-r border-slate-100 p-8 space-y-6 shrink-0 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Modules ({modules.length})</h3>
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
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      editingModule === i ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold truncate">{m.title}</span>
                  </button>
                ))}
                <button
                  onClick={addModule}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-50 transition-all text-xs font-bold"
                >
                  <Plus className="w-4 h-4" /> Ajouter un module
                </button>
              </div>

              <div className="pt-8 border-t border-slate-200 mt-auto">
                 <button
                   onClick={() => setStep(3)}
                   disabled={modules.length === 0}
                   className="w-full py-4 bg-brand-dark text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                   Valider le programme
                 </button>
                 <button onClick={() => setStep(1)} className="w-full py-4 text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors">
                   Retour
                 </button>
              </div>
            </aside>

            {/* Editor Area */}
            <main className="flex-1 p-10 bg-white min-h-[600px] relative">
              {editingModule !== null ? (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Édition du Module {editingModule + 1}</h2>
                    <button
                      onClick={() => removeModule(editingModule!)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre du module</label>
                      <input
                        type="text"
                        value={modules[editingModule].title}
                        onChange={(e) => updateModule(editingModule, { title: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lien Vidéo (YouTube/Vimeo)</label>
                      <div className="relative">
                         <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input
                           type="text"
                           value={modules[editingModule].video_url}
                           onChange={(e) => updateModule(editingModule, { video_url: e.target.value })}
                           placeholder="https://youtube.com/watch?v=..."
                           className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none"
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transcription / Contenu texte</label>
                      <textarea
                        value={modules[editingModule].transcript}
                        onChange={(e) => updateModule(editingModule, { transcript: e.target.value })}
                        rows={6}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exercices & Quiz</label>
                          <button
                            onClick={() => addExercise(editingModule)}
                            className="text-[10px] font-black text-brand-primary flex items-center gap-1 hover:underline"
                          >
                            <Plus className="w-3 h-3" /> Ajouter une question
                          </button>
                       </div>
                       
                       <div className="space-y-4">
                          {modules[editingModule].exercise_data.map((ex, exIdx) => (
                             <div key={exIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                <button
                                  onClick={() => {
                                    const updated = [...modules];
                                    updated[editingModule].exercise_data.splice(exIdx, 1);
                                    setModules(updated);
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
                                        const updated = [...modules];
                                        updated[editingModule].exercise_data[exIdx].question = e.target.value;
                                        setModules(updated);
                                     }}
                                     className="w-full bg-transparent border-b border-slate-200 py-1 text-xs font-bold outline-none"
                                   />
                                   <div className="grid grid-cols-2 gap-2">
                                      {ex.options.map((opt, oIdx) => (
                                         <input
                                           key={oIdx}
                                           type="text"
                                           value={opt}
                                           onChange={(e) => {
                                              const updated = [...modules];
                                              updated[editingModule].exercise_data[exIdx].options[oIdx] = e.target.value;
                                              setModules(updated);
                                           }}
                                           className={`px-3 py-2 rounded-lg text-[10px] border transition-all ${
                                             ex.correct_answer === opt ? "bg-green-50 border-green-200 text-green-700 font-bold" : "bg-white border-slate-100"
                                           }`}
                                         />
                                      ))}
                                   </div>
                                   <div className="flex gap-2">
                                      <select
                                        value={ex.correct_answer}
                                        onChange={(e) => {
                                           const updated = [...modules];
                                           updated[editingModule].exercise_data[exIdx].correct_answer = e.target.value;
                                           setModules(updated);
                                        }}
                                        className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1"
                                      >
                                         {ex.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                      </select>
                                      <p className="text-[10px] text-slate-400 self-center">Correction</p>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-200" />
                   </div>
                   <h3 className="font-bold text-slate-400">Sélectionnez un module pour l'éditer</h3>
                   <p className="text-xs text-slate-300 max-w-xs">Ajoutez du contenu vidéo, des textes et des quiz pour enrichir votre formation.</p>
                </div>
              )}
            </main>
          </div>
        )}

        {/* Step 3: Finalize */}
        {step === 3 && (
          <div className="p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">Prêt à publier ?</h2>
                <p className="text-slate-500 font-medium">Récapitulatif de votre formation avant la mise en ligne.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Général</h4>
                   <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-800">{formData.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-3">{formData.description}</p>
                   </div>
                   <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-600">{formData.category}</span>
                      <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-600 capitalize">{formData.level}</span>
                      <span className="px-3 py-1 bg-brand-primary text-white rounded-full text-[10px] font-bold">{formData.price}€</span>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structure</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <Video className="w-4 h-4 text-brand-primary" />
                         <p className="text-sm font-bold text-slate-700">{modules.length} Modules Vidéo</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <PenTool className="w-4 h-4 text-brand-primary" />
                         <p className="text-sm font-bold text-slate-700">{modules.reduce((acc, m) => acc + m.exercise_data.length, 0)} Exercices interactifs</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <Sparkles className="w-4 h-4 text-brand-primary" />
                         <p className="text-sm font-bold text-slate-700">Accès Certifications</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-8 max-w-md mx-auto space-y-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                       CRÉER LA FORMATION
                       <GraduationCap className="w-6 h-6" />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors"
                >
                  Revenir aux modules
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
