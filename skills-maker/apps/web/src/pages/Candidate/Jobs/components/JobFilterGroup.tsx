import { FormattedMessage } from 'react-intl'

import { cn } from '@/lib/utils'

type JobFilterGroupProps<TValue extends string> = {
  titleId: string
  options: { value: TValue; labelId: string }[]
  isSelected: (value: TValue) => boolean
  onSelect: (value: TValue) => void
}

/** Toggle chips — multi-select or single-select depending on what the parent does with onSelect. */
export const JobFilterGroup = <TValue extends string>({
  titleId,
  options,
  isSelected,
  onSelect,
}: JobFilterGroupProps<TValue>) => (
  <div className="space-y-2.5">
    <p className="text-[13px] font-semibold text-foreground">
      <FormattedMessage id={titleId} />
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, labelId }) => (
        <button
          key={value}
          type="button"
          aria-pressed={isSelected(value)}
          onClick={() => onSelect(value)}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
            isSelected(value)
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <FormattedMessage id={labelId} />
        </button>
      ))}
    </div>
  </div>
)
