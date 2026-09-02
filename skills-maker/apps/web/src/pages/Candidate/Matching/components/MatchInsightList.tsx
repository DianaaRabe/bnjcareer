import type { LucideIcon } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { cn } from '@/lib/utils'

type MatchInsightListProps = {
  titleId: string
  items: string[]
  icon: LucideIcon
  iconClassName: string
}

export const MatchInsightList = ({ titleId, items, icon: Icon, iconClassName }: MatchInsightListProps) => {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-background p-4 text-left">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <FormattedMessage id={titleId} />
      </p>
      <ul className="flex flex-col gap-1.5 text-[13.5px] leading-snug text-foreground">
        {items.map((item, index) => (
          <li key={`${titleId}-${index}`} className="flex gap-2">
            <Icon className={cn('mt-0.5 size-3.5 shrink-0', iconClassName)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
