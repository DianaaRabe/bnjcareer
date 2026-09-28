import { Clock } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import type { GoalItem } from './useDashboard'

type GoalsPanelProps = {
  goals: GoalItem[]
}

export const GoalsPanel = ({ goals }: GoalsPanelProps) => {
  const intl = useIntl()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">
          <FormattedMessage id="candidate.dashboard.goals.title" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {goals.map(({ labelId, progress }) => (
          <div key={labelId} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">
                <FormattedMessage id={labelId} />
              </span>
              <span className="font-semibold text-muted-foreground">
                <FormattedMessage id="common.format.percent" values={{ value: progress }} />
              </span>
            </div>
            <Progress
              value={progress}
              className="h-1.5"
              aria-label={intl.formatMessage({ id: labelId })}
            />
          </div>
        ))}
      </CardContent>

      <CardContent>
        <Button asChild size="lg" className="w-full gap-2">
          <Link to={ROUTES.candidate.coaching}>
            <Clock />
            <FormattedMessage id="candidate.dashboard.goals.cta" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
