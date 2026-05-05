"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Brain,
  Shield,
  Zap,
  FileSearch,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import JobCVComparisonModal from "./JobCVComparisonModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobData {
  title: string;
  company?: string;
  description: string;
  url?: string;
  requirements?: string[];
}

interface MatchAnalysis {
  score: number;
  verdict?: string;
  reasons?: string[];
}

interface Improvement {
  type: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface JobCVVersion {
  id: string;
  job_title: string;
  job_company?: string;
  optimized_html: string;
  improvements: Improvement[];
  match_summary: string;
  match_score_before?: number;
  status: string;
  created_at: string;
}

interface JobCVOptimizerProps {
  job: JobData;
  matchAnalysis?: MatchAnalysis;
  currentCvHtml?: string;
  onComplete?: (version: JobCVVersion) => void;
  /** If true, starts optimization automatically on mount */
  autoStart?: boolean;
  /** Called when the version is ready (separate from onComplete for more control) */
  onVersionReady?: (version: JobCVVersion) => void;
}

// ── Processing Steps ──────────────────────────────────────────────────────────

const OPTIMIZATION_STEPS = [
  {
    icon: FileSearch,
    label: "Analyse du poste cible",
    desc: "Extraction des mots-clés et compétences requises",
  },
  {
    icon: Target,
    label: "Comparaison profil / offre",
    desc: "Identification des points forts et des gaps",
  },
  {
    icon: Brain,
    label: "Optimisation IA ciblée",
    desc: "Adaptation du CV pour ce poste spécifique",
  },
  {
    icon: Shield,
    label: "Vérification ATS",
    desc: "Contrôle des mots-clés et du formatage",
  },
  {
    icon: Zap,
    label: "Génération du CV ciblé",
    desc: "Mise en forme finale optimisée",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function JobCVOptimizer({
  job,
  matchAnalysis,
  currentCvHtml,
  onComplete,
  autoStart = false,
  onVersionReady,
}: JobCVOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [error, setError] = useState("");
  const [version, setVersion] = useState<JobCVVersion | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Advance step animation during optimization
  useEffect(() => {
    if (!isOptimizing) return;
    const interval = setInterval(() => {
      setOptimizationStep((prev) => {
        if (prev < OPTIMIZATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isOptimizing]);

  // Auto-start optimization when autoStart is true
  useEffect(() => {
    if (autoStart && !isOptimizing && !version && !error) {
      handleOptimize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationStep(0);
    setError("");
    setVersion(null);

    try {
      // Get CV data from localStorage
      const savedCv = localStorage.getItem("user_cv_parsed");
      if (!savedCv) {
        setError(
          "Aucune donnée CV trouvée. Veuillez d'abord uploader et analyser votre CV dans l'onglet Mon CV."
        );
        setIsOptimizing(false);
        return;
      }

      const cvData = JSON.parse(savedCv);

      const response = await fetch("/api/cv-optimize-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvData,
          job,
          matchAnalysis: matchAnalysis || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "L'optimisation a échoué");
      }

      const result = await response.json();

      if (result.success && result.version) {
        setVersion(result.version);
        setShowModal(true);
        onComplete?.(result.version);
        onVersionReady?.(result.version);
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err: any) {
      console.error("Job CV optimization error:", err);
      setError(
        err.message || "Une erreur est survenue lors de l'optimisation."
      );
    } finally {
      setIsOptimizing(false);
      setOptimizationStep(0);
    }
  };

  return (
    <>
      {/* ── Trigger Button ───────────────────────────────────────────── */}
      {!isOptimizing && !error && (
        <button
          onClick={handleOptimize}
          className="w-full py-4 bg-gradient-to-r from-brand-primary to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 text-brand-accent group-hover:animate-pulse" />
          Optimiser mon CV pour ce poste
        </button>
      )}

      {/* ── Processing Animation ─────────────────────────────────────── */}
      {isOptimizing && (
        <div className="bg-gradient-to-br from-brand-dark via-brand-primary to-purple-600 rounded-2xl p-8 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-brand-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Optimisation ciblée en cours
                </h3>
                <p className="text-white/50 text-sm">
                  Adaptation de votre CV pour « {job.title} »
                  {job.company ? ` chez ${job.company}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {OPTIMIZATION_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === optimizationStep;
                const isDone = idx < optimizationStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-500 ${
                      isActive
                        ? "bg-white/15 backdrop-blur-sm scale-[1.02]"
                        : isDone
                        ? "bg-white/5 opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? "bg-brand-accent text-brand-dark"
                          : isDone
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isActive ? (
                        <StepIcon className="w-4 h-4 animate-pulse" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-bold ${
                          isActive ? "text-white" : "text-white/60"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p
                        className={`text-xs ${
                          isActive ? "text-white/70" : "text-white/30"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                    {isActive && (
                      <div className="ml-auto">
                        <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-5 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-accent to-yellow-300 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${((optimizationStep + 1) / OPTIMIZATION_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">
              Erreur d'optimisation
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={handleOptimize}
              className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ── Success indicator (when modal is closed) ─────────────────── */}
      {version && !showModal && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-800">
                CV optimisé disponible
              </p>
              <p className="text-xs text-green-600">
                {version.improvements.length} améliorations pour « {job.title} »
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Voir le résultat
          </button>
        </div>
      )}

      {/* ── Comparison Modal ─────────────────────────────────────────── */}
      {showModal && version && (
        <JobCVComparisonModal
          version={version}
          currentCvHtml={currentCvHtml}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
