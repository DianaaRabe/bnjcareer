import { FormattedDate, FormattedMessage } from 'react-intl'
import { Power, TriangleAlert } from 'lucide-react'

import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { AutomationRunsCard } from './components/AutomationRunsCard'
import { AutomationSettingsCard } from './components/AutomationSettingsCard'
import { PreparedApplicationsList } from './components/PreparedApplicationsList'
import { useApplications } from './useApplications'

export const Applications = () => {
  const vm = useApplications()

  if (vm.isLoading) {
    return (
      <div className="flex min-h-full flex-col gap-6">
        <PageHeader
          titleId="candidate.applications.title"
          descriptionId="candidate.applications.subtitle"
        />
        <LoadingState />
      </div>
    )
  }

  if (vm.hasError) {
    return (
      <div className="flex min-h-full flex-col gap-6">
        <PageHeader
          titleId="candidate.applications.title"
          descriptionId="candidate.applications.subtitle"
        />
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.applications.error.title"
          descriptionId="candidate.applications.error.description"
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={vm.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      <PageHeader
        titleId="candidate.applications.title"
        descriptionId="candidate.applications.subtitle"
      />

      {/* The master switch — the one explicit opt-in (skill §25). */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
              <Power className="size-5" />
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                <FormattedMessage
                  id={vm.enabled ? 'candidate.applications.status.on' : 'candidate.applications.status.off'}
                />
              </p>
              <p className="text-sm text-muted-foreground">
                {vm.enabled && vm.nextRunAt ? (
                  <FormattedMessage
                    id="candidate.applications.status.nextRun"
                    values={{
                      when: (
                        <FormattedDate
                          value={vm.nextRunAt}
                          day="2-digit"
                          month="short"
                          hour="2-digit"
                          minute="2-digit"
                        />
                      ),
                    }}
                  />
                ) : (
                  <FormattedMessage id="candidate.applications.status.offHint" />
                )}
              </p>
            </div>
          </div>
          <Switch
            checked={vm.enabled}
            disabled={vm.togglingEnabled}
            onCheckedChange={vm.toggleEnabled}
            aria-label="toggle-automation"
          />
        </CardContent>
      </Card>

      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
          {vm.draft && (
            <AutomationSettingsCard draft={vm.draft} ceilings={vm.ceilings} patch={vm.patch} />
          )}
          <AutomationRunsCard runs={vm.runs} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            <FormattedMessage id="candidate.applications.review.title" />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage id="candidate.applications.review.subtitle" />
          </p>
          {vm.preparedLoading ? (
            <LoadingState />
          ) : (
            <PreparedApplicationsList applications={vm.prepared} onCancel={vm.cancelApplication} />
          )}
        </div>
      </div>
    </div>
  )
}
