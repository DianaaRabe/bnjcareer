import { Trophy } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Progress } from '@/components/ui/progress'

type JourneyScoreProps = {
  points: number
  max: number
  levelId: string
  percent: number
}

export const JourneyScore = ({ points, max, levelId, percent }: JourneyScoreProps) => {
  const intl = useIntl()

  return (
    <section className="flex flex-col gap-3 border-b border-border pb-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[14.5px] font-semibold text-primary">
          <Trophy className="size-[17px]" strokeWidth={2} />
          <FormattedMessage id="candidate.coaching.score.title" />
        </h2>
        <p className="text-[22px] font-bold">
          <FormattedMessage id="candidate.coaching.score.points" values={{ value: points }} />
        </p>
      </div>

      <Progress
        value={percent}
        className="h-[5px]"
        aria-label={intl.formatMessage({ id: 'candidate.coaching.score.title' })}
      />

      <div className="flex justify-between gap-2 text-[12.5px] text-muted-foreground">
        <span>
          <FormattedMessage id={levelId} />
        </span>
        <span>
          <FormattedMessage id="candidate.coaching.score.max" values={{ value: max }} />
        </span>
      </div>
    </section>
  )
}
