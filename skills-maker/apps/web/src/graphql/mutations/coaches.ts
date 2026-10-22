import { graphql } from '@/gql'

export const UPDATE_COACH_PROFILE_MUTATION = graphql(`
  mutation UpdateCoachProfile($input: UpdateCoachProfileInput!) {
    updateCoachProfile(input: $input) {
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
