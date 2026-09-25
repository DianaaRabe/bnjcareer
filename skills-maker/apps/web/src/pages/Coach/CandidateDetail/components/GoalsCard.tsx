import { FormattedMessage, useIntl } from 'react-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CandidateDetail } from '../useCandidateDetail'

type GoalsCardProps = {
  goals: CandidateDetail['goals']
}

export const GoalsCard = ({ goals }: GoalsCardProps) => {
  const intl = useIntl()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">
          <FormattedMessage id="coach.candidateDetail.goals.title" />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            <FormattedMessage id="coach.candidateDetail.goals.empty" />
          </p>
        ) : (
          goals.map((goal) => {
            const percent = goal.target
              ? Math.min(Math.round((goal.progress / goal.target) * 100), 100)
              : Math.min(goal.progress, 100)
            const label = goal.title ?? intl.formatMessage({ id: 'coach.candidateDetail.goals.untitled' })

            return (
              <div key={goal.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{label}</span>
                  <span className="font-semibold text-muted-foreground">
                    <FormattedMessage id="common.format.percent" values={{ value: percent }} />
                  </span>
                </div>
                <Progress value={percent} className="h-1.5" aria-label={label} />
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
