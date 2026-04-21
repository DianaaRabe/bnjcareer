'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole, CandidateOnboardingData, CoachOnboardingData, OnboardingPayload } from '@/types/onboarding'
import { defaultCandidateData, defaultCoachData } from '@/types/onboarding'

interface UseOnboardingProps {
  role: UserRole
  userId: string
  initialData?: Partial<CandidateOnboardingData> | Partial<CoachOnboardingData>
}

export function useOnboarding({ role, userId, initialData = {} }: UseOnboardingProps) {
  const router = useRouter()

  // Step tracking
  const totalSteps = role === 'candidate' ? 5 : 4
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Form state
  const [candidateData, setCandidateData] = useState<CandidateOnboardingData>({
    ...defaultCandidateData,
    ...(role === 'candidate' ? initialData : {}),
  })
  const [coachData, setCoachData] = useState<CoachOnboardingData>({
    ...defaultCoachData,
    ...(role === 'coach' ? initialData : {}),
  })

  // Candidate updater
  const updateCandidate = useCallback((updates: Partial<CandidateOnboardingData>) => {
    setCandidateData((prev) => ({ ...prev, ...updates }))
  }, [])

  // Coach updater
  const updateCoach = useCallback((updates: Partial<CoachOnboardingData>) => {
    setCoachData((prev) => ({ ...prev, ...updates }))
  }, [])

  // Validation per step
  const canProceed = useCallback((): boolean => {
    if (role === 'candidate') {
      switch (currentStep) {
        case 1: return !!candidateData.first_name.trim() && !!candidateData.last_name.trim() && !!candidateData.birth_date
        case 2: return !!candidateData.education_level && !!candidateData.industry.trim() && !!candidateData.current_status
        case 3: return candidateData.strengths.length > 0 && candidateData.weaknesses.length > 0
        case 4: return !!candidateData.main_goal
        case 5: return true // photo + bio are optional
        default: return false
      }
    } else {
      switch (currentStep) {
        case 1: return !!coachData.first_name.trim() && !!coachData.last_name.trim()
        case 2: return !!coachData.specialization && coachData.experience_years !== ''
        case 3: return !!coachData.bio.trim()
        case 4: return coachData.session_types.length > 0
        default: return false
      }
    }
  }, [role, currentStep, candidateData, coachData])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, totalSteps])

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const payload: OnboardingPayload =
        role === 'candidate'
          ? { role: 'candidate', ...candidateData }
          : { role: 'coach', ...coachData }

      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Erreur lors de l\'enregistrement')
      }

      // Refresh the page so the layout re-fetches is_onboarded = true
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsSubmitting(false)
    }
  }, [role, candidateData, coachData, router])

  const handleNext = useCallback(() => {
    if (currentStep === totalSteps) {
      submit()
    } else {
      goNext()
    }
  }, [currentStep, totalSteps, goNext, submit])

  return {
    currentStep,
    totalSteps,
    candidateData,
    coachData,
    updateCandidate,
    updateCoach,
    canProceed: canProceed(),
    isSubmitting,
    submitError,
    handleNext,
    goBack,
    userId,
  }
}
