"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Users,
  Clock,
  Loader2,
  CalendarDays,
  Euro,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EventModal } from "@/components/coach/EventModal";

interface CoachEvent {
  id: string;
  title: string;
  type: "1v1" | "group";
  start_time: string;
  end_time: string;
  max_participants: number;
  meet_link: string | null;
  is_paid: boolean;
  price: number;
}

const DAYS_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/** Lundi de la semaine contenant `date` */
function weekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=dim
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Durée en minutes entre deux dates ISO */
function durationMin(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
}

/** Durée lisible */
function durationLabel(start: string, end: string): string {
  const m = durationMin(start, end);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h}h${String(rem).padStart(2, "0")}` : `${h}h`;
}

/** Heure locale HH:MM */
function toHHMM(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/** Couleur d'un event */
function eventColor(e: CoachEvent) {
  if (e.type === "1v1") return { border: "border-brand-primary", bg: "bg-brand-50", text: "text-brand-primary" };
  return { border: "border-blue-500", bg: "bg-blue-50", text: "text-blue-700" };
}

/** Même jour calendaire ? */
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const supabase = createClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents]           = useState<CoachEvent[]>([]);
  const [loading, setLoading]         = useState(true);

  /* Mois affiché */
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed

  /* ── Chargement ─────────────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("coach_events")
      .select("*")
      .eq("coach_id", user.id)
      .order("start_time", { ascending: true });

    setEvents((data as CoachEvent[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  /* ── Navigation mois ────────────────────────────────────────────────────── */
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  /* ── Grille du mois ─────────────────────────────────────────────────────── */
  const firstOfMonth = new Date(year, month, 1);
  // Lundi de la première semaine affichée
  const gridStart = weekStart(firstOfMonth);
  const cells: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  /* ── Événements du mois courant ─────────────────────────────────────────── */
  const monthEvents = events.filter((e) => {
    const d = new Date(e.start_time);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  /* ── Événements d'aujourd'hui (ou prochains si aucun) ───────────────────── */
  const todayEvents = events.filter((e) => sameDay(new Date(e.start_time), today));
  const upcomingEvents = events
    .filter((e) => new Date(e.start_time) >= today)
    .slice(0, 5);
  const sidebarEvents = todayEvents.length > 0 ? todayEvents : upcomingEvents;
  const sidebarLabel  = todayEvents.length > 0 ? "Aujourd'hui" : "À venir";

  /* ── Stats mensuelles ───────────────────────────────────────────────────── */
  const totalMinutes = monthEvents.reduce((acc, e) => acc + durationMin(e.start_time, e.end_time), 0);
  const totalHours   = (totalMinutes / 60).toFixed(1).replace(".", "h");
  const count1v1     = monthEvents.filter((e) => e.type === "1v1").length;
  const countGroup   = monthEvents.filter((e) => e.type === "group").length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Sessions & Calendrier</h1>
          <p className="text-slate-500 mt-1">Gérez vos rendez-vous individuels et collectifs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all"
          >
            <Plus className="w-4 h-4" />
            Créer un événement
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="text-sm font-medium">Chargement du calendrier…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* ── Calendrier (3/4) ──────────────────────────────────────────── */}
          <div className="xl:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {MONTHS_FR[month]} {year}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* En-tête jours */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_LABELS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {cells.map((cellDate, i) => {
                const isThisMonth = cellDate.getMonth() === month;
                const isToday     = sameDay(cellDate, today);
                const cellEvents  = events.filter((e) => sameDay(new Date(e.start_time), cellDate));

                return (
                  <div
                    key={i}
                    className={`min-h-[110px] bg-white p-2 transition-colors ${
                      !isThisMonth ? "opacity-35 bg-slate-50/60" : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Numéro du jour */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                          isToday
                            ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/30"
                            : "text-slate-700"
                        }`}
                      >
                        {cellDate.getDate()}
                      </span>
                      {cellEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400">+{cellEvents.length - 2}</span>
                      )}
                    </div>

                    {/* Events (max 2 affichés) */}
                    <div className="space-y-0.5">
                      {cellEvents.slice(0, 2).map((ev) => {
                        const { border, bg, text } = eventColor(ev);
                        return (
                          <div
                            key={ev.id}
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border-l-2 truncate ${border} ${bg} ${text}`}
                            title={`${ev.title} — ${toHHMM(ev.start_time)}`}
                          >
                            {toHHMM(ev.start_time)} {ev.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-6 mt-4 px-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-3 h-3 rounded-sm bg-brand-50 border-l-2 border-brand-primary" />
                Individuel (1:1)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="w-3 h-3 rounded-sm bg-blue-50 border-l-2 border-blue-500" />
                Groupe
              </div>
            </div>
          </div>

          {/* ── Sidebar (1/4) ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Sessions du jour / à venir */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-brand-primary" />
                {sidebarLabel}
                {sidebarEvents.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-brand-primary bg-brand-100 px-2 py-0.5 rounded-full">
                    {sidebarEvents.length}
                  </span>
                )}
              </h3>

              {sidebarEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">Aucune session à venir</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sidebarEvents.map((ev) => {
                    const { border, bg } = eventColor(ev);
                    const startDate = new Date(ev.start_time);
                    const isUpcoming = !sameDay(startDate, today);
                    return (
                      <div
                        key={ev.id}
                        className={`p-4 rounded-2xl border-l-4 ${border} ${bg} hover:translate-x-1 transition-transform cursor-default`}
                      >
                        <p className="text-sm font-bold text-slate-900 leading-tight">{ev.title}</p>
                        {isUpcoming && (
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                            {startDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                          </p>
                        )}
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {toHHMM(ev.start_time)} → {toHHMM(ev.end_time)}
                            <span className="ml-auto text-[10px] text-slate-400">
                              {durationLabel(ev.start_time, ev.end_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            {ev.type === "1v1" ? "Individuel" : `Groupe · max ${ev.max_participants}`}
                          </div>
                          {ev.is_paid && (
                            <div className="flex items-center gap-2 text-[11px] text-amber-600 font-bold">
                              <Euro className="w-3.5 h-3.5 shrink-0" />
                              {ev.price}€
                            </div>
                          )}
                        </div>
                        {ev.meet_link && (
                          <a
                            href={ev.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 w-full py-2 bg-white/60 hover:bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Video className="w-3 h-3" /> Rejoindre la session
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stats mensuelles */}
            <div className="bg-brand-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold mb-5">
                {MONTHS_FR[month]} — Statistiques
              </h3>

              {monthEvents.length === 0 ? (
                <p className="text-xs text-white/40 text-center py-4">Aucune session ce mois-ci</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5 font-medium text-white/60">
                      <span>Total d'heures</span>
                      <span className="text-brand-accent font-bold">{totalHours}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-accent rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (totalMinutes / 60 / 50) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-white/30 mt-1">objectif mensuel : 50h</p>
                  </div>

                  <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">Total</p>
                      <p className="text-2xl font-black">{monthEvents.length}</p>
                      <p className="text-[9px] text-white/40">sessions</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">1:1</p>
                      <p className="text-2xl font-black">{count1v1}</p>
                      <p className="text-[9px] text-white/40">individuels</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">Groupe</p>
                      <p className="text-2xl font-black">{countGroup}</p>
                      <p className="text-[9px] text-white/40">ateliers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal création */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          load(); // rafraîchit sans rechargement de page
        }}
      />
    </div>
  );
}
