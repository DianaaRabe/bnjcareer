import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { ResourcesQuery, ResourcesQueryVariables } from '@/gql/graphql'
import { RESOURCES_QUERY } from '@/graphql/queries/resources'

export function useResourcesQuery(
  options?: QueryHookOptions<ResourcesQuery, ResourcesQueryVariables>,
) {
  return useQuery(RESOURCES_QUERY, options)
}
