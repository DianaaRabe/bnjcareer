import { graphql } from '@/gql'

export const ANALYZE_JOB_MATCH_MUTATION = graphql(`
  mutation AnalyzeJobMatch($input: AnalyzeJobMatchInput!) {
    analyzeJobMatch(input: $input) {
      score
      summary
      strengths
      gaps
      tips
    }
  }
`)
