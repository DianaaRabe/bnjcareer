'use client'

import { CandidateOnboardingData } from '@/types/onboarding'
import { TagInput } from '@/components/onboarding/TagInput'
import { Sparkles } from 'lucide-react'

interface Props {
  data: CandidateOnboardingData
  onChange: (updates: Partial<CandidateOnboardingData>) => void
}

export function Step3Skills({ data, onChange }: Props) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Sparkles className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Compétences & bilan</h2>
        <p className="text-sm text-slate-500 mt-1">Une auto-évaluation honnête aide notre IA à mieux vous accompagner</p>
      </div>

      <TagInput
        tags={data.strengths}
        onChange={(tags) => onChange({ strengths: tags })}
        label="Vos 3 plus grandes forces"
        placeholder="ex: Leadership, Créativité..."
        maxTags={3}
        hint="Appuyez sur Entrée ou virgule pour ajouter (max 3)"
      />

      <TagInput
        tags={data.weaknesses}
        onChange={(tags) => onChange({ weaknesses: tags })}
        label="3 axes d'amélioration"
        placeholder="ex: Gestion du temps, Prise de parole..."
        maxTags={3}
        hint="Identifiez vos points de progression (max 3)"
      />

      <TagInput
        tags={data.skills}
        onChange={(tags) => onChange({ skills: tags })}
        label="Compétences & outils"
        placeholder="ex: React, Excel, Photoshop..."
        hint="Ajoutez autant de compétences que vous souhaitez"
      />
    </div>
  )
}
