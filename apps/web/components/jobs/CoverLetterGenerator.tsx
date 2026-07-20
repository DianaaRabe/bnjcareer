"use client";

import { useState, useRef, useCallback } from "react";
import {
  Mail,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  FileText,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobData {
  title: string;
  company?: string;
  description: string;
  url?: string;
  requirements?: string[];
}

interface CoverLetter {
  subject: string;
  body: string;
  job_title: string;
  job_company?: string | null;
  created_at: string;
}

interface CoverLetterGeneratorProps {
  job: JobData;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CoverLetterGenerator({ job }: CoverLetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    setLetter(null);

    try {
      const savedCv = localStorage.getItem("user_cv_parsed");
      if (!savedCv) {
        setError(
          "Aucune donnée CV trouvée. Veuillez d'abord uploader et analyser votre CV dans l'onglet Mon CV."
        );
        setIsGenerating(false);
        return;
      }

      const cvData = JSON.parse(savedCv);

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData, job }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "La génération a échoué");
      }

      const result = await response.json();
      if (result.success && result.cover_letter) {
        setLetter(result.cover_letter);
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err: any) {
      console.error("Cover letter generation error:", err);
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  }, [job]);

  const safeFilename = useCallback(() => {
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 40);
    const t = clean(job.title || "poste");
    const c = job.company ? `-${clean(job.company).substring(0, 20)}` : "";
    return `lettre-motivation-${t}${c}.pdf`;
  }, [job]);

  const handleDownloadPDF = useCallback(async () => {
    if (!letterRef.current) return;
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [15, 15, 15, 15] as [number, number, number, number],
        filename: safeFilename(),
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };
      await html2pdf().set(opt).from(letterRef.current).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  }, [safeFilename]);

  return (
    <div className="space-y-4">
      {/* ── Trigger ──────────────────────────────────────────────────── */}
      {!letter && !isGenerating && (
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-brand-dark to-brand-primary text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-3 group"
        >
          <Mail className="w-5 h-5 text-brand-accent group-hover:animate-pulse" />
          Générer ma lettre de motivation
        </button>
      )}

      {/* ── Generating ───────────────────────────────────────────────── */}
      {isGenerating && (
        <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-4 animate-fade-in">
          <Loader2 className="w-6 h-6 text-brand-primary animate-spin shrink-0" />
          <div>
            <p className="text-sm font-bold text-brand-dark">
              Rédaction de votre lettre en cours…
            </p>
            <p className="text-xs text-brand-primary/70">
              Personnalisation pour « {job.title} »
              {job.company ? ` chez ${job.company}` : ""}
            </p>
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
              Erreur de génération
            </p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-3 text-sm font-semibold text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* ── Result ───────────────────────────────────────────────────── */}
      {letter && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-bold text-green-800">
                Lettre de motivation prête
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                className="px-3 py-2 text-sm font-semibold text-brand-primary hover:text-brand-dark border border-brand-100 rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Régénérer
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Télécharger en PDF
              </button>
            </div>
          </div>

          {/* Printable letter */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div
              ref={letterRef}
              className="p-8 md:p-10 bg-white text-gray-900"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {letter.subject && (
                <p className="font-bold text-[15px] mb-6 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary print:hidden" />
                  {letter.subject}
                </p>
              )}
              <div className="whitespace-pre-wrap text-[14px] leading-relaxed">
                {letter.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
