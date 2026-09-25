import type { QueryResolvers, MutationResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { login, register } from './authService.js'
import { toGraphQLUser } from './authMappers.js'

// Each resolver is typed from the schema — args and return are checked at compile time.
const me: QueryResolvers['me'] = (_parent, _args, ctx) => {
  if (!ctx.user) return null
  return toGraphQLUser(ctx.user)
}

const registerMutation: MutationResolvers['register'] = async (_parent, args, ctx) => {
  const { token, user } = await register(ctx, args.input)
  return { token, user: toGraphQLUser(user) }
}

const loginMutation: MutationResolvers['login'] = async (_parent, args, ctx) => {
  const { token, user } = await login(ctx, args.input)
  return { token, user: toGraphQLUser(user) }
}

export const authResolvers = {
  Query: { me },
  Mutation: { register: registerMutation, login: loginMutation },
}

// Re-exported for consistency; other modules may add their own local guard.
export { requireUser }
