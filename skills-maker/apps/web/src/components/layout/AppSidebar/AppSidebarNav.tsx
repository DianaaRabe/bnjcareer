import { useIntl } from 'react-intl'
import { NavLink } from 'react-router-dom'

import { Separator } from '@/components/ui/separator'
import type { NavItem } from '@/constants/navigation'
import { cn } from '@/lib/utils'

type AppSidebarNavProps = {
  items: NavItem[]
  /** Account-level entries, rendered after a separator. */
  secondaryItems?: NavItem[]
  collapsed?: boolean
  onNavigate?: () => void
}

type AppSidebarNavLinkProps = {
  item: NavItem
  collapsed?: boolean
  onNavigate?: () => void
}

const AppSidebarNavLink = ({ item, collapsed, onNavigate }: AppSidebarNavLinkProps) => {
  const intl = useIntl()
  const { to, labelId, icon: Icon, end } = item
  const label = intl.formatMessage({ id: labelId })

  return (
    <li>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        title={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
            collapsed ? 'justify-center px-0' : 'justify-start',
            isActive
              ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
              : 'font-medium text-muted-foreground hover:bg-muted hover:text-sidebar-foreground',
          )
        }
      >
        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
        {/* Keep the label reachable by assistive tech even when the sidebar is collapsed. */}
        <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
      </NavLink>
    </li>
  )
}

export const AppSidebarNav = ({
  items,
  secondaryItems,
  collapsed,
  onNavigate,
}: AppSidebarNavProps) => (
  <nav className="flex-1 overflow-y-auto px-3 pb-4">
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <AppSidebarNavLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </ul>

    {secondaryItems && secondaryItems.length > 0 && (
      <>
        <Separator className="my-2.5 bg-sidebar-border" />
        <ul className="flex flex-col gap-0.5">
          {secondaryItems.map((item) => (
            <AppSidebarNavLink
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </>
    )}
  </nav>
)
