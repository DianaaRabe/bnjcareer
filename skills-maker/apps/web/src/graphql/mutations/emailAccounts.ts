import { graphql } from '@/gql'

export const CONNECT_EMAIL_ACCOUNT_MUTATION = graphql(`
  mutation ConnectEmailAccount($input: ConnectEmailAccountInput!) {
    connectEmailAccount(input: $input) {
      id
      provider
      emailAddress
      scopes
      connectedAt
      tokenExpiresAt
    }
  }
`)

export const DISCONNECT_EMAIL_ACCOUNT_MUTATION = graphql(`
  mutation DisconnectEmailAccount {
    disconnectEmailAccount
  }
`)
