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
} from "lucide-react";
import { EventModal } from "@/components/coach/EventModal";

const STATS = [
  { label: "Candidats assignés", value: "24", icon: Users, color: "text-brand-primary", bg: "bg-brand-100" },
  { label: "Candidats actifs", value: "18", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { label: "Sessions cette semaine", value: "12", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "À recontacter", value: "3", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
];

const STUCK_CANDIDATES = [
  { name: "Marc Dupont", reason: "Faible activité (7 jours)", status: "warning" },
  { name: "Sophie Martin", reason: "CV non complété", status: "info" },
  { name: "Lucas Bernard", reason: "Aucune candidature envoyée", status: "warning" },
];

// Const mocked list eliminated, we will use State.

export default function CoachDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const loadEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('coach_events')
        .select('*')
        .eq('coach_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(3);

      if (data) setUpcomingSessions(data);
    };

    loadEvents();
  }, [supabase]);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">Espace Coach 👋</p>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Gérez vos candidats et optimisez leur employabilité.</p>
        </div>
        <div className="flex items-center gap-3">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates needing attention */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Candidats à suivre</h2>
            <Link href="/coach/candidates" className="text-xs text-brand-primary font-semibold hover:text-brand-dark flex items-center gap-1">
              Voir tous les candidats <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {STUCK_CANDIDATES.map((candidate) => (
              <div key={candidate.name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {candidate.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{candidate.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className={`w-3 h-3 ${candidate.status === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                    {candidate.reason}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-white text-brand-primary hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <Link href={`/coach/candidates/1`} className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
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
                        {new Date(session.start_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} à {new Date(session.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-accent text-brand-dark">
                        {session.type === '1v1' ? 'Individuel' : 'Groupe'}
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
               <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-brand-primary hover:bg-brand-50 transition-all group text-left">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-primary flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Affecter un candidat</span>
               </button>
               <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-100 hover:border-brand-primary hover:bg-brand-50 transition-all group text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Partager une ressource</span>
               </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* Event Modal Integration */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
