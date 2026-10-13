import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { getMyApplications, getMyApplicationStats, sendMyApplication } from './applicationsService.js'

const myApplications: QueryResolvers['myApplications'] = (_parent, args, ctx) =>
  getMyApplications(ctx, { source: args.source, status: args.status })

const myApplicationStats: QueryResolvers['myApplicationStats'] = (_parent, _args, ctx) =>
  getMyApplicationStats(ctx)

const sendApplication: MutationResolvers['sendApplication'] = (_parent, args, ctx) =>
  sendMyApplication(ctx, args.id)

export const applicationsResolvers = {
  Query: {
    myApplications,
    myApplicationStats,
  },
  Mutation: {
    sendApplication,
  },
}
