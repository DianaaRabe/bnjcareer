"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  Download,
  Mail,
  AlertCircle,
  Building,
  ExternalLink,
  Eye,
} from "lucide-react";
import JobCVOptimizer from "@/components/jobs/JobCVOptimizer";
import JobCVComparisonModal from "@/components/jobs/JobCVComparisonModal";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobCVVersion {
  id: string;
  job_title: string;
  job_company?: string;
  optimized_html: string;
  improvements: {
    type: string;
    description: string;
    impact: "high" | "medium" | "low";
  }[];
  match_summary: string;
  match_score_before?: number;
  status: string;
  created_at: string;
}

interface ScrapperOptimizeModalProps {
  job: {
    title: string;
    companyName?: string;
    descriptionText: string;
    jobUrl?: string;
    applyUrl?: string;
    emails?: string[];
    salary?: any;
    location?: any;
  };
  onClose: () => void;
  onComplete?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ScrapperOptimizeModal({
  job,
  onClose,
  onComplete,
}: ScrapperOptimizeModalProps) {
  const [phase, setPhase] = useState<
    "extracting" | "optimizing" | "success" | "error"
  >("extracting");
  const [version, setVersion] = useState<JobCVVersion | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const optimizedRef = useRef<HTMLDivElement>(null);

  const hasEmails = job.emails && job.emails.length > 0;
  const companyDisplay = job.companyName || "Entreprise";
  const description = job.descriptionText || "";

  // Simulate extraction delay then move to optimizing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (phase === "extracting") {
        setPhase("optimizing");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  // Build the job data object for the optimizer
  const jobDataForOptimizer = {
    title: job.title || "Poste non spécifié",
    company: job.companyName || undefined,
    description: description,
    url: job.jobUrl || job.applyUrl || undefined,
  };

  const handleVersionReady = (ver: JobCVVersion) => {
    setVersion(ver);
    setPhase("success");
    onComplete?.();
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!version) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

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

      // Create temporary container for PDF generation
      const container = document.createElement("div");
      container.innerHTML = version.optimized_html;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      document.body.appendChild(container);

      const opt = {
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
      };

      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback: print window
      const printWindow = window.open("", "_blank");
      if (printWindow && version) {
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
    if (!hasEmails || !version) return;
    setIsSendingEmail(true);
    setEmailError("");

    try {
      const companyEmail = job.emails![0]; // Send to the first available email
      
      console.log("[ScrapperOptimizeModal] 🚀 Début de l'envoi de la candidature...", {
        versionId: version.id,
        companyEmail,
        jobTitle: job.title
      });

      // --- Client-side PDF Generation (blob→FileReader for reliable base64) ---
      console.log("[ScrapperOptimizeModal] ⚙️ Génération du PDF en cours...");
      const html2pdf = (await import("html2pdf.js")).default;
      const container = document.createElement("div");
      container.innerHTML = version.optimized_html;
      // Use opacity:0 instead of left:-9999px so html2canvas can render properly
      container.style.cssText = "position:fixed;top:0;left:0;width:794px;opacity:0;pointer-events:none;z-index:-1;";
      document.body.appendChild(container);

      const opt = {
        margin: 0,
        filename: "cv.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      // Use blob output + FileReader for reliable base64 encoding
      const pdfBlob: Blob = await html2pdf().set(opt).from(container).output('blob');
      document.body.removeChild(container);

      const cvBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUri = reader.result as string;
          resolve(dataUri.split('base64,')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      console.log(`[ScrapperOptimizeModal] ✅ PDF généré (Taille: ${Math.round(cvBase64.length / 1024)} KB)`);
      // -----------------------------------

      const res = await fetch("/api/candiboost/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOfferId: version.id,
          companyEmail,
          jobTitle: job.title,
          coverLetter: null,
          cvBase64
        }),
      });

      const data = await res.json();
      console.log("[ScrapperOptimizeModal] 📥 Réponse de l'API candiboost/send:", data);

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi de l'email.");
      }

      setEmailSent(true);
    } catch (err: any) {
      console.error("[ScrapperOptimizeModal] Email send error:", err);
      setEmailError(
        err.message || "Une erreur est survenue lors de l'envoi de l'email."
      );
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="relative overflow-hidden bg-gradient-to-r from-brand-dark via-brand-primary to-purple-600 px-6 py-5 shrink-0">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-extrabold text-white leading-tight">
                    Optimiser mon CV
                  </h2>
                  <p className="text-white/70 text-sm mt-0.5 truncate max-w-[300px]">
                    {job.title}
                  </p>
                  {job.companyName && (
                    <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {companyDisplay}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Phase 1: Extracting */}
            {phase === "extracting" && (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mb-5">
                  <FileText className="w-8 h-8 text-brand-primary animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Extraction de la description…
                </h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Récupération automatique de la description de l'offre depuis
                  les données scannées
                </p>
                <div className="mt-5 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full animate-pulse w-2/3" />
                </div>
              </div>
            )}

            {/* Phase 2: Optimizing - uses JobCVOptimizer with autoStart */}
            {phase === "optimizing" && (
              <div className="space-y-4 animate-fade-in">
                {/* Description preview */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      Description extraite
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {description.substring(0, 200)}
                    {description.length > 200 && "…"}
                  </p>
                </div>

                {/* Optimizer component */}
                <JobCVOptimizer
                  job={jobDataForOptimizer}
                  autoStart={true}
                  onVersionReady={handleVersionReady}
                  onComplete={(ver) => {
                    // Version ready is handled above
                  }}
                />
              </div>
            )}

            {/* Phase 3: Success */}
            {phase === "success" && version && (
              <div className="space-y-5 animate-fade-in">
                {/* Success banner */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-green-800">
                      CV optimisé avec succès !
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                      {version.improvements.length} améliorations appliquées
                      {version.improvements.filter((i) => i.impact === "high")
                        .length > 0 &&
                        ` dont ${version.improvements.filter((i) => i.impact === "high").length} à fort impact`}
                    </p>
                    {version.match_summary && (
                      <p className="text-xs text-green-600/80 mt-2 leading-relaxed">
                        {version.match_summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  {/* View comparison */}
                  <button
                    onClick={() => setShowComparison(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-brand-primary/20 hover:border-brand-primary text-brand-primary font-bold rounded-xl transition-all hover:shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    Voir le détail des améliorations
                  </button>

                  {/* Download PDF */}
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-brand-primary/25 transition-all disabled:opacity-70"
                  >
                    <Download className="w-4 h-4" />
                    {isDownloading
                      ? "Génération du PDF…"
                      : "Télécharger le CV optimisé (PDF)"}
                  </button>

                  {/* Send by email */}
                  <div className="relative group">
                    <button
                      onClick={handleSendEmail}
                      disabled={!hasEmails || isSendingEmail || emailSent}
                      className={`w-full flex items-center justify-center gap-2 py-3.5 font-bold rounded-xl transition-all ${
                        emailSent
                          ? "bg-green-50 text-green-700 border-2 border-green-200 cursor-default"
                          : hasEmails
                            ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 hover:border-purple-300 shadow-sm"
                            : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
                      }`}
                    >
                      {emailSent ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Email envoyé avec succès
                        </>
                      ) : isSendingEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-400 border-t-purple-700 rounded-full animate-spin" />
                          Envoi en cours…
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Envoyer mon CV pour le poste
                        </>
                      )}
                    </button>

                    {/* Tooltip when no emails */}
                    {!hasEmails && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                        Aucun email de contact disponible pour cette offre
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                      </div>
                    )}

                    {/* Email recipients info */}
                    {hasEmails && !emailSent && (
                      <p className="text-center text-xs text-purple-500 mt-1.5 font-medium">
                        Sera envoyé à : {job.emails!.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Email error */}
                  {emailError && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{emailError}</p>
                    </div>
                  )}
                </div>

                {/* Apply link shortcut */}
                {(job.applyUrl || job.jobUrl) && (
                  <div className="pt-2 border-t border-slate-100">
                    <a
                      href={job.applyUrl || job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-brand-primary font-medium transition-colors py-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Candidater directement sur la plateforme
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Phase: Error fallback */}
            {phase === "error" && (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Une erreur est survenue
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mb-4">
                  L'optimisation n'a pas pu être réalisée. Veuillez réessayer.
                </p>
                <button
                  onClick={() => setPhase("optimizing")}
                  className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Comparison Modal (overlay on top) ──────────────────────────── */}
      {showComparison && version && (
        <JobCVComparisonModal
          version={version}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}
