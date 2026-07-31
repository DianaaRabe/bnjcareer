import { ArrowRight, DatabaseX } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'

const INLINE_LINK_CLASS =
  'inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover'

type RecentApplicationsCardProps = {
  hasApplications: boolean
}

export const RecentApplicationsCard = ({ hasApplications }: RecentApplicationsCardProps) => (
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

    <CardContent className="flex flex-1 items-center justify-center py-8">
      {hasApplications ? (
        // TODO: render the recent applications list once the query exposes it.
        <div className="flex-1" />
      ) : (
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
      )}
    </CardContent>
  </Card>
)
