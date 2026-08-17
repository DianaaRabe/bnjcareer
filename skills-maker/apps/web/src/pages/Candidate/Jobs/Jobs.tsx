import { SearchX } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { ViewToggle } from '@/components/common/ViewToggle/ViewToggle'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { VIEW_MODE, VIEW_MODE_OPTIONS } from '@/constants/viewModes'
import { AtsOptimizerDialog } from './components/AtsOptimizerDialog'
import { JobCard } from './components/JobCard'
import { JobDetailsDialog } from './components/JobDetailsDialog'
import { JobFiltersSheet } from './components/JobFiltersSheet'
import { JobRow } from './components/JobRow'
import { JobSearchBar } from './components/JobSearchBar'
import { JobSourceTabs } from './components/JobSourceTabs'
import { JobsPreviewNotice } from './components/JobsPreviewNotice'
import { useJobs } from './useJobs'

export const Jobs = () => {
  const jobs = useJobs()

  const renderResults = () => {
    if (jobs.hasNoSource) {
      return (
        <EmptyState
          icon={SearchX}
          titleId="candidate.jobs.empty.noSource.title"
          descriptionId="candidate.jobs.empty.noSource.description"
        />
      )
    }

    if (jobs.isLoading) {
      return <LoadingState messageId="candidate.jobs.loading" />
    }

    if (jobs.hasError) {
      return (
        <EmptyState
          icon={SearchX}
          titleId="candidate.jobs.error.title"
          descriptionId="candidate.jobs.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={() => void jobs.retry()}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (jobs.visibleJobs.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          titleId="candidate.jobs.empty.noResults.title"
          descriptionId="candidate.jobs.empty.noResults.description"
          action={
            jobs.hasSearched ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={jobs.resetSearch}>
                <FormattedMessage id="candidate.jobs.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    if (jobs.viewMode === VIEW_MODE.list) {
      return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {jobs.visibleJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onOpenDetails={() => jobs.openDetails(job)}
              onOptimize={() => jobs.openAtsOptimizer(job)}
            />
          ))}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.visibleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onOpenDetails={() => jobs.openDetails(job)}
            onOptimize={() => jobs.openAtsOptimizer(job)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titleId="candidate.jobs.title" descriptionId="candidate.jobs.subtitle" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {jobs.activeSource && (
          <JobSourceTabs
            sources={jobs.availableSources}
            active={jobs.activeSource}
            onChange={jobs.selectSource}
          />
        )}
        <ViewToggle options={VIEW_MODE_OPTIONS} value={jobs.viewMode} onChange={jobs.setViewMode} />
      </div>

      <JobSearchBar
        keywords={jobs.keywordsInput}
        onKeywordsChange={jobs.setKeywordsInput}
        location={jobs.locationInput}
        onLocationChange={jobs.setLocationInput}
        onSubmit={jobs.submitSearch}
        isSearching={jobs.isLoading}
        onOpenFilters={jobs.openFilters}
        activeFilterCount={jobs.activeFilterCount}
        canFilter={jobs.supportedFilters.length > 0}
      />

      {!jobs.hasSearched && !jobs.hasNoSource && <JobsPreviewNotice />}

      {renderResults()}

      {jobs.activeSource && (
        <JobFiltersSheet
          open={jobs.isFiltersOpen}
          onOpenChange={jobs.setIsFiltersOpen}
          filters={jobs.draftFilters}
          onChange={jobs.setDraftFilters}
          onApply={jobs.applyFilters}
          onReset={jobs.resetFilters}
          supportedFilters={jobs.supportedFilters}
          source={jobs.activeSource}
        />
      )}

      <JobDetailsDialog job={jobs.selectedJob} onClose={jobs.closeDetails} onOptimize={jobs.openAtsOptimizer} />
      <AtsOptimizerDialog
        job={jobs.jobToOptimize}
        hasCv={jobs.hasCv}
        onClose={jobs.closeAtsOptimizer}
        onConfirm={jobs.goToCv}
      />
    </div>
  )
}
