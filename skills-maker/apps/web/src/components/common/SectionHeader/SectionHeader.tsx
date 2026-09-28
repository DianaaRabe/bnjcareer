import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  icon: LucideIcon
  titleId: string
  /** Trailing content aligned to the right (counters, filters…). */
  action?: ReactNode
  /** Spacing and separators are the caller's call — they depend on the surrounding layout. */
  className?: string
}

export const SectionHeader = ({ icon: Icon, titleId, action, className }: SectionHeaderProps) => (
  <div className={cn('flex items-center justify-between gap-2', className)}>
    <div className="flex items-center gap-2">
      <Icon className="size-[17px] text-primary" strokeWidth={2} />
      <h2 className="text-base font-semibold">
        <FormattedMessage id={titleId} />
      </h2>
    </div>
    {action}
  </div>
)
