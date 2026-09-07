import { CalendarClock, History } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CandidateDetail } from '../useCandidateDetail'

type SessionsCardProps = {
  candidate: CandidateDetail
}

export const SessionsCard = ({ candidate }: SessionsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold">
        <FormattedMessage id="coach.candidateDetail.sessions.title" />
      </CardTitle>
    </CardHeader>

    <CardContent className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <FormattedMessage id="coach.candidateDetail.sessions.total" />
        </span>
        <span className="font-semibold text-foreground">{candidate.sessionsCount}</span>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border p-3">
        <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-foreground">
            <FormattedMessage id="coach.candidateDetail.sessions.next" />
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            {candidate.nextSessionAt ? (
              <FormattedDate value={candidate.nextSessionAt} dateStyle="long" timeStyle="short" />
            ) : (
              <FormattedMessage id="coach.candidateDetail.sessions.noneScheduled" />
            )}
          </p>
        </div>
      </div>

      {candidate.lastSessionAt && (
        <div className="flex items-start gap-3 rounded-xl border border-border p-3">
          <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-foreground">
              <FormattedMessage id="coach.candidateDetail.sessions.last" />
            </p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              <FormattedDate value={candidate.lastSessionAt} dateStyle="long" timeStyle="short" />
            </p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)
