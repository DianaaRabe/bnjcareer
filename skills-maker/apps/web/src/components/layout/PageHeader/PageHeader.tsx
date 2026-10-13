import type { ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'

type PageHeaderProps = {
  titleId: string
  eyebrowId?: string
  descriptionId?: string
  /** Right-aligned actions (buttons, filters…). */
  actions?: ReactNode
}

export const PageHeader = ({ titleId, eyebrowId, descriptionId, actions }: PageHeaderProps) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div className="min-w-0 space-y-1">
      {eyebrowId && (
        <p className="text-sm font-medium text-muted-foreground">
          <FormattedMessage id={eyebrowId} />
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        <FormattedMessage id={titleId} />
      </h1>
      {descriptionId && (
        <p className="text-sm text-muted-foreground">
          <FormattedMessage id={descriptionId} />
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </header>
)
