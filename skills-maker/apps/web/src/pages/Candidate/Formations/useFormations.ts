import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { useTrainingsQuery } from '@/graphql/hooks/trainings'
import type { TrainingsQuery } from '@/gql/graphql'
import { CATEGORY_LABEL_IDS, FILTER_ALL, type CategoryFilter, type LevelFilter } from './constants'

export type Training = TrainingsQuery['trainings'][number]

export const useFormations = () => {
  const intl = useIntl()
  const { data, loading, error, refetch } = useTrainingsQuery()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilter>(FILTER_ALL)
  const [level, setLevel] = useState<LevelFilter>(FILTER_ALL)

  const all = useMemo(() => data?.trainings ?? [], [data])

  const trainings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((training) => {
      if (category !== FILTER_ALL && training.category !== category) return false
      if (level !== FILTER_ALL && training.level !== level) return false
      if (!query) return true

      // Search the translated category too, so typing "entretien" narrows the list.
      const categoryLabel = intl.formatMessage({ id: CATEGORY_LABEL_IDS[training.category] })
      return (
        training.title.toLowerCase().includes(query) ||
        categoryLabel.toLowerCase().includes(query)
      )
    })
  }, [all, search, category, level, intl])

  const resetFilters = () => {
    setSearch('')
    setCategory(FILTER_ALL)
    setLevel(FILTER_ALL)
  }

  return {
    search,
    setSearch,
    category,
    setCategory,
    level,
    setLevel,
    trainings,
    total: all.length,
    hasFilters: Boolean(search) || category !== FILTER_ALL || level !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
