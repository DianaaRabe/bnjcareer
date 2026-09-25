import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

type EmptyStateProps = {
  descriptionId: string
  icon?: LucideIcon
  titleId?: string
  /** Trailing call to action (retry, navigate…). */
  action?: ReactNode
}

/** Dashed placeholder card shared by empty, error and not-yet-built sections. */
export const EmptyState = ({ descriptionId, icon: Icon, titleId, action }: EmptyStateProps) => (
  <section className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-card p-10 text-center">
    {Icon && <Icon className="size-6 text-muted-foreground" />}
    {titleId && (
      <p className="text-sm font-semibold text-foreground">
        <FormattedMessage id={titleId} />
      </p>
    )}
    <p className="max-w-[420px] text-sm text-muted-foreground">
      <FormattedMessage id={descriptionId} />
    </p>
    {action}
  </section>
)
