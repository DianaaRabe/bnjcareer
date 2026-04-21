'use client'

import { CandidateOnboardingData } from '@/types/onboarding'
import { User, Phone, Calendar } from 'lucide-react'

interface Props {
  data: CandidateOnboardingData
  onChange: (updates: Partial<CandidateOnboardingData>) => void
}

export function Step1BasicInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <User className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Votre identité</h2>
        <p className="text-sm text-slate-500 mt-1">Commençons par quelques informations de base</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Prénom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
            placeholder="ex: Marie"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Nom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="ex: Dupont"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          Date de naissance <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={data.birth_date}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
          onChange={(e) => onChange({ birth_date: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          <Phone className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
          Téléphone <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="ex: +33 6 12 34 56 78"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
        />
      </div>
    </div>
  )
}
