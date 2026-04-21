'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { AvatarUpload } from '@/components/onboarding/AvatarUpload'
import { TagInput } from '@/components/onboarding/TagInput'
import { Save, CheckCircle, AlertCircle } from 'lucide-react'
import type { EducationLevel, CurrentStatus, MainGoal } from '@/types/onboarding'

// ─────────────────────────────── Config ──────────────────────────────────────

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: 'no_diploma', label: 'Sans diplôme' },
  { value: 'bac', label: 'Baccalauréat' },
  { value: 'bac+2', label: 'Bac+2 (BTS, DUT)' },
  { value: 'bac+3', label: 'Bac+3 (Licence)' },
  { value: 'bac+5', label: 'Bac+5 (Master, Ingénieur)' },
  { value: 'phd', label: 'Doctorat' },
  { value: 'other', label: 'Autre' },
]

const STATUS_OPTIONS: { value: CurrentStatus; label: string }[] = [
  { value: 'student', label: '🎓 Étudiant(e)' },
  { value: 'job_seeker', label: '🔍 En recherche d\'emploi' },
  { value: 'reconversion', label: '🔄 Reconversion professionnelle' },
]

const GOAL_OPTIONS: { value: MainGoal; label: string }[] = [
  { value: 'find_job', label: '💼 Trouver un emploi' },
  { value: 'improve_cv', label: '📄 Améliorer mon CV' },
  { value: 'change_career', label: '🔄 Changer de carrière' },
  { value: 'learn_skills', label: '📚 Développer mes compétences' },
  { value: 'network', label: '🤝 Réseauter' },
]

// ─────────────────────────────── Props ───────────────────────────────────────

interface Props {
  initialData: any
  initialSkills: string[]
  userId: string
}

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

const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all bg-white"

// ─────────────────────────────── Component ───────────────────────────────────

export function CandidateProfileForm({ initialData, initialSkills, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Form state — pre-filled from DB
  const [firstName, setFirstName] = useState(initialData?.first_name ?? '')
  const [lastName, setLastName] = useState(initialData?.last_name ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [birthDate, setBirthDate] = useState(initialData?.birth_date ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url ?? '')
  const [bio, setBio] = useState(initialData?.bio ?? '')
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>(initialData?.education_level ?? '')
  const [industry, setIndustry] = useState(initialData?.industry ?? '')
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | ''>(initialData?.current_status ?? '')
  const [strengths, setStrengths] = useState<string[]>(initialData?.strengths ?? [])
  const [weaknesses, setWeaknesses] = useState<string[]>(initialData?.weaknesses ?? [])
  const [skills, setSkills] = useState<string[]>(initialSkills)
  const [mainGoal, setMainGoal] = useState<MainGoal | ''>(initialData?.main_goal ?? '')

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
        phone: phone.trim() || null,
        birth_date: birthDate || null,
        avatar_url: avatarUrl || null,
        bio: bio.trim() || null,
        education_level: educationLevel || null,
        industry: industry.trim() || null,
        current_status: currentStatus || null,
        strengths,
        weaknesses,
        main_goal: mainGoal || null,
      })
      .eq('id', session.user.id)

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      setSaving(false)
      return
    }

    // Sync skills
    if (skills.length > 0) {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'candidate', skills, first_name: firstName, last_name: lastName, birth_date: birthDate, phone, education_level: educationLevel, industry, current_status: currentStatus, strengths, weaknesses, main_goal: mainGoal, avatar_url: avatarUrl, bio, is_onboarded: true, is_update: true }),
      })
    }

    setStatus('success')
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Status toast */}
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
      <Section title="Identité" icon="👤">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <AvatarUpload currentUrl={avatarUrl} onUpload={setAvatarUrl} userId={userId} />
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Prénom" required>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Marie" className={inputClass} />
              </InputField>
              <InputField label="Nom" required>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dupont" className={inputClass} />
              </InputField>
            </div>
            <InputField label="Date de naissance">
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputClass} />
            </InputField>
            <InputField label="Téléphone">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className={inputClass} />
            </InputField>
          </div>
        </div>

        <InputField label="Bio courte">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Décrivez-vous en quelques mots..."
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-slate-400 text-right mt-1">{bio.length}/500</p>
        </InputField>
      </Section>

      {/* 2 – Education */}
      <Section title="Parcours & carrière" icon="🎓">
        <InputField label="Niveau d'études">
          <select value={educationLevel} onChange={e => setEducationLevel(e.target.value as EducationLevel)} className={inputClass}>
            <option value="">Sélectionnez votre niveau</option>
            {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </InputField>

        <InputField label="Secteur / Domaine">
          <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} placeholder="ex: Informatique, Marketing..." className={inputClass} />
        </InputField>

        <InputField label="Situation actuelle">
          <select value={currentStatus} onChange={e => setCurrentStatus(e.target.value as CurrentStatus)} className={inputClass}>
            <option value="">Sélectionnez votre situation</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </InputField>
      </Section>

      {/* 3 – Skills */}
      <Section title="Compétences & bilan" icon="✨">
        <TagInput
          tags={strengths}
          onChange={setStrengths}
          label="Vos 3 plus grandes forces"
          placeholder="ex: Leadership, Créativité..."
          maxTags={3}
          hint="Max 3 forces"
        />
        <TagInput
          tags={weaknesses}
          onChange={setWeaknesses}
          label="3 axes d'amélioration"
          placeholder="ex: Gestion du temps..."
          maxTags={3}
          hint="Max 3 axes"
        />
        <TagInput
          tags={skills}
          onChange={setSkills}
          label="Compétences & outils"
          placeholder="ex: React, Excel, Photoshop..."
        />
      </Section>

      {/* 4 – Goal */}
      <Section title="Objectif principal" icon="🎯">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMainGoal(opt.value)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all duration-200 ${
                mainGoal === opt.value
                  ? 'border-brand-primary bg-brand-100 text-brand-primary'
                  : 'border-slate-100 hover:border-brand-primary/30 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {opt.label}
              {mainGoal === opt.value && (
                <div className="ml-auto w-4 h-4 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* Save button */}
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
