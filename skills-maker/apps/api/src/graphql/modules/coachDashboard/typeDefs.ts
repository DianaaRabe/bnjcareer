import gql from 'graphql-tag'

export const coachDashboardTypeDefs = gql`
  enum EventType {
    ONE_ON_ONE
    GROUP
  }

  type CoachCandidate {
    id: ID!
    firstName: String
    lastName: String
    avatarUrl: String
    sector: String
    situation: ProfileSituation
    sessionsCount: Int!
    "ISO 8601 datetime of the most recent session with this coach, past or future."
    lastSessionAt: String!
    "No session left ahead of now — every past session, nothing on the calendar."
    needsFollowUp: Boolean!
  }

  type CoachUpcomingSession {
    id: ID!
    title: String!
    "ISO 8601 datetime."
    startsAt: String!
    type: EventType!
  }

  type CoachDashboardOverview {
    totalCandidates: Int!
    sessionsThisWeek: Int!
    "Total sessions ahead — upcomingSessions is capped for display."
    upcomingSessionsCount: Int!
    "Soonest sessions ahead, earliest first."
    upcomingSessions: [CoachUpcomingSession!]!
    "Most recently active candidates first."
    recentCandidates: [CoachCandidate!]!
  }

  type Query {
    "Candidates who have booked at least one session with the authenticated coach."
    myCandidates: [CoachCandidate!]!
    "Overview for the authenticated coach's dashboard."
    coachDashboard: CoachDashboardOverview!
  }
`
