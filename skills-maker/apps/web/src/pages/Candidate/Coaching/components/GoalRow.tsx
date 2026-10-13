import { CheckCircle2, Circle, Star } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Goal } from '../useCoaching'

type GoalRowProps = {
  goal: Goal
  isLast: boolean
}

export const GoalRow = ({ goal, isLast }: GoalRowProps) => {
  const intl = useIntl()
  const label = intl.formatMessage({ id: goal.labelId })

  return (
    <li className={cn('flex flex-col gap-2 py-3.5', !isLast && 'border-b border-border')}>
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {goal.done ? (
            <CheckCircle2 className="size-4 shrink-0 text-success" />
          ) : (
            <Circle className="size-4 shrink-0 text-border-strong" />
          )}
          <span
            className={cn(
              'text-[13.5px] font-medium',
              goal.done && 'text-muted-foreground line-through',
            )}
          >
            {label}
          </span>
        </div>
        <span
          className="flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-foreground"
          aria-label={intl.formatMessage(
            { id: 'candidate.coaching.goals.points' },
            { value: goal.points },
          )}
        >
          <Star className="size-3 fill-brand-yellow text-brand-yellow" />
          <FormattedMessage id="common.format.count" values={{ value: goal.points }} />
        </span>
      </div>

      {!goal.done && goal.progress !== undefined && (
        <Progress value={goal.progress} aria-label={label} />
      )}
    </li>
  )
}
