import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ROUTES } from '@/constants/routes'
import { VIEW_MODE, type ViewMode } from '@/constants/viewModes'
import { CvStatus, JobSource } from '@/gql/graphql'
import { useMyCvQuery, useOptimizeCvMutation } from '@/graphql/hooks/cv'
import {
  useJobSourcesQuery,
  useSearchJobsQuery,
  useTrackJobApplicationMutation,
} from '@/graphql/hooks/jobs'
import { useMyProfileQuery } from '@/graphql/hooks/profiles'
import { useTranslate } from '@/hooks/useTranslate'
import {
  AVATAR_PALETTE,
  buildProfileSearchCriteria,
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
  const { translate } = useTranslate()
  const { data: cvData } = useMyCvQuery()
  const { data: profileData, loading: isLoadingProfile } = useMyProfileQuery()
  const { data: sourcesData, loading: isLoadingSources } = useJobSourcesQuery()
  const [runOptimizeCv, { loading: isOptimizingForJob }] = useOptimizeCvMutation()
  const [runTrackApplication] = useTrackJobApplicationMutation()

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

  // Until the candidate runs their own search, the feed is seeded from their profile
  // (sector, skills, student → part-time) so suggestions are relevant, not the provider's
  // generic top listings. Any explicit search or filter immediately takes over.
  const profileCriteria = useMemo(
    () => buildProfileSearchCriteria(profileData?.me?.profile),
    [profileData],
  )
  const hasUserSearch =
    Boolean(search.keywords || search.location) || countActiveFilters(appliedFilters) > 0

  const effectiveKeywords = hasUserSearch ? search.keywords : profileCriteria.keywords
  const effectiveLocation = hasUserSearch ? search.location : profileCriteria.location
  const effectiveFilters = hasUserSearch ? appliedFilters : profileCriteria.filters

  const { data, loading, error, refetch } = useSearchJobsQuery({
    // Wait for the profile before the default feed, otherwise the generic listings flash first.
    skip: !activeSource || (!hasUserSearch && isLoadingProfile),
    variables: {
      input: {
        source: activeSource ?? JobSource.FranceTravail,
        keywords: effectiveKeywords || null,
        location: effectiveLocation || null,
        limit: JOBS_PAGE_SIZE,
        contractTypes: effectiveFilters.contractTypes.length > 0 ? effectiveFilters.contractTypes : null,
        experienceLevel: effectiveFilters.experienceLevel,
        workTime: effectiveFilters.workTime,
        postedWithin: effectiveFilters.postedWithin,
        // Default profile-seeded feed only: if it comes back empty, let the API broaden the
        // query (drop filters, then keywords) so the candidate never sees an empty feed.
        broadenIfEmpty: !hasUserSearch,
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

  // Fired when the candidate opens an offer's "Postuler" link — records the application so the
  // dashboard reflects it. Fire-and-forget: it must never block navigating to the external site.
  const trackApply = (job: JobListItem) => {
    void runTrackApplication({
      variables: {
        input: {
          title: job.title,
          company: job.company ?? null,
          description: job.description,
          source: job.source,
          applyUrl: job.applyUrl,
        },
      },
    }).catch(() => {
      // Silent: applying opens an external tab regardless of whether tracking succeeds.
    })
  }

  const cv = cvData?.myCv ?? null
  // The CV must be extracted before it can be optimized against an offer.
  const canOptimizeCv =
    cv != null && (cv.status === CvStatus.Extracted || cv.status === CvStatus.Optimized)

  // Runs an optimization tailored to THIS offer (keywords/skills/structure), then hands the
  // candidate to the CV page where the offer-specific result is shown.
  const optimizeForJob = async () => {
    if (!jobToOptimize) return
    if (!canOptimizeCv || !cv) {
      // No usable CV yet — send them to the CV page to upload/extract one first.
      navigate(ROUTES.candidate.cv)
      setJobToOptimize(null)
      return
    }
    try {
      await runOptimizeCv({
        variables: {
          id: cv.id,
          template: cv.template ?? null,
          jobContext: {
            jobTitle: jobToOptimize.title,
            company: jobToOptimize.company ?? null,
            description: jobToOptimize.description,
          },
        },
      })
      toast.success(translate('candidate.jobs.ats.success.title'), {
        description: translate('candidate.jobs.ats.success.description', { jobTitle: jobToOptimize.title }),
      })
      setJobToOptimize(null)
      navigate(ROUTES.candidate.cv)
    } catch {
      toast.error(translate('candidate.jobs.ats.error.title'), {
        description: translate('candidate.jobs.ats.error.description'),
      })
    }
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
    optimizeForJob,
    isOptimizingForJob,
    trackApply,
    goToCv: () => navigate(ROUTES.candidate.cv),
  }
}
