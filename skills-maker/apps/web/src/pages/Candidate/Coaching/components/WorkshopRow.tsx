import { FormattedDate, FormattedMessage } from 'react-intl'

import type { Workshop } from '../useCoaching'

type WorkshopRowProps = {
  workshop: Workshop
}

export const WorkshopRow = ({ workshop }: WorkshopRowProps) => (
  <li className="flex items-center justify-between gap-3 border-b border-border py-4">
    <div className="min-w-0">
      <p className="truncate text-[14.5px] font-semibold">{workshop.title}</p>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
        <FormattedDate value={workshop.startsAt} dateStyle="long" timeStyle="short" />
        {workshop.coachName && (
          <>
            {' · '}
            <FormattedMessage
              id="candidate.coaching.workshops.coach"
              values={{ name: workshop.coachName }}
            />
          </>
        )}
      </p>
    </div>
  </li>
)
