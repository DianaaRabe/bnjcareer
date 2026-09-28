import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { CATEGORY_LABEL_IDS, FILTER_ALL, type CategoryFilter } from '@/constants/resources'
import { useCoachResourcesQuery } from '@/graphql/hooks/resources'
import type { CoachResourcesQuery } from '@/gql/graphql'

export type CoachResource = CoachResourcesQuery['coachResources'][number]

export const useResources = () => {
  const intl = useIntl()
  const { data, loading, error, refetch } = useCoachResourcesQuery()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>(FILTER_ALL)

  const all = useMemo(() => data?.coachResources ?? [], [data])

  const resources = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((resource) => {
      if (category !== FILTER_ALL && resource.category !== category) return false
      if (!query) return true

      const categoryLabel = intl.formatMessage({ id: CATEGORY_LABEL_IDS[resource.category] })
      return [resource.title, resource.description, categoryLabel].some((field) =>
        field?.toLowerCase().includes(query),
      )
    })
  }, [all, search, category, intl])

  const resetFilters = () => {
    setSearch('')
    setCategory(FILTER_ALL)
  }

  return {
    search,
    setSearch,
    category,
    setCategory,
    resources,
    total: all.length,
    hasFilters: Boolean(search) || category !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
