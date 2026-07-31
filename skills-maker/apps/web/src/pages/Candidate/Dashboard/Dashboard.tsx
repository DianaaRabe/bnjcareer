import { Sparkles } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { GoalsPanel } from './GoalsPanel'
import { QuickAccessCard } from './QuickAccessCard'
import { RecentApplicationsCard } from './RecentApplicationsCard'
import { StatCard } from './StatCard'
import { useDashboard } from './useDashboard'

export const Dashboard = () => {
  const { stats, goals, quickLinks, hasApplications, isAiEnabled } = useDashboard()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titleId="candidate.dashboard.title"
        descriptionId="candidate.dashboard.subtitle"
        actions={
          isAiEnabled && (
            <Badge variant="secondary" className="h-7 gap-1.5 px-3 font-semibold text-primary">
              <Sparkles className="size-3.5" />
              <FormattedMessage id="candidate.dashboard.ai.enabled" />
            </Badge>
          )
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.labelId} {...stat} />
        ))}
      </section>

      <section className="grid items-stretch gap-4 lg:grid-cols-[1.7fr_1fr]">
        <RecentApplicationsCard hasApplications={hasApplications} />
        <GoalsPanel goals={goals} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          <FormattedMessage id="candidate.dashboard.quickAccess.title" />
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <QuickAccessCard key={link.to} {...link} />
          ))}
        </div>
      </section>
    </div>
  )
}
