import { useMutation } from '@apollo/client'
import { MY_COACHING_QUERY } from '@/graphql/queries/coaching'
import { TRACK_JOB_APPLICATION_MUTATION } from '@/graphql/mutations/jobs'

export function useTrackJobApplicationMutation() {
  // Refetch the dashboard overview so the new application shows up in the counters.
  return useMutation(TRACK_JOB_APPLICATION_MUTATION, {
    refetchQueries: [{ query: MY_COACHING_QUERY }],
  })
}
