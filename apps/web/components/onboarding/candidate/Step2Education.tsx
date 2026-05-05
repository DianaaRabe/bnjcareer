'use client'

import { CandidateOnboardingData, EducationLevel, CurrentStatus } from '@/types/onboarding'
import { GraduationCap } from 'lucide-react'

interface Props {
  data: CandidateOnboardingData
  onChange: (updates: Partial<CandidateOnboardingData>) => void
}

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'no_diploma', label: 'Sans diplôme' },
  { value: 'bac', label: 'Baccalauréat' },
  { value: 'bac+2', label: 'Bac+2 (BTS, DUT)' },
  { value: 'bac+3', label: 'Bac+3 (Licence)' },
  { value: 'bac+5', label: 'Bac+5 (Master, Ingénieur)' },
  { value: 'phd', label: 'Doctorat' },
  { value: 'other', label: 'Autre' },
]

const STATUS_OPTIONS: { value: CurrentStatus; label: string; emoji: string; desc: string }[] = [
  { value: 'student', label: 'Étudiant(e)', emoji: '🎓', desc: 'Je suis en cours d\'études' },
  { value: 'job_seeker', label: 'En recherche', emoji: '🔍', desc: 'Je cherche activement un emploi' },
  { value: 'reconversion', label: 'Reconversion', emoji: '🔄', desc: 'Je change d\'orientation professionnelle' },
]

export function Step2Education({ data, onChange }: Props) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <GraduationCap className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Parcours & carrière</h2>
        <p className="text-sm text-slate-500 mt-1">Pour mieux adapter nos recommandations</p>
      </div>

      {/* Education level */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Niveau d'études <span className="text-red-400">*</span>
        </label>
        <select
          value={data.education_level}
          onChange={(e) => onChange({ education_level: e.target.value as EducationLevel })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white appearance-none"
        >
          <option value="">Sélectionnez votre niveau</option>
          {EDUCATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Training Establishment */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Établissement de formation <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.training_establishment}
          onChange={(e) => onChange({ training_establishment: e.target.value })}
          placeholder="ex: HEC Paris, Sorbonne, EPITECH..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
        />
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Secteur / Domaine <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.industry}
          onChange={(e) => onChange({ industry: e.target.value })}
          placeholder="ex: Informatique, Marketing, Finance..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
        />
      </div>

      {/* Current status – card selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Situation actuelle <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ current_status: opt.value })}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                data.current_status === opt.value
                  ? 'border-brand-primary bg-brand-100'
                  : 'border-slate-100 hover:border-brand-primary/30 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div>
                <p className={`text-sm font-semibold ${data.current_status === opt.value ? 'text-brand-primary' : 'text-slate-800'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
              {data.current_status === opt.value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
