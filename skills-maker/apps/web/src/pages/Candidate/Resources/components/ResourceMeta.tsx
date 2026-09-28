import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABEL_IDS, durationMessage, sizeMessage } from '../constants'
import type { Resource } from '../useResources'

type ResourceMetaProps = {
  resource: Resource
}

export const ResourceMeta = ({ resource }: ResourceMetaProps) => {
  const size = resource.sizeBytes ? sizeMessage(resource.sizeBytes) : null
  const duration = resource.durationMinutes ? durationMessage(resource.durationMinutes) : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
        <FormattedMessage id={CATEGORY_LABEL_IDS[resource.category]} />
      </Badge>

      {size && (
        <span className="text-[12px] text-muted-foreground">
          <FormattedMessage id={size.id} values={{ value: size.value }} />
        </span>
      )}

      {duration && (
        <span className="text-[12px] text-muted-foreground">
          <FormattedMessage id={duration.id} values={duration.values} />
        </span>
      )}
    </div>
  )
}
