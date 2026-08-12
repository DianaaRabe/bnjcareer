import { graphql } from '@/gql'

export const JOB_SOURCES_QUERY = graphql(`
  query JobSources {
    jobSources {
      id
      supportedFilters
    }
  }
`)

export const SEARCH_JOBS_QUERY = graphql(`
  query SearchJobs($input: SearchJobsInput!) {
    searchJobs(input: $input) {
      source
      total
      jobs {
        id
        source
        title
        company
        location
        description
        applyUrl
        postedAt
        tags
        isRemote
        salary {
          label
          min
          max
          currency
          period
        }
      }
    }
  }
`)
