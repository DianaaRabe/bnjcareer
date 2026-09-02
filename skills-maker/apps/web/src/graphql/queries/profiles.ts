import { graphql } from '@/gql'

export const MY_PROFILE_QUERY = graphql(`
  query MyProfile {
    me {
      id
      profile {
        id
        firstName
        lastName
        phone
        bio
        avatarUrl
        birthDate
        educationLevel
        school
        sector
        situation
        strengths
        improvements
        skills
        objective
      }
    }
  }
`)
