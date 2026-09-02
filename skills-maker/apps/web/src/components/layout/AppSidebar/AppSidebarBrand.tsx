import type { ReactNode } from 'react'
import { ChevronsLeft } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'

type AppSidebarBrandProps = {
  portalLabelId: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  /** Extra control on the right of the brand — the mobile drawer puts its close button here. */
  action?: ReactNode
}

const BrandLogo = () => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-base font-bold text-brand-yellow-foreground">
    <FormattedMessage id="app.initial" />
  </span>
)

export const AppSidebarBrand = ({
  portalLabelId,
  collapsed,
  onToggleCollapse,
  action,
}: AppSidebarBrandProps) => {
  const intl = useIntl()
  const toggleLabel = intl.formatMessage({ id: collapsed ? 'nav.expand' : 'nav.collapse' })

  // The logo doubles as the toggle — collapsed, it is the only affordance left to expand back.
  const logo = onToggleCollapse ? (
    <button
      type="button"
      onClick={onToggleCollapse}
      title={toggleLabel}
      aria-label={toggleLabel}
      className="rounded-xl outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <BrandLogo />
    </button>
  ) : (
    <BrandLogo />
  )

  if (collapsed) {
    return <div className="flex justify-center px-3 py-5">{logo}</div>
  }

  return (
    <div className="flex items-center gap-3 px-4 py-5">
      {logo}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">
          <FormattedMessage id="app.name" />
        </p>
        <p className="truncate text-[0.65rem] font-semibold tracking-[0.14em] text-sidebar-primary uppercase">
          <FormattedMessage id={portalLabelId} />
        </p>
      </div>
      {action ??
        (onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            title={toggleLabel}
            aria-label={toggleLabel}
            className="text-sidebar-foreground/60 hover:bg-muted hover:text-sidebar-foreground"
          >
            <ChevronsLeft />
          </Button>
        ))}
    </div>
  )
}
