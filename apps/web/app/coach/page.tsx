"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Users,
  Calendar,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { EventModal } from "@/components/coach/EventModal";
import { CoachNotifications } from "@/components/coach/CoachNotifications";

interface DashboardStats {
  totalEnrolled: number;
  activeEnrolled: number;
  sessionsThisWeek: number;
  pendingBookings: number;
}

interface RecentEnrollment {
  id: string;
  student_name: string;
  formation_title: string;
  progress_pct: number;
  enrolled_at: string;
  needs_attention: boolean;
}

export default function CoachDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEnrolled: 0,
    activeEnrolled: 0,
    sessionsThisWeek: 0,
    pendingBookings: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [formations, setFormations] = useState<{ published: number; total: number; totalModules: number }>({
    published: 0, total: 0, totalModules: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Chargement parallèle
      const [eventsRes, formationsRes, enrollmentsRes] = await Promise.all([
        // Sessions à venir
        supabase
          .from("coach_events")
          .select("*")
          .eq("coach_id", user.id)
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true })
          .limit(4),

        // Formations du coach
        supabase
          .from("formations")
          .select("id, title, is_published, modules_count")
          .eq("coach_id", user.id),

        // Inscriptions dans les formations du coach
        supabase
          .from("formation_enrollments")
          .select(`
            id, progress_pct, enrolled_at, completed_at,
            formations!inner(coach_id, title),
            profiles:student_id(first_name, last_name)
          `)
          .eq("formations.coach_id", user.id)
          .order("enrolled_at", { ascending: false }),
      ]);

      // Sessions
      if (eventsRes.data) setUpcomingSessions(eventsRes.data);

      // Sessions cette semaine
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { count: weekSessions } = await supabase
        .from("coach_events")
        .select("id", { count: "exact", head: true })
        .eq("coach_id", user.id)
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", weekEnd.toISOString());

      // Formations stats
      const formationList = formationsRes.data || [];
      const publishedCount = formationList.filter((f) => f.is_published).length;
      const totalModules = formationList.reduce((acc, f) => acc + (f.modules_count || 0), 0);
      setFormations({ published: publishedCount, total: formationList.length, totalModules });

      // Inscriptions stats
      const enrollments = enrollmentsRes.data || [];
      const total = enrollments.length;
      const active = enrollments.filter((e) => !e.completed_at && e.progress_pct < 100).length;

      // Candidats qui ont besoin d'attention (< 20% de progression et inscrit depuis > 7 jours)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentList: RecentEnrollment[] = enrollments.slice(0, 6).map((e: any) => {
        const enrolledDate = new Date(e.enrolled_at);
        const needsAttention =
          e.progress_pct < 20 &&
          !e.completed_at &&
          enrolledDate < sevenDaysAgo;

        const profile = e.profiles;
        const studentName = profile
          ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Candidat"
          : "Candidat";

        return {
          id: e.id,
          student_name: studentName,
          formation_title: (e.formations as any)?.title || "Formation",
          progress_pct: e.progress_pct || 0,
          enrolled_at: e.enrolled_at,
          needs_attention: needsAttention,
        };
      });

      setRecentEnrollments(recentList);
      setStats({
        totalEnrolled: total,
        activeEnrolled: active,
        sessionsThisWeek: weekSessions ?? 0,
        pendingBookings: recentList.filter((e) => e.needs_attention).length,
      });
    };

    loadData();
  }, [supabase]);

  const STATS = [
    { label: "Apprenants inscrits", value: String(stats.totalEnrolled), icon: Users, color: "text-brand-primary", bg: "bg-brand-100" },
    { label: "Apprenants actifs", value: String(stats.activeEnrolled), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Sessions cette semaine", value: String(stats.sessionsThisWeek), icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "À relancer", value: String(stats.pendingBookings), icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">Espace Coach 👋</p>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Gérez vos formations et suivez la progression de vos apprenants.</p>
        </div>
        <div className="flex items-center gap-3">
          <CoachNotifications />
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Formations KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formations publiées</p>
            <p className="text-2xl font-black text-slate-900">{formations.published} <span className="text-sm text-slate-400 font-medium">/ {formations.total}</span></p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modules créés</p>
            <p className="text-2xl font-black text-slate-900">{formations.totalModules}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taux de complétion</p>
            <p className="text-2xl font-black text-slate-900">
              {stats.totalEnrolled > 0
                ? `${Math.round(((stats.totalEnrolled - stats.activeEnrolled) / stats.totalEnrolled) * 100)}%`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apprenants récents */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Apprenants récents</h2>
            <Link href="/coach/formations" className="text-xs text-brand-primary font-semibold hover:text-brand-dark flex items-center gap-1">
              Voir les formations <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Aucun apprenant inscrit pour l'instant</p>
                <Link href="/coach/formations/create" className="text-xs text-brand-primary font-semibold mt-2 inline-block hover:underline">
                  Créer une formation →
                </Link>
              </div>
            ) : (
              recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-light to-brand-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {e.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{e.student_name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{e.formation_title}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${e.progress_pct >= 80 ? "bg-green-400" : e.progress_pct >= 40 ? "bg-brand-primary" : "bg-amber-400"}`}
                          style={{ width: `${e.progress_pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">{e.progress_pct}%</span>
                    </div>
                  </div>
                  {e.needs_attention && (
                    <span title="À relancer"><AlertCircle className="w-4 h-4 text-amber-500 shrink-0" /></span>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-white text-brand-primary hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <Link href="/coach/formations" className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sessions & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand-dark to-brand-primary rounded-2xl p-6 text-white shadow-xl shadow-brand-dark/20">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-brand-accent" />
              <h2 className="text-base font-bold">Sessions à venir</h2>
            </div>
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-white/50 bg-white/5 p-4 rounded-xl text-center">Aucune session prévue.</p>
              ) : (
                upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-white/10 rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                    <p className="text-sm font-bold truncate">{session.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11px] text-white/70 font-medium">
                        {new Date(session.start_time).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} à{" "}
                        {new Date(session.start_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-accent text-brand-dark">
                        {session.type === "1v1" ? "Individuel" : "Groupe"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/coach/calendar" className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-brand-accent hover:bg-white transition-colors rounded-xl text-sm font-bold text-brand-dark">
              Accéder au calendrier
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/coach/formations/create" className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-brand-primary hover:bg-brand-50 transition-all group text-left">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Créer une formation</span>
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Planifier une session</span>
              </button>
              <Link href="/coach/resources" className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-green-300 hover:bg-green-50 transition-all group text-left">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Partager une ressource</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
