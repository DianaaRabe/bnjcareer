import { ChevronRight } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABEL_IDS, TYPE_ICONS, TYPE_LABEL_IDS, TYPE_STYLES, durationMessage, sizeMessage } from '@/constants/resources'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { STATUS_LABEL_IDS, STATUS_STYLES } from '../constants'
import type { CoachResource } from '../useResources'

type ResourceRowProps = {
  resource: CoachResource
}

export const ResourceRow = ({ resource }: ResourceRowProps) => {
  const Icon = TYPE_ICONS[resource.type]
  const status = resource.published ? 'published' : 'draft'
  const meta = resource.sizeBytes != null ? sizeMessage(resource.sizeBytes) : null
  const duration = resource.durationMinutes != null ? durationMessage(resource.durationMinutes) : null

  return (
    <li className="flex items-start gap-4 border-b border-border py-4 last:border-b-0">
      <div className={cn('flex size-11 flex-none items-center justify-center rounded-md', TYPE_STYLES[resource.type])}>
        <Icon className="size-[19px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn('text-[11.5px] font-semibold', STATUS_STYLES[status])}>
            <FormattedMessage id={STATUS_LABEL_IDS[status]} />
          </Badge>
          <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
            <FormattedMessage id={TYPE_LABEL_IDS[resource.type]} />
          </Badge>
          <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
            <FormattedMessage id={CATEGORY_LABEL_IDS[resource.category]} />
          </Badge>
        </div>

        <p className="mt-1 text-[15px] font-semibold">{resource.title}</p>
        {resource.description && (
          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{resource.description}</p>
        )}

        {(meta || duration) && (
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            {meta && <FormattedMessage id={meta.id} values={{ value: meta.value }} />}
            {duration && <FormattedMessage id={duration.id} values={duration.values} />}
          </p>
        )}
      </div>

      <Link
        to={`${ROUTES.coach.resources}/${resource.id}`}
        className="flex flex-none items-center gap-0.5 text-[12.5px] font-semibold text-primary hover:text-primary-hover"
      >
        <FormattedMessage id="coach.resources.manage" />
        <ChevronRight className="size-3.5" />
      </Link>
    </li>
  )
}
