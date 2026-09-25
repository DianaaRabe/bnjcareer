import gql from 'graphql-tag'

export const profilesTypeDefs = gql`
  enum ProfileSituation {
    EMPLOYED
    JOB_SEARCH
    RECONVERSION
    STUDENT
  }

  enum ProfileObjective {
    FIND_JOB
    IMPROVE_CV
    CAREER_CHANGE
    DEVELOP_SKILLS
    NETWORK
  }

  type Profile {
    id: ID!
    firstName: String
    lastName: String
    phone: String
    bio: String
    avatarUrl: String
    "ISO date (YYYY-MM-DD)"
    birthDate: String
    educationLevel: String
    school: String
    sector: String
    situation: ProfileSituation
    strengths: [String!]!
    improvements: [String!]!
    skills: [String!]!
    objective: ProfileObjective
  }

  extend type User {
    profile: Profile
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
    bio: String
    avatarUrl: String
    "ISO date (YYYY-MM-DD)"
    birthDate: String
    educationLevel: String
    school: String
    sector: String
    situation: ProfileSituation
    strengths: [String!]
    improvements: [String!]
    skills: [String!]
    objective: ProfileObjective
  }

  type Mutation {
    updateProfile(input: UpdateProfileInput!): Profile!
  }
`
