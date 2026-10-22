import { useMemo, useState } from 'react'

import { VIEW_MODE, type ViewMode } from '@/constants/viewModes'
import { useMyCandidatesQuery } from '@/graphql/hooks/candidates'
import type { MyCandidatesQuery } from '@/gql/graphql'
import { FILTER_ALL, type SituationFilter } from './constants'

export type Candidate = MyCandidatesQuery['myCandidates'][number]

export const useCandidates = () => {
  const { data, loading, error, refetch } = useMyCandidatesQuery()

  const [search, setSearch] = useState('')
  const [situation, setSituation] = useState<SituationFilter>(FILTER_ALL)
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.grid)

  const all = useMemo(() => data?.myCandidates ?? [], [data])

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((candidate) => {
      if (situation !== FILTER_ALL && candidate.situation !== situation) return false
      if (!query) return true

      const haystack = [candidate.firstName, candidate.lastName, candidate.sector]
      return haystack.some((field) => field?.toLowerCase().includes(query))
    })
  }, [all, search, situation])

  const resetFilters = () => {
    setSearch('')
    setSituation(FILTER_ALL)
  }

  return {
    search,
    setSearch,
    situation,
    setSituation,
    viewMode,
    setViewMode,
    candidates,
    total: all.length,
    hasFilters: Boolean(search) || situation !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
