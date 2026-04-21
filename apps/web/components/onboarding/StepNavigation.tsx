'use client'

import { Loader2 } from 'lucide-react'

interface StepNavigationProps {
  step: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  isSubmitting?: boolean
  canProceed?: boolean
}

export function StepNavigation({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  canProceed = true,
}: StepNavigationProps) {
  const isLast = step === totalSteps
  const isFirst = step === 1

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirst}
        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour
      </button>

      {/* Next / Submit */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-dark text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enregistrement...
          </>
        ) : isLast ? (
          <>
            Terminer
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </>
        ) : (
          <>
            Suivant
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
