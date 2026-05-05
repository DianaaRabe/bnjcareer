import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Users, User, ArrowRight, Sparkles, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export async function EventNotifications() {
  const supabase = createClient();

  // Fetch upcoming events
  const { data: events, error } = await supabase
    .from('coach_events')
    .select(`
      *,
      coach:profiles!coach_events_coach_id_fkey (
        first_name,
        last_name,
        avatar_url
      ),
      bookings (
        id
      )
    `)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(3);

  if (error || !events || events.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          Nouveautés pour vous
        </h2>
        <Link href="/dashboard/coaching" className="text-xs text-brand-primary font-semibold hover:underline">
          Voir tout le catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map((event) => {
          const bookingCount = event.current_participants || 0;
          const remainingSpots = (event.max_participants || 10) - bookingCount;
          const isFull = remainingSpots <= 0;
          const is1v1 = event.type === '1v1';
          const coachName = `${event.coach?.first_name || ''} ${event.coach?.last_name || ''}`.trim() || 'Coach';

          return (
            <div 
              key={event.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Decorative gradient blur */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-colors" />
              
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    is1v1 ? 'bg-brand-100 text-brand-primary' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {is1v1 ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    {is1v1 ? 'Session 1:1' : 'Atelier Groupe'}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {event.is_paid ? `${event.price} €` : 'Gratuit'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-brand-primary transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">{coachName}</span>
                </p>

                <div className="mt-auto space-y-2">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(event.start_time).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(event.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <span className={`text-[10px] font-bold ${
                      isFull ? 'text-red-500' : 'text-slate-500'
                    }`}>
                      {is1v1 
                        ? (isFull ? 'Déjà réservé' : 'Disponible')
                        : `${remainingSpots} place${remainingSpots > 1 ? 's' : ''} restante${remainingSpots > 1 ? 's' : ''}`
                      }
                    </span>
                    <Link 
                      href={`/dashboard/coaching?event=${event.id}`}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        isFull 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-brand-primary text-white hover:bg-brand-dark shadow-sm'
                      }`}
                    >
                      Réserver <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
