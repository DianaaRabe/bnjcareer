"use client";

import React, { useState } from "react";
import { Target, UploadCloud, Link2, BrainCircuit, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

interface MatchResult {
  score: number;
  verdict: string;
  reasons: string[];
}

export default function MatchingPage() {
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  
  const savedCv = typeof window !== "undefined" ? localStorage.getItem("user_cv_parsed") : null;

  // Récupération des données venant de l'extension
  React.useEffect(() => {
    const checkExtensionData = () => {
      const extData = localStorage.getItem('extension_job_match');
      if (extData) {
        try {
          const { url, description } = JSON.parse(extData);
          if (url) setJobUrl(url);
          if (description) setJobDescription(description);
          // On nettoie pour ne pas écraser au prochain refresh manuel
          localStorage.removeItem('extension_job_match');
        } catch (e) {}
      }
    };

    checkExtensionData();
    window.addEventListener('extension_job_loaded', checkExtensionData);
    return () => window.removeEventListener('extension_job_loaded', checkExtensionData);
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      if (!savedCv) {
        throw new Error("Veuillez d'abord analyser votre CV dans l'onglet CV.");
      }

      const candidateData = JSON.parse(savedCv);
      
      const payload = {
        candidate: candidateData,
        offer: {
          url: jobUrl,
          description: jobDescription
        }
      };

      const res = await fetch("https://jobmatchingscore.bnjteammaker.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
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
        reasons: Array.isArray(data.reasons) ? data.reasons : []
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50", label: "Excellent" };
    if (score >= 55) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", label: "Bon" };
    return { bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50", label: "Faible" };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Matching IA</h1>
        <p className="text-slate-500 text-sm mt-1">Analysez la compatibilité entre votre profil et une offre d'emploi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
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

            {/* Job Description (The workaround for better matching) */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                Description de l'offre (copier-coller)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Collez ici le texte de l'offre pour une analyse précise..."
                rows={4}
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
                    <p className="text-sm font-semibold text-green-800">CV déjà analysé disponible</p>
                    <p className="text-xs text-green-600">Extrait depuis votre espace CV</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-xs text-green-600 underline shrink-0"
                  >
                    Utiliser ce CV
                  </button>
                </div>
              ) : null}
              <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">
                  {savedCv ? "Ou importer un autre CV :" : "Importez votre CV :"}
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-brand-light hover:bg-brand-100/20 transition-all flex items-center gap-3"
                  onClick={() => document.getElementById("cv-file-input")?.click()}
                >
                  <UploadCloud className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-500">
                    {file ? file.name : "Cliquer pour sélectionner un CV (PDF)"}
                  </span>
                  <input id="cv-file-input" type="file" className="hidden" accept=".pdf,.doc,.docx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
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

        {/* Result */}
        <div className="flex flex-col gap-6">
          {result ? (
            <>
              {/* Score */}
              <div className={`${getScoreColor(result.score).bg} rounded-2xl p-6 border ${result.score >= 75 ? "border-green-200" : result.score >= 55 ? "border-amber-200" : "border-red-200"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className={`w-5 h-5 ${getScoreColor(result.score).text}`} />
                    <h2 className={`font-bold text-lg ${getScoreColor(result.score).text}`}>
                      Score de compatibilité
                    </h2>
                  </div>
                  <span className={`text-3xl font-extrabold ${getScoreColor(result.score).text}`}>
                    {result.score}%
                  </span>
                </div>
                <div className="h-4 bg-white/60 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${getScoreColor(result.score).bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <p className={`text-sm font-semibold mt-2 ${getScoreColor(result.score).text}`}>
                  {getScoreColor(result.score).label} — {
                    result.score >= 75 ? "Votre profil correspond bien à cette offre !" :
                    result.score >= 55 ? "Profil compatible avec quelques ajustements." :
                    "Le poste semble éloigné de votre profil actuel."
                  }
                </p>
              </div>

              {/* Comments */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1">
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
                        <li key={idx} className="flex gap-2 text-sm text-slate-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Aucun détail supplémentaire.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 min-h-48 bg-white rounded-2xl shadow-sm border border-dashed border-slate-200 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-2">Prêt à analyser</h3>
              <p className="text-sm text-slate-400">Renseignez l'URL d'une offre et lancez l'analyse pour voir votre score de compatibilité</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-brand-primary font-semibold">
                <ChevronRight className="w-3 h-3" /> Essayez avec une offre Indeed
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
