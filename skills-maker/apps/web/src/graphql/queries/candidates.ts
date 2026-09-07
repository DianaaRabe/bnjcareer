import { graphql } from '@/gql'

export const MY_CANDIDATES_QUERY = graphql(`
  query MyCandidates {
    myCandidates {
      id
      firstName
      lastName
      avatarUrl
      sector
      situation
      sessionsCount
      lastSessionAt
      needsFollowUp
    }
  }
`)
