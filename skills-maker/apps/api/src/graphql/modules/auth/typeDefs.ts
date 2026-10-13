import gql from 'graphql-tag'

export const authTypeDefs = gql`
  enum Role {
    CANDIDATE
    COACH
    ADMIN
  }

  type User {
    id: ID!
    email: String!
    role: Role!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CredentialsInput {
    email: String!
    password: String!
  }

  type Query {
    "Currently authenticated user"
    me: User
  }

  type Mutation {
    register(input: CredentialsInput!): AuthPayload!
    login(input: CredentialsInput!): AuthPayload!
  }
`
