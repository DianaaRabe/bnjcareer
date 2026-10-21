import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyEmailAccountQuery, MyEmailAccountQueryVariables } from '@/gql/graphql'
import { MY_EMAIL_ACCOUNT_QUERY } from '@/graphql/queries/emailAccounts'

export function useMyEmailAccountQuery(
  options?: QueryHookOptions<MyEmailAccountQuery, MyEmailAccountQueryVariables>,
) {
  return useQuery(MY_EMAIL_ACCOUNT_QUERY, options)
}
