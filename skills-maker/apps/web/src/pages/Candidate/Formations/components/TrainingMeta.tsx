import { BookOpen, Clock, Star } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { durationMessage } from '../constants'

type TrainingMetaProps = {
  modules: number
  durationDays: number
  instructor?: string | null
}

export const TrainingMeta = ({ modules, durationDays, instructor }: TrainingMetaProps) => {
  const duration = durationMessage(durationDays)

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <BookOpen className="size-3" />
        <FormattedMessage id="candidate.formations.modules" values={{ count: modules }} />
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="size-3" />
        <FormattedMessage id={duration.id} values={{ count: duration.count }} />
      </span>
      {instructor && (
        <span className="flex items-center gap-1.5">
          <Star className="size-3 fill-brand-yellow text-brand-yellow" />
          {instructor}
        </span>
      )}
    </div>
  )
}
