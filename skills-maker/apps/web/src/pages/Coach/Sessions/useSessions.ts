import { useMemo, useState } from 'react'

import type { MySessionsQuery } from '@/gql/graphql'
import { useMySessionsQuery } from '@/graphql/hooks/sessions'
import { FILTER_ALL, type TypeFilter } from './constants'

export type CoachSession = MySessionsQuery['mySessions'][number]

export const useSessions = () => {
  const { data, loading, error, refetch } = useMySessionsQuery()

  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>(FILTER_ALL)

  const all = useMemo(() => data?.mySessions ?? [], [data])

  const sessions = useMemo(() => {
    const query = search.trim().toLowerCase()

    return all.filter((session) => {
      if (type !== FILTER_ALL && session.type !== type) return false
      if (!query) return true
      return session.title.toLowerCase().includes(query)
    })
  }, [all, search, type])

  const resetFilters = () => {
    setSearch('')
    setType(FILTER_ALL)
  }

  return {
    search,
    setSearch,
    type,
    setType,
    sessions,
    total: all.length,
    hasFilters: Boolean(search) || type !== FILTER_ALL,
    resetFilters,
    isLoading: loading,
    hasError: Boolean(error),
    retry: () => void refetch(),
  }
}
