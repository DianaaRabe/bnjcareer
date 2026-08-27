import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { VIEW_MODE, type ViewMode } from '@/constants/viewModes'
import { useResourcesQuery } from '@/graphql/hooks/resources'
import type { ResourcesQuery } from '@/gql/graphql'
import { CATEGORY_LABEL_IDS, FILTER_ALL, type CategoryFilter } from './constants'

export type Resource = ResourcesQuery['resources'][number]

export const useResources = () => {
  const intl = useIntl()
  const { data, loading, error, refetch } = useResourcesQuery()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>(FILTER_ALL)
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.grid)

  const all = useMemo(() => data?.resources ?? [], [data])

  const resources = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((resource) => {
      if (category !== FILTER_ALL && resource.category !== category) return false
      if (!query) return true

      // The translated category is searchable too, so typing "entretien" narrows the list.
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
    viewMode,
    setViewMode,
    resources,
    total: all.length,
    hasFilters: Boolean(search) || category !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
