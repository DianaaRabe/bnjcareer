import { useMemo } from 'react'

import type { Role } from '@/gql/graphql'
import { useMeQuery } from '@/graphql/hooks/auth'
import { getToken } from '@/lib/auth'

type UseProtectedActionArgs = {
  /** Roles allowed to reach the guarded route or action. */
  rolesAuthorized: Role[]
}

/**
 * Role gate for a route or a UI action: `isAuthorized` only turns true once `me` resolved,
 * so callers must wait for `isLoading` before acting on it.
 */
export function useProtectedAction({ rolesAuthorized }: UseProtectedActionArgs) {
  const hasToken = Boolean(getToken())
  const { data, loading, error } = useMeQuery({ skip: !hasToken })
  const role = data?.me?.role ?? null

  const isAuthorized = useMemo(
    () => (role ? rolesAuthorized.includes(role) : false),
    [role, rolesAuthorized],
  )

  return { isAuthorized, isLoading: hasToken && loading, role, error }
}
