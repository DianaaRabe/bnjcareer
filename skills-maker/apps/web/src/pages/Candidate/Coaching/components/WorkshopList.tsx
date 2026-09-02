import { CalendarDays } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { SectionHeader } from '@/components/common/SectionHeader/SectionHeader'
import { WorkshopRow } from './WorkshopRow'
import type { Workshop } from '../useCoaching'

type WorkshopListProps = {
  workshops: Workshop[]
}

export const WorkshopList = ({ workshops }: WorkshopListProps) => (
  <section className="flex flex-col">
    <SectionHeader
      icon={CalendarDays}
      titleId="candidate.coaching.workshops.title"
      className="border-b border-border pb-3.5"
      action={
        <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">
          <FormattedMessage
            id="candidate.coaching.workshops.count"
            values={{ count: workshops.length }}
          />
        </span>
      }
    />

    {workshops.length === 0 ? (
      <div className="flex min-h-[140px] flex-1 items-center justify-center py-6">
        <p className="text-sm text-muted-foreground">
          <FormattedMessage id="candidate.coaching.workshops.empty" />
        </p>
      </div>
    ) : (
      <ul className="flex flex-col">
        {workshops.map((workshop) => (
          <WorkshopRow key={workshop.id} workshop={workshop} />
        ))}
      </ul>
    )}
  </section>
)
