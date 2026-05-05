"use client";

import { useState, useRef, useCallback } from "react";
import {
  Sparkles,
  Download,
  ChevronRight,
  Shield,
  Search,
  FileText,
  Layers,
  Type,
  Star,
  User,
  CheckCircle2,
  X,
  ZoomIn,
  Target,
  ArrowLeftRight,
  Repeat2,
  Briefcase,
  TrendingUp,
  Award,
  Mail,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface JobCVComparisonModalProps {
  version: JobCVVersion;
  currentCvHtml?: string;
  emails?: string[];
  onClose: () => void;
}

// ── Category Config ───────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  string,
  { icon: any; label: string; color: string; bg: string }
> = {
  keyword: {
    icon: Search,
    label: "Mot-clé ajouté",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-100",
  },
  rephrasing: {
    icon: Repeat2,
    label: "Reformulation",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
  reordering: {
    icon: ArrowLeftRight,
    label: "Réorganisation",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
  },
  gap_coverage: {
    icon: Target,
    label: "Couverture de gap",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-100",
  },
  structure: {
    icon: Layers,
    label: "Structure ATS",
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-100",
  },
  profile: {
    icon: User,
    label: "Profil adapté",
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function JobCVComparisonModal({
  version,
  currentCvHtml,
  emails = [],
  onClose,
}: JobCVComparisonModalProps) {
  const [activeTab, setActiveTab] = useState<
    "preview" | "improvements" | "summary"
  >("preview");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [fullscreenPanel, setFullscreenPanel] = useState<
    "original" | "optimized" | null
  >(null);
  const optimizedRef = useRef<HTMLDivElement>(null);

  const highImpactCount = version.improvements.filter(
    (i) => i.impact === "high"
  ).length;
  const totalImprovements = version.improvements.length;

  // Group improvements by type
  const groupedImprovements = version.improvements.reduce(
    (acc, imp) => {
      const key = imp.type || "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(imp);
      return acc;
    },
    {} as Record<string, Improvement[]>
  );

  const handleDownloadPDF = useCallback(async () => {
    if (!optimizedRef.current) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Sanitize job title for filename
      const safeTitle = version.job_title
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 40);

      const safeCompany = (version.job_company || "")
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 20);

      const filename = `cv-${safeTitle}${safeCompany ? `-${safeCompany}` : ""}.pdf`;

      const element = optimizedRef.current;
      const opt = {
        margin: 0,
        filename,
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
          <head><title>CV - ${version.job_title}</title></head>
          <body>${version.optimized_html}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } finally {
      setIsDownloading(false);
    }
  }, [version]);

  const handleSendEmail = async () => {
    if (emails.length === 0 || !version) return;
    setIsSendingEmail(true);
    setEmailError("");

    try {
      // TODO: Implement actual email sending via /api/send-cv-email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSent(true);
    } catch (err: any) {
      setEmailError(
        "L'envoi d'email n'est pas encore configuré. Cette fonctionnalité sera disponible prochainement."
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formattedDate = new Date(version.created_at).toLocaleDateString(
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 pt-8 animate-fade-in overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-primary to-purple-600 px-6 py-5 shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-brand-accent" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2 flex-wrap">
                  CV Optimisé
                  <span className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent text-xs font-bold rounded-full whitespace-nowrap">
                    {version.job_title}
                  </span>
                </h2>
                <p className="text-white/60 text-sm mt-0.5 truncate">
                  {version.job_company && `${version.job_company} • `}
                  {totalImprovements} améliorations dont {highImpactCount} à
                  fort impact • {formattedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {version.match_score_before && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm font-bold">
                    Score: {version.match_score_before}%
                  </span>
                </div>
              )}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-yellow-400 text-brand-dark text-sm font-bold rounded-xl shadow-lg shadow-brand-accent/30 transition-all disabled:opacity-70"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Génération..." : "Télécharger PDF"}
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 p-1 mx-6 mt-4 rounded-xl w-fit shrink-0">
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
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === "summary"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Award className="w-4 h-4" />
            Résumé
          </button>
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "preview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BEFORE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="text-sm font-bold text-slate-700">
                      CV Actuel (Générique)
                    </span>
                  </div>
                  <button
                    onClick={() => setFullscreenPanel("original")}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 h-[550px] overflow-auto bg-white">
                  {currentCvHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: currentCvHtml }}
                      className="cv-optimized-preview"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <FileText className="w-16 h-16 mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        Pas de CV optimisé générique disponible
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Optimisez d'abord votre CV dans l'onglet "Mon CV"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AFTER */}
              <div className="bg-white rounded-2xl border-2 border-brand-primary/20 shadow-sm shadow-brand-primary/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-brand-100 bg-brand-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-bold text-brand-primary">
                      CV Ciblé — {version.job_title}
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
                <div className="p-4 h-[550px] overflow-auto bg-white">
                  <div
                    ref={optimizedRef}
                    dangerouslySetInnerHTML={{
                      __html: version.optimized_html,
                    }}
                    className="cv-optimized-preview"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === "improvements" ? (
            /* ── Improvements Grid ──────────────────────────────────────── */
            <div className="space-y-6">
              {Object.entries(groupedImprovements).map(([type, items]) => {
                const typeConfig = TYPE_CONFIG[type] || {
                  icon: CheckCircle2,
                  label: type,
                  color: "text-slate-700",
                  bg: "bg-slate-50 border-slate-100",
                };
                const Icon = typeConfig.icon;

                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                      <h3 className={`text-sm font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </h3>
                      <span className="text-xs text-slate-400 font-medium">
                        ({items.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map((imp, i) => {
                        const impactConfig =
                          IMPACT_CONFIG[imp.impact] || IMPACT_CONFIG.low;

                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border ${typeConfig.bg} transition-all hover:shadow-md hover:-translate-y-0.5`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
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
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Match Summary ──────────────────────────────────────────── */
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Score comparison */}
              {version.match_score_before && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">
                        Amélioration de la compatibilité
                      </h3>
                      <p className="text-sm text-green-600">
                        Score de matching avant optimisation
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-semibold mb-1">
                        AVANT
                      </p>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                          style={{
                            width: `${version.match_score_before}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm font-bold text-amber-600 mt-1">
                        {version.match_score_before}%
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-green-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 font-semibold mb-1">
                        APRÈS OPTIMISATION
                      </p>
                      <div className="h-3 bg-white rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-1000 delay-500"
                          style={{ width: "100%" }}
                        />
                      </div>
                      <p className="text-sm font-bold text-green-600 mt-1">
                        Optimisé ✓
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Match summary text */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-brand-primary" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Résumé de l'optimisation
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm">
                  {version.match_summary ||
                    "Votre CV a été adapté pour maximiser vos chances d'être sélectionné pour ce poste."}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-2xl font-extrabold text-blue-700">
                    {version.improvements.filter((i) => i.type === "keyword")
                      .length || 0}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Mots-clés ajoutés
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100">
                  <p className="text-2xl font-extrabold text-emerald-700">
                    {version.improvements.filter(
                      (i) => i.type === "rephrasing"
                    ).length || 0}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Reformulations
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <p className="text-2xl font-extrabold text-purple-700">
                    {highImpactCount}
                  </p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Impacts élevés
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-primary/25 transition-all disabled:opacity-70"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading
                    ? "Génération..."
                    : "Télécharger PDF"}
                </button>
                
                <div className="relative group w-full sm:w-auto">
                    <button
                      onClick={handleSendEmail}
                      disabled={emails.length === 0 || isSendingEmail || emailSent}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-xl transition-all ${
                        emailSent
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                          : emails.length > 0
                            ? "bg-white text-brand-primary border border-brand-primary hover:bg-brand-50 shadow-sm"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      {emailSent ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Envoyé
                        </>
                      ) : isSendingEmail ? (
                        <>
                          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Envoyer par email
                        </>
                      )}
                    </button>
                    
                    {!emails.length && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        Aucun email disponible
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                      </div>
                    )}
                </div>
              </div>
              {emailError && (
                 <div className="text-center text-xs text-red-500 font-medium">{emailError}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Fullscreen Modal ─────────────────────────────────────────── */}
        {fullscreenPanel && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {fullscreenPanel === "original" ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      CV Actuel
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      CV Ciblé — {version.job_title}
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
                  currentCvHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: currentCvHtml }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                      <FileText className="w-16 h-16 mb-3 opacity-30" />
                      <p className="text-sm font-medium">
                        Pas de CV générique disponible
                      </p>
                    </div>
                  )
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: version.optimized_html,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
