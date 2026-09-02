import { AppShell } from '@/components/layout/AppShell/AppShell'
import { COACH_NAV_ITEMS, COACH_SECONDARY_NAV_ITEMS } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { useMyCoachAgreementQuery } from '@/graphql/hooks/coachAgreement'
import { PORTAL_ROLES } from '@/lib/rbac'

/** The coach space stays closed until the collaboration agreement in force is signed. */
export const CoachShell = () => {
  const { data, loading } = useMyCoachAgreementQuery()

  return (
    <AppShell
      portalLabelId="nav.coach.portal"
      navItems={COACH_NAV_ITEMS}
      secondaryNavItems={COACH_SECONDARY_NAV_ITEMS}
      rolesAuthorized={PORTAL_ROLES.coach}
      gate={{
        isResolving: loading,
        isBlocked: data?.myCoachAgreement.isSigned === false,
        redirectTo: ROUTES.coach.agreement,
      }}
    />
  )
}
