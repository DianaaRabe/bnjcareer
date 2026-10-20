import { graphql } from '@/gql'

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: CredentialsInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        role
      }
    }
  }
`)

export const AUTH_WITH_GOOGLE_MUTATION = graphql(`
  mutation AuthWithGoogle($input: GoogleAuthInput!) {
    authWithGoogle(input: $input) {
      token
      user {
        id
        email
        role
      }
    }
  }
`)

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: CredentialsInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        role
      }
    }
  }
`)


