import { graphql } from '@/gql'

export const COACH_DASHBOARD_QUERY = graphql(`
  query CoachDashboard {
    coachDashboard {
      totalCandidates
      sessionsThisWeek
      upcomingSessionsCount
      upcomingSessions {
        id
        title
        startsAt
        type
      }
      recentCandidates {
        id
        firstName
        lastName
        avatarUrl
        sector
        sessionsCount
        lastSessionAt
        needsFollowUp
      }
    }
  }
`)
