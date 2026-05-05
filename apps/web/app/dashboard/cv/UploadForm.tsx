"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle2,
  Sparkles,
  Loader2,
  Shield,
  Zap,
  Brain,
  FileSearch,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CVOptimizationView from "./CVOptimizationView";

// ── Optimization step definitions ─────────────────────────────────────────
const OPTIMIZATION_STEPS = [
  {
    icon: FileSearch,
    label: "Analyse du CV existant",
    desc: "Lecture de la structure et du contenu",
  },
  {
    icon: Brain,
    label: "Optimisation IA en cours",
    desc: "Réécriture ATS par intelligence artificielle",
  },
  {
    icon: Shield,
    label: "Vérification compatibilité ATS",
    desc: "Contrôle des mots-clés et du formatage",
  },
  {
    icon: Zap,
    label: "Génération du CV optimisé",
    desc: "Mise en forme finale et export",
  },
];

interface Improvement {
  category: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface OptimizationRecord {
  id: string;
  optimized_html: string;
  improvements: Improvement[];
  original_cv_url: string;
  status: string;
  created_at: string;
}

export default function UploadForm({
  userId,
  existingCV,
  latestOptimization,
}: {
  userId: string;
  existingCV: any;
  latestOptimization: OptimizationRecord | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationStep, setOptimizationStep] = useState(0);
  const [optimization, setOptimization] =
    useState<OptimizationRecord | null>(latestOptimization);
  const [optimizationError, setOptimizationError] = useState("");

  // Advance step animation during optimization
  useEffect(() => {
    if (!isOptimizing) return;
    const interval = setInterval(() => {
      setOptimizationStep((prev) => {
        if (prev < OPTIMIZATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isOptimizing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setMessage({ text: "", type: "" });
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("bnj-career")
      .upload(filePath, file);

    if (uploadError) {
      setMessage({
        text: "Erreur d'upload : " + uploadError.message,
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("bnj-career").getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("cvs").insert({
      user_id: userId,
      pdf_url: publicUrl,
      template: "default",
    });

    if (dbError) {
      setMessage({
        text: "Erreur BD : " + dbError.message,
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    // Launch CV extraction via API
    setMessage({
      text: "Fichier uploadé ! Analyse de votre profil en cours (patientez...)",
      type: "success",
    });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://cv-encryptor.onrender.com/api/extract-cv-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const jsonResponse = await res.json();
        const extractedData = jsonResponse.data || jsonResponse;
        localStorage.setItem(
          "user_cv_parsed",
          JSON.stringify(extractedData)
        );
        setMessage({
          text: "CV uploadé et analysé avec succès !",
          type: "success",
        });
      } else {
        console.error("Erreur d'analyse API", await res.text());
        setMessage({
          text: "CV sauvegardé, mais l'analyse IA a échoué. Veuillez réessayer l'analyse plus tard.",
          type: "error",
        });
      }
    } catch (apiError) {
      console.error("Exception lors de l'appel à l'API:", apiError);
      setMessage({
        text: "CV sauvegardé, mais la connexion à l'IA d'analyse a échoué.",
        type: "error",
      });
    }

    setFile(null);
    router.refresh();
    setIsLoading(false);
  };

  // ── Trigger ATS optimization ──────────────────────────────────────────
  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationStep(0);
    setOptimizationError("");
    setOptimization(null);

    try {
      // Get CV data from localStorage
      const savedCv = localStorage.getItem("user_cv_parsed");
      if (!savedCv) {
        setOptimizationError(
          "Aucune donnée CV trouvée. Veuillez d'abord uploader et analyser votre CV."
        );
        setIsOptimizing(false);
        return;
      }

      const cvData = JSON.parse(savedCv);

      const response = await fetch("/api/cv-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "L'optimisation a échoué"
        );
      }

      const result = await response.json();

      if (result.success && result.optimization) {
        setOptimization(result.optimization);
        router.refresh();
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err: any) {
      console.error("Optimization error:", err);
      setOptimizationError(
        err.message || "Une erreur est survenue lors de l'optimisation."
      );
    } finally {
      setIsOptimizing(false);
      setOptimizationStep(0);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* ── Existing CV Card ─────────────────────────────────────────────── */}
      {existingCV && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">CV Actuel</p>
                <p className="text-xs text-slate-500 text-ellipsis overflow-hidden max-w-[200px] sm:max-w-xs block whitespace-nowrap mt-0.5">
                  {existingCV.pdf_url?.split("/").pop() || "Document PDF"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary to-brand-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-brand-primary/25 disabled:opacity-60 transition-all flex-1 sm:flex-initial"
              >
                {isOptimizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isOptimizing
                  ? "Optimisation en cours..."
                  : "Optimiser mon CV"}
              </button>
              <a
                href={existingCV.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-brand-primary hover:text-brand-dark px-4 py-2.5 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors whitespace-nowrap"
              >
                Voir le CV
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Optimization Progress ────────────────────────────────────────── */}
      {isOptimizing && (
        <div className="bg-gradient-to-br from-brand-dark via-brand-primary to-purple-600 rounded-2xl p-8 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-brand-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Optimisation ATS en cours
                </h3>
                <p className="text-white/50 text-sm">
                  L'IA analyse et réécrit votre CV...
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {OPTIMIZATION_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = idx === optimizationStep;
                const isDone = idx < optimizationStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                      isActive
                        ? "bg-white/15 backdrop-blur-sm scale-[1.02]"
                        : isDone
                        ? "bg-white/5 opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? "bg-brand-accent text-brand-dark"
                          : isDone
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isActive ? (
                        <StepIcon className="w-5 h-5 animate-pulse" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div>
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
            <div className="mt-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
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

      {/* ── Optimization Error ───────────────────────────────────────────── */}
      {optimizationError && (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-red-500 text-lg">⚠</span>
          </div>
          <div>
            <p className="text-sm font-bold text-red-700">
              Erreur d'optimisation
            </p>
            <p className="text-sm text-red-600 mt-1">{optimizationError}</p>
            <button
              onClick={handleOptimize}
              className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ── Optimization Result ──────────────────────────────────────────── */}
      {optimization && optimization.status === "completed" && (
        <CVOptimizationView
          optimization={optimization}
          onReOptimize={handleOptimize}
          isReOptimizing={isOptimizing}
        />
      )}

      {/* ── Upload Zone ──────────────────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-brand-primary/30 transition-colors">
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center">
            <FileIcon className="w-12 h-12 text-blue-500 mb-3" />
            <p className="font-semibold text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                Uploader
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center text-brand-primary mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-900">
              Cliquez pour ajouter un fichier PDF
            </p>
            <p className="text-sm text-slate-500 mt-2">
              ou glissez-déposez le fichier ici
            </p>
            <p className="text-xs text-slate-400 mt-4 text-center max-w-[280px]">
              Formats acceptés : PDF. Taille max : 5 MB.
            </p>
          </div>
        )}
      </div>

      {/* ── Status Message ───────────────────────────────────────────────── */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "error"
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
