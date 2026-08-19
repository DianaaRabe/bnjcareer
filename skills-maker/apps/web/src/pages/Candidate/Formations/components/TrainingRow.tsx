import { ChevronRight, Lock } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { CATEGORY_ICONS, CATEGORY_LABEL_IDS, LEVEL_LABEL_IDS, LEVEL_STYLES } from '../constants'
import { TrainingMeta } from './TrainingMeta'
import { TrainingPrice } from './TrainingPrice'
import type { Training } from '../useFormations'

type TrainingRowProps = {
  training: Training
}

export const TrainingRow = ({ training }: TrainingRowProps) => {
  const Icon = CATEGORY_ICONS[training.category]

  return (
    <li className="flex items-start gap-4 border-b border-border py-4 last:border-b-0">
      <div className="flex size-11 flex-none items-center justify-center rounded-md bg-accent">
        <Icon className="size-[19px] text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
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
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
            {training.description}
          </p>
        )}

        <TrainingMeta
          modules={training.modules}
          durationDays={training.durationDays}
          instructor={training.instructor}
        />
      </div>

      <div className="flex flex-none flex-col items-end gap-2">
        <TrainingPrice priceCents={training.priceCents} />
        <Link
          to={`${ROUTES.candidate.formations}/${training.id}`}
          className="flex items-center gap-0.5 text-[12.5px] font-semibold text-primary hover:text-primary-hover"
        >
          <FormattedMessage id="candidate.formations.view" />
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </li>
  )
}
