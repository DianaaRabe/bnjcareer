import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import type { Role } from '@/gql/graphql'
import { useMeQuery } from '@/graphql/hooks/auth'
import { useProtectedAction } from '@/hooks/useProtectedAction'
import { clearToken, getToken } from '@/lib/auth'
import { getHomeRoute } from '@/lib/rbac'

const COLLAPSED_KEY = 'sidebar:collapsed'

type UseAppShellArgs = {
  /** Roles allowed in this portal — anyone else is sent back to their own. */
  rolesAuthorized: Role[]
}

export function useAppShell({ rolesAuthorized }: UseAppShellArgs) {
  const [isNavOpen, setNavOpen] = useState(false)
  // The collapsed sidebar is a lasting preference — keep it across reloads.
  const [isCollapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true')
  const navigate = useNavigate()
  const apolloClient = useApolloClient()
  const hasToken = Boolean(getToken())
  const { data, error, loading } = useMeQuery({ skip: !hasToken })
  const { isAuthorized } = useProtectedAction({ rolesAuthorized })

  // A rejected `me` means the stored token is stale — drop it so the login page starts clean.
  useEffect(() => {
    if (error) {
      clearToken()
    }
  }, [error])

  const closeNav = () => setNavOpen(false)

  const toggleCollapsed = () =>
    setCollapsed((collapsed) => {
      localStorage.setItem(COLLAPSED_KEY, String(!collapsed))
      return !collapsed
    })

  const signOut = async () => {
    clearToken()
    await apolloClient.clearStore()
    navigate(ROUTES.login, { replace: true })
  }

  return {
    isAuthenticated: hasToken && !error,
    // The role is unknown until `me` resolves — gates must not decide before that.
    isLoading: hasToken && loading,
    isAuthorized,
    homeRoute: getHomeRoute(data?.me?.role),
    user: data?.me,
    isNavOpen,
    setNavOpen,
    closeNav,
    isCollapsed,
    toggleCollapsed,
    signOut,
  }
}
