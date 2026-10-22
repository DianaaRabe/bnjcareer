import { ROUTES } from '@/constants/routes'
import { Role } from '@/gql/graphql'

/** Portals a role may enter. The API stays the source of truth — this only gates the UI. */
export const PORTAL_ROLES = {
  candidate: [Role.Candidate],
  // No admin portal yet — admins land on the coach one until it is migrated.
  coach: [Role.Coach, Role.Admin],
} satisfies Record<string, Role[]>

const HOME_ROUTE_BY_ROLE: Record<Role, string> = {
  [Role.Candidate]: ROUTES.candidate.root,
  [Role.Coach]: ROUTES.coach.root,
  [Role.Admin]: ROUTES.coach.root,
}

/** Where to send a user who requested a portal their role cannot access. */
export const getHomeRoute = (role?: Role | null) =>
  role ? HOME_ROUTE_BY_ROLE[role] : ROUTES.login
