import gql from 'graphql-tag'

export const matchingTypeDefs = gql`
  type JobMatchResult {
    "Compatibility between the stored CV and the offer, 0-100."
    score: Int!
    "One-sentence verdict, written in French by the model."
    summary: String!
    "What the CV already proves for this offer."
    strengths: [String!]!
    "Requirements the CV does not cover."
    gaps: [String!]!
    "Actionable CV edits, ordered by impact."
    tips: [String!]!
  }

  input AnalyzeJobMatchInput {
    "Reference only — the analysis runs on the pasted description."
    jobUrl: String
    jobTitle: String
    company: String
    description: String!
  }

  type Mutation {
    "Scores the authenticated candidate's CV against a job offer via the LLM."
    analyzeJobMatch(input: AnalyzeJobMatchInput!): JobMatchResult!
  }
`
