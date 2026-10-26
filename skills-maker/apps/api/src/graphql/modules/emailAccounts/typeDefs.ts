import gql from 'graphql-tag'

export const emailAccountsTypeDefs = gql`
  "The mailbox provider a candidate connected to send their applications from."
  enum EmailAccountProvider {
    BREVO
    GOOGLE
    MICROSOFT
  }

  "A candidate's connected sending mailbox. OAuth tokens are NEVER exposed — only safe metadata."
  type ConnectedEmailAccount {
    id: ID!
    provider: EmailAccountProvider!
    emailAddress: String!
    "Scopes actually granted, so an over-broad grant is visible in review."
    scopes: [String!]!
    connectedAt: String!
    "ISO 8601 expiry of the stored access token, or null when unknown."
    tokenExpiresAt: String
  }

  "Tokens captured from the OAuth redirect. Stored encrypted at rest; never returned to any client."
  input ConnectEmailAccountInput {
    provider: EmailAccountProvider!
    emailAddress: String!
    accessToken: String!
    "Long-lived refresh token (access_type=offline). Optional: absent on some re-consents."
    refreshToken: String
    "ISO 8601 or epoch-seconds expiry of the access token, if the provider returned one."
    expiresAt: String
    scopes: [String!]
  }

  type Query {
    "The signed-in candidate's connected sending mailbox, or null when none is connected."
    myEmailAccount: ConnectedEmailAccount
  }

  type Mutation {
    "Stores the candidate's OAuth mailbox tokens (encrypted) so the platform can send on their behalf."
    connectEmailAccount(input: ConnectEmailAccountInput!): ConnectedEmailAccount!
    "Wipes the stored credentials for the candidate's mailbox. The row stays, marked disconnected."
    disconnectEmailAccount: Boolean!
  }
`
