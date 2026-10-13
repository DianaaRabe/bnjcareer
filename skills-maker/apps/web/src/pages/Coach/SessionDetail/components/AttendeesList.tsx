import { FormattedMessage } from 'react-intl'

import type { MySessionQuery } from '@/gql/graphql'
import { AttendeeRow } from './AttendeeRow'

type AttendeesListProps = {
  attendees: NonNullable<MySessionQuery['mySession']>['attendees']
  isRemoving: boolean
  onRemove: (id: string) => void
}

export const AttendeesList = ({ attendees, isRemoving, onRemove }: AttendeesListProps) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-[15px] font-semibold">
      <FormattedMessage id="coach.sessionDetail.attendees.title" />
    </h2>

    {attendees.length === 0 ? (
      <p className="py-4 text-center text-sm text-muted-foreground">
        <FormattedMessage id="coach.sessionDetail.attendees.empty" />
      </p>
    ) : (
      <ul className="flex flex-col">
        {attendees.map((attendee) => (
          <AttendeeRow key={attendee.id} attendee={attendee} isRemoving={isRemoving} onRemove={onRemove} />
        ))}
      </ul>
    )}
  </div>
)
