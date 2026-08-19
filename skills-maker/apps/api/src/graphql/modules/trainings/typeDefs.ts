import gql from 'graphql-tag'

export const trainingsTypeDefs = gql`
  enum TrainingCategory {
    INTERVIEW
    CV
    CAREER_CHANGE
    SOFT_SKILLS
    TECHNICAL
    LEADERSHIP
  }

  enum TrainingLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  type Training {
    id: ID!
    title: String!
    description: String
    category: TrainingCategory!
    level: TrainingLevel!
    "Price in cents. Null means the training is free."
    priceCents: Int
    modules: Int!
    "Duration in days — the client renders weeks or days per locale."
    durationDays: Int!
    instructor: String
    certificate: Boolean!
  }

  type Query {
    "Published training catalog, newest first. Filtering happens client-side on this list."
    trainings: [Training!]!
  }
`
