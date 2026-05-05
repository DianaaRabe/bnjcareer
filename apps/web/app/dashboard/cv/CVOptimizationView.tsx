"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Download,
  RefreshCw,
  ChevronRight,
  Shield,
  Search,
  FileText,
  Layers,
  Type,
  Star,
  User,
  ArrowRight,
  CheckCircle2,
  X,
  ZoomIn,
} from "lucide-react";

interface Improvement {
  category: string;
  description: string;
  impact: "high" | "medium" | "low";
}

interface OptimizationData {
  id: string;
  optimized_html: string;
  improvements: Improvement[];
  original_cv_url: string;
  status: string;
  created_at: string;
}

interface CVOptimizationViewProps {
  optimization: OptimizationData;
  onReOptimize: () => void;
  isReOptimizing: boolean;
}

const CATEGORY_CONFIG: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  structure: {
    icon: Layers,
    label: "Structure",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-100",
  },
  keywords: {
    icon: Search,
    label: "Mots-clés ATS",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-100",
  },
  content: {
    icon: FileText,
    label: "Contenu",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
  formatting: {
    icon: Type,
    label: "Mise en forme",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
  },
  skills: {
    icon: Star,
    label: "Compétences",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-100",
  },
  profile: {
    icon: User,
    label: "Profil",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-100",
  },
};

const IMPACT_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  high: {
    label: "Impact élevé",
    color: "text-purple-700 bg-purple-100",
    dot: "bg-purple-500",
  },
  medium: {
    label: "Impact moyen",
    color: "text-blue-700 bg-blue-100",
    dot: "bg-blue-500",
  },
  low: {
    label: "Impact léger",
    color: "text-slate-600 bg-slate-100",
    dot: "bg-slate-400",
  },
};

export default function CVOptimizationView({
  optimization,
  onReOptimize,
  isReOptimizing,
}: CVOptimizationViewProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "improvements">(
    "preview"
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [fullscreenPanel, setFullscreenPanel] = useState<
    "original" | "optimized" | null
  >(null);
  const optimizedRef = useRef<HTMLDivElement>(null);

  const highImpactCount = optimization.improvements.filter(
    (i) => i.impact === "high"
  ).length;
  const totalImprovements = optimization.improvements.length;

  const handleDownloadPDF = useCallback(async () => {
    if (!optimizedRef.current) return;
    setIsDownloading(true);

    try {
      // Dynamic import of html2pdf.js (client-side only)
      const html2pdf = (await import("html2pdf.js")).default;

      const element = optimizedRef.current;
      const opt = {
        margin: 0,
        filename: "cv-optimise-ats.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback: open print dialog
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head><title>CV Optimisé ATS</title></head>
          <body>${optimization.optimized_html}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setIsDownloading(false);
    }
  }, [optimization.optimized_html]);

  const formattedDate = new Date(optimization.created_at).toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Score Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-primary to-purple-600 rounded-2xl p-6 shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-brand-accent" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                CV Optimisé ATS
                <span className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent text-xs font-bold rounded-full">
                  IA
                </span>
              </h2>
              <p className="text-white/60 text-sm mt-0.5">
                {totalImprovements} améliorations dont {highImpactCount} à fort
                impact • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onReOptimize}
              disabled={isReOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isReOptimizing ? "animate-spin" : ""}`}
              />
              Relancer
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-yellow-400 text-brand-dark text-sm font-bold rounded-xl shadow-lg shadow-brand-accent/30 transition-all disabled:opacity-70"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Génération..." : "Télécharger PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "preview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Avant / Après
        </button>
        <button
          onClick={() => setActiveTab("improvements")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === "improvements"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Améliorations
          <span className="w-5 h-5 bg-brand-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalImprovements}
          </span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      {activeTab === "preview" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BEFORE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-sm font-bold text-slate-700">
                  CV Original
                </span>
              </div>
              <button
                onClick={() => setFullscreenPanel("original")}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 h-[600px] overflow-auto bg-white">
              {optimization.original_cv_url ? (
                <iframe
                  src={optimization.original_cv_url}
                  className="w-full h-full rounded-lg border border-slate-100"
                  title="CV Original"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="w-16 h-16 mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    Aperçu non disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AFTER */}
          <div className="bg-white rounded-2xl border-2 border-brand-primary/20 shadow-sm shadow-brand-primary/5 overflow-hidden group">
            <div className="flex items-center justify-between px-5 py-3 border-b border-brand-100 bg-brand-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold text-brand-primary">
                  CV Optimisé ATS
                </span>
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              </div>
              <button
                onClick={() => setFullscreenPanel("optimized")}
                className="text-brand-primary/40 hover:text-brand-primary transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 h-[600px] overflow-auto bg-white">
              <div
                ref={optimizedRef}
                dangerouslySetInnerHTML={{
                  __html: optimization.optimized_html,
                }}
                className="cv-optimized-preview"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── Improvements Grid ──────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optimization.improvements.map((imp, i) => {
            const catConfig = CATEGORY_CONFIG[imp.category] || {
              icon: CheckCircle2,
              label: imp.category,
              color: "text-slate-700",
              bg: "bg-slate-50 border-slate-100",
            };
            const impactConfig = IMPACT_CONFIG[imp.impact] || IMPACT_CONFIG.low;
            const Icon = catConfig.icon;

            return (
              <div
                key={i}
                className={`p-5 rounded-2xl border ${catConfig.bg} transition-all hover:shadow-md hover:-translate-y-0.5`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${catConfig.bg} shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${catConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs font-bold ${catConfig.color}`}
                      >
                        {catConfig.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${impactConfig.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${impactConfig.dot}`}
                        />
                        {impactConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {imp.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Fullscreen Modal ─────────────────────────────────────────────── */}
      {fullscreenPanel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                {fullscreenPanel === "original" ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    CV Original
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    CV Optimisé ATS
                    <Sparkles className="w-4 h-4 text-brand-accent" />
                  </>
                )}
              </h3>
              <button
                onClick={() => setFullscreenPanel(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {fullscreenPanel === "original" ? (
                <iframe
                  src={optimization.original_cv_url}
                  className="w-full h-[70vh] rounded-lg border border-slate-100"
                  title="CV Original - Plein écran"
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: optimization.optimized_html,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
