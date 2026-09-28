import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { SearchJobsQuery, SearchJobsQueryVariables } from '@/gql/graphql'
import { SEARCH_JOBS_QUERY } from '@/graphql/queries/jobs'

export function useSearchJobsQuery(options?: QueryHookOptions<SearchJobsQuery, SearchJobsQueryVariables>) {
  return useQuery(SEARCH_JOBS_QUERY, options)
}
