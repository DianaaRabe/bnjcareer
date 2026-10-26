import type { LucideIcon } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewToggleOption<TValue extends string> = {
  id: TValue
  labelId: string
  icon: LucideIcon
}

type ViewToggleProps<TValue extends string> = {
  options: ViewToggleOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
  className?: string
}

/** Segmented icon switcher — same surface as a pill `TabsList`, squared off instead of fully rounded. */
export const ViewToggle = <TValue extends string>({
  options,
  value,
  onChange,
  className,
}: ViewToggleProps<TValue>) => {
  const intl = useIntl()

  return (
    <div
      className={cn(
        'flex w-fit shrink-0 gap-0.5 rounded-xl border border-border bg-card p-1 shadow-xs',
        className,
      )}
    >
      {options.map(({ id, labelId, icon: Icon }) => {
        const label = intl.formatMessage({ id: labelId })

        return (
          <Button
            key={id}
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-pressed={value === id}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              'text-muted-foreground',
              value === id &&
                'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary dark:bg-primary/15',
            )}
          >
            <Icon className="size-[15px]" />
          </Button>
        )
      })}
    </div>
  )
}
