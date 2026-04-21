'use client'

import { useEffect } from 'react'
import type { UserRole } from '@/types/onboarding'
import { useOnboarding } from '@/hooks/useOnboarding'
import { ProgressBar } from './ProgressBar'
import { StepNavigation } from './StepNavigation'

// Candidate steps
import { Step1BasicInfo } from './candidate/Step1BasicInfo'
import { Step2Education } from './candidate/Step2Education'
import { Step3Skills } from './candidate/Step3Skills'
import { Step4Goals } from './candidate/Step4Goals'
import { Step5Profile } from './candidate/Step5Profile'

// Coach steps
import { Step1Identity } from './coach/Step1Identity'
import { Step2Expertise } from './coach/Step2Expertise'
import { Step3ProfessionalInfo } from './coach/Step3ProfessionalInfo'
import { Step4CoachingSetup } from './coach/Step4CoachingSetup'

// ─── Config ────────────────────────────────────────────────────────────────

const CANDIDATE_LABELS = ['Identité', 'Parcours', 'Compétences', 'Objectifs', 'Profil']
const COACH_LABELS = ['Identité', 'Expertise', 'Expérience', 'Coaching']

// ─── Component ─────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  role: UserRole
  userId: string
}

export function OnboardingModal({ role, userId }: OnboardingModalProps) {
  const {
    currentStep,
    totalSteps,
    candidateData,
    coachData,
    updateCandidate,
    updateCoach,
    canProceed,
    isSubmitting,
    submitError,
    handleNext,
    goBack,
  } = useOnboarding({ role, userId })

  // Block body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Prevent closing with Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') e.preventDefault()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const stepLabels = role === 'candidate' ? CANDIDATE_LABELS : COACH_LABELS

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 10, 30, 0.75)', backdropFilter: 'blur(6px)' }}
    >
      {/* ── Card ──────────────────────────────────────────────────────── */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        style={{ maxHeight: '90vh' }}
      >
        {/* ── Header gradient strip ───────────────────────────────────── */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-primary to-brand-light px-6 pt-6 pb-5">
          {/* Brand + title */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-xs font-semibold tracking-widest uppercase">
                {role === 'candidate' ? 'Candidat' : 'Coach'} · BNJ Skills Maker
              </p>
              <h1 className="text-white text-xl font-extrabold mt-0.5">
                Bienvenue 👋 Configurons votre profil
              </h1>
            </div>
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white text-lg font-black">{currentStep}</span>
              <span className="text-white/60 text-xs font-medium">/{totalSteps}</span>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepLabels={stepLabels}
          />
        </div>

        {/* ── Scrollable step content ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          {role === 'candidate' && (
            <>
              {currentStep === 1 && <Step1BasicInfo data={candidateData} onChange={updateCandidate} />}
              {currentStep === 2 && <Step2Education data={candidateData} onChange={updateCandidate} />}
              {currentStep === 3 && <Step3Skills data={candidateData} onChange={updateCandidate} />}
              {currentStep === 4 && <Step4Goals data={candidateData} onChange={updateCandidate} />}
              {currentStep === 5 && <Step5Profile data={candidateData} onChange={updateCandidate} userId={userId} />}
            </>
          )}

          {role === 'coach' && (
            <>
              {currentStep === 1 && <Step1Identity data={coachData} onChange={updateCoach} userId={userId} />}
              {currentStep === 2 && <Step2Expertise data={coachData} onChange={updateCoach} />}
              {currentStep === 3 && <Step3ProfessionalInfo data={coachData} onChange={updateCoach} />}
              {currentStep === 4 && <Step4CoachingSetup data={coachData} onChange={updateCoach} />}
            </>
          )}

          {/* Error message */}
          {submitError && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600 font-medium">{submitError}</p>
            </div>
          )}
        </div>

        {/* ── Footer navigation ───────────────────────────────────────── */}
        <div className="px-6 pb-5 bg-white border-t border-slate-50">
          <StepNavigation
            step={currentStep}
            totalSteps={totalSteps}
            onBack={goBack}
            onNext={handleNext}
            isSubmitting={isSubmitting}
            canProceed={canProceed}
          />
        </div>
      </div>
    </div>
  )
}
