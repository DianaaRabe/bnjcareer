"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Building, Sparkles, CheckCircle,
  Clock, History, ExternalLink, ChevronDown, ChevronUp, Loader2,
  X, Filter, Banknote, Calendar, Wifi, Eye, Globe, Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useFeatures } from "@/lib/tenant/context";
import { ApplyModal } from "./ApplyModal";
import ScrapperOptimizeModal from "./ScrapperOptimizeModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type Source = "indeed" | "linkedin" | "hellowork" | "cabinet" | "immigration";

interface NormalizedJob {
  id: string;
  source: Source;
  title: string;
  companyName: string;
  location: string;
  salary?: string | null;
  contractType?: string | null;
  experienceLevel?: string | null;
  sector?: string | null;
  remote?: string | null;
  jobUrl: string;
  applyUrl?: string | null;
  postedDate?: string | null;
  postedTimeAgo?: string | null;
  descriptionText?: string;
  companyLogo?: string | null;
  recruiterName?: string | null;
  applicationsCount?: string | null;
  duration?: string | null;
}

// ─── Source config ────────────────────────────────────────────────────────────

const SOURCES: { id: Source; label: string; color: string; api: string }[] = [
  { id: "indeed",      label: "Indeed",        color: "text-blue-600   bg-blue-50   border-blue-200",     api: "/api/scrapper" },
  { id: "linkedin",    label: "LinkedIn",      color: "text-sky-600    bg-sky-50    border-sky-200",      api: "/api/scrapper/linkedin" },
  { id: "hellowork",   label: "HelloWork",     color: "text-violet-600 bg-violet-50 border-violet-200",   api: "/api/scrapper/hellowork" },
  { id: "cabinet",     label: "Cabinets",      color: "text-amber-600  bg-amber-50  border-amber-200",    api: "" },
  { id: "immigration", label: "Immigration",   color: "text-emerald-600 bg-emerald-50 border-emerald-200", api: "" },
];

const SOURCE_LOGOS: Record<Source, React.ReactNode> = {
  indeed:      <span className="font-black text-blue-600 text-[10px]">IN</span>,
  linkedin:    <span className="font-black text-sky-600 text-[10px]">Li</span>,
  hellowork:   <span className="font-black text-violet-600 text-[10px]">HW</span>,
  cabinet:     <Users className="w-3 h-3 text-amber-600" />,
  immigration: <Globe className="w-3 h-3 text-emerald-600" />,
};

// ─── Indeed normalizer (existing format) ──────────────────────────────────────

function normalizeIndeed(item: any): NormalizedJob {
  return {
    id:              item.id ?? item.jobKey ?? item.url ?? String(Math.random()),
    source:          "indeed",
    title:           item.title ?? "Poste non spécifié",
    companyName:     item.companyName ?? "Entreprise inconnue",
    location:        typeof item.location === "object"
      ? (item.location?.city ?? item.location?.formattedAddressShort ?? "")
      : (item.location ?? ""),
    salary:          item.salary
      ? (typeof item.salary === "object" ? item.salary.salaryText : item.salary)
      : null,
    contractType:    item.jobType ?? null,
    jobUrl:          item.jobUrl ?? item.url ?? "",
    applyUrl:        item.applyUrl ?? item.jobUrl ?? item.url ?? "",
    descriptionText: item.descriptionText ?? item.description ?? "",
    postedTimeAgo:   item.postedAt ?? null,
    companyLogo:     null,
  };
}

// ─── LinkedIn filters ─────────────────────────────────────────────────────────

const LI_DATE_OPTIONS = [
  { value: "r86400",  label: "Dernières 24h" },
  { value: "r604800", label: "Dernière semaine" },
  { value: "r2592000",label: "Dernier mois" },
];
const LI_CONTRACT = [
  { value: "F", label: "Temps plein" },
  { value: "P", label: "Temps partiel" },
  { value: "C", label: "CDD / Contrat" },
  { value: "I", label: "Stage" },
];
const LI_LEVEL = [
  { value: "1", label: "Stage" },
  { value: "2", label: "Débutant" },
  { value: "3", label: "Junior" },
  { value: "4", label: "Confirmé" },
  { value: "5", label: "Senior / Directeur" },
];
const LI_REMOTE = [
  { value: "2", label: "Full remote" },
  { value: "3", label: "Hybride" },
];

// ─── Indeed filters ───────────────────────────────────────────────────────────

// Indeed's actor accepts a SINGLE jobType string.
// Empty value = no filter (we omit the field server-side).
const IN_JOB_TYPES = [
  { value: "",           label: "Tous" },
  { value: "fulltime",   label: "Temps plein" },
  { value: "parttime",   label: "Temps partiel" },
  { value: "permanent",  label: "CDI" },
  { value: "contract",   label: "CDD / Contrat" },
  { value: "temporary",  label: "Intérim" },
  { value: "internship", label: "Stage" },
  { value: "freelance",  label: "Freelance" },
  { value: "seasonal",   label: "Saisonnier" },
];

// ─── HelloWork filters ────────────────────────────────────────────────────────

const HW_PERIOD = [
  { value: "all", label: "Toutes" },
  { value: "1d",  label: "Dernières 24h" },
  { value: "3d",  label: "3 derniers jours" },
  { value: "7d",  label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
];

// HelloWork's actor accepts an ARRAY of contract types (French labels).
const HW_CONTRACT = [
  { value: "CDI",        label: "CDI" },
  { value: "CDD",        label: "CDD" },
  { value: "Stage",      label: "Stage" },
  { value: "Alternance", label: "Alternance" },
  { value: "Freelance",  label: "Freelance" },
  { value: "Intérim",    label: "Intérim" },
];

// ─── Cabinet de recrutement options ───────────────────────────────────────

const CABINET_SPECIALTIES = [
  { value: "",            label: "Toutes spécialités" },
  { value: "tech",        label: "IT / Tech" },
  { value: "finance",     label: "Finance / Banque" },
  { value: "sante",       label: "Santé / Pharma" },
  { value: "industrie",   label: "Industrie / Ingénierie" },
  { value: "commercial",  label: "Commercial / Ventes" },
  { value: "rh",          label: "Ressources Humaines" },
  { value: "juridique",   label: "Juridique / Droit" },
  { value: "marketing",   label: "Marketing / Com" },
  { value: "logistique",  label: "Logistique / Supply Chain" },
];

// ─── Immigration options ─────────────────────────────────────────────────

const IMMIGRATION_COUNTRIES = [
  { value: "ca", label: "🇨🇦  Canada",       flag: "🇨🇦" },
  { value: "fr", label: "🇫🇷  France",       flag: "🇫🇷" },
  { value: "us", label: "🇺🇸  États-Unis",   flag: "🇺🇸" },
  { value: "gb", label: "🇬🇧  Royaume-Uni",  flag: "🇬🇧" },
  { value: "de", label: "🇩🇪  Allemagne",    flag: "🇩🇪" },
  { value: "be", label: "🇧🇪  Belgique",     flag: "🇧🇪" },
  { value: "ch", label: "🇨🇭  Suisse",       flag: "🇨🇭" },
  { value: "au", label: "🇦🇺  Australie",    flag: "🇦🇺" },
];

const IMMIGRATION_VISA_TYPES = [
  { value: "",           label: "Tous les visas" },
  { value: "work",       label: "Visa de travail" },
  { value: "skilled",    label: "Travailleur qualifié" },
  { value: "student",    label: "Visa étudiant" },
  { value: "sponsor",    label: "Sponsorship entreprise" },
  { value: "permanent",  label: "Résidence permanente" },
  { value: "startup",    label: "Visa startup / entrepreneur" },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: Source }) {
  const s = SOURCES.find((x) => x.id === source)!;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.color}`}>
      {SOURCE_LOGOS[source]}&nbsp;{s.label}
    </span>
  );
}

function MultiSelect({
  options, value, onChange, placeholder,
}: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            value.includes(o.value)
              ? "bg-brand-primary text-white border-brand-primary"
              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-primary/50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({
  job, isApplied, onApply, onOptimize, onDetails,
}: {
  job: NormalizedJob;
  isApplied: boolean;
  onApply: () => void;
  onOptimize: () => void;
  onDetails: () => void;
}) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt="" className="w-10 h-10 rounded-xl object-contain border border-slate-100 p-0.5" />
            ) : (
              <div className="w-10 h-10 bg-brand-100 text-brand-primary rounded-xl flex items-center justify-center font-bold text-lg uppercase shrink-0">
                {(job.companyName || job.title || "J").charAt(0)}
              </div>
            )}
            <SourceBadge source={job.source} />
          </div>
          {job.salary && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 font-semibold text-[10px] px-2 py-1 rounded-full border border-green-100 shrink-0">
              <Banknote className="w-3 h-3" />
              {job.salary.length > 25 ? job.salary.slice(0, 25) + "…" : job.salary}
            </span>
          )}
        </div>

        <h3
          className="text-sm font-bold text-slate-900 mb-2 leading-snug group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-2"
          onClick={onDetails}
        >
          {job.title}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
          <p className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.companyName}</span>
          </p>
          {job.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{job.location}</span>
            </p>
          )}
          {(job.contractType || job.remote) && (
            <p className="flex items-center gap-1.5 flex-wrap">
              {job.contractType && (
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{job.contractType}</span>
              )}
              {job.remote && (
                <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                  <Wifi className="w-2.5 h-2.5" />{job.remote}
                </span>
              )}
            </p>
          )}
          {(job.postedTimeAgo ?? job.postedDate) && (
            <p className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {job.postedTimeAgo ?? job.postedDate}
            </p>
          )}
        </div>

        {job.descriptionText && (
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {job.descriptionText.slice(0, 140)}…
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 space-y-2">
        {isApplied ? (
          <button disabled className="w-full bg-green-50 text-green-700 font-bold py-2.5 rounded-xl border border-green-200 flex items-center justify-center gap-2 text-xs cursor-not-allowed">
            <CheckCircle className="w-4 h-4" /> Déjà postulé
          </button>
        ) : (
          <button
            onClick={onApply}
            className="w-full bg-slate-50 hover:bg-brand-primary text-slate-700 hover:text-white font-bold py-2.5 rounded-xl border border-slate-200 hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow-md hover:shadow-brand-primary/20"
          >
            Candidater maintenant
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={onDetails}
            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-2 rounded-xl border border-slate-200 transition-all text-xs flex items-center justify-center gap-1"
          >
            <Search className="w-3 h-3" /> Détails
          </button>
          <button
            onClick={onOptimize}
            disabled={!job.descriptionText}
            className="flex-1 bg-brand-50 hover:bg-brand-100 text-brand-primary font-semibold py-2 rounded-xl border border-brand-100 transition-all text-xs flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={!job.descriptionText ? "Description non disponible" : "Optimiser mon CV pour ce poste"}
          >
            <Sparkles className="w-3 h-3" /> Optimiser CV
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose }: { job: NormalizedJob; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-100 text-brand-primary rounded-xl flex items-center justify-center font-bold text-lg uppercase shrink-0">
            {(job.companyName || "J").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SourceBadge source={job.source} />
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{job.title}</h2>
            <p className="text-sm text-slate-500">{job.companyName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 py-3 flex flex-wrap gap-3 text-xs border-b border-slate-50 bg-slate-50">
          {job.location && <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3" />{job.location}</span>}
          {job.salary && <span className="flex items-center gap-1 text-green-700 font-semibold"><Banknote className="w-3 h-3" />{job.salary}</span>}
          {job.contractType && <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">{job.contractType}</span>}
          {job.remote && <span className="flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100"><Wifi className="w-3 h-3" />{job.remote}</span>}
          {job.experienceLevel && <span className="text-slate-500">{job.experienceLevel}</span>}
          {job.sector && <span className="text-slate-400">{job.sector}</span>}
        </div>

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
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Voir l'offre
            </a>
          )}
          {(job.applyUrl ?? job.jobUrl) && (
            <a
              href={job.applyUrl ?? job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm rounded-xl shadow-md shadow-brand-primary/20 transition-colors"
            >
              Postuler <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MultiSourceScrapper({ userId }: { userId?: string }) {
  const router = useRouter();
  const features = useFeatures();

  // Filter available sources based on the tenant's allowed aggregator sources
  // Africa: ['indeed', 'linkedin'] — no HelloWork
  // FR: all three sources available
  const availableSources = SOURCES.filter(s =>
    features.aggregatorSources.length === 0 || features.aggregatorSources.includes(s.id as any)
  );

  // ── State ──────────────────────────────────────────────────────────────────
  // Default to first available source so Africa doesn't default to hellowork
  const [activeSource, setActiveSource] = useState<Source>(() =>
    (availableSources[0]?.id ?? "linkedin") as Source
  );
  const [keywords, setKeywords]         = useState("Développeur");
  const [location, setLocation]         = useState("Paris");

  // Indeed-specific
  const [country, setCountry]           = useState("fr");
  const [inJobType, setInJobType]       = useState("");        // "" = pas de filtre

  // LinkedIn-specific
  const [liDatePosted, setLiDatePosted]         = useState("r604800");
  const [liContract, setLiContract]             = useState<string[]>([]);
  const [liLevel, setLiLevel]                   = useState<string[]>([]);
  const [liRemote, setLiRemote]                 = useState<string[]>([]);

  // HelloWork-specific
  const [hwPeriod, setHwPeriod]                 = useState("7d");
  const [hwDistance, setHwDistance]             = useState("20");
  const [hwContract, setHwContract]             = useState<string[]>([]);

  // Cabinet-specific
  const [cabinetSpecialty, setCabinetSpecialty] = useState("");

  // Immigration-specific
  const [immiCountry, setImmiCountry]           = useState("ca");
  const [immiVisaType, setImmiVisaType]         = useState("");

  // Common
  const [showFilters, setShowFilters]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [jobs, setJobs]                 = useState<NormalizedJob[]>([]);
  const [error, setError]               = useState("");
  const [history, setHistory]           = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs]   = useState<Record<string, boolean>>({});

  // Modals
  const [selectedJob, setSelectedJob]   = useState<NormalizedJob | null>(null);
  const [detailJob, setDetailJob]       = useState<NormalizedJob | null>(null);
  const [optimizeJob, setOptimizeJob]   = useState<NormalizedJob | null>(null);

  // Placeholder preview jobs (shown before the user runs their first search)
  const [placeholderJobs, setPlaceholderJobs] = useState<NormalizedJob[]>([]);
  const [placeholderCategory, setPlaceholderCategory] = useState<"tech" | "non-tech">("non-tech");
  const [hasSearched, setHasSearched] = useState(false);

  // ── Load preview placeholder jobs based on user's industry ─────────────────
  // Cache-bust with timestamp so each page visit gets a fresh random set
  useEffect(() => {
    fetch(`/api/jobs/instant?_t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.jobs)) {
          setPlaceholderJobs(data.jobs);
          setPlaceholderCategory(data.category ?? "non-tech");
        }
      })
      .catch(() => { /* silent — placeholders are non-critical */ });
  }, []);

  // ── Load history ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("job_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15)
      .then(({ data }) => { if (data) setHistory(data); });
  }, [userId]);

  // ── Sync applied state ─────────────────────────────────────────────────────
  useEffect(() => {
    const applied: Record<string, boolean> = {};
    jobs.forEach((job) => {
      if (localStorage.getItem(`applied_${job.id}`)) applied[job.id] = true;
    });
    setAppliedJobs(applied);
  }, [jobs]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (e?: React.FormEvent, kw = keywords, loc = location, src = activeSource) => {
      if (e) e.preventDefault();
      setLoading(true);
      setError("");
      setJobs([]);
      setHasSearched(true);

      try {
        const source = SOURCES.find((s) => s.id === src)!;

        // ── Cabinet & Immigration: use placeholder results (API coming soon) ──
        if (src === "cabinet" || src === "immigration") {
          // Simulate a short loading time for UX consistency
          await new Promise((r) => setTimeout(r, 800));

          // Use placeholders, tagged with the active source
          const fakeJobs: NormalizedJob[] = placeholderJobs.slice(0, 12).map((j, i) => ({
            ...j,
            id: `${src}-${i}-${j.id}`,
            source: src,
            ...(src === "cabinet"
              ? {
                  companyName: [
                    "Michael Page", "Robert Half", "Hays", "Korn Ferry",
                    "PageGroup", "Adecco Talent", "Manpower Executive",
                    "Spring Professional", "Expectra", "Mercuri Urval",
                    "Morgan Philips", "FedGroup",
                  ][i % 12],
                }
              : {
                  companyName: [
                    "Immigration Canada", "Pôle Emploi International", "Work Permit Agency",
                    "Global Talent Visa", "Expat Network", "Visa Solutions",
                    "International Mobility", "Talent Beyond Borders",
                    "WorldBridge HR", "Visa Express Pro",
                    "Global Relocations", "Pathway Immigration",
                  ][i % 12],
                  location: IMMIGRATION_COUNTRIES.find((c) => c.value === immiCountry)?.label.slice(4) ?? loc,
                }),
            title: kw ? `${j.title} — ${kw}` : j.title,
          }));

          setJobs(fakeJobs);

          // Save to job_searches
          if (userId && fakeJobs.length > 0) {
            const supabase = createClient();
            const { data: inserted } = await supabase
              .from("job_searches")
              .insert({
                user_id: userId,
                query: kw,
                location: loc,
                country: src,
                results: fakeJobs,
              })
              .select()
              .single();
            if (inserted) setHistory((prev) => [inserted, ...prev].slice(0, 15));
          }

          setLoading(false);
          return;
        }

        // ── Real API sources ────────────────────────────────────────────────
        let payload: Record<string, unknown> = {};

        if (src === "indeed") {
          payload = {
            query: kw,
            location: loc,
            country,
            ...(inJobType ? { jobType: inJobType } : {}),
          };
        } else if (src === "linkedin") {
          payload = {
            title: kw, location: loc,
            datePosted: liDatePosted,
            contractType: liContract,
            experienceLevel: liLevel,
            remote: liRemote,
            limit: 25,
          };
        } else {
          payload = {
            keywords: kw,
            location: loc,
            period: hwPeriod,
            distance: hwDistance,
            ...(hwContract.length > 0 ? { contract: hwContract } : {}),
            limit: 30,
          };
        }

        const res  = await fetch(source.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const rawItems: any[] = data.items ?? [];
        const normalized: NormalizedJob[] = src === "indeed"
          ? rawItems.map(normalizeIndeed)
          : rawItems; // LinkedIn and HelloWork are already normalized server-side

        setJobs(normalized);

        // Save to job_searches
        if (userId && normalized.length > 0) {
          const supabase = createClient();
          const { data: inserted } = await supabase
            .from("job_searches")
            .insert({
              user_id: userId,
              query: kw,
              location: loc,
              country: src, // reuse country column to store source
              results: normalized,
            })
            .select()
            .single();

          if (inserted) {
            setHistory((prev) => [inserted, ...prev].slice(0, 15));
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [keywords, location, activeSource, country, inJobType, liDatePosted, liContract, liLevel, liRemote, hwPeriod, hwDistance, hwContract, cabinetSpecialty, immiCountry, immiVisaType, placeholderJobs, userId]
  );

  const loadFromHistory = (h: any) => {
    const src = (h.country as Source) || "indeed";
    setKeywords(h.query);
    setLocation(h.location);
    setActiveSource(src);
    setJobs(h.results ?? []);
  };

  // ── Source-specific filter panels ──────────────────────────────────────────
  const renderFilters = () => {
    if (activeSource === "cabinet") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Spécialité du cabinet</label>
            <select
              value={cabinetSpecialty}
              onChange={(e) => setCabinetSpecialty(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {CABINET_SPECIALTIES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (activeSource === "immigration") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Pays de destination</label>
            <select
              value={immiCountry}
              onChange={(e) => setImmiCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {IMMIGRATION_COUNTRIES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Type de visa</label>
            <select
              value={immiVisaType}
              onChange={(e) => setImmiVisaType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {IMMIGRATION_VISA_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (activeSource === "indeed") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {[["fr","France"],["be","Belgique"],["ch","Suisse"],["ca","Canada"],["us","États-Unis"],["gb","Royaume-Uni"],["de","Allemagne"],["es","Espagne"]].map(([code, label]) => (
                <option key={code} value={code}>{label} ({code.toUpperCase()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Type de contrat</label>
            <select
              value={inJobType}
              onChange={(e) => setInJobType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {IN_JOB_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (activeSource === "linkedin") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1.5">Publiée depuis</label>
              <select
                value={liDatePosted}
                onChange={(e) => setLiDatePosted(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {LI_DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Type de contrat</label>
            <MultiSelect options={LI_CONTRACT} value={liContract} onChange={setLiContract} placeholder="Tous" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Niveau d'expérience</label>
            <MultiSelect options={LI_LEVEL} value={liLevel} onChange={setLiLevel} placeholder="Tous" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Télétravail</label>
            <MultiSelect options={LI_REMOTE} value={liRemote} onChange={setLiRemote} placeholder="Tous" />
          </div>
        </div>
      );
    }

    // HelloWork
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Publiée depuis</label>
            <select
              value={hwPeriod}
              onChange={(e) => setHwPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {HW_PERIOD.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">Rayon (km)</label>
            <select
              value={hwDistance}
              onChange={(e) => setHwDistance(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              {["5","10","20","30","50","100"].map((d) => <option key={d} value={d}>{d} km</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1.5">Type de contrat</label>
          <MultiSelect options={HW_CONTRACT} value={hwContract} onChange={setHwContract} placeholder="Tous" />
        </div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-primary" />
            Chasseur d'Opportunités
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Agrégateurs, cabinets de recrutement et immigration — tout depuis une seule interface
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/jobs#cv-history")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-primary font-semibold text-sm rounded-xl border border-brand-100 transition-all shrink-0"
        >
          <History className="w-4 h-4" /> CV optimisés
        </button>
      </div>

      {/* ── Source tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {availableSources.map((src) => (
          <button
            key={src.id}
            onClick={() => { setActiveSource(src.id); setJobs([]); setError(""); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeSource === src.id
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {src.label}
          </button>
        ))}
      </div>

      {/* ── Search form ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSearch} className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={
                activeSource === "cabinet"
                  ? "Poste recherché (ex: Chef de projet, DAF...)"
                  : activeSource === "immigration"
                    ? "Métier / compétence (ex: Infirmier, Data Engineer...)"
                    : "Titre du poste (ex: Développeur React)"
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all text-sm"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={
                activeSource === "immigration"
                  ? "Ville de destination (ex: Toronto, Berlin...)"
                  : "Localisation (ex: Paris, Lyon...)"
              }
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                showFilters
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-primary/40"
              }`}
            >
              <Filter className="w-4 h-4" />
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-dark text-white font-bold text-sm shadow-lg shadow-brand-primary/30 disabled:opacity-60 transition-all hover:shadow-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "Scan…" : "Rechercher"}
            </button>
          </div>
        </form>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtres {SOURCES.find((s) => s.id === activeSource)?.label ?? activeSource}
            </p>
            {renderFilters()}
          </div>
        )}
      </div>

      {/* ── Search history chips ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Récent :
          </span>
          {history.slice(0, 8).map((h, i) => (
            <button
              key={h.id ?? i}
              onClick={() => loadFromHistory(h)}
              className="text-xs font-medium bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-primary px-3 py-1.5 rounded-full border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <span className="uppercase text-[9px] px-1 bg-slate-200 rounded text-slate-500">
                {h.country || "IN"}
              </span>
              {h.query} – {h.location}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-2 text-red-700 text-sm">
          <X className="w-4 h-4 shrink-0" />
          <span className="font-medium">Erreur : {error}</span>
        </div>
      )}

      {/* ── Beta banner for new sources ──────────────────────────────────── */}
      {(activeSource === "cabinet" || activeSource === "immigration") && !hasSearched && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 border ${
          activeSource === "cabinet"
            ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-200"
            : "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            activeSource === "cabinet" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
          }`}>
            {activeSource === "cabinet" ? <Users className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-black uppercase tracking-widest ${
              activeSource === "cabinet" ? "text-amber-700" : "text-emerald-700"
            }`}>
              {activeSource === "cabinet" ? "Cabinets de recrutement" : "Offres immigration"} — Bêta
            </p>
            <p className="text-sm text-slate-600">
              {activeSource === "cabinet"
                ? "Trouvez des opportunités via les meilleurs cabinets de recrutement. Lancez une recherche pour découvrir les postes disponibles."
                : "Explorez les offres d'emploi avec sponsorship visa à l'international. Sélectionnez un pays et lancez votre recherche."}
            </p>
          </div>
        </div>
      )}

      {/* ── Preview placeholder section (shown before first real search on aggregator tabs) ── */}
      {!loading && jobs.length === 0 && !error && !hasSearched && placeholderJobs.length > 0 && activeSource !== "cabinet" && activeSource !== "immigration" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl px-5 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/15 text-brand-primary flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-brand-primary">
                Aperçu pour vous
              </p>
              <p className="text-sm text-slate-600">
                Voici quelques offres {placeholderCategory === "tech" ? "tech" : "généralistes"} sélectionnées
                d'après votre profil. Lancez une recherche pour des résultats personnalisés et à jour.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {placeholderJobs.map((job, i) => (
              <div key={"ph-" + job.id + i} style={{ animationDelay: `${(i % 9) * 60}ms` }} className="animate-slide-up">
                <JobCard
                  job={job}
                  isApplied={!!appliedJobs[job.id]}
                  onApply={() => setSelectedJob(job)}
                  onOptimize={() => setOptimizeJob(job)}
                  onDetails={() => setDetailJob(job)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand-light border-t-brand-primary rounded-full animate-spin" />
            <p className="text-slate-500 font-medium">
              Scan en cours sur {availableSources.find((s) => s.id === activeSource)?.label}…
            </p>
          </div>
        )}

        {/* Empty state — only when no preview is available OR after a search returned 0 */}
        {!loading && jobs.length === 0 && !error && (hasSearched || placeholderJobs.length === 0) && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 text-brand-primary rounded-2xl mb-5">
              <Search className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              {hasSearched ? "Aucune offre trouvée" : "Prêt à trouver votre prochain job ?"}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm">
              {hasSearched
                ? "Essayez d'élargir vos mots-clés ou de changer de source."
                : "Choisissez une source, entrez un titre de poste et une localisation."}
            </p>
          </div>
        )}

        {jobs.map((job, i) => (
          <div key={job.id + i} style={{ animationDelay: `${(i % 9) * 60}ms` }} className="animate-slide-up">
            <JobCard
              job={job}
              isApplied={!!appliedJobs[job.id]}
              onApply={() => setSelectedJob(job)}
              onOptimize={() => setOptimizeJob(job)}
              onDetails={() => setDetailJob(job)}
            />
          </div>
        ))}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {detailJob && (
        <JobDetailModal job={detailJob} onClose={() => setDetailJob(null)} />
      )}

      {selectedJob && (
        <ApplyModal
          job={{
            ...selectedJob,
            jobUrl: selectedJob.jobUrl,
            descriptionText: selectedJob.descriptionText,
            companyName: selectedJob.companyName,
            emails: [],
          }}
          onClose={() => setSelectedJob(null)}
          onApplied={() => {
            setAppliedJobs((prev) => ({ ...prev, [selectedJob.id]: true }));
            // Ne pas fermer le modal ici — le panneau d'assistance reste affiché
            // L'utilisateur fermera via le bouton X (onClose)
          }}
        />
      )}

      {optimizeJob && optimizeJob.descriptionText && (
        <ScrapperOptimizeModal
          job={{
            title: optimizeJob.title,
            companyName: optimizeJob.companyName,
            descriptionText: optimizeJob.descriptionText,
            jobUrl: optimizeJob.jobUrl,
            applyUrl: optimizeJob.applyUrl ?? undefined,
            salary: optimizeJob.salary ?? undefined,
            location: optimizeJob.location,
            emails: [],
          }}
          onClose={() => setOptimizeJob(null)}
        />
      )}
    </div>
  );
}
