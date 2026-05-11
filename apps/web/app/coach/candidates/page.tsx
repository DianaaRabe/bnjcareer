"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 8;

interface CandidateRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  bio: string | null;
  industry: string | null;
  current_status: string | null;
  /* agrégats calculés côté client */
  formations_count: number;
  avg_progress: number;
  last_activity: string | null; // ISO date
}

function statusLabel(s: string | null) {
  switch (s) {
    case "job_seeker":   return { label: "En recherche",  cls: "bg-green-100 text-green-700" };
    case "reconversion": return { label: "Reconversion",  cls: "bg-violet-100 text-violet-700" };
    case "student":      return { label: "Étudiant",      cls: "bg-blue-100 text-blue-700" };
    default:             return { label: "Non renseigné", cls: "bg-slate-100 text-slate-500" };
  }
}

function relativeTime(isoDate: string | null): string {
  if (!isoDate) return "—";
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return "Hier";
  if (days < 30)  return `Il y a ${days} jours`;
  return new Date(isoDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function CandidatesListPage() {
  const supabase = createClient();

  const [allCandidates, setAllCandidates] = useState<CandidateRow[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);

  /* ── Chargement ────────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    /* 1. Formations du coach */
    const { data: myFormations } = await supabase
      .from("formations")
      .select("id")
      .eq("coach_id", user.id);

    const formationIds = (myFormations || []).map((f) => f.id);

    /* 2. Inscriptions dans ces formations */
    let enrollments: any[] = [];
    if (formationIds.length > 0) {
      const { data } = await supabase
        .from("formation_enrollments")
        .select("student_id, progress_pct, enrolled_at, completed_at, formation_id")
        .in("formation_id", formationIds);
      enrollments = data || [];
    }

    /* 3. IDs candidats uniques (via formations) */
    // Note : bookings référence calendar_events (ancienne table), pas coach_events.
    // On se base uniquement sur les formation_enrollments.
    const candidateIdSet = new Set<string>(
      enrollments.map((e) => e.student_id),
    );

    if (candidateIdSet.size === 0) {
      setAllCandidates([]);
      setLoading(false);
      return;
    }

    /* 5. Profils candidats */
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, bio, industry, current_status")
      .in("id", [...candidateIdSet])
      .eq("role", "candidate");

    /* 6. Emails depuis auth.users via API interne (si dispo), sinon on laisse vide */
    /* On ne peut pas lire auth.users côté client avec la clé anon — on laisse email vide */

    /* 7. Calcul des agrégats par candidat */
    const rows: CandidateRow[] = (profiles || []).map((p) => {
      const myEnrollments = enrollments.filter((e) => e.student_id === p.id);
      const avgProgress = myEnrollments.length > 0
        ? Math.round(myEnrollments.reduce((acc, e) => acc + (e.progress_pct || 0), 0) / myEnrollments.length)
        : 0;
      const dates = myEnrollments
        .map((e) => e.enrolled_at)
        .filter(Boolean)
        .sort()
        .reverse();

      return {
        ...p,
        email: "",               // non exposé côté anon
        formations_count: myEnrollments.length,
        avg_progress: avgProgress,
        last_activity: dates[0] || null,
      };
    });

    /* Tri : plus récent d'abord */
    rows.sort((a, b) => {
      if (!a.last_activity) return 1;
      if (!b.last_activity) return -1;
      return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
    });

    setAllCandidates(rows);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  /* Remise à 1 quand on cherche */
  useEffect(() => { setPage(1); }, [search]);

  /* ── Filtrage + pagination ──────────────────────────────────────────────── */
  const filtered = allCandidates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
    return (
      name.includes(q) ||
      (c.industry || "").toLowerCase().includes(q) ||
      (c.bio || "").toLowerCase().includes(q)
    );
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageSlice   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const start       = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const end         = Math.min(safePage * PAGE_SIZE, filtered.length);

  /* ── Rendu ─────────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Mes Candidats</h1>
          <p className="text-slate-500 mt-1">
            {loading ? "Chargement…" : `${allCandidates.length} candidat${allCandidates.length > 1 ? "s" : ""} dans vos formations et sessions`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtrer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Barre de recherche */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, secteur, bio…"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-brand-primary/30 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <p className="text-sm font-medium">Chargement des candidats…</p>
            </div>
          ) : pageSlice.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
              <Users className="w-12 h-12 opacity-30" />
              <div className="text-center">
                <p className="text-sm font-bold text-slate-600">
                  {search ? "Aucun résultat pour cette recherche" : "Aucun candidat inscrit pour l'instant"}
                </p>
                {!search && (
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Les candidats apparaîtront ici dès qu'ils s'inscriront à vos formations ou sessions.
                  </p>
                )}
              </div>
              {!search && (
                <Link
                  href="/coach/formations/create"
                  className="mt-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-all"
                >
                  Créer une formation
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Formations</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progression moy.</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dernière activité</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageSlice.map((c) => {
                  const { label, cls } = statusLabel(c.current_status);
                  const initials = `${(c.first_name || " ")[0]}${(c.last_name || " ")[0]}`.toUpperCase();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Candidat */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-light to-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {[c.first_name, c.last_name].filter(Boolean).join(" ") || "Candidat"}
                            </p>
                            {c.industry && (
                              <p className="text-xs text-slate-500">{c.industry}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase ${cls}`}>
                          {label}
                        </span>
                      </td>

                      {/* Formations */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <GraduationCap className="w-3.5 h-3.5 text-brand-primary" />
                          <span className="text-sm font-bold">{c.formations_count}</span>
                        </div>
                      </td>

                      {/* Progression */}
                      <td className="px-6 py-4">
                        <div className="w-full max-w-[120px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-600">{c.avg_progress}%</span>
                            {c.avg_progress < 20 && c.formations_count > 0 && (
                              <span title="À relancer"><AlertCircle className="w-3 h-3 text-amber-500" /></span>
                            )}
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                c.avg_progress > 80 ? "bg-green-500" :
                                c.avg_progress > 40 ? "bg-brand-primary" :
                                "bg-amber-500"
                              }`}
                              style={{ width: `${c.avg_progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dernière activité */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-sm">{relativeTime(c.last_activity)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-slate-400 hover:text-brand-primary transition-colors"
                            title="Envoyer un message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/coach/candidates/${c.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-50 text-brand-primary rounded-lg text-xs font-bold hover:bg-brand-primary hover:text-white transition-all"
                          >
                            Gérer <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Affichage de {start}–{end} sur {filtered.length} candidat{filtered.length > 1 ? "s" : ""}
              {search && ` · filtrés sur ${allCandidates.length}`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Précédent
              </button>

              {/* Numéros de page */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                  .reduce<(number | "…")[]>((acc, n, i, arr) => {
                    if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "…" ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n as number)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          safePage === n
                            ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
                            : "text-slate-600 hover:bg-white hover:shadow-sm border border-slate-200"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
