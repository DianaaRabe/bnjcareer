import { Briefcase, DatabaseX } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { APPLICATION_STATUS_LABEL_IDS, APPLICATION_STATUS_STYLES } from '../constants'
import type { CandidateDetail } from '../useCandidateDetail'

type ApplicationsCardProps = {
  applications: CandidateDetail['applications']
}

export const ApplicationsCard = ({ applications }: ApplicationsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold">
        <FormattedMessage id="coach.candidateDetail.applications.title" />
      </CardTitle>
    </CardHeader>

    <CardContent className="flex flex-1 flex-col gap-1">
      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <DatabaseX className="size-7 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            <FormattedMessage id="coach.candidateDetail.applications.empty" />
          </p>
        </div>
      ) : (
        applications.map((application) => (
          <div
            key={application.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Briefcase className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">
                  {application.jobTitle ?? <FormattedMessage id="coach.candidateDetail.applications.untitled" />}
                </p>
                <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                  {application.company ?? <FormattedMessage id="coach.candidateDetail.applications.unknownCompany" />}
                  {' · '}
                  <FormattedDate value={application.createdAt} dateStyle="medium" />
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge className={cn('text-[10.5px] font-semibold', APPLICATION_STATUS_STYLES[application.status])}>
                <FormattedMessage id={APPLICATION_STATUS_LABEL_IDS[application.status]} />
              </Badge>
              {application.matchScore != null && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  <FormattedMessage
                    id="coach.candidateDetail.applications.matchScore"
                    values={{ value: Math.round(application.matchScore) }}
                  />
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
)
