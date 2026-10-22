import gql from 'graphql-tag'

export const coachingTypeDefs = gql`
  enum CoachingGoalKey {
    CV
    APPLICATIONS
    INTERVIEW
    WORKSHOP
    MATCHING
  }

  type CoachingGoal {
    key: CoachingGoalKey!
    points: Int!
    done: Boolean!
    "Completion 0–100 while in progress. Null once done, or when the goal is all-or-nothing."
    progress: Int
  }

  type CoachingWorkshop {
    id: ID!
    title: String!
    "ISO 8601 datetime."
    startsAt: String!
    coachName: String
  }

  type CoachingScore {
    points: Int!
    max: Int!
    percent: Int!
  }

  "Headline counters for the candidate dashboard — all derived from real rows."
  type CoachingStats {
    "Offers the candidate applied to or analysed (dashboard: 'offres ciblées')."
    applicationCount: Int!
    interviewCount: Int!
    "Best match score recorded so far, 0–100."
    bestMatchScore: Int!
    "Past sessions/workshops the candidate attended."
    attendedWorkshopCount: Int!
  }

  "A recent offer the candidate applied to or analysed — shown on the dashboard preview."
  type CoachingApplication {
    id: ID!
    title: String!
    company: String
    status: String!
    "ISO 8601 datetime the application row was created."
    appliedAt: String!
  }

  type CoachingOverview {
    "Booked sessions still ahead, earliest first."
    workshops: [CoachingWorkshop!]!
    goals: [CoachingGoal!]!
    score: CoachingScore!
    "Consecutive days ending today with at least one application sent."
    streakDays: Int!
    stats: CoachingStats!
    "Most recent applications, newest first — for the dashboard preview."
    recentApplications: [CoachingApplication!]!
  }

  type Query {
    "Journey overview for the authenticated candidate: workshops, goals and score."
    myCoaching: CoachingOverview!
  }
`
