import { X } from 'lucide-react'
import { useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

type ChipInputProps = {
  labelId: string
  hintId: string
  values: string[]
  max?: number
  placeholderId?: string
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}

export const ChipInput = ({ labelId, hintId, values, max, placeholderId, onAdd, onRemove }: ChipInputProps) => {
  const intl = useIntl()
  const [input, setInput] = useState('')
  const maxed = !!max && values.length >= max

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-1.5">
        <Label>
          <FormattedMessage id={labelId} />
        </Label>
        {max && (
          <span className="text-xs text-muted-foreground">
            ({values.length}/{max})
          </span>
        )}
      </div>
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2.5 py-2">
        {values.map((v, i) => (
          <Badge key={v + i} variant="secondary" className="h-6 gap-1.5 px-2.5 text-sm">
            {v}
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={intl.formatMessage({ id: 'candidate.profile.chip.remove' }, { value: v })}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <input
          value={input}
          disabled={maxed}
          placeholder={
            maxed
              ? intl.formatMessage({ id: 'candidate.profile.chip.max' })
              : placeholderId
                ? intl.formatMessage({ id: placeholderId })
                : undefined
          }
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd(input)
              setInput('')
            }
          }}
          className="min-w-[100px] flex-1 border-none bg-transparent text-[13.5px] outline-none placeholder:italic"
        />
      </div>
      <p className="text-[11.5px] text-muted-foreground">
        <FormattedMessage id={hintId} />
      </p>
    </div>
  )
}
