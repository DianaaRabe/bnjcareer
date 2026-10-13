import { Menu, X } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Navigate, Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/layout/AppSidebar/AppSidebar'
import { LoadingScreen } from '@/components/layout/LoadingScreen/LoadingScreen'
import { Button } from '@/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { NavItem } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import type { Role } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { useAppShell } from './useAppShell'

type AppShellProps = {
  portalLabelId: string
  navItems: NavItem[]
  secondaryNavItems?: NavItem[]
  /** Roles allowed in this portal. */
  rolesAuthorized: Role[]
  /** Route to send the user to when a prerequisite — signing the agreement — is unmet. */
  gate?: { isBlocked: boolean; isResolving: boolean; redirectTo: string }
}

export const AppShell = ({
  portalLabelId,
  navItems,
  secondaryNavItems,
  rolesAuthorized,
  gate,
}: AppShellProps) => {
  const {
    isAuthenticated,
    isLoading,
    isAuthorized,
    homeRoute,
    user,
    isNavOpen,
    setNavOpen,
    closeNav,
    isCollapsed,
    toggleCollapsed,
    signOut,
  } = useAppShell({ rolesAuthorized })
  const intl = useIntl()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />
  }

  // Hold the render until the role is known, otherwise the gate below would bounce everyone.
  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthorized) {
    return <Navigate to={homeRoute} replace />
  }

  // Hold the render until the gate resolved, otherwise it would bounce an eligible user.
  if (gate?.isResolving) {
    return <LoadingScreen />
  }

  if (gate?.isBlocked) {
    return <Navigate to={gate.redirectTo} replace />
  }

  const sidebarProps = {
    portalLabelId,
    navItems,
    secondaryNavItems,
    user,
    onSignOut: signOut,
  }

  return (
    <div className="flex min-h-screen bg-muted">
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block',
          isCollapsed ? 'w-[76px]' : 'w-64',
        )}
      >
        <AppSidebar {...sidebarProps} collapsed={isCollapsed} onToggleCollapse={toggleCollapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Sheet open={isNavOpen} onOpenChange={setNavOpen}>
          <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background px-4 py-3 lg:hidden">
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={intl.formatMessage({ id: 'nav.open' })}
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <span className="truncate text-sm font-semibold text-foreground">
              <FormattedMessage id={portalLabelId} />
            </span>
          </header>

          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-72 gap-0 border-none bg-sidebar p-0"
          >
            <SheetTitle className="sr-only">
              <FormattedMessage id="nav.menu" />
            </SheetTitle>
            <AppSidebar
              {...sidebarProps}
              onNavigate={closeNav}
              brandAction={
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={intl.formatMessage({ id: 'nav.close' })}
                    className="bg-muted text-muted-foreground hover:text-sidebar-foreground"
                  >
                    <X />
                  </Button>
                </SheetClose>
              }
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
