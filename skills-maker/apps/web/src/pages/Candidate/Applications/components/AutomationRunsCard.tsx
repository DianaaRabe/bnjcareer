import { FormattedDate, FormattedMessage } from 'react-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MyAutomationRunsQuery } from '@/gql/graphql'

type Run = MyAutomationRunsQuery['myAutomationRuns'][number]

export const AutomationRunsCard = ({ runs }: { runs: Run[] }) => {
  if (runs.length === 0) return null

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <FormattedMessage id="candidate.applications.runs.title" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground">
                <FormattedDate value={run.startedAt} day="2-digit" month="short" hour="2-digit" minute="2-digit" />
              </p>
              <p className="text-xs text-muted-foreground">{run.status}</p>
            </div>
            <p className="shrink-0 text-xs text-muted-foreground">
              <FormattedMessage
                id="candidate.applications.runs.counters"
                values={{
                  discovered: run.jobsDiscovered,
                  matched: run.jobsMatched,
                  prepared: run.applicationsPrepared,
                }}
              />
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
