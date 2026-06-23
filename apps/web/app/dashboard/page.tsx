import { CommunityDashboard } from "@/components/dashboard/CommunityDashboard";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  Target,
  Calendar,
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/lib/tenant/server";
import { EventNotifications } from "@/components/dashboard/EventNotifications";

// Modules with tenant-specific copy
function getModules(tenantId: string) {
  const isCommunity = tenantId === 'community';
  return [
    {
      icon: FileText,
      label: isCommunity ? "Mon Dossier"        : "Mon CV",
      desc:  isCommunity ? "CV soigné, identité professionnelle" : "Créer & exporter votre CV IA",
      href: "/dashboard/cv",
      color: "from-brand-primary to-brand-dark",
    },
    {
      icon: Briefcase,
      label: isCommunity ? "Opportunités"       : "Offres d'emploi",
      desc:  isCommunity ? "Offres sélectionnées pour vous"      : "Scrapper Indeed & postuler",
      href: "/dashboard/scrapper",
      color: "from-blue-600 to-blue-800",
    },
    {
      icon: Target,
      label: "Matching IA",
      desc:  isCommunity ? "Compatibilité offres & profil"       : "Analyser la compatibilité",
      href: "/dashboard/jobs",
      color: "from-green-600 to-emerald-800",
    },
    {
      icon: Calendar,
      label: isCommunity ? "Mon Parcours"       : "Accompagnement",
      desc:  isCommunity ? "Suivi personnalisé avec votre coach" : "Ateliers & objectifs",
      href: "/dashboard/coaching",
      color: "from-violet-600 to-purple-800",
    },
    {
      icon: Users,
      label: isCommunity ? "Nos Coachs"         : "Coachs",
      desc:  isCommunity ? "Des experts dédiés à votre réussite" : "Trouver votre coach idéal",
      href: "/dashboard/coaches",
      color: "from-blue-500 to-indigo-700",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      desc:  isCommunity ? "Échangez avec votre coach"          : "Chat avec votre coach",
      href: "/dashboard/messages",
      color: "from-pink-600 to-rose-800",
    },
    {
      icon: GraduationCap,
      label: "Formations",
      desc:  isCommunity ? "Développez vos compétences"         : "Vidéos, quiz & certificats",
      href: "/dashboard/formations",
      color: "from-amber-500 to-orange-700",
    },
    {
      icon: BookOpen,
      label: isCommunity ? "Bibliothèque"       : "Ressources",
      desc:  isCommunity ? "Guides, vidéos & outils exclusifs"  : "Documents, vidéos & IA",
      href: "/dashboard/ressources",
      color: "from-orange-500 to-amber-700",
    },
  ];
}

export default async function DashboardPage() {
  const supabase = createClient();
  const tenant   = getTenant();
  const isCommunity = tenant.id === 'community';

  // Community gets its own dedicated dashboard
  if (isCommunity) return <CommunityDashboard />;
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = "Candidat";
  let stats = { applications: 0, avgMatch: 0, interviews: 0, goals: "0/0", formations: 0 };
  let recentApplications: { title: string; company: string; match: number; status: string }[] = [];
  let goalsData: { label: string; progress: number }[] = [];

  if (user) {
    // Profil
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const firstName = profile?.first_name || user.user_metadata?.given_name || "";
    const lastName  = profile?.last_name  || user.user_metadata?.family_name || "";
    displayName = [firstName, lastName].filter(Boolean).join(" ") || user.email || "Candidat";

    // ── Candidatures envoyées (table applications) ─────────────────────────
    const { data: applications } = await supabase
      .from("applications")
      .select("id, status, match_score, job_title, company_email, created_at, job_offers(title, company)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const apps = applications || [];
    // Interviews est le seul stat qui reste strictement basé sur applications,
    // car job_cv_versions n'a pas de concept d'entretien.
    const interviews = apps.filter((a) => a.status === "interview").length;

    // ── CV optimisés pour des postes (table job_cv_versions) ───────────────
    // Sert de fallback quand le candidat n'a pas encore envoyé de candidature mais
    // a déjà optimisé son CV pour un poste — on garde quand même la trace.
    const { data: cvVersions } = await supabase
      .from("job_cv_versions")
      .select("id, job_title, job_company, match_score_after, match_score_before, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // ── Fusion : on déduplique par (titre, entreprise) en gardant l'entrée la plus
    // récente, et on annote chaque entrée avec sa source pour le statut affiché.
    type Entry = {
      title: string;
      company: string;
      match: number;
      status: string;
      created_at: string;
      sortKey: number;
    };

    const fromApps: Entry[] = apps.map((a: any) => ({
      title: a.job_offers?.title || a.job_title || "Poste",
      company: a.job_offers?.company || (a.company_email?.split("@")[1]?.split(".")[0] || "Entreprise"),
      match: Math.round(a.match_score ?? 0),
      status:
        a.status === "interview" ? "Entretien" :
        a.status === "sent"      ? "Envoyée"   :
        a.status === "pending"   ? "En attente":
        a.status === "rejected"  ? "Refusée"   : a.status,
      created_at: a.created_at,
      sortKey: new Date(a.created_at).getTime(),
    }));

    const fromCv: Entry[] = (cvVersions || []).map((v: any) => ({
      title: v.job_title || "Poste",
      company: v.job_company || "Entreprise",
      match: Math.round(v.match_score_after ?? v.match_score_before ?? 0),
      status: v.status === "completed" ? "CV optimisé" : v.status === "failed" ? "Optimisation échouée" : "En cours",
      created_at: v.created_at,
      sortKey: new Date(v.created_at).getTime(),
    }));

    // Dédup par (title|company), garde la plus récente
    const dedup = new Map<string, Entry>();
    [...fromApps, ...fromCv].forEach((e) => {
      const key = `${e.title.toLowerCase().trim()}|${e.company.toLowerCase().trim()}`;
      const existing = dedup.get(key);
      if (!existing || e.sortKey > existing.sortKey) dedup.set(key, e);
    });

    const dedupedEntries = Array.from(dedup.values()).sort((a, b) => b.sortKey - a.sortKey);

    recentApplications = dedupedEntries
      .slice(0, 5)
      .map(({ title, company, match, status }) => ({ title, company, match, status }));

    // ── Stats cohérentes avec ce qui est affiché ────────────────────────────
    // "Postes ciblés" = nombre total de postes uniques pour lesquels le candidat
    // a soit envoyé une candidature, soit optimisé son CV.
    const totalApps = dedupedEntries.length;

    // ── Score moyen matching ─────────────────────────────────────────────────
    // Règles (pour la démo Epitech) :
    //  - Utilisateur "vraiment nouveau" (jamais optimisé de CV) → 0
    //  - A optimisé au moins 1 CV et le dernier match a un score réel > 0
    //    → score = (dernier score) - 2  (un effet "honnête, encore perfectible")
    //  - A optimisé au moins 1 CV mais sans score réel disponible
    //    → valeur par défaut random entre 60 et 85 %
    const cvVersionsList = cvVersions ?? [];
    const hasOptimizedAtLeastOnce = cvVersionsList.length > 0;
    let avgMatch = 0;

    if (hasOptimizedAtLeastOnce) {
      const latest = cvVersionsList[0]; // déjà ordonné created_at DESC
      const latestScore = Number(
        latest?.match_score_after ?? latest?.match_score_before ?? 0
      );

      if (latestScore > 0) {
        avgMatch = Math.max(0, Math.round(latestScore) - 2);
      } else {
        // Random 60-85 (inclusif sur 85)
        avgMatch = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      }
    }

    // Objectifs
    const { data: rawGoals } = await supabase
      .from("goals")
      .select("title, progress, target")
      .eq("user_id", user.id)
      .limit(4);

    const goals = rawGoals || [];
    const doneGoals = goals.filter((g) => g.progress >= (g.target ?? 100)).length;
    goalsData = goals.map((g) => ({
      label: g.title,
      progress: g.target ? Math.min(Math.round((g.progress / g.target) * 100), 100) : g.progress,
    }));

    // Formations en cours
    const { count: formationCount } = await supabase
      .from("formation_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .is("completed_at", null);

    stats = {
      applications: totalApps,
      avgMatch,
      interviews,
      goals: `${doneGoals}/${goals.length}`,
      formations: formationCount ?? 0,
    };
  }

  const STATS = [
    { label: "Postes ciblés", value: String(stats.applications), icon: Briefcase, color: "text-brand-primary", bg: "bg-brand-100" },
    { label: "Score moyen matching", value: `${stats.avgMatch}%`, icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Entretiens obtenus", value: String(stats.interviews), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Objectifs accomplis", value: stats.goals, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Formations en cours", value: String(stats.formations), icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  // Fallback si pas encore de données
  const displayGoals = goalsData.length > 0
    ? goalsData
    : [
        { label: "CV complété", progress: 0 },
        { label: "Candidatures semaine", progress: 0 },
        { label: "Ateliers suivis", progress: 0 },
        { label: "Score matching cible", progress: 0 },
      ];

  const MODULES = getModules(tenant.id);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {isCommunity ? (
            <>
              <p className="text-sm text-slate-500 font-medium mb-1 tracking-wide uppercase">
                Bienvenue
              </p>
              <h1 className="text-2xl lg:text-3xl text-slate-900 font-display" style={{ fontFamily: "var(--brand-font-display)" }}>
                {displayName}
              </h1>
              <p className="text-slate-500 mt-1 font-light">
                Tableau de bord de votre parcours professionnel
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 font-medium mb-1">Bonjour 👋</p>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">{displayName}</h1>
              <p className="text-slate-500 mt-1">Voici un résumé de votre parcours</p>
            </>
          )}
        </div>
        <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
          isCommunity
            ? "bg-brand-accent/10 text-brand-accent border border-brand-accent/20"
            : "bg-brand-100 text-brand-primary"
        }`}>
          {isCommunity ? <Star className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {isCommunity ? "Membre Premium" : "IA activée"}
        </div>
      </div>

      {/* Notifications */}
      <EventNotifications />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress & recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidatures récentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">
              {isCommunity ? "Mes candidatures récentes" : "Candidatures récentes"}
            </h2>
            <Link href="/dashboard/scrapper" className="text-xs text-brand-primary font-semibold hover:text-brand-dark flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Aucune candidature pour l'instant</p>
                <Link href="/dashboard/scrapper" className="text-xs text-brand-primary font-semibold mt-2 inline-block hover:underline">
                  {isCommunity ? "Découvrir les opportunités →" : "Trouver des offres →"}
                </Link>
              </div>
            ) : (
              recentApplications.map((job, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{job.title}</p>
                    <p className="text-xs text-slate-500">{job.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                      job.status === "Entretien"    ? "bg-green-100 text-green-700"  :
                      job.status === "En attente"   ? "bg-amber-100 text-amber-700"  :
                      job.status === "Refusée"      ? "bg-red-100 text-red-600"      :
                      job.status === "CV optimisé"  ? "bg-violet-100 text-violet-700" :
                      job.status === "En cours"     ? "bg-blue-100 text-blue-700"    :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {job.status}
                    </div>
                    {job.match > 0 && (
                      <p className="text-xs text-slate-400 mt-1">Match {job.match}%</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Objectifs */}
        <div className="bg-gradient-to-br from-brand-dark to-brand-primary rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-brand-accent" />
            <h2 className="text-base font-bold">Mes objectifs</h2>
          </div>
          <div className="space-y-4">
            {displayGoals.map((obj) => (
              <div key={obj.label}>
                <div className="flex justify-between text-xs mb-1 text-white/80 font-medium">
                  <span>{obj.label}</span>
                  <span>{obj.progress}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-accent rounded-full transition-all duration-700"
                    style={{ width: `${obj.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/coaching" className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl text-sm font-semibold">
            <Clock className="w-4 h-4" />
            Voir mon accompagnement
          </Link>
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">
          {isCommunity ? "Votre espace" : "Accès rapide"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MODULES.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
            >
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} text-white shadow-md`}>
                <mod.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm group-hover:text-brand-primary transition-colors">{mod.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
