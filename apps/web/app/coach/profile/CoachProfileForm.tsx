'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AvatarUpload } from '@/components/onboarding/AvatarUpload'
import { TagInput } from '@/components/onboarding/TagInput'
import { Save, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react'
import type { SessionType, PreviousRole } from '@/types/onboarding'

// ─────────────────────────────── Config ──────────────────────────────────────

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

const SESSION_TYPE_OPTIONS: { value: SessionType; label: string; emoji: string }[] = [
  { value: '1v1', label: 'Séance individuelle (1:1)', emoji: '👤' },
  { value: 'group', label: 'Séance de groupe', emoji: '👥' },
]

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white"

// ─────────────────────────────── Section wrapper ─────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-50 bg-slate-50/50">
        <span className="text-lg">{icon}</span>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

function InputField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─────────────────────────────── Component ───────────────────────────────────

interface Props {
  initialData: any
  userId: string
}

export function CoachProfileForm({ initialData, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Step 1 – Identity
  const [firstName, setFirstName] = useState(initialData?.first_name ?? '')
  const [lastName, setLastName] = useState(initialData?.last_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url ?? '')

  // Step 2 – Expertise
  const [specialization, setSpecialization] = useState(initialData?.specialization ?? '')
  const [experienceYears, setExperienceYears] = useState<number | ''>(initialData?.experience_years ?? '')
  const [certifications, setCertifications] = useState<string[]>(initialData?.certifications ?? [])

  // Step 3 – Professional Info
  const [previousRoles, setPreviousRoles] = useState<PreviousRole[]>(initialData?.previous_roles ?? [])
  const [bio, setBio] = useState(initialData?.bio ?? '')
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url ?? '')

  // Step 4 – Coaching setup
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>(initialData?.session_types ?? [])
  const [supportAreas, setSupportAreas] = useState<string[]>(initialData?.support_areas ?? [])

  // Previous roles helpers
  const addRole = () => setPreviousRoles(prev => [...prev, { title: '', company: '' }])
  const updateRole = (i: number, field: keyof PreviousRole, val: string) =>
    setPreviousRoles(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  const removeRole = (i: number) =>
    setPreviousRoles(prev => prev.filter((_, idx) => idx !== i))

  const toggleSessionType = (type: SessionType) =>
    setSessionTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )

  const handleSave = async () => {
    setSaving(true)
    setStatus('idle')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSaving(false); return }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: avatarUrl || null,
        specialization: specialization || null,
        experience_years: experienceYears !== '' ? Number(experienceYears) : null,
        certifications,
        previous_roles: previousRoles,
        bio: bio.trim() || null,
        video_url: videoUrl.trim() || null,
        session_types: sessionTypes,
        support_areas: supportAreas,
      })
      .eq('id', session.user.id)

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('success')
      router.refresh()
    }

    setSaving(false)
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Status */}
      {status === 'success' && (
        <div className="flex items-center gap-2.5 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" /> Profil mis à jour avec succès !
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* 1 – Identity */}
      <Section title="Identité professionnelle" icon="🛡️">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <AvatarUpload currentUrl={avatarUrl} onUpload={setAvatarUrl} userId={userId} />
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Prénom" required>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sophie" className={inputClass} />
              </InputField>
              <InputField label="Nom" required>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Martin" className={inputClass} />
              </InputField>
            </div>
          </div>
        </div>
      </Section>

      {/* 2 – Expertise */}
      <Section title="Expertise & certifications" icon="🏆">
        <InputField label="Spécialisation" required>
          <select value={specialization} onChange={e => setSpecialization(e.target.value)} className={inputClass}>
            <option value="">Choisissez votre spécialisation</option>
            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </InputField>

        <InputField label="Années d'expérience en coaching" required>
          <input
            type="number"
            min={0}
            max={50}
            value={experienceYears}
            onChange={e => setExperienceYears(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="ex: 5"
            className={inputClass}
          />
        </InputField>

        <TagInput
          tags={certifications}
          onChange={setCertifications}
          label="Certifications & formations"
          placeholder="ex: ICF ACC, Coach Professionnel..."
          hint="Appuyez sur Entrée pour ajouter chaque certification"
        />
      </Section>

      {/* 3 – Professional info */}
      <Section title="Parcours professionnel" icon="💼">
        <InputField label="Postes précédents">
          <div className="space-y-3">
            {previousRoles.map((role, i) => (
              <div key={i} className="flex gap-2.5 p-3 border border-slate-100 rounded-xl bg-slate-50">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={role.title}
                    onChange={e => updateRole(i, 'title', e.target.value)}
                    placeholder="Intitulé du poste"
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all"
                  />
                  <input
                    type="text"
                    value={role.company}
                    onChange={e => updateRole(i, 'company', e.target.value)}
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
            <button
              type="button"
              onClick={addRole}
              disabled={previousRoles.length >= 5}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-dark disabled:opacity-40 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un poste
            </button>
          </div>
        </InputField>

        <InputField label="Bio professionnelle" required>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Décrivez votre approche de coaching, vos valeurs..."
            rows={4}
            maxLength={600}
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/600</p>
        </InputField>

        <InputField label="Vidéo d'introduction (1mn)">
          <input
            type="url"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="Lien YouTube, Vimeo, Loom..."
            className={inputClass}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Une courte vidéo pour vous présenter aux candidats.
          </p>
        </InputField>
      </Section>

      {/* 4 – Coaching setup */}
      <Section title="Configuration du coaching" icon="📅">
        <InputField label="Types de séances proposées" required>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SESSION_TYPE_OPTIONS.map(opt => {
              const isSelected = sessionTypes.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleSessionType(opt.value)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-brand-primary bg-brand-100'
                      : 'border-slate-100 hover:border-brand-primary/30 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-brand-primary' : 'text-slate-700'}`}>
                    {opt.label}
                  </span>
                  <div className={`ml-auto w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-brand-primary border-brand-primary' : 'border-slate-200'
                  }`}>
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
        </InputField>

        <TagInput
          tags={supportAreas}
          onChange={setSupportAreas}
          label="Domaines d'accompagnement"
          placeholder="ex: Entretiens, Leadership, Soft skills..."
          hint="Ajoutez les domaines dans lesquels vous accompagnez vos clients"
        />
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-brand-primary to-brand-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  )
}
