import { BookOpen, Search, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FILTER_DISPLAY, FilterControl } from '@/components/common/FilterControl/FilterControl'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_OPTIONS } from '@/constants/resources'
import { CreateResourceDialog } from './components/CreateResourceDialog'
import { ResourceRow } from './components/ResourceRow'
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
          titleId="coach.resources.error.title"
          descriptionId="coach.resources.error.description"
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
          icon={resources.hasFilters ? Search : BookOpen}
          titleId="coach.resources.empty.title"
          descriptionId="coach.resources.empty.description"
          action={
            resources.hasFilters ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={resources.resetFilters}>
                <FormattedMessage id="coach.resources.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    return (
      <ul className="flex flex-col">
        {resources.resources.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        titleId="coach.resources.title"
        descriptionId="coach.resources.subtitle"
        actions={
          <>
            {!resources.isLoading && !resources.hasError && (
              <Badge
                variant="secondary"
                className="h-[34px] gap-1.5 px-3.5 text-[12.5px] font-semibold text-accent-foreground"
              >
                <BookOpen className="size-3.5" />
                <FormattedMessage id="coach.resources.count" values={{ count: resources.total }} />
              </Badge>
            )}
            <CreateResourceDialog />
          </>
        }
      />

      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center sm:w-[380px]">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <Input
            value={resources.search}
            onChange={(event) => resources.setSearch(event.target.value)}
            placeholder={intl.formatMessage({ id: 'coach.resources.search.placeholder' })}
            aria-label={intl.formatMessage({ id: 'coach.resources.search.label' })}
            className="pl-10"
          />
        </div>

        <FilterControl
          display={FILTER_DISPLAY.select}
          labelId="coach.resources.filter.category"
          options={CATEGORY_OPTIONS}
          isSelected={(value) => value === resources.category}
          onSelect={resources.setCategory}
        />
      </div>

      {renderLibrary()}
    </div>
  )
}
