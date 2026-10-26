import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  useMyApplicationStatsQuery,
  useMyApplicationsQuery,
  useSendApplicationMutation,
} from '@/graphql/hooks/applications'
import { ApplicationSource, ApplicationStatus, type MyApplicationsQuery } from '@/gql/graphql'
import { useTranslate } from '@/hooks/useTranslate'
import { getGraphQLErrorCode } from '@/lib/apollo'

export type CandidateApplication = MyApplicationsQuery['myApplications'][number]

/** "ALL" is the unfiltered sentinel; the real enum values narrow the list. */
export const FILTER_ALL = 'ALL' as const
export type SourceFilter = ApplicationSource | typeof FILTER_ALL
export type StatusFilter = ApplicationStatus | typeof FILTER_ALL

/**
 * The applications hub read model: the full history plus aggregate counters. Filtering is done
 * client-side — one candidate's application list is small, so refetching per facet would add
 * latency and flicker for no benefit, and the stats stay anchored to the full set.
 */
export const useApplicationsHub = () => {
  const { translate } = useTranslate()
  const statsQuery = useMyApplicationStatsQuery()
  const listQuery = useMyApplicationsQuery()
  const [sendApplication] = useSendApplicationMutation()

  const [source, setSource] = useState<SourceFilter>(FILTER_ALL)
  const [status, setStatus] = useState<StatusFilter>(FILTER_ALL)
  // The id currently being sent — drives the per-card spinner without blocking the others.
  const [sendingId, setSendingId] = useState<string | null>(null)

  const all = useMemo(() => listQuery.data?.myApplications ?? [], [listQuery.data])

  const filtered = useMemo(
    () =>
      all.filter(
        (app) =>
          (source === FILTER_ALL || app.source === source) &&
          (status === FILTER_ALL || app.status === status),
      ),
    [all, source, status],
  )

  /**
   * Send one prepared automated application. The mutation returns the updated row (same id), so
   * Apollo patches the card in place; we only refetch the aggregate counters, which the normalized
   * cache cannot recompute on its own. Failures map to an honest message by error code — a disabled
   * switch, a missing prerequisite, or a provider failure each read differently.
   */
  const send = useCallback(
    async (id: string) => {
      setSendingId(id)
      try {
        await sendApplication({ variables: { id } })
        await statsQuery.refetch()
        toast.success(translate('candidate.applications.send.success'))
      } catch (err) {
        const code = getGraphQLErrorCode(err)
        const descriptionId =
          code === 'FORBIDDEN'
            ? 'candidate.applications.send.disabled'
            : code === 'FAILED_PRECONDITION'
              ? 'candidate.applications.send.notReady'
              : 'candidate.applications.send.unexpected'
        toast.error(translate('candidate.applications.send.error'), {
          description: translate(descriptionId),
        })
      } finally {
        setSendingId(null)
      }
    },
    [sendApplication, statsQuery, translate],
  )

  return {
    isLoading: listQuery.loading && !listQuery.data,
    hasError: Boolean(listQuery.error),
    retry: () => {
      void listQuery.refetch()
      void statsQuery.refetch()
    },

    stats: statsQuery.data?.myApplicationStats ?? null,

    applications: filtered,
    totalCount: all.length,

    source,
    setSource,
    status,
    setStatus,

    send,
    sendingId,
  }
}
