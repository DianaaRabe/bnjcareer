import { Lock } from 'lucide-react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ResourceAccess } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { TYPE_ICONS, TYPE_LABEL_IDS, TYPE_STYLES, isLocked } from '../constants'
import { ResourceAction } from './ResourceAction'
import { ResourceMeta } from './ResourceMeta'
import type { Resource } from '../useResources'

type ResourceCardProps = {
  resource: Resource
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const Icon = TYPE_ICONS[resource.type]
  const locked = isLocked(resource.access)

  return (
    <Card className={cn('flex h-full flex-col gap-4 p-4', locked && 'border-warning/30')}>
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            'flex size-10 flex-none items-center justify-center rounded-lg',
            TYPE_STYLES[resource.type],
          )}
        >
          <Icon className="size-[18px]" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {locked && (
            <Badge className="gap-1 bg-warning/10 text-[11px] font-bold text-warning">
              <Lock className="size-3" />
              {resource.access === ResourceAccess.Premium || resource.priceCents == null ? (
                <FormattedMessage id="candidate.resources.badge.premium" />
              ) : (
                <FormattedNumber
                  value={resource.priceCents / 100}
                  style="currency"
                  currency="EUR"
                  maximumFractionDigits={0}
                />
              )}
            </Badge>
          )}
          <Badge variant="secondary" className="text-[11px] font-semibold text-primary">
            <FormattedMessage id={TYPE_LABEL_IDS[resource.type]} />
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <p className="text-[15px] font-semibold">{resource.title}</p>
        {resource.description && (
          <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
            {resource.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <ResourceMeta resource={resource} />
        <ResourceAction resource={resource} />
      </div>
    </Card>
  )
}
