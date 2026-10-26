import { Check } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import type { ProfileObjective } from '@/gql/graphql'
import { OBJECTIVE_OPTIONS } from '../constants'

type ObjectiveSectionProps = {
  value: ProfileObjective | ''
  onChange: (v: ProfileObjective) => void
}

export const ObjectiveSection = ({ value, onChange }: ObjectiveSectionProps) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    {OBJECTIVE_OPTIONS.map((opt) => {
      const selected = opt.value === value
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2.5 rounded-md border px-4 py-3.5 text-left hover:bg-accent ${
            selected ? 'border-2 border-primary bg-accent' : 'border-border bg-background'
          }`}
        >
          <opt.icon className={`size-[17px] shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`flex-1 text-[13.5px] font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>
            <FormattedMessage id={opt.labelId} />
          </span>
          {selected && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="size-3" strokeWidth={3} />
            </span>
          )}
        </button>
      )
    })}
  </div>
)
