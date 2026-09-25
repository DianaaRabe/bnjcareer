import type { LucideIcon } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Option<T extends string> = { value: T; labelId: string; icon?: LucideIcon }

type IconSelectFieldProps<T extends string> = {
  labelId: string
  value: T | ''
  options: readonly Option<T>[]
  placeholderId: string
  onChange: (value: T) => void
}

export const IconSelectField = <T extends string>({
  labelId,
  value,
  options,
  placeholderId,
  onChange,
}: IconSelectFieldProps<T>) => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        <FormattedMessage id={labelId} />
      </Label>
      <Select value={value || undefined} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-11! w-full">
          <SelectValue placeholder={intl.formatMessage({ id: placeholderId })} />
        </SelectTrigger>
        <SelectContent>
          {/* SelectGroup carries the popover padding — without it the hovered item bleeds to the edges. */}
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon && <opt.icon className="size-[15px] text-muted-foreground" />}
                <FormattedMessage id={opt.labelId} />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
