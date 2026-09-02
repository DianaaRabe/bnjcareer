import { Lock } from 'lucide-react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { ResourceAccess } from '@/gql/graphql'
import { TYPE_ACTIONS, isLocked } from '../constants'
import type { Resource } from '../useResources'

type ResourceActionProps = {
  resource: Resource
}

/** Locked resources have no url — the server withholds it, so there is nothing to link to. */
export const ResourceAction = ({ resource }: ResourceActionProps) => {
  if (isLocked(resource.access)) {
    return (
      <span className="flex items-center gap-2 text-[12.5px] font-semibold text-warning">
        <Lock className="size-3.5" />
        {resource.access === ResourceAccess.Premium || resource.priceCents == null ? (
          <FormattedMessage id="candidate.resources.action.premium" />
        ) : (
          <FormattedMessage
            id="candidate.resources.action.unlock"
            values={{
              price: (
                <FormattedNumber
                  value={resource.priceCents / 100}
                  style="currency"
                  currency="EUR"
                  maximumFractionDigits={0}
                />
              ),
            }}
          />
        )}
      </span>
    )
  }

  const { labelId, icon: Icon } = TYPE_ACTIONS[resource.type]

  if (!resource.url) {
    return null
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="flex w-fit items-center gap-2 text-[12.5px] font-semibold text-primary hover:text-primary-hover"
    >
      <Icon className="size-3.5" />
      <FormattedMessage id={labelId} />
    </a>
  )
}
