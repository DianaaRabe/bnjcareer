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

  "A coach's management view of a resource — same shape as Resource, unredacted, plus the publish state."
  type CoachResource {
    id: ID!
    title: String!
    description: String
    type: ResourceType!
    category: ResourceCategory!
    url: String
    sizeBytes: Int
    durationMinutes: Int
    access: ResourceAccess!
    priceCents: Int
    "Hidden from candidates until true."
    published: Boolean!
  }

  input CreateResourceInput {
    title: String!
    description: String
    type: ResourceType!
    category: ResourceCategory!
    url: String
    sizeBytes: Int
    durationMinutes: Int
    access: ResourceAccess
    priceCents: Int
    published: Boolean
  }

  input UpdateResourceInput {
    title: String
    description: String
    type: ResourceType
    category: ResourceCategory
    url: String
    sizeBytes: Int
    durationMinutes: Int
    access: ResourceAccess
    priceCents: Int
    published: Boolean
  }

  type Query {
    "Published resource library, newest first. Filtering happens client-side."
    resources: [Resource!]!
    "The whole shared library, drafts included — any coach can manage any resource."
    coachResources: [CoachResource!]!
    "One resource of the shared library."
    coachResource(id: ID!): CoachResource!
  }

  type Mutation {
    "Adds a resource to the shared library."
    createResource(input: CreateResourceInput!): CoachResource!
    "Updates a resource of the shared library — omitted fields are left untouched."
    updateResource(id: ID!, input: UpdateResourceInput!): CoachResource!
    "Removes a resource from the shared library."
    deleteResource(id: ID!): Boolean!
  }
`
