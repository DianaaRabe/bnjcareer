"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, MapPin, Briefcase, Building2, Sparkles, CheckCircle,
  ExternalLink, Loader2, X, Banknote, Calendar, Wifi,
  Clock, ChevronDown, Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommunityJob {
  id: string;
  source: string;
  title: string;
  companyName: string;
  companyLogo: string | null;
  location: string;
  salary: string | null;
  contractType: string | null;
  experienceLevel: string | null;
  remote: string | null;
  sector: string | null;
  jobUrl: string;
  applyUrl: string | null;
  postedDate: string | null;
  descriptionText: string;
  skills: string[];
  companyId: string | null;
  applicationEmail: string | null;
}

const CONTRACT_TYPES = [
  { value: "CDI",       label: "CDI" },
  { value: "CDD",       label: "CDD" },
  { value: "Stage",     label: "Stage" },
  { value: "Alternance",label: "Alternance" },
  { value: "Freelance", label: "Freelance" },
];

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }: { job: CommunityJob; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="w-14 h-14 rounded-2xl object-contain border border-slate-100 p-1 shrink-0 bg-white"
            />
          ) : (
            <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center font-black text-xl uppercase shrink-0">
              {(job.companyName || "J").charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary mb-1">
              <Sparkles className="w-3 h-3" /> Offre exclusive
            </span>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{job.title}</h2>
            <p className="text-sm text-slate-500 font-medium">{job.companyName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 py-3 flex flex-wrap gap-3 text-xs border-b border-slate-50 bg-slate-50/80">
          {job.location && (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <MapPin className="w-3 h-3 text-brand-primary" />{job.location}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1 text-green-700 font-semibold">
              <Banknote className="w-3 h-3" />{job.salary}
            </span>
          )}
          {job.contractType && (
            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600 font-medium">{job.contractType}</span>
          )}
          {job.remote && (
            <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 font-medium">
              <Wifi className="w-3 h-3" />{job.remote}
            </span>
          )}
          {job.experienceLevel && (
            <span className="text-slate-500">{job.experienceLevel}</span>
          )}
          {job.sector && (
            <span className="text-slate-400">{job.sector}</span>
          )}
          {job.postedDate && (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />{job.postedDate}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-50 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-brand-primary/8 text-brand-primary rounded-full border border-brand-primary/20">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="flex-1 overflow-y-auto p-6">
          {job.descriptionText ? (
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.descriptionText}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic text-center py-10">Description non disponible</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex gap-3">
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-primary/25 transition-colors"
            >
              Postuler <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {job.applicationEmail && (
            <a
              href={`mailto:${job.applicationEmail}?subject=Candidature — ${job.title}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
            >
              Envoyer mon CV par e-mail
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function CommunityJobCard({
  job,
  onDetails,
}: {
  job: CommunityJob;
  onDetails: () => void;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={onDetails}>
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-3">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.companyName}
                className="w-11 h-11 rounded-xl object-contain border border-slate-100 p-1 bg-white shrink-0"
              />
            ) : (
              <div className="w-11 h-11 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-black text-lg uppercase shrink-0">
                {(job.companyName || "J").charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-primary truncate">{job.companyName}</p>
              {job.sector && <p className="text-[10px] text-slate-400 truncate">{job.sector}</p>}
            </div>
          </div>
          {/* Exclusive badge */}
          <span className="shrink-0 text-[9px] font-black px-1.5 py-0.5 bg-brand-accent/20 text-brand-accent rounded-full border border-brand-accent/30 uppercase tracking-wide">
            Exclusif
          </span>
        </div>

        <h3
          className="text-sm font-bold text-slate-900 mb-3 leading-snug group-hover:text-brand-primary transition-colors line-clamp-2"
        >
          {job.title}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-500">
          {job.location && (
            <p className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
          )}
          {(job.contractType || job.remote) && (
            <p className="flex items-center gap-1.5 flex-wrap">
              {job.contractType && (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{job.contractType}</span>
              )}
              {job.remote && (
                <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 font-medium">
                  <Wifi className="w-2.5 h-2.5" />{job.remote}
                </span>
              )}
            </p>
          )}
          {job.salary && (
            <p className="flex items-center gap-1.5 text-green-700 font-semibold">
              <Banknote className="w-3.5 h-3.5 shrink-0" />{job.salary}
            </p>
          )}
          {job.postedDate && (
            <p className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" />{job.postedDate}
            </p>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] font-bold px-2 py-0.5 bg-brand-primary/8 text-brand-primary rounded-full border border-brand-primary/20">
                {s}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5">+{job.skills.length - 4}</span>
            )}
          </div>
        )}

        {job.descriptionText && (
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {job.descriptionText.slice(0, 130)}…
          </p>
        )}
      </div>

      {/* Action */}
      <div className="mt-4">
        <button
          onClick={(e) => { e.stopPropagation(); onDetails(); }}
          className="w-full bg-slate-50 hover:bg-brand-primary text-slate-700 hover:text-white font-bold py-2.5 rounded-xl border border-slate-200 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow-md hover:shadow-brand-primary/20"
        >
          Voir l'offre complète <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CommunityJobsBoard({ userId }: { userId?: string }) {
  const [keywords, setKeywords]       = useState("");
  const [location, setLocation]       = useState("");
  const [contractFilter, setContractFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs]               = useState<CommunityJob[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [detailJob, setDetailJob]     = useState<CommunityJob | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchJobs = useCallback(async (kw: string, loc: string, contracts: string[]) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (kw)  params.set("keywords", kw);
      if (loc) params.set("location", loc);
      const res  = await fetch(`/api/jobs/community?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let items: CommunityJob[] = data.items ?? [];
      // Client-side contract filter (avoids extra API params)
      if (contracts.length > 0) {
        items = items.filter(j => j.contractType && contracts.includes(j.contractType));
      }
      setJobs(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchJobs("", "", []);
  }, [fetchJobs]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchJobs(keywords, location, contractFilter);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [keywords, location, contractFilter, fetchJobs]);

  const toggleContract = (v: string) =>
    setContractFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-brand-primary" />
          Offres d'emploi exclusives
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Opportunités sélectionnées par notre communauté, vérifiées et réservées à nos membres.
        </p>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              placeholder="Titre du poste, compétences…"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 focus:bg-white transition-all text-sm"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Localisation (ville, région…)"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary/50 focus:bg-white transition-all text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
              showFilters
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-primary/40"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {contractFilter.length > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${showFilters ? "bg-white/20" : "bg-brand-primary/15 text-brand-primary"}`}>
                {contractFilter.length}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-3">Type de contrat</p>
            <div className="flex flex-wrap gap-2">
              {CONTRACT_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => toggleContract(ct.value)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                    contractFilter.includes(ct.value)
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm shadow-brand-primary/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/50"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
              {contractFilter.length > 0 && (
                <button
                  onClick={() => setContractFilter([])}
                  className="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-500 font-bold hover:bg-red-50 transition-all flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Effacer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Count / loading indicator ────────────────────────────────────────── */}
      {!loading && !error && (
        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {jobs.length === 0
            ? "Aucune offre correspondante"
            : `${jobs.length} offre${jobs.length > 1 ? "s" : ""} disponible${jobs.length > 1 ? "s" : ""}`}
          {(keywords || location) && ` · mise à jour en temps réel`}
        </p>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-2 text-red-700 text-sm">
          <X className="w-4 h-4 shrink-0" />
          <span className="font-medium">Erreur : {error}</span>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Chargement des offres…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-5 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
            <Search className="w-9 h-9 text-brand-primary/40" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-700 mb-1">Aucune offre trouvée</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              {keywords || location
                ? "Essayez d'élargir vos critères de recherche."
                : "Les premières offres de la communauté seront bientôt publiées."}
            </p>
          </div>
          {(keywords || location || contractFilter.length > 0) && (
            <button
              onClick={() => { setKeywords(""); setLocation(""); setContractFilter([]); }}
              className="text-sm font-bold text-brand-primary hover:text-brand-dark flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" /> Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              style={{ animationDelay: `${(i % 9) * 50}ms` }}
              className="animate-slide-up"
            >
              <CommunityJobCard
                job={job}
                onDetails={() => setDetailJob(job)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      {detailJob && (
        <JobDetailModal job={detailJob} onClose={() => setDetailJob(null)} />
      )}
    </div>
  );
}
