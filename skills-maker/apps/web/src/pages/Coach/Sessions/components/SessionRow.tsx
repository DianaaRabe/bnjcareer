import { CalendarDays, ChevronRight, Users } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import { EVENT_STATUS_LABEL_IDS, EVENT_STATUS_STYLES, EVENT_TYPE_LABEL_IDS } from '../../constants'
import type { CoachSession } from '../useSessions'

type SessionRowProps = {
  session: CoachSession
}

export const SessionRow = ({ session }: SessionRowProps) => (
  <li className="flex items-start gap-4 border-b border-border py-4 last:border-b-0">
    <div className="flex size-11 flex-none items-center justify-center rounded-md bg-accent">
      <CalendarDays className="size-[19px] text-primary" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={cn('text-[11.5px] font-semibold', EVENT_STATUS_STYLES[session.status])}>
          <FormattedMessage id={EVENT_STATUS_LABEL_IDS[session.status]} />
        </Badge>
        <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
          <FormattedMessage id={EVENT_TYPE_LABEL_IDS[session.type]} />
        </Badge>
      </div>

      <p className="mt-1 text-[15px] font-semibold">{session.title}</p>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        <FormattedDate value={session.startTime} dateStyle="long" timeStyle="short" />
      </p>

      <div className="mt-2 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Users className="size-3.5" />
        <FormattedMessage id="coach.sessions.attendeesCount" values={{ count: session.attendeesCount }} />
      </div>
    </div>

    <Link
      to={`${ROUTES.coach.sessions}/${session.id}`}
      className="flex flex-none items-center gap-0.5 text-[12.5px] font-semibold text-primary hover:text-primary-hover"
    >
      <FormattedMessage id="coach.sessions.manage" />
      <ChevronRight className="size-3.5" />
    </Link>
  </li>
)
