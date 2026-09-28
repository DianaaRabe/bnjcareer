import { Navigate } from 'react-router-dom'

import { LoadingScreen } from '@/components/layout/LoadingScreen/LoadingScreen'
import { useProtectedAction } from '@/hooks/useProtectedAction'
import { getHomeRoute } from '@/lib/rbac'
import { CandidateLanding } from './CandidateLanding'

/**
 * Public entry point at `/`: signed-in visitors go straight to their portal,
 * everyone else sees the candidate landing page.
 */
export function LandingGate() {
  const { isLoading, role } = useProtectedAction({ rolesAuthorized: [] })

  if (isLoading) {
    return <LoadingScreen />
  }

  if (role) {
    return <Navigate to={getHomeRoute(role)} replace />
  }

  return <CandidateLanding />
}
