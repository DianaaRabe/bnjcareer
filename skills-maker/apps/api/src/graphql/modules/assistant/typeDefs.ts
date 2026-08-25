import gql from 'graphql-tag'

export const assistantTypeDefs = gql`
  enum AssistantRole {
    USER
    ASSISTANT
  }

  input AssistantMessageInput {
    role: AssistantRole!
    content: String!
  }

  input AssistantAskInput {
    "The conversation so far, oldest first. The last entry is the new question."
    messages: [AssistantMessageInput!]!
  }

  type AssistantChunk {
    "Text produced since the previous chunk — append it, do not replace."
    delta: String!
    "True on the last chunk, when nothing more will come."
    done: Boolean!
  }

  type Subscription {
    "Streams the assistant answer as it is produced."
    assistantReply(input: AssistantAskInput!): AssistantChunk!
  }
`
