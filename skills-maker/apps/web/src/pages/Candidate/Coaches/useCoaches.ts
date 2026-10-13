import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { VIEW_MODE, type ViewMode } from '@/constants/viewModes'
import { useCoachesQuery } from '@/graphql/hooks/coaches'
import type { CoachesQuery } from '@/gql/graphql'
import { EXPERTISE_LABEL_IDS, FILTER_ALL, type ExpertiseFilter } from './constants'

export type Coach = CoachesQuery['coaches'][number]

export const useCoaches = () => {
  const intl = useIntl()
  const { data, loading, error, refetch } = useCoachesQuery()

  const [search, setSearch] = useState('')
  const [expertise, setExpertise] = useState<ExpertiseFilter>(FILTER_ALL)
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.grid)

  const all = useMemo(() => data?.coaches ?? [], [data])

  const coaches = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((coach) => {
      if (expertise !== FILTER_ALL && !coach.expertise.includes(expertise)) return false
      if (!query) return true

      // Name, headline and translated expertise all answer "who can help me with X".
      const haystack = [
        coach.firstName,
        coach.lastName,
        coach.specialty,
        ...coach.expertise.map((value) => intl.formatMessage({ id: EXPERTISE_LABEL_IDS[value] })),
      ]

      return haystack.some((field) => field?.toLowerCase().includes(query))
    })
  }, [all, search, expertise, intl])

  const resetFilters = () => {
    setSearch('')
    setExpertise(FILTER_ALL)
  }

  return {
    search,
    setSearch,
    expertise,
    setExpertise,
    viewMode,
    setViewMode,
    coaches,
    total: all.length,
    hasFilters: Boolean(search) || expertise !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
