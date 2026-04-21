'use client'

import { CoachOnboardingData, PreviousRole } from '@/types/onboarding'
import { Briefcase, Plus, Trash2 } from 'lucide-react'

interface Props {
  data: CoachOnboardingData
  onChange: (updates: Partial<CoachOnboardingData>) => void
}

export function Step3ProfessionalInfo({ data, onChange }: Props) {
  const addRole = () => {
    onChange({ previous_roles: [...data.previous_roles, { title: '', company: '' }] })
  }

  const updateRole = (index: number, field: keyof PreviousRole, value: string) => {
    const updated = data.previous_roles.map((r, i) =>
      i === index ? { ...r, [field]: value } : r
    )
    onChange({ previous_roles: updated })
  }

  const removeRole = (index: number) => {
    onChange({ previous_roles: data.previous_roles.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-2xl mb-3">
          <Briefcase className="w-6 h-6 text-brand-primary" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">Parcours professionnel</h2>
        <p className="text-sm text-slate-500 mt-1">Votre historique inspire confiance aux candidats</p>
      </div>

      {/* Previous roles */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Postes précédents <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
        </label>

        <div className="space-y-3">
          {data.previous_roles.map((role, i) => (
            <div
              key={i}
              className="flex gap-2.5 p-3 border border-slate-100 rounded-xl bg-slate-50 animate-fade-in"
            >
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={role.title}
                  onChange={(e) => updateRole(i, 'title', e.target.value)}
                  placeholder="Intitulé du poste"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                />
                <input
                  type="text"
                  value={role.company}
                  onChange={(e) => updateRole(i, 'company', e.target.value)}
                  placeholder="Entreprise"
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRole(i)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRole}
          disabled={data.previous_roles.length >= 5}
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-dark disabled:opacity-40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un poste
        </button>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Bio professionnelle <span className="text-red-400">*</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Décrivez votre approche de coaching, vos valeurs, et ce que vous apportez concrètement à vos clients..."
          rows={4}
          maxLength={600}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all resize-none"
        />
        <p className="text-xs text-slate-400 text-right mt-1">{data.bio.length}/600</p>
      </div>
    </div>
  )
}
