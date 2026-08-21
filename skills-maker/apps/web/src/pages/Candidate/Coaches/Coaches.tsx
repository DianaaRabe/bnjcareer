import { Search, Sparkles, TriangleAlert, Users } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { ViewToggle } from '@/components/common/ViewToggle/ViewToggle'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VIEW_MODE, VIEW_MODE_OPTIONS } from '@/constants/viewModes'
import { CoachCard } from './components/CoachCard'
import { CoachRow } from './components/CoachRow'
import { EXPERTISE_OPTIONS } from './constants'
import { useCoaches } from './useCoaches'

export const Coaches = () => {
  const coaches = useCoaches()
  const intl = useIntl()

  const renderDirectory = () => {
    if (coaches.isLoading) {
      return <LoadingState />
    }

    if (coaches.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.coaches.error.title"
          descriptionId="candidate.coaches.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={coaches.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (coaches.coaches.length === 0) {
      return (
        <EmptyState
          icon={Search}
          titleId="candidate.coaches.empty.title"
          descriptionId="candidate.coaches.empty.description"
          action={
            coaches.hasFilters ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={coaches.resetFilters}>
                <FormattedMessage id="candidate.coaches.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    if (coaches.viewMode === VIEW_MODE.list) {
      return (
        <ul className="overflow-hidden rounded-xl border border-border bg-card">
          {coaches.coaches.map((coach) => (
            <CoachRow key={coach.id} coach={coach} />
          ))}
        </ul>
      )
    }

    return (
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {coaches.coaches.map((coach) => (
          <li key={coach.id} className="flex">
            <CoachCard coach={coach} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        titleId="candidate.coaches.title"
        descriptionId="candidate.coaches.subtitle"
        actions={
          !coaches.isLoading && !coaches.hasError ? (
            <Badge
              variant="secondary"
              className="h-[34px] gap-1.5 px-3.5 text-[12.5px] font-semibold text-accent-foreground"
            >
              <Users className="size-3.5" />
              <FormattedMessage id="candidate.coaches.count" values={{ count: coaches.total }} />
            </Badge>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <Input
            value={coaches.search}
            onChange={(event) => coaches.setSearch(event.target.value)}
            placeholder={intl.formatMessage({ id: 'candidate.coaches.search.placeholder' })}
            aria-label={intl.formatMessage({ id: 'candidate.coaches.search.label' })}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <FilterControl
            display={FILTER_DISPLAY.select}
            icon={Sparkles}
            labelId="candidate.coaches.filter.expertise"
            options={EXPERTISE_OPTIONS}
            isSelected={(value) => value === coaches.expertise}
            onSelect={coaches.setExpertise}
          />
          <ViewToggle
            options={VIEW_MODE_OPTIONS}
            value={coaches.viewMode}
            onChange={coaches.setViewMode}
          />
        </div>
      </div>

      {renderDirectory()}
    </div>
  )
}
