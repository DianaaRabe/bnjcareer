import { TriangleAlert } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { FormattedMessage } from 'react-intl'
import { GoalList } from './components/GoalList'
import { JourneyScore } from './components/JourneyScore'
import { StreakBanner } from './components/StreakBanner'
import { WorkshopList } from './components/WorkshopList'
import { useCoaching } from './useCoaching'

export const Coaching = () => {
  const coaching = useCoaching()

  const renderOverview = () => {
    if (coaching.isLoading) {
      return <LoadingState />
    }

    if (coaching.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.coaching.error.title"
          descriptionId="candidate.coaching.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={coaching.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    return (
      <div className="grid flex-1 grid-cols-1 gap-10 lg:grid-cols-[1.7fr_1fr]">
        <WorkshopList workshops={coaching.workshops} />

        <div className="flex flex-col">
          <JourneyScore
            points={coaching.score.points}
            max={coaching.score.max}
            levelId={coaching.score.levelId}
            percent={coaching.scorePercent}
          />
          <StreakBanner days={coaching.streakDays} />
          <GoalList goals={coaching.goals} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      <PageHeader titleId="candidate.coaching.title" descriptionId="candidate.coaching.subtitle" />
      {renderOverview()}
    </div>
  )
}
