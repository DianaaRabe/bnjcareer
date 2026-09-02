import { Search, Sparkles, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrainingFilters } from './components/TrainingFilters'
import { TrainingRow } from './components/TrainingRow'
import { useFormations } from './useFormations'

export const Formations = () => {
  const formations = useFormations()

  const renderCatalog = () => {
    if (formations.isLoading) {
      return <LoadingState />
    }

    if (formations.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.formations.error.title"
          descriptionId="candidate.formations.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={formations.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    if (formations.trainings.length === 0) {
      return (
        <EmptyState
          icon={Search}
          titleId="candidate.formations.empty.title"
          descriptionId="candidate.formations.empty.description"
          action={
            formations.hasFilters ? (
              <Button variant="outline" size="lg" className="mt-2" onClick={formations.resetFilters}>
                <FormattedMessage id="candidate.formations.empty.reset" />
              </Button>
            ) : null
          }
        />
      )
    }

    return (
      <ul className="flex flex-col">
        {formations.trainings.map((training) => (
          <TrainingRow key={training.id} training={training} />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      <PageHeader
        titleId="candidate.formations.title"
        descriptionId="candidate.formations.subtitle"
        actions={
          !formations.isLoading && !formations.hasError ? (
            <Badge
              variant="secondary"
              className="h-[34px] gap-1.5 px-3.5 text-[12.5px] font-semibold text-accent-foreground"
            >
              <Sparkles className="size-3.5" />
              <FormattedMessage
                id="candidate.formations.count"
                values={{ count: formations.total }}
              />
            </Badge>
          ) : null
        }
      />

      <TrainingFilters
        search={formations.search}
        onSearchChange={formations.setSearch}
        category={formations.category}
        onCategoryChange={formations.setCategory}
        level={formations.level}
        onLevelChange={formations.setLevel}
      />

      {renderCatalog()}
    </div>
  )
}
