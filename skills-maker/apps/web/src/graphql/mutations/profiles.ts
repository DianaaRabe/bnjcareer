import { graphql } from '@/gql'

export const UPDATE_PROFILE_MUTATION = graphql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
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
`)
