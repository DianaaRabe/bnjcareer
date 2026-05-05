"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  FileText,
  GraduationCap,
  CheckCircle2,
  Lock,
  Loader2,
  Menu,
  X,
  Trophy,
  Video,
  PenTool,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  transcript: string | null;
  exercise_data: any[];
  duration_minutes: number | null;
  order_index: number;
}

interface Formation {
  id: string;
  title: string;
  formation_modules: Module[];
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const formationId = params.id as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, any>>({});
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false);
  const [exerciseScore, setExerciseScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, pRes] = await Promise.all([
          fetch(`/api/formations/${formationId}`),
          fetch(`/api/formations/${formationId}/progress`),
        ]);

        const fData = await fRes.json();
        const pData = await pRes.json();

        if (fData.formation) {
          setFormation(fData.formation);
          const firstModule = fData.formation.formation_modules[0];
          setCurrentModule(firstModule);
        }

        if (pData.progress) setProgress(pData.progress);
        if (pData.enrollment) setEnrollment(pData.enrollment);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formationId]);

  const handleModuleClick = (mod: Module) => {
    setCurrentModule(mod);
    setShowExercise(false);
    setExerciseAnswers({});
    setExerciseSubmitted(false);
    setExerciseScore(null);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const isModuleCompleted = (moduleId: string) => {
    return progress.some((p) => p.module_id === moduleId && p.completed);
  };

  const handleCompleteModule = async () => {
    if (!currentModule || !formation) return;
    setSavingProgress(true);

    try {
      let score = null;
      if (currentModule.exercise_data && currentModule.exercise_data.length > 0) {
        // Simple score calculation for QCM
        let correct = 0;
        currentModule.exercise_data.forEach((q, idx) => {
          if (exerciseAnswers[idx] === q.correct_answer) correct++;
        });
        score = Math.round((correct / currentModule.exercise_data.length) * 100);
        setExerciseScore(score);
        setExerciseSubmitted(true);
      }

      const res = await fetch(`/api/formations/${formationId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: currentModule.id,
          exercise_score: score,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update local progress
        setProgress((prev) => {
          const existing = prev.find((p) => p.module_id === currentModule.id);
          if (existing) {
            return prev.map((p) =>
              p.module_id === currentModule.id ? { ...p, completed: true, exercise_score: score } : p
            );
          }
          return [...prev, { module_id: currentModule.id, completed: true, exercise_score: score }];
        });
        
        if (data.is_completed) {
          setEnrollment((prev: any) => ({ ...prev, progress_pct: 100, has_badge: true }));
        } else {
          setEnrollment((prev: any) => ({ ...prev, progress_pct: data.progress_pct }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  const goToNextModule = () => {
    if (!formation || !currentModule) return;
    const currentIndex = formation.formation_modules.findIndex((m) => m.id === currentModule.id);
    if (currentIndex < formation.formation_modules.length - 1) {
      handleModuleClick(formation.formation_modules[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Initialisation de votre espace d'apprentissage...</p>
      </div>
    );
  }

  if (!formation || !currentModule) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] lg:h-screen bg-slate-50 overflow-hidden relative">
      {/* Mobile Sidebar Toggle */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden"
        } fixed lg:relative z-40 w-80 h-full bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shrink-0`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-primary rounded-lg text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-slate-900 text-sm line-clamp-1">{formation.title}</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Votre progression</p>
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">
              {enrollment?.progress_pct || 0}%
            </p>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-500"
              style={{ width: `${enrollment?.progress_pct || 0}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {formation.formation_modules.map((mod, i) => {
            const active = currentModule.id === mod.id;
            const completed = isModuleCompleted(mod.id);
            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                className={`w-full flex items-start gap-4 p-4 transition-all border-b border-slate-50 group text-left ${
                  active ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors ${
                    completed
                      ? "bg-green-100 text-green-600"
                      : active
                      ? "bg-brand-primary text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold transition-colors line-clamp-2 ${
                      active ? "text-brand-primary" : "text-slate-700"
                    }`}
                  >
                    {mod.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-400 font-medium">
                      {mod.duration_minutes ? `${mod.duration_minutes} min` : "Leçon"}
                    </p>
                  </div>
                </div>
                {active && <ChevronRight className="w-4 h-4 text-brand-primary" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Learning Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/formations/${formationId}`)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
              title="Sortir de la formation"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leçon en cours</p>
              <h3 className="text-xs font-bold text-slate-800 truncate max-w-md">{currentModule.title}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              Programme
            </button>
            <button
              onClick={() => router.push("/dashboard/formations")}
              className="flex items-center gap-2 px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Quitter
            </button>
          </div>
        </div>

        {/* Learning Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-5xl mx-auto w-full p-4 lg:p-8 space-y-8 pb-32">
            {/* Video Player Placeholder / YouTube */}
            <div className="aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white">
              {currentModule.video_url ? (
                <iframe
                  src={currentModule.video_url.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                  <PlayCircle className="w-20 h-20 mb-4" />
                  <p className="text-lg font-bold">Aucune vidéo pour ce module</p>
                </div>
              )}
            </div>

            {/* Tabs / Navigation inside content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex border-b border-slate-100 px-6">
                <button
                  onClick={() => setShowExercise(false)}
                  className={`px-4 py-4 text-xs font-bold border-b-2 transition-colors ${
                    !showExercise
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" /> Description & Transcription
                  </div>
                </button>
                {currentModule.exercise_data && currentModule.exercise_data.length > 0 && (
                  <button
                    onClick={() => setShowExercise(true)}
                    className={`px-4 py-4 text-xs font-bold border-b-2 transition-colors ${
                      showExercise
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> Exercices & Quiz
                    </div>
                  </button>
                )}
              </div>

              <div className="p-8">
                {!showExercise ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 mb-4">{currentModule.title}</h2>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {currentModule.description || "Ce module se concentre sur les concepts clés abordés dans la vidéo."}
                      </p>
                    </div>

                    {currentModule.transcript && (
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center gap-2 mb-4 text-slate-400">
                          <FileText className="w-4 h-4" />
                          <h4 className="text-[10px] font-bold uppercase tracking-widest">Transcription de la leçon</h4>
                        </div>
                        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                          "{currentModule.transcript}"
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-slate-900">Quiz d'évaluation</h2>
                      {exerciseScore !== null && (
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold ${
                          exerciseScore >= 70 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          Score: {exerciseScore}%
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {currentModule.exercise_data.map((q, qIdx) => (
                        <div key={qIdx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                          <p className="text-sm font-bold text-slate-800">
                            {qIdx + 1}. {q.question}
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt: string, oIdx: number) => {
                              const isSelected = exerciseAnswers[qIdx] === opt;
                              const isCorrect = q.correct_answer === opt;
                              let statusClass = "border-slate-200 hover:border-brand-primary/40 bg-white";
                              
                              if (exerciseSubmitted) {
                                if (isCorrect) statusClass = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
                                else if (isSelected && !isCorrect) statusClass = "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500";
                                else statusClass = "border-slate-100 opacity-50 bg-white";
                              } else if (isSelected) {
                                statusClass = "border-brand-primary bg-brand-50 text-brand-primary ring-1 ring-brand-primary";
                              }

                              return (
                                <button
                                  key={oIdx}
                                  disabled={exerciseSubmitted}
                                  onClick={() => setExerciseAnswers({ ...exerciseAnswers, [qIdx]: opt })}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${statusClass}`}
                                >
                                  {opt}
                                  {exerciseSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                </button>
                              );
                            })}
                          </div>
                          {exerciseSubmitted && q.explanation && (
                            <p className="text-[10px] text-slate-500 mt-2 italic bg-white p-2 rounded-lg border border-slate-100">
                              💡 {q.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl p-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const currentIndex = formation.formation_modules.findIndex((m) => m.id === currentModule.id);
                  if (currentIndex > 0) handleModuleClick(formation.formation_modules[currentIndex - 1]);
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all disabled:opacity-30"
                disabled={formation.formation_modules.findIndex((m) => m.id === currentModule.id) === 0}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNextModule}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all disabled:opacity-30"
                disabled={formation.formation_modules.findIndex((m) => m.id === currentModule.id) === formation.formation_modules.length - 1}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleCompleteModule}
              disabled={savingProgress || isModuleCompleted(currentModule.id)}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-lg ${
                isModuleCompleted(currentModule.id)
                  ? "bg-green-500 text-white shadow-green-500/20"
                  : "bg-brand-primary text-white shadow-brand-primary/20 hover:scale-105 active:scale-95"
              } disabled:opacity-80`}
            >
              {savingProgress ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isModuleCompleted(currentModule.id) ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Terminé
                </>
              ) : (
                "Marquer comme terminé"
              )}
            </button>
            
            {isModuleCompleted(currentModule.id) && (
              <button
                onClick={goToNextModule}
                className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-2xl text-sm font-bold hover:bg-black transition-all group"
              >
                Suivant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Completion Modal / Sparkles when 100% */}
      {enrollment?.progress_pct === 100 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/90 backdrop-blur-md animate-in fade-in duration-700">
           <div className="bg-white rounded-[40px] p-12 max-w-lg w-full text-center space-y-6 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-accent via-brand-primary to-brand-accent" />
             <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Trophy className="w-12 h-12 text-brand-primary" />
             </div>
             <h2 className="text-3xl font-black text-slate-900">Félicitations !</h2>
             <p className="text-slate-500 font-medium leading-relaxed">
               Vous avez terminé avec succès la formation <span className="font-bold text-brand-primary">{formation.title}</span>.
             </p>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                <div className="flex items-center justify-center gap-2 text-brand-primary font-bold">
                   <Sparkles className="w-5 h-5" />
                   Certification obtenue
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
                  Vous pouvez maintenant débloquer votre certificat PDF officiel BNJ Skills Maker ou arborer votre nouveau badge sur votre profil.
                </p>
             </div>
             <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => router.push(`/dashboard/subscriptions`)}
                  className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
                >
                  DÉBLOQUER MON CERTIFICAT PDF
                </button>
                <button
                  onClick={() => router.push("/dashboard/formations")}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Retour au catalogue
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
