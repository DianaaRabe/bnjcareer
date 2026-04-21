'use client'

import { CoachOnboardingData } from '@/types/onboarding'
import { AvatarUpload } from '@/components/onboarding/AvatarUpload'
import { Shield } from 'lucide-react'

interface Props {
  data: CoachOnboardingData
  onChange: (updates: Partial<CoachOnboardingData>) => void
  userId: string
}

export function Step1Identity({ data, onChange, userId }: Props) {
  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Shield className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Votre identité professionnelle</h2>
        <p className="text-sm text-slate-500 mt-1">Ces informations seront visibles par vos candidats</p>
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
            placeholder="ex: Sophie"
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
            placeholder="ex: Martin"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Photo de profil <span className="text-slate-400 font-normal text-xs">(fortement recommandée)</span>
        </label>
        <AvatarUpload
          currentUrl={data.avatar_url}
          onUpload={(url) => onChange({ avatar_url: url })}
          userId={userId}
        />
      </div>
    </div>
  )
}
