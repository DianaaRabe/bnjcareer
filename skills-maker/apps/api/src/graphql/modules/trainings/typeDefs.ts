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

  "The coach's own view of a training — same shape as Training, plus the draft/published state."
  type CoachTraining {
    id: ID!
    title: String!
    description: String
    category: TrainingCategory!
    level: TrainingLevel!
    priceCents: Int
    modules: Int!
    durationDays: Int!
    instructor: String
    certificate: Boolean!
    "Hidden from candidates until true."
    published: Boolean!
    curriculum: [TrainingModule!]!
  }

  input CreateTrainingInput {
    title: String!
    description: String
    category: TrainingCategory!
    level: TrainingLevel!
    priceCents: Int
    durationDays: Int!
    instructor: String
    certificate: Boolean
  }

  input UpdateTrainingInput {
    title: String
    description: String
    category: TrainingCategory
    level: TrainingLevel
    priceCents: Int
    durationDays: Int
    instructor: String
    certificate: Boolean
    published: Boolean
  }

  input TrainingModuleInput {
    title: String!
    summary: String
    durationMinutes: Int
  }

  type Query {
    "Published training catalog, newest first. Filtering happens client-side on this list."
    trainings: [Training!]!
    "One published training with its programme."
    training(id: ID!): Training!
    "The authenticated coach's own trainings, drafts included, newest first."
    myTrainings: [CoachTraining!]!
    "One of the authenticated coach's own trainings, with its programme."
    myTraining(id: ID!): CoachTraining!
  }

  type Mutation {
    "Creates a draft training owned by the authenticated coach."
    createTraining(input: CreateTrainingInput!): CoachTraining!
    "Updates a training owned by the authenticated coach — omitted fields are left untouched."
    updateTraining(id: ID!, input: UpdateTrainingInput!): CoachTraining!
    "Deletes a training owned by the authenticated coach, and its curriculum with it."
    deleteTraining(id: ID!): Boolean!
    "Appends a module to the end of the training's curriculum."
    addTrainingModule(trainingId: ID!, input: TrainingModuleInput!): TrainingModule!
    "Updates one module of a training owned by the authenticated coach."
    updateTrainingModule(id: ID!, input: TrainingModuleInput!): TrainingModule!
    "Removes one module and shifts the following ones up so positions stay contiguous."
    removeTrainingModule(id: ID!): Boolean!
  }
`
