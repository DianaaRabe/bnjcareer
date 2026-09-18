import { Check, FileText, LayoutTemplate, Palette } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { CvTemplate } from '@/gql/graphql'
import { cn } from '@/lib/utils'

const OPTIONS: { value: CvTemplate; icon: typeof FileText; labelId: string; descriptionId: string }[] = [
  {
    value: CvTemplate.Ats,
    icon: FileText,
    labelId: 'candidate.cv.format.ats.label',
    descriptionId: 'candidate.cv.format.ats.description',
  },
  {
    value: CvTemplate.Professional,
    icon: LayoutTemplate,
    labelId: 'candidate.cv.format.professional.label',
    descriptionId: 'candidate.cv.format.professional.description',
  },
  {
    value: CvTemplate.Creative,
    icon: Palette,
    labelId: 'candidate.cv.format.creative.label',
    descriptionId: 'candidate.cv.format.creative.description',
  },
]

interface CvFormatSelectorProps {
  value: CvTemplate
  onChange: (value: CvTemplate) => void
  disabled?: boolean
  /** `sidebar` renders a compact vertical stack; `grid` (default) a 3-column card. */
  orientation?: 'grid' | 'sidebar'
}

export const CvFormatSelector = ({ value, onChange, disabled, orientation = 'grid' }: CvFormatSelectorProps) => {
  const isSidebar = orientation === 'sidebar'
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-xs">
      <div>
        <p className="text-[13px] font-semibold">
          <FormattedMessage id="candidate.cv.format.title" />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <FormattedMessage id="candidate.cv.format.subtitle" />
        </p>
      </div>
      <div className={cn('grid gap-2.5', isSidebar ? 'grid-cols-1' : 'sm:grid-cols-3')}>
        {OPTIONS.map((option) => {
          const Icon = option.icon
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative rounded-lg border text-left transition',
                'hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60',
                selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-background',
                isSidebar ? 'flex items-center gap-3 p-2.5 pr-8' : 'flex flex-col gap-1.5 p-4',
              )}
            >
              {selected && (
                <span className="absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              )}
              <span
                className={cn(
                  'flex shrink-0 items-center justify-center',
                  isSidebar && 'size-8 rounded-md',
                  isSidebar && (selected ? 'bg-primary/10' : 'bg-muted'),
                )}
              >
                <Icon className={cn('size-5', selected ? 'text-primary' : 'text-muted-foreground')} />
              </span>
              <span className="min-w-0">
                <p className="text-[13px] font-semibold">
                  <FormattedMessage id={option.labelId} />
                </p>
                <p className={cn('text-xs text-muted-foreground', isSidebar && 'line-clamp-1')}>
                  <FormattedMessage id={option.descriptionId} />
                </p>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
