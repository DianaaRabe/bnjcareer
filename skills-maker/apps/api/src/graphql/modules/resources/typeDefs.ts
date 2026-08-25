import gql from 'graphql-tag'

export const resourcesTypeDefs = gql`
  enum ResourceType {
    PDF
    DOC
    ARTICLE
    VIDEO
    REPLAY
  }

  enum ResourceCategory {
    APPLICATION
    INTERVIEW
    NETWORK
    ORGANIZATION
    COACHING
    TOOLS
  }

  enum ResourceAccess {
    FREE
    PAID
    PREMIUM
  }

  type Resource {
    id: ID!
    title: String!
    description: String
    type: ResourceType!
    category: ResourceCategory!
    "Null while the file or the article is not published yet."
    url: String
    "Bytes — documents only."
    sizeBytes: Int
    "Minutes — videos and replays only."
    durationMinutes: Int
    access: ResourceAccess!
    "Price in cents. Only set when access is PAID."
    priceCents: Int
  }

  type Query {
    "Published resource library, newest first. Filtering happens client-side."
    resources: [Resource!]!
  }
`
