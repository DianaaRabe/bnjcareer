import type { User } from '@prisma/client'

// Map the Prisma entity to the exposed GraphQL type — never expose passwordHash.
export function toGraphQLUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  }
}
