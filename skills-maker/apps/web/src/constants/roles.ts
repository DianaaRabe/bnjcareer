import { Role } from '@/gql/graphql'

export const ROLE_LABEL_IDS: Record<Role, string> = {
  [Role.Candidate]: 'role.candidate',
  [Role.Coach]: 'role.coach',
  [Role.Admin]: 'role.admin',
}
