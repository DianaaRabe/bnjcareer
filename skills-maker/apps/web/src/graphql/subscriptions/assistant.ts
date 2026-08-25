import { graphql } from '@/gql'

export const ASSISTANT_REPLY_SUBSCRIPTION = graphql(`
  subscription AssistantReply($input: AssistantAskInput!) {
    assistantReply(input: $input) {
      delta
      done
    }
  }
`)
