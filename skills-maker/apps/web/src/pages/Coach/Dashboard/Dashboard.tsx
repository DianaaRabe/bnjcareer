import { Bell, Plus, TriangleAlert } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { QuickAccessCard } from '@/components/common/QuickAccessCard/QuickAccessCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { RecentCandidatesCard } from './RecentCandidatesCard'
import { UpcomingSessionsCard } from './UpcomingSessionsCard'
import { useDashboard } from './useDashboard'

export const Dashboard = () => {
  const intl = useIntl()
  const dashboard = useDashboard()

  const renderOverview = () => {
    if (dashboard.isLoading) {
      return <LoadingState />
    }

    if (dashboard.hasError) {
      return (
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.dashboard.error.title"
          descriptionId="coach.dashboard.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={dashboard.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      )
    }

    return (
      <>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {dashboard.stats.map((stat) => (
            <StatCard key={stat.labelId} {...stat} />
          ))}
        </section>

        <section className="grid items-stretch gap-4 lg:grid-cols-[1.7fr_1fr]">
          <RecentCandidatesCard candidates={dashboard.recentCandidates} />
          <UpcomingSessionsCard sessions={dashboard.upcomingSessions} />
        </section>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titleId="coach.dashboard.title"
        descriptionId="coach.dashboard.subtitle"
        actions={
          <>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={intl.formatMessage({ id: 'common.notifications' })}
              className="rounded-full text-muted-foreground"
            >
              <Bell />
            </Button>
            {/* No session creation flow yet — the button states the intent rather than faking it. */}
            <Button size="lg" className="gap-2 rounded-xl" disabled>
              <Plus />
              <FormattedMessage id="coach.dashboard.newSession" />
            </Button>
          </>
        }
      />

      {renderOverview()}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          <FormattedMessage id="coach.dashboard.quickAccess.title" />
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.quickLinks.map((link) => (
            <QuickAccessCard key={link.to} {...link} />
          ))}
        </div>
      </section>
    </div>
  )
}
