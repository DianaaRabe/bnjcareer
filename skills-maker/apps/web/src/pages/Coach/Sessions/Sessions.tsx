import { CalendarDays, Search, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreateSessionDialog } from './components/CreateSessionDialog'
import { SessionRow } from './components/SessionRow'
import { TYPE_OPTIONS } from './constants'
import { useSessions } from './useSessions'

export const Sessions = () => {
  const sessions = useSessions()
  const intl = useIntl()

  const renderAgenda = () => {
    if (sessions.isLoading) {
      return <LoadingState />
    }

    if (sessions.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.sessions.error.title"
          descriptionId="coach.sessions.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={sessions.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (sessions.sessions.length === 0) {
      return (
        <EmptyState
          icon={sessions.hasFilters ? Search : CalendarDays}
          titleId="coach.sessions.empty.title"
          descriptionId="coach.sessions.empty.description"
          action={
            sessions.hasFilters ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={sessions.resetFilters}>
                <FormattedMessage id="coach.sessions.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    return (
      <ul className="flex flex-col">
        {sessions.sessions.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        titleId="coach.sessions.title"
        descriptionId="coach.sessions.subtitle"
        actions={
          <>
            {!sessions.isLoading && !sessions.hasError && (
              <Badge
                variant="secondary"
                className="h-[34px] gap-1.5 px-3.5 text-[12.5px] font-semibold text-accent-foreground"
              >
                <CalendarDays className="size-3.5" />
                <FormattedMessage id="coach.sessions.count" values={{ count: sessions.total }} />
              </Badge>
            )}
            <CreateSessionDialog />
          </>
        }
      />

      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <Input
            value={sessions.search}
            onChange={(event) => sessions.setSearch(event.target.value)}
            placeholder={intl.formatMessage({ id: 'coach.sessions.search.placeholder' })}
            aria-label={intl.formatMessage({ id: 'coach.sessions.search.label' })}
            className="pl-10"
          />
        </div>

        <FilterControl
          display={FILTER_DISPLAY.select}
          labelId="coach.sessions.filter.type"
          options={TYPE_OPTIONS}
          isSelected={(value) => value === sessions.type}
          onSelect={sessions.setType}
        />
      </div>

      {renderAgenda()}
    </div>
  )
}
