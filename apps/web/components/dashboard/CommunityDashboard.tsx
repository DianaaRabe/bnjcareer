// ─────────────────────────────────────────────────────────────────────────────
// Community Dashboard — server component
//
// Completely separate from the FR/Africa dashboard.
// Visual identity: ivory bg · navy cards · gold accents · DM Serif Display headings
// Data: same user stats + local community jobs (no external aggregators)
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import {
  FileText, Briefcase, Target, Calendar, Users, MessageSquare,
  BookOpen, GraduationCap, ArrowRight, Star, TrendingUp,
  CheckCircle, Clock, MapPin, Banknote, Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EventNotifications } from "@/components/dashboard/EventNotifications";

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD  = "#D4AF37";
const NAVY  = "#0F172A";
const BLUE  = "#1E3A8A";
const IVORY = "#F8FAFC";
const SAND  = "#EAD7B7";
const SAND_BORDER = `${SAND}90`;

const SERIF: React.CSSProperties = {
  fontFamily: "'DM Serif Display', Georgia, serif",
  fontWeight: 400,
};

// ─── Feature modules ──────────────────────────────────────────────────────────

const MODULES = [
  { icon: FileText,      label: "Mon Dossier",      desc: "CV soigné & identité pro",              href: "/dashboard/cv",            gold: false },
  { icon: Briefcase,     label: "Opportunités",      desc: "Offres sélectionnées pour vous",        href: "/dashboard/scrapper",      gold: true  },
  { icon: Target,        label: "Matching IA",       desc: "Compatibilité offre & profil",          href: "/dashboard/jobs",          gold: false },
  { icon: Calendar,      label: "Mon Parcours",      desc: "Suivi avec votre coach",                href: "/dashboard/coaching",      gold: false },
  { icon: Users,         label: "Nos Coachs",        desc: "Des experts à votre service",           href: "/dashboard/coaches",       gold: false },
  { icon: MessageSquare, label: "Messages",          desc: "Échangez en toute confiance",           href: "/dashboard/messages",      gold: false },
  { icon: GraduationCap, label: "Formations",        desc: "Développez vos compétences",            href: "/dashboard/formations",    gold: false },
  { icon: BookOpen,      label: "Bibliothèque",      desc: "Ressources & guides exclusifs",         href: "/dashboard/ressources",    gold: false },
];

// ─── Section title component ──────────────────────────────────────────────────

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="space-y-1 mb-6">
      <h2 className="text-2xl" style={{ ...SERIF, color: NAVY }}>{children}</h2>
      {sub && <p className="text-sm" style={{ color: "#64748b" }}>{sub}</p>}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, gold = false }: {
  label: string; value: string; icon: React.ElementType; gold?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "white",
        border: `1px solid ${SAND_BORDER}`,
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: gold ? `${GOLD}18` : `${BLUE}10`, color: gold ? GOLD : BLUE }}
      >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-black" style={{ color: NAVY }}>{value}</p>
        <p className="text-xs font-medium mt-0.5" style={{ color: "#94a3b8" }}>{label}</p>
      </div>
    </div>
  );
}

// ─── Community job card (compact) ─────────────────────────────────────────────

function JobCard({ job }: { job: any }) {
  return (
    <Link
      href="/dashboard/scrapper"
      className="flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group"
      style={{
        background: "white",
        border: `1px solid ${SAND_BORDER}`,
        boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
      }}
    >
      {/* Logo */}
      {job.companies?.logo_url ? (
        <img
          src={job.companies.logo_url}
          alt={job.companies.name}
          className="w-11 h-11 rounded-xl object-contain border p-1 shrink-0 bg-white"
          style={{ borderColor: SAND_BORDER }}
        />
      ) : (
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0"
          style={{ background: `${BLUE}10`, color: BLUE }}
        >
          {(job.companies?.name || job.title || "?").charAt(0).toUpperCase()}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate group-hover:text-blue-700 transition-colors" style={{ color: NAVY }}>
          {job.title}
        </p>
        <p className="text-xs font-medium mt-0.5 truncate" style={{ color: "#64748b" }}>
          {job.companies?.name}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {job.location && (
            <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#94a3b8" }}>
              <MapPin className="w-3 h-3" /> {job.location}
            </span>
          )}
          {job.contract_type && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${BLUE}10`, color: BLUE }}
            >
              {job.contract_type}
            </span>
          )}
          {job.salary_label && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700">
              <Banknote className="w-3 h-3" /> {job.salary_label}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight
        className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
        style={{ color: GOLD }}
      />
    </Link>
  );
}

// ─── Module card ──────────────────────────────────────────────────────────────

function ModuleCard({ icon: Icon, label, desc, href, gold }: {
  icon: React.ElementType; label: string; desc: string; href: string; gold: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: gold ? NAVY : "white",
        border: `1px solid ${gold ? "transparent" : SAND_BORDER}`,
        boxShadow: gold
          ? `0 8px 30px ${NAVY}30`
          : "0 2px 12px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{
          background: gold ? `${GOLD}20` : `${BLUE}10`,
          color: gold ? GOLD : BLUE,
        }}
      >
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: gold ? "white" : NAVY }}>
          {label}
        </p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: gold ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>
          {desc}
        </p>
      </div>
      <ArrowRight
        className="w-4 h-4 mt-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
        style={{ color: gold ? GOLD : BLUE }}
      />
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export async function CommunityDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── User data ──────────────────────────────────────────────────────────────
  let displayName = "Membre";
  let stats = { applications: 0, avgMatch: 0, interviews: 0, goals: "0/0", formations: 0 };
  let recentApplications: { title: string; company: string; match: number; status: string }[] = [];
  let goalsData: { label: string; progress: number }[] = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const firstName = profile?.first_name || user.user_metadata?.given_name || "";
    const lastName  = profile?.last_name  || user.user_metadata?.family_name || "";
    displayName = [firstName, lastName].filter(Boolean).join(" ") || user.email?.split("@")[0] || "Membre";

    const { data: applications } = await supabase
      .from("applications")
      .select("id, status, match_score, job_title, company_email, created_at, job_offers(title, company)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const apps = applications || [];
    const scores = apps.map((a: any) => a.match_score).filter((s: any) => s != null) as number[];
    const avgMatch = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;

    recentApplications = apps.slice(0, 4).map((a: any) => ({
      title:   a.job_offers?.title || a.job_title || "Poste",
      company: a.job_offers?.company || (a.company_email?.split("@")[1]?.split(".")[0] || "Entreprise"),
      match:   Math.round(a.match_score ?? 0),
      status:
        a.status === "interview" ? "Entretien" :
        a.status === "sent"      ? "Envoyée"   :
        a.status === "pending"   ? "En attente" :
        a.status === "rejected"  ? "Refusée"   : a.status,
    }));

    const { data: rawGoals } = await supabase
      .from("goals")
      .select("title, progress, target")
      .eq("user_id", user.id)
      .limit(4);

    const goals = rawGoals || [];
    const done  = goals.filter((g: any) => g.progress >= (g.target ?? 100)).length;
    goalsData   = goals.map((g: any) => ({
      label:    g.title,
      progress: g.target ? Math.min(Math.round((g.progress / g.target) * 100), 100) : g.progress,
    }));

    const { count: formationCount } = await supabase
      .from("formation_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .is("completed_at", null);

    stats = {
      applications: apps.length,
      avgMatch,
      interviews:  apps.filter((a: any) => a.status === "interview").length,
      goals:       `${done}/${goals.length}`,
      formations:  formationCount ?? 0,
    };
  }

  // ── Community jobs (most recent 4) ────────────────────────────────────────
  const { data: recentJobs } = await supabase
    .from("local_jobs")
    .select("id, title, location, contract_type, salary_label, companies(name, logo_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const jobs = recentJobs || [];

  // ── Fallback goals ────────────────────────────────────────────────────────
  const displayGoals = goalsData.length > 0 ? goalsData : [
    { label: "CV complété",            progress: 0 },
    { label: "Candidatures semaine",   progress: 0 },
    { label: "Ateliers suivis",        progress: 0 },
    { label: "Score matching cible",   progress: 0 },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-10" style={{ background: IVORY, minHeight: "100vh" }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p
            className="text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ color: `${GOLD}90` }}
          >
            Espace membre
          </p>
          <h1 className="text-3xl lg:text-4xl" style={{ ...SERIF, color: NAVY }}>
            {displayName}
          </h1>
          <p className="text-sm font-light" style={{ color: "#64748b" }}>
            Tableau de bord de votre parcours professionnel
          </p>
        </div>

        {/* Premium badge */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shrink-0"
          style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GOLD }}
        >
          <Star className="w-3.5 h-3.5" strokeWidth={1.5} />
          Membre Premium
        </div>
      </div>

      {/* ── Notifications ────────────────────────────────────────────────────── */}
      <EventNotifications />

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Candidatures"        value={String(stats.applications)} icon={Briefcase}   gold={false} />
        <StatCard label="Score matching moyen" value={`${stats.avgMatch}%`}       icon={Target}      gold={false} />
        <StatCard label="Entretiens obtenus"  value={String(stats.interviews)}   icon={CheckCircle} gold={false} />
        <StatCard label="Objectifs accomplis" value={stats.goals}                icon={Star}        gold={true}  />
        <StatCard label="Formations en cours" value={String(stats.formations)}   icon={GraduationCap} gold={false} />
      </div>

      {/* ── Main 2-col layout ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Opportunités récentes (2/3) ───────────────────────────────────── */}
        <div
          className="lg:col-span-2 rounded-3xl p-6"
          style={{ background: "white", border: `1px solid ${SAND_BORDER}`, boxShadow: "0 2px 20px rgba(15,23,42,0.04)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl" style={{ ...SERIF, color: NAVY }}>Opportunités récentes</h2>
              <p className="text-xs font-medium mt-0.5" style={{ color: "#94a3b8" }}>
                Sélectionnées pour la communauté
              </p>
            </div>
            <Link
              href="/dashboard/scrapper"
              className="flex items-center gap-1 text-xs font-bold transition-colors hover:opacity-70"
              style={{ color: GOLD }}
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: NAVY }} />
              <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                Les premières offres arrivent bientôt.
              </p>
              <Link
                href="/dashboard/scrapper"
                className="text-xs font-bold mt-2 inline-block hover:opacity-70"
                style={{ color: GOLD }}
              >
                Explorer la plateforme →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        {/* ── Objectifs (1/3) ───────────────────────────────────────────────── */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{ background: NAVY }}
        >
          {/* Gold glow */}
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10"
            style={{ background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
          />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: GOLD }} strokeWidth={1.5} />
              <h2 className="text-lg text-white" style={SERIF}>Mes objectifs</h2>
            </div>

            <div className="space-y-4">
              {displayGoals.map((obj) => (
                <div key={obj.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{obj.label}</span>
                    <span className="font-bold" style={{ color: GOLD }}>{obj.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${obj.progress}%`, background: `linear-gradient(90deg, ${GOLD}90, ${GOLD})` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/coaching"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Clock className="w-3.5 h-3.5" />
              Voir mon parcours
            </Link>
          </div>
        </div>
      </div>

      {/* ── Candidatures récentes ────────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6"
        style={{ background: "white", border: `1px solid ${SAND_BORDER}`, boxShadow: "0 2px 20px rgba(15,23,42,0.04)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl" style={{ ...SERIF, color: NAVY }}>Mes candidatures récentes</h2>
          <Link href="/dashboard/scrapper" className="text-xs font-bold hover:opacity-70 flex items-center gap-1" style={{ color: GOLD }}>
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: NAVY }} />
            <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>Aucune candidature pour l'instant.</p>
            <Link href="/dashboard/scrapper" className="text-xs font-bold mt-2 inline-block hover:opacity-70" style={{ color: GOLD }}>
              Découvrir les opportunités →
            </Link>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: `${SAND}60` }}>
            {recentApplications.map((job, idx) => (
              <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: `${BLUE}10`, color: BLUE }}
                >
                  {job.company.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: NAVY }}>{job.title}</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{job.company}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: job.status === "Entretien" ? "rgba(34,197,94,0.1)"
                        : job.status === "En attente"        ? `${GOLD}18`
                        : job.status === "Refusée"           ? "rgba(239,68,68,0.08)"
                        : `${BLUE}10`,
                      color: job.status === "Entretien" ? "#16a34a"
                        : job.status === "En attente"   ? GOLD
                        : job.status === "Refusée"      ? "#dc2626"
                        : BLUE,
                    }}
                  >
                    {job.status}
                  </span>
                  {job.match > 0 && (
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Match {job.match}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Feature grid ─────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-[40px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
          <h2 className="text-2xl" style={{ ...SERIF, color: NAVY }}>Votre espace</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.href} {...mod} />
          ))}
        </div>
      </div>
    </div>
  );
}
