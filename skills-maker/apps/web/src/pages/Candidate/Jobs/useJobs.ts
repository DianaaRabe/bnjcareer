import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/constants/routes'
import { VIEW_MODE, type ViewMode } from '@/constants/viewModes'
import { JobSource } from '@/gql/graphql'
import { useMyCvQuery } from '@/graphql/hooks/cv'
import { useJobSourcesQuery, useSearchJobsQuery } from '@/graphql/hooks/jobs'
import {
  AVATAR_PALETTE,
  countActiveFilters,
  EMPTY_JOB_FILTERS,
  JOBS_PAGE_SIZE,
  JOB_SOURCE_COLORS,
  type Job,
  type JobFilters,
  type JobListItem,
} from './constants'

type SearchCriteria = { keywords: string; location: string }

const EMPTY_SEARCH: SearchCriteria = { keywords: '', location: '' }

const toListItem = (job: Job, index: number): JobListItem => ({
  ...job,
  initial: (job.company?.trim() || job.title).charAt(0).toUpperCase(),
  avatar: AVATAR_PALETTE[index % AVATAR_PALETTE.length],
  sourceColor: JOB_SOURCE_COLORS[job.source],
})

export const useJobs = () => {
  const navigate = useNavigate()
  const { data: cvData } = useMyCvQuery()
  const { data: sourcesData, loading: isLoadingSources } = useJobSourcesQuery()

  const [selectedSource, setSelectedSource] = useState<JobSource | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODE.grid)
  const [keywordsInput, setKeywordsInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [search, setSearch] = useState<SearchCriteria>(EMPTY_SEARCH)
  const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null)
  const [jobToOptimize, setJobToOptimize] = useState<JobListItem | null>(null)
  // Draft holds the panel's state; only `appliedFilters` reaches the query.
  const [draftFilters, setDraftFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<JobFilters>(EMPTY_JOB_FILTERS)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const availableSources = useMemo(() => sourcesData?.jobSources ?? [], [sourcesData])
  // Falls back to the first configured source until the user picks one.
  const activeSource = selectedSource ?? availableSources[0]?.id ?? null
  const supportedFilters = useMemo(
    () => availableSources.find((source) => source.id === activeSource)?.supportedFilters ?? [],
    [availableSources, activeSource],
  )

  const { data, loading, error, refetch } = useSearchJobsQuery({
    skip: !activeSource,
    variables: {
      input: {
        source: activeSource ?? JobSource.FranceTravail,
        keywords: search.keywords || null,
        location: search.location || null,
        limit: JOBS_PAGE_SIZE,
        contractTypes: appliedFilters.contractTypes.length > 0 ? appliedFilters.contractTypes : null,
        experienceLevel: appliedFilters.experienceLevel,
        workTime: appliedFilters.workTime,
        postedWithin: appliedFilters.postedWithin,
      },
    },
    notifyOnNetworkStatusChange: true,
  })

  const visibleJobs = useMemo(() => (data?.searchJobs.jobs ?? []).map(toListItem), [data])

  const submitSearch = () => setSearch({ keywords: keywordsInput, location: locationInput })

  const resetSearch = () => {
    setKeywordsInput('')
    setLocationInput('')
    setSearch(EMPTY_SEARCH)
    setDraftFilters(EMPTY_JOB_FILTERS)
    setAppliedFilters(EMPTY_JOB_FILTERS)
  }

  const openFilters = () => {
    setDraftFilters(appliedFilters)
    setIsFiltersOpen(true)
  }

  const applyFilters = () => {
    setAppliedFilters(draftFilters)
    setIsFiltersOpen(false)
  }

  const resetFilters = () => {
    setDraftFilters(EMPTY_JOB_FILTERS)
    setAppliedFilters(EMPTY_JOB_FILTERS)
    setIsFiltersOpen(false)
  }

  const openAtsOptimizer = (job: JobListItem) => {
    setSelectedJob(null)
    setJobToOptimize(job)
  }

  return {
    availableSources: availableSources.map(({ id }) => id),
    activeSource,
    selectSource: setSelectedSource,
    hasNoSource: !isLoadingSources && availableSources.length === 0,
    viewMode,
    setViewMode,
    keywordsInput,
    setKeywordsInput,
    locationInput,
    setLocationInput,
    hasSearched: Boolean(search.keywords || search.location) || countActiveFilters(appliedFilters) > 0,
    submitSearch,
    resetSearch,
    supportedFilters,
    isFiltersOpen,
    setIsFiltersOpen,
    openFilters,
    draftFilters,
    setDraftFilters,
    applyFilters,
    resetFilters,
    activeFilterCount: countActiveFilters(appliedFilters),
    isLoading: isLoadingSources || loading,
    hasError: Boolean(error),
    retry: () => refetch(),
    visibleJobs,
    totalCount: data?.searchJobs.total ?? null,
    hasCv: Boolean(cvData?.myCv),
    selectedJob,
    openDetails: setSelectedJob,
    closeDetails: () => setSelectedJob(null),
    jobToOptimize,
    openAtsOptimizer,
    closeAtsOptimizer: () => setJobToOptimize(null),
    goToCv: () => navigate(ROUTES.candidate.cv),
  }
}
