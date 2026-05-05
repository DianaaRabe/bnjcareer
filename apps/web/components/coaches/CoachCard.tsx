import React from 'react';
import { User, Star, Award, BookOpen, ArrowRight, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface CoachCardProps {
  coach: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialization: string | null;
    experience_years: number | null;
    certifications: string[] | null;
    video_url?: string | null;
  };
}

export function CoachCard({ coach }: CoachCardProps) {
  const fullName = `${coach.first_name || ''} ${coach.last_name || ''}`.trim() || 'Coach';
  const initials = (coach.first_name?.[0] || '') + (coach.last_name?.[0] || '');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      <div className="flex items-start gap-4 mb-5">
        <div className="relative shrink-0">
          {coach.avatar_url ? (
            <img 
              src={coach.avatar_url} 
              alt={fullName} 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-50 group-hover:ring-brand-primary/10 transition-all"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-primary flex items-center justify-center text-xl font-bold ring-4 ring-slate-50 group-hover:ring-brand-primary/10 transition-all">
              {initials || <User className="w-8 h-8" />}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors">
            {fullName}
          </h3>
          <p className="text-sm font-semibold text-brand-primary flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" />
            {coach.specialization || 'Coaching Carrière'}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
              {coach.experience_years || 0} ans d'exp.
            </span>
            <div className="flex items-center gap-0.5 text-amber-500">
               <Star className="w-3 h-3 fill-current" />
               <span className="text-[11px] font-extrabold">4.9</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 italic leading-relaxed">
        "{coach.bio || 'Coach expert dédié à votre réussite professionnelle.'}"
      </p>

      {coach.video_url && (
        <div className="mb-4">
          <a
            href={coach.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Vidéo d'introduction
          </a>
        </div>
      )}

      {coach.certifications && coach.certifications.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {coach.certifications.slice(0, 2).map((cert, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Award className="w-3 h-3" />
              {cert}
            </span>
          ))}
          {coach.certifications.length > 2 && (
            <span className="text-[10px] font-bold text-slate-400 py-1">+{coach.certifications.length - 2}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-5 border-t border-slate-50">
        <Link 
          href={`/dashboard/coaches/${coach.id}`}
          className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Voir profil
        </Link>
        <Link 
          href={`/dashboard/coaching?coach=${coach.id}`}
          className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-dark shadow-md shadow-brand-primary/20 transition-all"
        >
          Prendre RDV
        </Link>
      </div>
    </div>
  );
}
