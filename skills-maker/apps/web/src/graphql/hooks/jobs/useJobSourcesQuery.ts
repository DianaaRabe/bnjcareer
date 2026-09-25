import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { JobSourcesQuery, JobSourcesQueryVariables } from '@/gql/graphql'
import { JOB_SOURCES_QUERY } from '@/graphql/queries/jobs'

export function useJobSourcesQuery(options?: QueryHookOptions<JobSourcesQuery, JobSourcesQueryVariables>) {
  return useQuery(JOB_SOURCES_QUERY, options)
}
