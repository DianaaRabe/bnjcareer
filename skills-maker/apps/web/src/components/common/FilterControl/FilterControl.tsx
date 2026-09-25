import type { LucideIcon } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type FilterOption<TValue extends string> = {
  value: TValue
  labelId: string
  icon?: LucideIcon
}

export const FILTER_DISPLAY = {
  chips: 'chips',
  select: 'select',
} as const

export type FilterDisplay = (typeof FILTER_DISPLAY)[keyof typeof FILTER_DISPLAY]

type FilterControlProps<TValue extends string> = {
  labelId: string
  options: FilterOption<TValue>[]
  isSelected: (value: TValue) => boolean
  onSelect: (value: TValue) => void
  /** Beside the label on chips, inside the trigger on a select. */
  icon?: LucideIcon
  /** `chips` exposes every option at once; `select` collapses them behind a trigger. */
  display?: FilterDisplay
}

/**
 * One facet of a filtered list. Selection is driven by `isSelected`/`onSelect`, so the caller
 * decides the arity: toggling one value gives single-select, an array membership test gives
 * multi-select. Only `chips` can render a multi-select — a trigger shows a single value.
 */
export const FilterControl = <TValue extends string>({
  labelId,
  options,
  isSelected,
  onSelect,
  icon: Icon,
  display = FILTER_DISPLAY.chips,
}: FilterControlProps<TValue>) => {
  const intl = useIntl()
  const label = intl.formatMessage({ id: labelId })

  if (display === FILTER_DISPLAY.select) {
    const current = options.find(({ value }) => isSelected(value))

    return (
      <Select value={current?.value} onValueChange={(next) => onSelect(next as TValue)}>
        <SelectTrigger className="h-11! flex-1 sm:flex-none" aria-label={label}>
          {Icon && <Icon className="size-3.5 text-muted-foreground" />}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* SelectGroup carries the popover padding — without it the hovered item bleeds to the edges. */}
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.icon && <option.icon className="size-[15px] text-muted-foreground" />}
                <FormattedMessage id={option.labelId} />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, labelId: optionLabelId }) => (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected(value)}
            onClick={() => onSelect(value)}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors',
              isSelected(value)
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <FormattedMessage id={optionLabelId} />
          </button>
        ))}
      </div>
    </div>
  )
}
