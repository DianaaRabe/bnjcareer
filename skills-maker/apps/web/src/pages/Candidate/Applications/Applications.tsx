import { FormattedMessage } from 'react-intl'
import { TriangleAlert } from 'lucide-react'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApplicationsList } from './components/ApplicationsList'
import { ApplicationsStats } from './components/ApplicationsStats'
import { AutomationPanel } from './components/AutomationPanel'
import { useApplicationsHub } from './useApplicationsHub'

export const Applications = () => {
  const vm = useApplicationsHub()

  return (
    <div className="flex min-h-full flex-col gap-6">
      <PageHeader
        titleId="candidate.applications.title"
        descriptionId="candidate.applications.subtitle"
      />

      {vm.isLoading ? (
        <LoadingState />
      ) : vm.hasError ? (
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
      ) : (
        <>
          {vm.stats && <ApplicationsStats stats={vm.stats} />}

          <Tabs defaultValue="all" className="flex-1">
            <TabsList>
              <TabsTrigger value="all">
                <FormattedMessage id="candidate.applications.tabs.all" />
              </TabsTrigger>
              <TabsTrigger value="automation">
                <FormattedMessage id="candidate.applications.tabs.automation" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-4">
              <ApplicationsList
                applications={vm.applications}
                source={vm.source}
                status={vm.status}
                onSourceChange={vm.setSource}
                onStatusChange={vm.setStatus}
                onSend={vm.send}
                sendingId={vm.sendingId}
              />
            </TabsContent>

            <TabsContent value="automation" className="pt-4">
              <AutomationPanel />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
