'use client'

import { CandidateOnboardingData } from '@/types/onboarding'
import { AvatarUpload } from '@/components/onboarding/AvatarUpload'
import { ImageIcon } from 'lucide-react'

interface Props {
  data: CandidateOnboardingData
  onChange: (updates: Partial<CandidateOnboardingData>) => void
  userId: string
}

export function Step5Profile({ data, onChange, userId }: Props) {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <ImageIcon className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Finalisez votre profil</h2>
        <p className="text-sm text-slate-500 mt-1">Une photo et une bio augmentent votre visibilité de 3×</p>
      </div>

      <AvatarUpload
        currentUrl={data.avatar_url}
        onUpload={(url) => onChange({ avatar_url: url })}
        userId={userId}
      />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Bio courte <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Décrivez-vous en quelques mots... vos aspirations, votre personnalité, ce qui vous anime."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none"
        />
        <p className="text-xs text-slate-400 text-right mt-1">{data.bio.length}/500</p>
      </div>
    </div>
  )
}
