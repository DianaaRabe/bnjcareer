import { Navigate } from 'react-router-dom'

import { LoadingScreen } from '@/components/layout/LoadingScreen/LoadingScreen'
import { useProtectedAction } from '@/hooks/useProtectedAction'
import { getHomeRoute } from '@/lib/rbac'

/** Entry point of the app: sends each visitor to the portal matching their role. */
export const HomeRedirect = () => {
  // No role is authorized here — the hook is only used to resolve the current role.
  const { isLoading, role } = useProtectedAction({ rolesAuthorized: [] })

  if (isLoading) {
    return <LoadingScreen />
  }

  return <Navigate to={getHomeRoute(role)} replace />
}
