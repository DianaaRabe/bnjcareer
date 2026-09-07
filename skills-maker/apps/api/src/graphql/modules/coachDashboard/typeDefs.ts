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
    bio: String
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

  enum ApplicationStatus {
    SENT
    PENDING
    REJECTED
    INTERVIEW
  }

  type CoachCandidateApplication {
    id: ID!
    jobTitle: String
    company: String
    status: ApplicationStatus!
    matchScore: Float
    "ISO 8601 datetime."
    createdAt: String!
  }

  type CoachCandidateGoal {
    id: ID!
    title: String
    "Completion, 0–100."
    progress: Int!
    target: Int
  }

  type CoachCandidateDetail {
    id: ID!
    firstName: String
    lastName: String
    avatarUrl: String
    bio: String
    sector: String
    situation: ProfileSituation
    "Null when the candidate has not uploaded a CV yet."
    cvStatus: CvStatus
    sessionsCount: Int!
    "ISO 8601 datetime of the most recent past session, if any."
    lastSessionAt: String
    "ISO 8601 datetime of the closest session ahead, if any."
    nextSessionAt: String
    "Most recent applications first."
    applications: [CoachCandidateApplication!]!
    goals: [CoachCandidateGoal!]!
  }

  type Query {
    "Candidates who have booked at least one session with the authenticated coach."
    myCandidates: [CoachCandidate!]!
    "Overview for the authenticated coach's dashboard."
    coachDashboard: CoachDashboardOverview!
    "One of the authenticated coach's candidates, with applications, goals and CV status."
    coachCandidate(id: ID!): CoachCandidateDetail!
  }
`
