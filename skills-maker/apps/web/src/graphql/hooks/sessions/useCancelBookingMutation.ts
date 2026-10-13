import { useMutation, type MutationHookOptions } from '@apollo/client'
import type { CancelBookingMutation, CancelBookingMutationVariables } from '@/gql/graphql'
import { CANCEL_BOOKING_MUTATION } from '@/graphql/mutations/sessions'

export function useCancelBookingMutation(
  options?: MutationHookOptions<CancelBookingMutation, CancelBookingMutationVariables>,
) {
  return useMutation(CANCEL_BOOKING_MUTATION, options)
}
