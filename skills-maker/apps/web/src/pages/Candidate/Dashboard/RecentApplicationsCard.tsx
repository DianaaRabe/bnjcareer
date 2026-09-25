import { ArrowRight, DatabaseX } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import type { RecentApplication } from './useDashboard'

const INLINE_LINK_CLASS =
  'inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover'

type RecentApplicationsCardProps = {
  applications: RecentApplication[]
}

export const RecentApplicationsCard = ({ applications }: RecentApplicationsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold">
        <FormattedMessage id="candidate.dashboard.applications.title" />
      </CardTitle>
      <CardAction>
        <Link to={ROUTES.candidate.applications} className={INLINE_LINK_CLASS}>
          <FormattedMessage id="candidate.dashboard.applications.viewAll" />
          <ArrowRight className="size-3.5" />
        </Link>
      </CardAction>
    </CardHeader>

    {applications.length > 0 ? (
      <CardContent className="flex flex-1 flex-col">
        <ul className="divide-y divide-border">
          {applications.map((application) => (
            <li key={application.id} className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{application.title}</p>
                {application.company && (
                  <p className="truncate text-xs text-muted-foreground">{application.company}</p>
                )}
              </div>
              <time className="shrink-0 text-xs text-muted-foreground" dateTime={application.appliedAt}>
                <FormattedDate value={application.appliedAt} day="2-digit" month="short" year="numeric" />
              </time>
            </li>
          ))}
        </ul>
      </CardContent>
    ) : (
      <CardContent className="flex flex-1 items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <DatabaseX className="size-7 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            <FormattedMessage id="candidate.dashboard.applications.empty" />
          </p>
          <Link to={ROUTES.candidate.jobs} className={INLINE_LINK_CLASS}>
            <FormattedMessage id="candidate.dashboard.applications.findJobs" />
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </CardContent>
    )}
  </Card>
)
