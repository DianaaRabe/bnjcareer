"use client";

import React, { useState, useEffect } from "react";
import { Bell, UserPlus, UserMinus, X, Calendar, Clock, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  coach_id: string;
  candidate_id: string;
  event_id: string;
  type: 'booking' | 'cancellation';
  is_read: boolean;
  created_at: string;
  candidate?: { first_name: string; last_name: string; avatar_url: string | null };
  event?: { title: string; type: string; start_time: string };
}

export function CoachNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const loadNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('coach_notifications')
      .select(`
        *,
        candidate:profiles!coach_notifications_candidate_id_fkey(first_name, last_name, avatar_url),
        event:coach_events!coach_notifications_event_id_fkey(title, type, start_time)
      `)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[coach-notifs] Error:', error);
      return;
    }

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('coach-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coach_notifications',
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('coach_notifications')
      .update({ is_read: true })
      .eq('coach_id', user.id)
      .eq('is_read', false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-primary" />
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-brand-primary hover:underline"
                  >
                    Tout marquer lu
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Aucune notification</p>
                  <p className="text-xs text-slate-300 mt-1">Les inscriptions apparaîtront ici</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const candidateName = `${notif.candidate?.first_name || ''} ${notif.candidate?.last_name || ''}`.trim() || 'Un candidat';
                  const initials = (notif.candidate?.first_name?.[0] || '') + (notif.candidate?.last_name?.[0] || '');
                  const isBooking = notif.type === 'booking';

                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors ${
                        !notif.is_read ? 'bg-brand-50/30' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {notif.candidate?.avatar_url ? (
                          <img src={notif.candidate.avatar_url} alt={candidateName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                            {initials}
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          isBooking ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isBooking ? <UserPlus className="w-3 h-3 text-white" /> : <UserMinus className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">
                          <span className="font-bold text-slate-900">{candidateName}</span>
                          {' '}
                          {isBooking ? "s'est inscrit(e) à" : "s'est désinscrit(e) de"}
                        </p>
                        <p className="text-xs font-semibold text-brand-primary truncate mt-0.5">
                          {notif.event?.title || 'Session'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">{timeAgo(notif.created_at)}</span>
                          {!notif.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
