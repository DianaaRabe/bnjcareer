'use client'

import { CoachOnboardingData } from '@/types/onboarding'
import { TagInput } from '@/components/onboarding/TagInput'
import { Award } from 'lucide-react'

interface Props {
  data: CoachOnboardingData
  onChange: (updates: Partial<CoachOnboardingData>) => void
}

const SPECIALIZATIONS = [
  'Coaching carrière',
  'Coaching tech / IT',
  'Coaching RH & Recrutement',
  'Coaching développement personnel',
  'Coaching commercial & vente',
  'Coaching exécutif',
  'Coaching reconversion',
  'Autre',
]

export function Step2Expertise({ data, onChange }: Props) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Award className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Votre expertise</h2>
        <p className="text-sm text-slate-500 mt-1">Vos qualifications nous aident à vous matcher avec les bons candidats</p>
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Spécialisation <span className="text-red-400">*</span>
        </label>
        <select
          value={data.specialization}
          onChange={(e) => onChange({ specialization: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white appearance-none"
        >
          <option value="">Choisissez votre spécialisation</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Years of experience */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Années d'expérience en coaching <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min={0}
          max={50}
          value={data.experience_years}
          onChange={(e) => onChange({ experience_years: e.target.value === '' ? '' : Number(e.target.value) })}
          placeholder="ex: 5"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
        />
      </div>

      {/* Certifications */}
      <TagInput
        tags={data.certifications}
        onChange={(tags) => onChange({ certifications: tags })}
        label="Certifications & formations"
        placeholder="ex: ICF ACC, Coach Professionnel..."
        hint="Appuyez sur Entrée pour ajouter chaque certification"
      />
    </div>
  )
}
