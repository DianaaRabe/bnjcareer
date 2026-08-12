import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

type JobsEmptyStateProps = {
  titleId: string
  descriptionId: string
  action?: ReactNode
}

export const JobsEmptyState = ({ titleId, descriptionId, action }: JobsEmptyStateProps) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-card p-10 text-center">
    <SearchX className="size-6 text-muted-foreground" />
    <p className="text-sm font-semibold text-foreground">
      <FormattedMessage id={titleId} />
    </p>
    <p className="max-w-[420px] text-[13px] text-muted-foreground">
      <FormattedMessage id={descriptionId} />
    </p>
    {action}
  </div>
)
