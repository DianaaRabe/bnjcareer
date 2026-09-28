import { ChevronRight, Lock } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { TrainingMeta } from '@/components/common/TrainingMeta/TrainingMeta'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_ICONS, CATEGORY_LABEL_IDS, LEVEL_LABEL_IDS, LEVEL_STYLES } from '@/constants/trainings'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { STATUS_LABEL_IDS, STATUS_STYLES } from '../constants'
import type { CoachTraining } from '../useFormations'

type TrainingRowProps = {
  training: CoachTraining
}

export const TrainingRow = ({ training }: TrainingRowProps) => {
  const Icon = CATEGORY_ICONS[training.category]
  const status = training.published ? 'published' : 'draft'

  return (
    <li className="flex items-start gap-4 border-b border-border py-4 last:border-b-0">
      <div className="flex size-11 flex-none items-center justify-center rounded-md bg-accent">
        <Icon className="size-[19px] text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('text-[11.5px] font-semibold', STATUS_STYLES[status])}>
            <FormattedMessage id={STATUS_LABEL_IDS[status]} />
          </Badge>
          <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
            <FormattedMessage id={CATEGORY_LABEL_IDS[training.category]} />
          </Badge>
          <Badge className={cn('text-[11.5px] font-semibold', LEVEL_STYLES[training.level])}>
            <FormattedMessage id={LEVEL_LABEL_IDS[training.level]} />
          </Badge>
          {training.certificate && (
            <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
              <Lock className="size-2.5" />
              <FormattedMessage id="candidate.formations.certificate" />
            </span>
          )}
        </div>

        <p className="mt-1 text-[15px] font-semibold">{training.title}</p>
        {training.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{training.description}</p>
        )}

        <TrainingMeta modules={training.modules} durationDays={training.durationDays} instructor={training.instructor} />
      </div>

      <Link
        to={`${ROUTES.coach.formations}/${training.id}`}
        className="flex flex-none items-center gap-0.5 text-[12.5px] font-semibold text-primary hover:text-primary-hover"
      >
        <FormattedMessage id="coach.formations.manage" />
        <ChevronRight className="size-3.5" />
      </Link>
    </li>
  )
}
