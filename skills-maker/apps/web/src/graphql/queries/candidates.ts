import { graphql } from '@/gql'

export const MY_CANDIDATES_QUERY = graphql(`
  query MyCandidates {
    myCandidates {
      id
      firstName
      lastName
      avatarUrl
      bio
      sector
      situation
      sessionsCount
      lastSessionAt
      needsFollowUp
    }
  }
`)

export const COACH_CANDIDATE_QUERY = graphql(`
  query CoachCandidate($id: ID!) {
    coachCandidate(id: $id) {
      id
      firstName
      lastName
      avatarUrl
      bio
      sector
      situation
      cvStatus
      sessionsCount
      lastSessionAt
      nextSessionAt
      applications {
        id
        jobTitle
        company
        status
        matchScore
        createdAt
      }
      goals {
        id
        title
        progress
        target
      }
    }
  }
`)
