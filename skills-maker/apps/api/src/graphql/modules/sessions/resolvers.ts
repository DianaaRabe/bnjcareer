import { Role } from '@prisma/client'
import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { requireRole } from '@/lib/rbac.js'
import {
  cancelBooking,
  cancelSession,
  createSession,
  getMySession,
  listMySessions,
  updateSession,
} from './sessionsService.js'

const mySessions: QueryResolvers['mySessions'] = async (_parent, _args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return listMySessions(ctx, user.id)
}

const mySession: QueryResolvers['mySession'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return getMySession(ctx, user.id, args.id)
}

const createSessionMutation: MutationResolvers['createSession'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return createSession(ctx, user.id, args.input)
}

const updateSessionMutation: MutationResolvers['updateSession'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return updateSession(ctx, user.id, args.id, args.input)
}

const cancelSessionMutation: MutationResolvers['cancelSession'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return cancelSession(ctx, user.id, args.id)
}

const cancelBookingMutation: MutationResolvers['cancelBooking'] = async (_parent, args, ctx) => {
  const user = requireRole(ctx, Role.COACH, Role.ADMIN)
  return cancelBooking(ctx, user.id, args.id)
}

export const sessionsResolvers = {
  Query: { mySessions, mySession },
  Mutation: {
    createSession: createSessionMutation,
    updateSession: updateSessionMutation,
    cancelSession: cancelSessionMutation,
    cancelBooking: cancelBookingMutation,
  },
}
