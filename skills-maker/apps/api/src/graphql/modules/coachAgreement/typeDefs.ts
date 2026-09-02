import gql from 'graphql-tag'

export const coachAgreementTypeDefs = gql`
  type CoachAgreementTerms {
    "Contract version a coach must sign to reach the coach space."
    currentVersion: String!
    "Share of a candidate subscription paid to the coach, in percent."
    subscriptionShareCoachPct: Int!
    "Platform commission on a paid training, in percent."
    formationSharePlatformPct: Int!
  }

  type CoachAgreement {
    id: ID!
    contractVersion: String!
    signedName: String!
    subscriptionShareCoachPct: Int!
    formationSharePlatformPct: Int!
    "ISO 8601 datetime."
    acceptedAt: String!
  }

  type CoachAgreementStatus {
    terms: CoachAgreementTerms!
    "True once the coach signed the current version and has not revoked it."
    isSigned: Boolean!
    "The signature in force, if any. A signature on an older version is not returned."
    signature: CoachAgreement
  }

  input SignCoachAgreementInput {
    "Must match the version currently in force, or the signature is refused."
    contractVersion: String!
    "The coach full name, typed by hand — this is the electronic signature."
    signedName: String!
  }

  type Query {
    "Whether the signed-in coach already accepted the agreement in force."
    myCoachAgreement: CoachAgreementStatus!
  }

  type Mutation {
    signCoachAgreement(input: SignCoachAgreementInput!): CoachAgreement!
  }
`
