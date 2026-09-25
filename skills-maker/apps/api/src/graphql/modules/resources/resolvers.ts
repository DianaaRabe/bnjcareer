import { Role } from '@prisma/client'
import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { requireRole, requireUser } from '@/lib/rbac.js'
import { createResource, deleteResource, getCoachResource, listCoachResources, updateResource } from './resourcesCoachService.js'
import { listResources } from './resourcesService.js'

const resources: QueryResolvers['resources'] = async (_parent, _args, ctx) => {
  requireUser(ctx)
  return listResources(ctx)
}

const coachResources: QueryResolvers['coachResources'] = async (_parent, _args, ctx) => {
  requireRole(ctx, Role.COACH, Role.ADMIN)
  return listCoachResources(ctx)
}

const coachResource: QueryResolvers['coachResource'] = async (_parent, args, ctx) => {
  requireRole(ctx, Role.COACH, Role.ADMIN)
  return getCoachResource(ctx, args.id)
}

const createResourceMutation: MutationResolvers['createResource'] = async (_parent, args, ctx) => {
  requireRole(ctx, Role.COACH, Role.ADMIN)
  return createResource(ctx, args.input)
}

const updateResourceMutation: MutationResolvers['updateResource'] = async (_parent, args, ctx) => {
  requireRole(ctx, Role.COACH, Role.ADMIN)
  return updateResource(ctx, args.id, args.input)
}

const deleteResourceMutation: MutationResolvers['deleteResource'] = async (_parent, args, ctx) => {
  requireRole(ctx, Role.COACH, Role.ADMIN)
  return deleteResource(ctx, args.id)
}

export const resourcesResolvers = {
  Query: { resources, coachResources, coachResource },
  Mutation: {
    createResource: createResourceMutation,
    updateResource: updateResourceMutation,
    deleteResource: deleteResourceMutation,
  },
}
