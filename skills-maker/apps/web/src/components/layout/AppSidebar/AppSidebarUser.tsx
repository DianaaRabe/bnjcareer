import { LogOut } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ROLE_LABEL_IDS } from '@/constants/roles'
import type { MeQuery } from '@/gql/graphql'

export type CurrentUser = NonNullable<MeQuery['me']>

type AppSidebarUserProps = {
  user?: CurrentUser | null
  collapsed?: boolean
  onSignOut: () => void
}

export const AppSidebarUser = ({ user, collapsed, onSignOut }: AppSidebarUserProps) => {
  const intl = useIntl()

  const displayName = user
    ? [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || user.email
    : ''

  const avatar = user ? (
    <Avatar className="after:border-sidebar-border">
      {user.profile?.avatarUrl && <AvatarImage src={user.profile.avatarUrl} alt="" />}
      <AvatarFallback className="bg-brand-yellow text-[0.8rem] font-bold text-brand-yellow-foreground">
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  ) : (
    <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" aria-hidden="true" />
  )

  // Collapsed: avatar only — signing out means expanding the sidebar first.
  if (collapsed) {
    return <div className="flex justify-center border-t border-sidebar-border p-3">{avatar}</div>
  }

  return (
    <div className="flex items-center gap-3 border-t border-sidebar-border p-3">
      {avatar}
      {user ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.8rem] font-semibold text-sidebar-foreground">
            {displayName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            <FormattedMessage id={ROLE_LABEL_IDS[user.role]} />
          </p>
        </div>
      ) : (
        <div className="flex-1 space-y-2" aria-hidden="true">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onSignOut}
        title={intl.formatMessage({ id: 'nav.signOut' })}
        aria-label={intl.formatMessage({ id: 'nav.signOut' })}
        className="text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
      >
        <LogOut />
      </Button>
    </div>
  )
}
