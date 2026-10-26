import type { FormEvent } from 'react'
import { Briefcase, Loader2, MapPin, Search, SlidersHorizontal } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type JobSearchBarProps = {
  keywords: string
  onKeywordsChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  onSubmit: () => void
  isSearching: boolean
  onOpenFilters: () => void
  activeFilterCount: number
  /** No filter panel when the active source honours none. */
  canFilter: boolean
}

export const JobSearchBar = ({
  keywords,
  onKeywordsChange,
  location,
  onLocationChange,
  onSubmit,
  isSearching,
  onOpenFilters,
  activeFilterCount,
  canFilter,
}: JobSearchBarProps) => {
  const intl = useIntl()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="flex flex-col gap-2.5 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
      <div className="relative flex flex-1 items-center">
        <Briefcase className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <Input
          value={keywords}
          onChange={(event) => onKeywordsChange(event.target.value)}
          placeholder={intl.formatMessage({ id: 'candidate.jobs.search.title.placeholder' })}
          aria-label={intl.formatMessage({ id: 'candidate.jobs.search.title.label' })}
          className="pl-10"
        />
      </div>
      <div className="relative flex flex-1 items-center">
        <MapPin className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
        <Input
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          placeholder={intl.formatMessage({ id: 'candidate.jobs.search.location.placeholder' })}
          aria-label={intl.formatMessage({ id: 'candidate.jobs.search.location.label' })}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2.5">
        {canFilter && (
          <Button type="button" variant="outline" size="lg" onClick={onOpenFilters}>
            <SlidersHorizontal className="size-3.5" />
            <FormattedMessage id="candidate.jobs.search.filters" />
            {activeFilterCount > 0 && (
              <span className="ml-0.5 flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isSearching}>
          {isSearching ? <Loader2 className="size-[15px] animate-spin" /> : <Search className="size-[15px]" />}
          <FormattedMessage id="candidate.jobs.search.submit" />
        </Button>
      </div>
    </form>
  )
}
