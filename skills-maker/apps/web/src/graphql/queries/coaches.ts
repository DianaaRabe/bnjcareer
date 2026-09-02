import { graphql } from '@/gql'

export const COACHES_QUERY = graphql(`
  query Coaches {
    coaches {
      id
      firstName
      lastName
      avatarUrl
      bio
      specialty
      yearsExperience
      certifications
      expertise
      rating
      acceptingClients
    }
  }
`)
