import type { MutationResolvers, UserResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { getProfileByUserId, updateProfile } from './profileService.js'
import { toGraphQLProfile } from './profileMappers.js'

const profile: UserResolvers['profile'] = async (parent, _args, ctx) => {
  const record = await getProfileByUserId(ctx, parent.id)
  return record ? toGraphQLProfile(record) : null
}

const updateProfileMutation: MutationResolvers['updateProfile'] = async (_parent, args, ctx) => {
  const user = requireUser(ctx)
  const record = await updateProfile(ctx, user.id, args.input)
  return toGraphQLProfile(record)
}

export const profilesResolvers = {
  User: { profile },
  Mutation: { updateProfile: updateProfileMutation },
}
