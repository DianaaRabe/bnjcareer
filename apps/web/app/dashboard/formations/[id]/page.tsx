"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Lock,
  Calendar,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Trophy,
  FileText,
} from "lucide-react";

interface Module {
  id: string;
  title: string;
  duration_minutes: number | null;
  order_index: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
}

interface Formation {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_label: string | null;
  price: number;
  level: string;
  category: string | null;
  modules_count: number;
  coach_id: string;
  profiles: { first_name: string; last_name: string; avatar_url: string | null } | null;
  formation_modules: Module[];
  formation_milestones: Milestone[];
}

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, eRes] = await Promise.all([
          fetch(`/api/formations/${id}`),
          fetch(`/api/formations/${id}/enroll`),
        ]);

        const fData = await fRes.json();
        const eData = await eRes.json();

        if (fData.formation) setFormation(fData.formation);
        if (eData.enrolled) {
          setEnrolled(true);
          setEnrollment(eData.enrollment);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await fetch(`/api/formations/${id}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setEnrolled(true);
        setEnrollment(data.enrollment);
        router.push(`/dashboard/formations/${id}/learn`);
      } else {
        alert(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Chargement de la formation...</p>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Formation non trouvée</h1>
        <button onClick={() => router.back()} className="mt-4 text-brand-primary font-bold">
          Retourner aux formations
        </button>
      </div>
    );
  }

  const coachName = formation.profiles
    ? `${formation.profiles.first_name} ${formation.profiles.last_name}`
    : "Coach BNJ";

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/dashboard/formations")}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-colors text-sm font-semibold"
      >
        <ChevronLeft className="w-4 h-4" />
        Toutes les formations
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-64 sm:h-80 bg-brand-dark relative overflow-hidden">
              {formation.thumbnail_url ? (
                <img
                  src={formation.thumbnail_url}
                  alt={formation.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GraduationCap className="w-24 h-24 text-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
                </div>
              )}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {formation.category || "Formation"}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20">
                    Niveau {formation.level}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {formation.title}
                </h1>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-6 mb-8 py-4 border-y border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formatteur</p>
                    <p className="text-sm font-bold text-slate-800">{coachName}</p>
                  </div>
                </div>
                {formation.duration_label && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durée</p>
                      <p className="text-sm font-bold text-slate-800">{formation.duration_label}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Modules</p>
                    <p className="text-sm font-bold text-slate-800">{formation.modules_count} leçons</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-3">À propos de cette formation</h2>
                  <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {formation.description || "Aucune description fournie."}
                  </div>
                </div>

                {formation.formation_milestones.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Ce que vous allez apprendre</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formation.formation_milestones.map((ms) => (
                        <div key={ms.id} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                          <p className="text-sm text-slate-700 font-medium">{ms.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Curriculum */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Programme de la formation</h2>
            <div className="space-y-3">
              {formation.formation_modules.map((mod, i) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{mod.title}</p>
                      {mod.duration_minutes && (
                        <p className="text-[10px] text-slate-400 font-medium">Vidéo • {mod.duration_minutes} min</p>
                      )}
                    </div>
                  </div>
                  {!enrolled ? (
                    <Lock className="w-4 h-4 text-slate-300" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-brand-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sticky top-8">
            <div className="mb-6">
              {formation.price === 0 ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-green-600">Gratuit</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{formation.price}€</span>
                  <span className="text-slate-400 text-sm font-medium">paiement unique</span>
                </div>
              )}
            </div>

            {enrolled ? (
              <div className="space-y-4">
                <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-bold text-brand-primary">VOTRE PROGRESSION</p>
                    <p className="text-xs font-bold text-brand-primary">{enrollment.progress_pct}%</p>
                  </div>
                  <div className="h-2 bg-brand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary"
                      style={{ width: `${enrollment.progress_pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/formations/${id}/learn`)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20"
                >
                  Continuer l'apprentissage
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                >
                  {enrolling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      S'inscrire maintenant
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Accès à vie • Certificat de fin de formation inclus
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <p className="text-xs font-bold text-slate-800 mb-2">Cette formation inclut :</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <PlayCircle className="w-4 h-4 text-brand-primary" />
                  <span>{formation.modules_count} leçons vidéo HD</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span>Transcriptions & ressources PDF</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  <span>Exercices et tests d'évaluation</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Trophy className="w-4 h-4 text-brand-primary" />
                  <span>Accès aux certifications BNJ</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  <span>Accès flexible 24h/24, 7j/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


