'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full">
      {/* Step labels */}
      <div className="flex justify-between mb-2">
        {stepLabels.map((label, i) => {
          const step = i + 1
          const isActive = step === currentStep
          const isDone = step < currentStep
          return (
            <div
              key={label}
              className="flex flex-col items-center gap-1"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-brand-primary text-white scale-90'
                    : isActive
                    ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-110'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight hidden sm:block transition-colors duration-200 ${
                  isActive ? 'text-brand-primary' : isDone ? 'text-slate-500' : 'text-slate-300'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-primary to-brand-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
