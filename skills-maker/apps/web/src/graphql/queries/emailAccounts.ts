import { graphql } from '@/gql'

export const MY_EMAIL_ACCOUNT_QUERY = graphql(`
  query MyEmailAccount {
    myEmailAccount {
      id
      provider
      emailAddress
      scopes
      connectedAt
      tokenExpiresAt
    }
  }
`)
