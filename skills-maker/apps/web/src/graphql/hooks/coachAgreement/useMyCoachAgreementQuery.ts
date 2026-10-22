import { useQuery, type QueryHookOptions } from '@apollo/client'
import type { MyCoachAgreementQuery, MyCoachAgreementQueryVariables } from '@/gql/graphql'
import { MY_COACH_AGREEMENT_QUERY } from '@/graphql/queries/coachAgreement'

export function useMyCoachAgreementQuery(
  options?: QueryHookOptions<MyCoachAgreementQuery, MyCoachAgreementQueryVariables>,
) {
  return useQuery(MY_COACH_AGREEMENT_QUERY, options)
}
