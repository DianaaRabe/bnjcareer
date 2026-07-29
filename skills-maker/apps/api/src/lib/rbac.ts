import { GraphQLError } from 'graphql'
import type { Role } from '@prisma/client'
import type { Context } from '@/context.js'
import { messages } from '@/constants/messages.js'

// Reusable authorization guards for resolvers.

export function requireUser(ctx: Context) {
  if (!ctx.user) {
    throw new GraphQLError(messages.authenticationRequired, {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
  return ctx.user
}

export function requireRole(ctx: Context, ...roles: Role[]) {
  const user = requireUser(ctx)
  if (!roles.includes(user.role)) {
    throw new GraphQLError(messages.accessDenied, {
      extensions: { code: 'FORBIDDEN' },
    })
  }
  return user
}
