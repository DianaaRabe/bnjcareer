"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  Users,
  Clock,
  MapPin,
} from "lucide-react";
import { EventModal } from "@/components/coach/EventModal";

export default function CalendarPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const SESSIONS = [
    { id: 1, title: "Coaching 1:1 - Marc Dupont", time: "10:00 - 11:00", type: "1:1", participants: 1, color: "border-brand-primary bg-brand-50" },
    { id: 2, title: "Atelier CV & IA", time: "14:00 - 15:30", type: "Groupe", participants: 8, color: "border-blue-500 bg-blue-50" },
    { id: 3, title: "Review LinkedIn - Sophie Martin", time: "16:00 - 16:30", type: "1:1", participants: 1, color: "border-purple-500 bg-purple-50" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900">Sessions & Calendrier</h1>
          <p className="text-slate-500 mt-1">Gérez vos rendez-vous individuels et collectifs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer un événement
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Calendar Grid (3/4) */}
        <div className="xl:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
           {/* Calendar Header */}
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Avril 2024</h2>
              <div className="flex gap-2">
                 <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                 </button>
                 <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                 </button>
              </div>
           </div>

           {/* Calendar Days Header */}
           <div className="grid grid-cols-7 border-b border-slate-100 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{day}</div>
              ))}
           </div>

           {/* Calendar Days Grid (Placeholder for weekly view or month) */}
           <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-inner">
             {Array.from({ length: 35 }).map((_, i) => {
               const day = (i % 31) + 1;
               const isCurrentMonth = i >= 0 && i < 30;
               const isToday = day === 12;
               return (
                 <div key={i} className={`min-h-[120px] bg-white p-3 transition-colors ${!isCurrentMonth ? "bg-slate-50 opacity-40" : "hover:bg-slate-50"}`}>
                   <span className={`text-sm font-bold ${isToday ? "bg-brand-primary text-white w-7 h-7 flex items-center justify-center rounded-full" : "text-slate-800"}`}>{day}</span>
                   {isToday && (
                     <div className="mt-2 space-y-1">
                        {SESSIONS.map(s => (
                          <div key={s.id} className={`text-[9px] font-bold p-1 rounded border-l-2 truncate shadow-sm ${s.color}`}>
                            {s.time.split(' ')[0]} - {s.title}
                          </div>
                        ))}
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        </div>

        {/* Upcoming List & Filters (1/4) */}
        <div className="space-y-6">
           <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-6">Programmé aujourd'hui</h3>
              <div className="space-y-4">
                 {SESSIONS.map((session) => (
                   <div key={session.id} className={`p-4 rounded-2xl border-l-4 shadow-sm ${session.color} cursor-pointer hover:translate-x-1 transition-transform`}>
                      <p className="text-sm font-bold text-slate-900 leading-tight">{session.title}</p>
                      <div className="grid grid-cols-1 gap-2 mt-4">
                         <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {session.time}
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Video className="w-3.5 h-3.5" />
                            Google Meet
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            {session.participants} participant(s)
                         </div>
                      </div>
                      <button className="mt-4 w-full py-2 bg-white/50 hover:bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-2">
                         <Video className="w-3 h-3" /> Rejoindre la session
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-brand-dark rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-sm font-bold mb-4">Statistiques mensuelles</h3>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-[11px] mb-1 font-medium text-white/60">
                       <span>Total d'heures</span>
                       <span className="text-brand-accent">42h / 50h</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-brand-accent rounded-full" style={{ width: '84%' }} />
                    </div>
                 </div>
                 <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                    <div>
                       <p className="text-[10px] text-white/50 font-bold uppercase py-1">Visioconf</p>
                       <p className="text-xl font-bold">18</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/50 font-bold uppercase py-1">Ateliers</p>
                        <p className="text-xl font-bold">5</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Event Modal Integration */}
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
