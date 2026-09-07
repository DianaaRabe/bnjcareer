import { Search, TriangleAlert, Users } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CandidateRow } from './components/CandidateRow'
import { SITUATION_OPTIONS } from './constants'
import { useCandidates } from './useCandidates'

export const Candidates = () => {
  const candidates = useCandidates()
  const intl = useIntl()

  const renderList = () => {
    if (candidates.isLoading) {
      return <LoadingState />
    }

    if (candidates.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.candidates.error.title"
          descriptionId="coach.candidates.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={candidates.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (candidates.candidates.length === 0) {
      return (
        <EmptyState
          icon={Search}
          titleId="coach.candidates.empty.title"
          descriptionId="coach.candidates.empty.description"
          action={
            candidates.hasFilters ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={candidates.resetFilters}>
                <FormattedMessage id="coach.candidates.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    return (
      <ul className="overflow-hidden rounded-xl border border-border bg-card">
        {candidates.candidates.map((candidate) => (
          <CandidateRow key={candidate.id} candidate={candidate} />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-4">
      <PageHeader
        titleId="coach.candidates.title"
        descriptionId="coach.candidates.subtitle"
        actions={
          !candidates.isLoading && !candidates.hasError ? (
            <Badge
              variant="secondary"
              className="h-[34px] gap-1.5 px-3.5 text-[12.5px] font-semibold text-accent-foreground"
            >
              <Users className="size-3.5" />
              <FormattedMessage id="coach.candidates.count" values={{ count: candidates.total }} />
            </Badge>
          ) : null
        }
      />

      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <Input
            value={candidates.search}
            onChange={(event) => candidates.setSearch(event.target.value)}
            placeholder={intl.formatMessage({ id: 'coach.candidates.search.placeholder' })}
            aria-label={intl.formatMessage({ id: 'coach.candidates.search.label' })}
            className="pl-10"
          />
        </div>

        <FilterControl
          display={FILTER_DISPLAY.select}
          labelId="coach.candidates.filter.situation"
          options={SITUATION_OPTIONS}
          isSelected={(value) => value === candidates.situation}
          onSelect={candidates.setSituation}
        />
      </div>

      {renderList()}
    </div>
  )
}
