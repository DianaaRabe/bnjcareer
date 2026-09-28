import { useState } from 'react'
import { UserX } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { initialsOf } from '@/components/common/PersonIdentity/PersonIdentity'
import { BookingStatus } from '@/gql/graphql'
import type { MySessionQuery } from '@/gql/graphql'

type Attendee = NonNullable<MySessionQuery['mySession']>['attendees'][number]

type AttendeeRowProps = {
  attendee: Attendee
  isRemoving: boolean
  onRemove: (id: string) => void
}

export const AttendeeRow = ({ attendee, isRemoving, onRemove }: AttendeeRowProps) => {
  const intl = useIntl()
  const [confirming, setConfirming] = useState(false)

  const name =
    [attendee.firstName, attendee.lastName].filter(Boolean).join(' ') ||
    intl.formatMessage({ id: 'coach.sessionDetail.attendees.anonymous' })

  return (
    <li className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <Avatar className="size-8">
        {attendee.avatarUrl && <AvatarImage src={attendee.avatarUrl} alt="" />}
        <AvatarFallback className="bg-accent text-[11px] font-bold text-primary">
          {initialsOf(attendee.firstName, attendee.lastName)}
        </AvatarFallback>
      </Avatar>

      <p className="min-w-0 flex-1 truncate text-[14px] font-semibold">{name}</p>

      {attendee.status === BookingStatus.Canceled ? (
        <Badge variant="secondary" className="text-[11px] font-semibold text-muted-foreground">
          <FormattedMessage id="coach.sessionDetail.attendees.canceled" />
        </Badge>
      ) : confirming ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-none border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => onRemove(attendee.id)}
          onBlur={() => setConfirming(false)}
          disabled={isRemoving}
          autoFocus
        >
          <FormattedMessage id="coach.sessionDetail.attendees.confirmRemove" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="flex-none text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirming(true)}
          aria-label={intl.formatMessage({ id: 'coach.sessionDetail.attendees.remove' })}
        >
          <UserX className="size-3.5" />
        </Button>
      )}
    </li>
  )
}
