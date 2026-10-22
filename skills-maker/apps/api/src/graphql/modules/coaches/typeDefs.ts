import gql from 'graphql-tag'

export const coachesTypeDefs = gql`
  enum CoachExpertise {
    CV_STRATEGY
    INTERVIEW
    LINKEDIN
    NEGOTIATION
    CAREER_CHANGE
    LEADERSHIP
  }

  type Coach {
    id: ID!
    firstName: String
    lastName: String
    avatarUrl: String
    bio: String
    "Headline shown under the name."
    specialty: String
    yearsExperience: Int
    certifications: [String!]!
    expertise: [CoachExpertise!]!
    "Average rating out of 5. Null until enough sessions were reviewed."
    rating: Float
    "A coach who stopped taking new candidates stays listed but cannot be booked."
    acceptingClients: Boolean!
  }

  "The authenticated coach's own directory settings — same data, plus the publish state."
  type MyCoachProfile {
    specialty: String
    yearsExperience: Int
    certifications: [String!]!
    expertise: [CoachExpertise!]!
    rating: Float
    acceptingClients: Boolean!
    "Hidden from the candidate-facing directory until true."
    published: Boolean!
  }

  input UpdateCoachProfileInput {
    specialty: String
    yearsExperience: Int
    certifications: [String!]
    expertise: [CoachExpertise!]
    acceptingClients: Boolean
    published: Boolean
  }

  type Query {
    "Published coach directory, most experienced first. Filtering happens client-side."
    coaches: [Coach!]!
    "The authenticated coach's own directory settings."
    myCoachProfile: MyCoachProfile!
  }

  type Mutation {
    "Updates the authenticated coach's own directory settings — omitted fields are left untouched."
    updateCoachProfile(input: UpdateCoachProfileInput!): MyCoachProfile!
  }
`
