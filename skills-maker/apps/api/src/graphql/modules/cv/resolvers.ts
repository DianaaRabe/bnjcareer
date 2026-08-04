import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { createCv, getMyCv, optimizeCv, updateCvDetails } from './cvService.js'
import { toGraphQLCv } from './cvMappers.js'

const myCv: QueryResolvers['myCv'] = async (_parent, _args, ctx) => {
  const cv = await getMyCv(ctx)
  return cv ? toGraphQLCv(cv) : null
}

const createCvMutation: MutationResolvers['createCv'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  const cv = await createCv(ctx, args.input)
  return toGraphQLCv(cv)
}

const optimizeCvMutation: MutationResolvers['optimizeCv'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  const cv = await optimizeCv(ctx, args.id)
  return toGraphQLCv(cv)
}

const updateCvDetailsMutation: MutationResolvers['updateCvDetails'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  const cv = await updateCvDetails(ctx, args.id, args.input)
  return toGraphQLCv(cv)
}

export const cvResolvers = {
  Query: { myCv },
  Mutation: {
    createCv: createCvMutation,
    optimizeCv: optimizeCvMutation,
    updateCvDetails: updateCvDetailsMutation,
  },
}
