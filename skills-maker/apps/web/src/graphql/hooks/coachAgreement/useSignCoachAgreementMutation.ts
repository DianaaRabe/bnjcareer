import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { SignCoachAgreementMutation, SignCoachAgreementMutationVariables } from '@/gql/graphql'
import { SIGN_COACH_AGREEMENT_MUTATION } from '@/graphql/mutations/coachAgreement'

export function useSignCoachAgreementMutation(
  options?: MutationHookOptions<SignCoachAgreementMutation, SignCoachAgreementMutationVariables>,
) {
  return useMutation(SIGN_COACH_AGREEMENT_MUTATION, options)
}
