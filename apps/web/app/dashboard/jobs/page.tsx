"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Target,
  UploadCloud,
  Link2,
  BrainCircuit,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Clock,
  FileText,
  Briefcase,
  TrendingUp,
  ExternalLink,
  Eye,
  Download,
  Loader2,
  Trash2,
} from "lucide-react";
import JobCVOptimizer from "@/components/jobs/JobCVOptimizer";
import JobCVComparisonModal from "@/components/jobs/JobCVComparisonModal";

interface MatchResult {
  score: number;
  verdict: string;
  reasons: string[];
}

interface JobCVVersionRecord {
  id: string;
  job_title: string;
  job_company: string | null;
  match_score_before: number | null;
  status: string;
  created_at: string;
}

interface FullJobCVVersion {
  id: string;
  job_title: string;
  job_company?: string;
  optimized_html: string;
  improvements: { type: string; description: string; impact: "high" | "medium" | "low" }[];
  match_summary: string;
  match_score_before?: number;
  status: string;
  created_at: string;
}

export default function MatchingPage() {
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  const [previousVersions, setPreviousVersions] = useState<
    JobCVVersionRecord[]
  >([]);
  const [currentCvHtml, setCurrentCvHtml] = useState<string | undefined>(
    undefined
  );
  const [selectedVersion, setSelectedVersion] = useState<FullJobCVVersion | null>(null);
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);
  const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null);
  const [deletingVersionId, setDeletingVersionId] = useState<string | null>(null);

  const savedCv =
    typeof window !== "undefined"
      ? localStorage.getItem("user_cv_parsed")
      : null;

  // ── Load previous job CV versions ──────────────────────────────────────
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: versions } = await supabase
          .from("job_cv_versions")
          .select(
            "id, job_title, job_company, match_score_before, status, created_at"
          )
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(10);

        if (versions) setPreviousVersions(versions);

        // Also fetch latest generic optimized CV HTML for comparison
        const { data: optimizations } = await supabase
          .from("cv_optimizations")
          .select("optimized_html")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);

        if (optimizations?.[0]?.optimized_html) {
          setCurrentCvHtml(optimizations[0].optimized_html);
        }
      } catch (err) {
        // Tables may not exist yet — silently ignore
        console.error("[jobs] Fetch versions error:", err);
      }
    };
    fetchVersions();
  }, []);

  // ── Extension data injection ───────────────────────────────────────────
  useEffect(() => {
    const checkExtensionData = () => {
      const extData = localStorage.getItem("extension_job_match");
      if (extData) {
        try {
          const { url, description } = JSON.parse(extData);
          if (url) setJobUrl(url);
          if (description) setJobDescription(description);
          localStorage.removeItem("extension_job_match");
        } catch (e) {}
      }
    };

    checkExtensionData();
    window.addEventListener("extension_job_loaded", checkExtensionData);
    return () =>
      window.removeEventListener("extension_job_loaded", checkExtensionData);
  }, []);

  // ── Auto-fill from scrapper navigation ──────────────────────────────────
  useEffect(() => {
    const scrapperData = localStorage.getItem("scrapper_job_for_matching");
    if (scrapperData) {
      try {
        const job = JSON.parse(scrapperData);
        if (job.jobUrl) setJobUrl(job.jobUrl);
        if (job.title) setJobTitle(job.title);
        if (job.companyName) setJobCompany(job.companyName);
        if (job.descriptionText) setJobDescription(job.descriptionText);
        localStorage.removeItem("scrapper_job_for_matching");
      } catch (e) {
        console.error("[jobs] Failed to parse scrapper job data:", e);
      }
    }
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (!savedCv) {
        throw new Error(
          "Veuillez d'abord analyser votre CV dans l'onglet CV."
        );
      }

      const candidateData = JSON.parse(savedCv);

      const payload = {
        candidate: candidateData,
        offer: {
          url: jobUrl,
          description: jobDescription,
        },
      };

      const res = await fetch(
        "https://jobmatchingscore.bnjteammaker.com/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        let errorMessage = `Erreur API (${res.status})`;
        try {
          const errorResponse = await res.text();
          if (errorResponse) {
            errorMessage += ` : ${errorResponse}`;
          }
        } catch (e) {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setResult({
        score: data.score,
        verdict: data.verdict || data.comments || data.comment || "",
        reasons: Array.isArray(data.reasons) ? data.reasons : [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75)
      return {
        bar: "bg-green-500",
        text: "text-green-700",
        bg: "bg-green-50",
        label: "Excellent",
      };
    if (score >= 55)
      return {
        bar: "bg-amber-500",
        text: "text-amber-700",
        bg: "bg-amber-50",
        label: "Bon",
      };
    return {
      bar: "bg-red-500",
      text: "text-red-700",
      bg: "bg-red-50",
      label: "Faible",
    };
  };

  // Build job data object for the optimizer
  const jobDataForOptimizer = {
    title: jobTitle || "Poste non spécifié",
    company: jobCompany || undefined,
    description: jobDescription,
    url: jobUrl,
  };

  const matchAnalysisForOptimizer = result
    ? {
        score: result.score,
        verdict: result.verdict,
        reasons: result.reasons,
      }
    : undefined;

  // ── Fetch full version data for viewing ─────────────────────────────────
  const handleViewVersion = useCallback(async (versionId: string) => {
    setLoadingVersionId(versionId);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("job_cv_versions")
        .select(
          "id, job_title, job_company, optimized_html, improvements, match_summary, match_score_before, status, created_at"
        )
        .eq("id", versionId)
        .single();

      if (fetchError || !data) {
        console.error("[jobs] Fetch version error:", fetchError);
        return;
      }

      setSelectedVersion({
        id: data.id,
        job_title: data.job_title,
        job_company: data.job_company || undefined,
        optimized_html: data.optimized_html || "",
        improvements: data.improvements || [],
        match_summary: data.match_summary || "",
        match_score_before: data.match_score_before || undefined,
        status: data.status,
        created_at: data.created_at,
      });
    } catch (err) {
      console.error("[jobs] View version error:", err);
    } finally {
      setLoadingVersionId(null);
    }
  }, []);

  // ── Download version as PDF ─────────────────────────────────────────────
  const handleDownloadVersion = useCallback(async (versionId: string) => {
    setDownloadingVersionId(versionId);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("job_cv_versions")
        .select("job_title, job_company, optimized_html")
        .eq("id", versionId)
        .single();

      if (fetchError || !data?.optimized_html) {
        console.error("[jobs] Download version error:", fetchError);
        return;
      }

      const html2pdf = (await import("html2pdf.js")).default;

      // Create a temporary container for the HTML
      const container = document.createElement("div");
      container.innerHTML = data.optimized_html;
      document.body.appendChild(container);

      const safeTitle = data.job_title
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 40);

      const safeCompany = (data.job_company || "")
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 20);

      const filename = `cv-${safeTitle}${safeCompany ? `-${safeCompany}` : ""}.pdf`;

      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
        })
        .from(container)
        .save();

      document.body.removeChild(container);
    } catch (err) {
      console.error("[jobs] PDF generation error:", err);
      // Fallback: try opening in print window
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("job_cv_versions")
          .select("optimized_html, job_title")
          .eq("id", versionId)
          .single();
        if (data?.optimized_html) {
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html><html><head><title>CV - ${data.job_title}</title></head><body>${data.optimized_html}</body></html>`);
            printWindow.document.close();
            printWindow.print();
          }
        }
      } catch {}
    } finally {
      setDownloadingVersionId(null);
    }
  }, []);

  // ── Delete a single CV version ──────────────────────────────────────────
  const handleDeleteVersion = useCallback(async (versionId: string, jobTitle: string) => {
    if (!confirm(`Supprimer le CV ciblé pour "${jobTitle}" ? Cette action est irréversible.`)) return;
    setDeletingVersionId(versionId);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("job_cv_versions")
        .delete()
        .eq("id", versionId);
      if (deleteError) throw deleteError;
      // Remove from local state immediately — no page reload needed
      setPreviousVersions((prev) => prev.filter((v) => v.id !== versionId));
    } catch (err) {
      console.error("[jobs] Delete version error:", err);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    } finally {
      setDeletingVersionId(null);
    }
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-brand-primary" />
            Matching IA
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Analysez la compatibilité entre votre profil et une offre d'emploi,
            puis optimisez votre CV
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-brand-100 text-brand-primary px-4 py-2 rounded-full text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          CV Ciblé IA
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Job URL */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                URL de l'offre d'emploi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://fr.indeed.com/viewjob?jk=..."
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white text-slate-900 transition-all"
                  required
                />
              </div>
            </div>

            {/* Job Title + Company (for optimizer) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Titre du poste
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Développeur React"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white text-slate-900 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Entreprise
                </label>
                <input
                  type="text"
                  value={jobCompany}
                  onChange={(e) => setJobCompany(e.target.value)}
                  placeholder="Ex: TechCorp"
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white text-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Description de l'offre (copier-coller)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Collez ici le texte complet de l'offre pour une analyse et optimisation précise..."
                rows={5}
                className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white text-slate-900 transition-all resize-none"
                required
              />
            </div>

            {/* CV section */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                CV du candidat
              </label>
              {savedCv ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">
                      CV déjà analysé disponible
                    </p>
                    <p className="text-xs text-green-600">
                      Extrait depuis votre espace CV
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">
                      CV non analysé
                    </p>
                    <p className="text-xs text-amber-600">
                      Uploadez votre CV dans l'onglet "Mon CV" d'abord
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !jobUrl}
              className="w-full py-4 bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold rounded-2xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  Analyser la compatibilité
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Result ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">
          {result ? (
            <>
              {/* Score */}
              <div
                className={`${getScoreColor(result.score).bg} rounded-2xl p-6 border ${result.score >= 75 ? "border-green-200" : result.score >= 55 ? "border-amber-200" : "border-red-200"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target
                      className={`w-5 h-5 ${getScoreColor(result.score).text}`}
                    />
                    <h2
                      className={`font-bold text-lg ${getScoreColor(result.score).text}`}
                    >
                      Score de compatibilité
                    </h2>
                  </div>
                  <span
                    className={`text-3xl font-extrabold ${getScoreColor(result.score).text}`}
                  >
                    {result.score}%
                  </span>
                </div>
                <div className="h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${getScoreColor(result.score).bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <p
                  className={`text-sm font-semibold mt-2 ${getScoreColor(result.score).text}`}
                >
                  {getScoreColor(result.score).label} —{" "}
                  {result.score >= 75
                    ? "Votre profil correspond bien à cette offre !"
                    : result.score >= 55
                    ? "Profil compatible avec quelques ajustements."
                    : "Le poste semble éloigné de votre profil actuel."}
                </p>
              </div>

              {/* Comments */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-primary" />
                  Verdict & Points Clés
                </h2>
                <div className="space-y-4">
                  {result.verdict && (
                    <div className="text-sm font-semibold text-slate-900 bg-brand-50 p-3 rounded-lg border border-brand-100">
                      {result.verdict}
                    </div>
                  )}
                  {result.reasons.length > 0 ? (
                    <ul className="space-y-2">
                      {result.reasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-sm text-slate-700"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Aucun détail supplémentaire.
                    </p>
                  )}
                </div>
              </div>

              {/* ── CV OPTIMIZER CTA ───────────────────────────────────── */}
              {jobDescription && (
                <div className="bg-gradient-to-br from-slate-50 to-brand-50 rounded-2xl p-6 border border-brand-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Augmentez vos chances
                      </h3>
                      <p className="text-sm text-slate-500">
                        Adaptez votre CV spécifiquement pour ce poste
                      </p>
                    </div>
                  </div>

                  <JobCVOptimizer
                    job={jobDataForOptimizer}
                    matchAnalysis={matchAnalysisForOptimizer}
                    currentCvHtml={currentCvHtml}
                    onComplete={(version) => {
                      // Add to previous versions list
                      setPreviousVersions((prev) => [
                        {
                          id: version.id,
                          job_title: version.job_title,
                          job_company: version.job_company || null,
                          match_score_before: version.match_score_before || null,
                          status: version.status,
                          created_at: version.created_at,
                        },
                        ...prev,
                      ]);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 min-h-48 bg-white rounded-2xl shadow-sm border border-dashed border-slate-200 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">
                Prêt à analyser
              </h3>
              <p className="text-sm text-slate-400">
                Renseignez l'URL d'une offre et lancez l'analyse pour voir votre
                score de compatibilité
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-brand-primary font-semibold">
                <ChevronRight className="w-3 h-3" /> Essayez avec une offre
                Indeed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Previous Job CV Versions ──────────────────────────────────── */}
      {previousVersions.length > 0 && (
        <div id="cv-history" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-primary" />
              CV ciblés précédents
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {previousVersions.length} version
              {previousVersions.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {previousVersions.map((ver) => {
              const date = new Date(ver.created_at).toLocaleDateString(
                "fr-FR",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );
              const isLoadingThis = loadingVersionId === ver.id;
              const isDownloadingThis = downloadingVersionId === ver.id;

              return (
                <div
                  key={ver.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-100 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {(ver.job_company || ver.job_title || "J").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-primary transition-colors">
                      {ver.job_title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {ver.job_company && `${ver.job_company} • `}
                      {date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ver.match_score_before && (
                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {ver.match_score_before}%
                      </div>
                    )}
                    <button
                      onClick={() => handleViewVersion(ver.id)}
                      disabled={isLoadingThis}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-50 text-brand-primary text-xs font-semibold rounded-lg border border-brand-100 hover:border-brand-primary/30 transition-all disabled:opacity-60"
                      title="Voir ce CV"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Voir</span>
                    </button>
                    <button
                      onClick={() => handleDownloadVersion(ver.id)}
                      disabled={isDownloadingThis}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60"
                      title="Télécharger ce CV en PDF"
                    >
                      {isDownloadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => handleDeleteVersion(ver.id, ver.job_title)}
                      disabled={deletingVersionId === ver.id}
                      className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 text-xs font-semibold rounded-lg border border-red-100 hover:border-red-200 transition-all disabled:opacity-60"
                      title="Supprimer ce CV"
                    >
                      {deletingVersionId === ver.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Version Comparison Modal ──────────────────────────────────── */}
      {selectedVersion && (
        <JobCVComparisonModal
          version={selectedVersion}
          currentCvHtml={currentCvHtml}
          onClose={() => setSelectedVersion(null)}
        />
      )}
    </div>
  );
}
