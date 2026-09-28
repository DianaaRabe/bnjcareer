import { CalendarDays } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { EVENT_TYPE_LABEL_IDS } from '../constants'
import type { UpcomingSession } from './useDashboard'

type UpcomingSessionsCardProps = {
  sessions: UpcomingSession[]
}

export const UpcomingSessionsCard = ({ sessions }: UpcomingSessionsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold">
        <FormattedMessage id="coach.dashboard.upcomingSessions.title" />
      </CardTitle>
    </CardHeader>

    <CardContent className="flex flex-1 flex-col gap-1">
      {sessions.length === 0 ? (
        <p className="flex-1 py-8 text-center text-sm text-muted-foreground">
          <FormattedMessage id="coach.dashboard.upcomingSessions.empty" />
        </p>
      ) : (
        <ul className="flex flex-col">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{session.title}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  <FormattedDate value={session.startsAt} dateStyle="long" timeStyle="short" />
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10.5px] font-semibold text-muted-foreground">
                <FormattedMessage id={EVENT_TYPE_LABEL_IDS[session.type]} />
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </CardContent>

    <CardContent>
      <Button asChild variant="outline" size="lg" className="w-full gap-2">
        <Link to={ROUTES.coach.sessions}>
          <CalendarDays />
          <FormattedMessage id="coach.dashboard.upcomingSessions.viewCalendar" />
        </Link>
      </Button>
    </CardContent>
  </Card>
)
