import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TYPE_ICONS, TYPE_LABEL_IDS, TYPE_STYLES, isLocked } from '../constants'
import { ResourceAction } from './ResourceAction'
import { ResourceMeta } from './ResourceMeta'
import type { Resource } from '../useResources'

type ResourceRowProps = {
  resource: Resource
}

/** Same content as `ResourceCard`, laid out on one line — the lock state rides on the action. */
export const ResourceRow = ({ resource }: ResourceRowProps) => {
  const Icon = TYPE_ICONS[resource.type]

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border p-4 last:border-b-0 hover:bg-accent sm:flex-row sm:items-center sm:gap-4',
        isLocked(resource.access) && 'bg-warning/[0.04]',
      )}
    >
      <div
        className={cn(
          'flex size-10 flex-none items-center justify-center rounded-lg',
          TYPE_STYLES[resource.type],
        )}
      >
        <Icon className="size-[18px]" />
      </div>

      <div className="min-w-0 flex-[2]">
        <p className="truncate text-sm font-bold text-foreground">{resource.title}</p>
        {resource.description && (
          <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {resource.description}
          </p>
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Badge variant="secondary" className="text-[11px] font-semibold text-primary">
          <FormattedMessage id={TYPE_LABEL_IDS[resource.type]} />
        </Badge>
        <ResourceMeta resource={resource} />
      </div>

      <div className="flex flex-none items-center sm:justify-end">
        <ResourceAction resource={resource} />
      </div>
    </div>
  )
}
