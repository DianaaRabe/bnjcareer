import type { ReactNode } from 'react'

import type { NavItem } from '@/constants/navigation'
import { cn } from '@/lib/utils'
import { AppSidebarBrand } from './AppSidebarBrand'
import { AppSidebarNav } from './AppSidebarNav'
import { AppSidebarUser, type CurrentUser } from './AppSidebarUser'

type AppSidebarProps = {
  portalLabelId: string
  navItems: NavItem[]
  secondaryNavItems?: NavItem[]
  user?: CurrentUser | null
  onSignOut: () => void
  /** Icons-only rail — desktop can shrink the sidebar to save horizontal space. */
  collapsed?: boolean
  onToggleCollapse?: () => void
  /** Called when a nav item is picked — used to close the mobile drawer. */
  onNavigate?: () => void
  /** Control rendered in the brand row — the mobile drawer passes its close button. */
  brandAction?: ReactNode
  className?: string
}

export const AppSidebar = ({
  portalLabelId,
  navItems,
  secondaryNavItems,
  user,
  onSignOut,
  collapsed,
  onToggleCollapse,
  onNavigate,
  brandAction,
  className,
}: AppSidebarProps) => (
  <div className={cn('flex h-full flex-col bg-sidebar text-sidebar-foreground', className)}>
    <AppSidebarBrand
      portalLabelId={portalLabelId}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      action={brandAction}
    />
    <AppSidebarNav
      items={navItems}
      secondaryItems={secondaryNavItems}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
    <AppSidebarUser user={user} collapsed={collapsed} onSignOut={onSignOut} />
  </div>
)
