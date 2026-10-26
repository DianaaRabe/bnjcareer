import type { SubscriptionResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { streamAssistantReply, type AssistantChunk } from './assistantService.js'

// Subscriptions resolve in two steps: `subscribe` returns the async iterator,
// `resolve` maps each yielded value onto the SDL shape.
const assistantReply: SubscriptionResolvers['assistantReply'] = {
  subscribe: (_parent, args, ctx) => {
    const user = requireUser(ctx)
    return streamAssistantReply(ctx, user.id, args.input)
  },
  resolve: (payload: AssistantChunk) => payload,
}

export const assistantResolvers = {
  Subscription: { assistantReply },
}
