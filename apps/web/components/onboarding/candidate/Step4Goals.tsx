'use client'

import { CandidateOnboardingData, MainGoal } from '@/types/onboarding'
import { Target } from 'lucide-react'

interface Props {
  data: CandidateOnboardingData
  onChange: (updates: Partial<CandidateOnboardingData>) => void
}

const GOAL_OPTIONS: { value: MainGoal; label: string; emoji: string; desc: string }[] = [
  { value: 'find_job', label: 'Trouver un emploi', emoji: '💼', desc: 'Décrocher un poste correspondant à mon profil' },
  { value: 'improve_cv', label: 'Améliorer mon CV', emoji: '📄', desc: 'Optimiser mon CV pour attirer les recruteurs' },
  { value: 'change_career', label: 'Changer de carrière', emoji: '🔄', desc: 'Me reconvertir vers un nouveau secteur' },
  { value: 'learn_skills', label: 'Développer mes compétences', emoji: '📚', desc: 'Acquérir de nouvelles compétences ciblées' },
  { value: 'network', label: 'Réseauter', emoji: '🤝', desc: 'Élargir mon réseau professionnel' },
]

export function Step4Goals({ data, onChange }: Props) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Target className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Votre objectif principal</h2>
        <p className="text-sm text-slate-500 mt-1">Cela guide notre IA pour personnaliser votre expérience</p>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {GOAL_OPTIONS.map((opt) => {
          const isSelected = data.main_goal === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ main_goal: opt.value })}
              className={`relative flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                isSelected
                  ? 'border-brand-primary bg-gradient-to-r from-brand-100 to-white shadow-sm'
                  : 'border-slate-100 hover:border-brand-primary/30 hover:bg-slate-50/50'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold ${isSelected ? 'text-brand-primary' : 'text-slate-800'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-slate-200 group-hover:border-brand-primary/50'
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
  )
}
