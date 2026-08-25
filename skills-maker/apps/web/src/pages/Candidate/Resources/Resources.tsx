import { BookOpen, Search, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResourceCard } from './components/ResourceCard'
import { CATEGORY_OPTIONS } from './constants'
import { useResources } from './useResources'

export const Resources = () => {
  const resources = useResources()
  const intl = useIntl()

  const renderLibrary = () => {
    if (resources.isLoading) {
      return <LoadingState />
    }

    if (resources.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.resources.error.title"
          descriptionId="candidate.resources.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={resources.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (resources.resources.length === 0) {
      return (
        <EmptyState
          icon={Search}
          titleId="candidate.resources.empty.title"
          descriptionId="candidate.resources.empty.description"
          action={
            resources.hasFilters ? (
              <Button
                variant="outline"
                size="lg"
                className="mt-2"
                onClick={resources.resetFilters}
              >
                <FormattedMessage id="candidate.resources.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    return (
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.resources.map((resource) => (
          <li key={resource.id} className="flex">
            <ResourceCard resource={resource} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-4">
      <PageHeader
        titleId="candidate.resources.title"
        descriptionId="candidate.resources.subtitle"
        actions={
          !resources.isLoading && !resources.hasError ? (
            <Badge
              variant="secondary"
              className="h-[34px] gap-2 px-4 text-[12.5px] font-semibold text-accent-foreground"
            >
              <BookOpen className="size-3.5" />
              <FormattedMessage
                id="candidate.resources.count"
                values={{ count: resources.total }}
              />
            </Badge>
          ) : null
        }
      />

      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <Input
            value={resources.search}
            onChange={(event) => resources.setSearch(event.target.value)}
            placeholder={intl.formatMessage({ id: 'candidate.resources.search.placeholder' })}
            aria-label={intl.formatMessage({ id: 'candidate.resources.search.label' })}
            className="pl-10"
          />
        </div>

        <FilterControl
          display={FILTER_DISPLAY.select}
          icon={BookOpen}
          labelId="candidate.resources.filter.category"
          options={CATEGORY_OPTIONS}
          isSelected={(value) => value === resources.category}
          onSelect={resources.setCategory}
        />
      </div>

      {renderLibrary()}
    </div>
  )
}
