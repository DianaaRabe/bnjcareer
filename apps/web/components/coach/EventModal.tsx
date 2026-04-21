'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Clock, Users, Link as LinkIcon, Loader2 } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EventModal({ isOpen, onClose }: EventModalProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'1v1' | 'group'>('1v1');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [meetLink, setMeetLink] = useState('');
  
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/coach/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, type, start_time: startTime, end_time: endTime, max_participants: maxParticipants, meet_link: meetLink, is_paid: isPaid, price: isPaid ? price : 0
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la création de l'événement");
      }

      router.refresh();
      onClose();
      // Reset form
      setTitle('');
      setStartTime('');
      setEndTime('');
      setMeetLink('');
      setMaxParticipants(10);
      setIsPaid(false);
      setPrice('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Nouvelle session</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre de la session *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Coaching CV, Préparation entretien..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('1v1')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  type === '1v1' 
                    ? 'border-brand-primary bg-brand-50 text-brand-primary' 
                    : 'border-slate-100 text-slate-600 hover:border-brand-primary/30'
                }`}
              >
                Individuel (1:1)
              </button>
              <button
                type="button"
                onClick={() => setType('group')}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  type === 'group' 
                    ? 'border-brand-primary bg-brand-50 text-brand-primary' 
                    : 'border-slate-100 text-slate-600 hover:border-brand-primary/30'
                }`}
              >
                Groupe
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Début *
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Fin *
                </label>
                <input 
                  type="datetime-local" 
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-sm text-slate-900"
                />
              </div>
            </div>

            {type === 'group' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Places disponibles *
                </label>
                <input 
                  type="number" 
                  min="2"
                  max="100"
                  required
                  value={maxParticipants}
                  onChange={e => setMaxParticipants(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-slate-900"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" /> Lien Visio (ex: Google Meet, Zoom)
              </label>
              <input 
                type="url" 
                value={meetLink}
                onChange={e => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-slate-900"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Formation payante</label>
                <p className="text-xs text-slate-500">Exiger un paiement pour cette session</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaid(!isPaid)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPaid ? 'bg-brand-primary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPaid ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isPaid && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix (en €) *</label>
                <input 
                  type="number"
                  min="1"
                  required={isPaid}
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  placeholder="Ex: 50"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
