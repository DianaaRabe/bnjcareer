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

  type TrainingModule {
    id: ID!
    title: String!
    summary: String
    "1-based rank inside the training."
    position: Int!
    durationMinutes: Int
  }

  type Training {
    id: ID!
    title: String!
    description: String
    category: TrainingCategory!
    level: TrainingLevel!
    "Price in cents. Null means the training is free."
    priceCents: Int
    "Number of modules — derived from the curriculum."
    modules: Int!
    "Duration in days — the client renders weeks or days per locale."
    durationDays: Int!
    instructor: String
    certificate: Boolean!
    "Ordered programme. Only resolved on the detail query."
    curriculum: [TrainingModule!]!
  }

  type Query {
    "Published training catalog, newest first. Filtering happens client-side on this list."
    trainings: [Training!]!
    "One published training with its programme."
    training(id: ID!): Training!
  }
`
