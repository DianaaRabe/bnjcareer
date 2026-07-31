import { graphql } from '@/gql'

export const ME_QUERY = graphql(`
  query Me {
    me {
      id
      email
      role
      profile {
        firstName
        lastName
        avatarUrl
      }
    }
  }
`)
