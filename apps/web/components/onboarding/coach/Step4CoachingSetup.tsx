'use client'

import { CoachOnboardingData, SessionType } from '@/types/onboarding'
import { TagInput } from '@/components/onboarding/TagInput'
import { Calendar } from 'lucide-react'

interface Props {
  data: CoachOnboardingData
  onChange: (updates: Partial<CoachOnboardingData>) => void
}

const SESSION_TYPE_OPTIONS: { value: SessionType; label: string; emoji: string; desc: string }[] = [
  { value: '1v1', label: 'Séance individuelle (1:1)', emoji: '👤', desc: 'Sessions privées avec un seul candidat' },
  { value: 'group', label: 'Séance de groupe', emoji: '👥', desc: 'Ateliers collectifs jusqu\'à 10 personnes' },
]

export function Step4CoachingSetup({ data, onChange }: Props) {
  const toggleSessionType = (type: SessionType) => {
    const current = data.session_types
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type]
    onChange({ session_types: updated })
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Calendar className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Configuration du coaching</h2>
        <p className="text-sm text-slate-500 mt-1">Définissez comment vous accompagnez vos candidats</p>
      </div>

      {/* Session types – multi-select */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Types de séances proposées <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SESSION_TYPE_OPTIONS.map((opt) => {
            const isSelected = data.session_types.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleSessionType(opt.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-primary bg-brand-100'
                    : 'border-slate-100 hover:border-brand-primary/30 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                </div>
                {/* Checkbox visual */}
                <div
                  className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-brand-primary border-brand-primary' : 'border-slate-200'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Support areas */}
      <TagInput
        tags={data.support_areas}
        onChange={(tags) => onChange({ support_areas: tags })}
        label="Domaines d'accompagnement"
        placeholder="ex: Entretiens, Soft skills, Leadership..."
        hint="Ajoutez les domaines dans lesquels vous accompagnez vos clients"
      />
    </div>
  )
}
