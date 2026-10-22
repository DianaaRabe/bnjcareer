import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import {
  connectEmailAccount,
  disconnectEmailAccount,
  getMyEmailAccount,
} from './emailAccountsService.js'

const myEmailAccount: QueryResolvers['myEmailAccount'] = (_parent, _args, ctx) => getMyEmailAccount(ctx)

const connectEmailAccountMutation: MutationResolvers['connectEmailAccount'] = (_parent, args, ctx) =>
  connectEmailAccount(ctx, args.input)

const disconnectEmailAccountMutation: MutationResolvers['disconnectEmailAccount'] = (_parent, _args, ctx) =>
  disconnectEmailAccount(ctx)

export const emailAccountsResolvers = {
  Query: {
    myEmailAccount,
  },
  Mutation: {
    connectEmailAccount: connectEmailAccountMutation,
    disconnectEmailAccount: disconnectEmailAccountMutation,
  },
}
