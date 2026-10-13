import { graphql } from '@/gql'

export const TRACK_JOB_APPLICATION_MUTATION = graphql(`
  mutation TrackJobApplication($input: TrackJobApplicationInput!) {
    trackJobApplication(input: $input)
  }
`)
