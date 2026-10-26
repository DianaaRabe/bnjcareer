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

export const MY_COACH_PROFILE_QUERY = graphql(`
  query MyCoachProfile {
    myCoachProfile {
      specialty
      yearsExperience
      certifications
      expertise
      rating
      acceptingClients
      published
    }
  }
`)
