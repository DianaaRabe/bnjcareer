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

  type CoachingOverview {
    "Booked sessions still ahead, earliest first."
    workshops: [CoachingWorkshop!]!
    goals: [CoachingGoal!]!
    score: CoachingScore!
    "Consecutive days ending today with at least one application sent."
    streakDays: Int!
  }

  type Query {
    "Journey overview for the authenticated candidate: workshops, goals and score."
    myCoaching: CoachingOverview!
  }
`
