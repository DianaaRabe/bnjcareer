import { ArrowRight, DatabaseX } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { RelativeTime } from '@/components/common/RelativeTime/RelativeTime'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { CandidateIdentity } from '../components/CandidateIdentity'
import { FollowUpBadge } from '../components/FollowUpBadge'
import type { RecentCandidate } from './useDashboard'

type RecentCandidatesCardProps = {
  candidates: RecentCandidate[]
}

export const RecentCandidatesCard = ({ candidates }: RecentCandidatesCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold">
        <FormattedMessage id="coach.dashboard.recentCandidates.title" />
      </CardTitle>
      <CardAction>
        <Link
          to={ROUTES.coach.candidates}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          <FormattedMessage id="coach.dashboard.recentCandidates.viewAll" />
          <ArrowRight className="size-3.5" />
        </Link>
      </CardAction>
    </CardHeader>

    <CardContent className="flex flex-1 flex-col gap-1">
      {candidates.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <DatabaseX className="size-7 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            <FormattedMessage id="coach.dashboard.recentCandidates.empty" />
          </p>
        </div>
      ) : (
        candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
          >
            <CandidateIdentity candidate={candidate} />
            <div className="flex shrink-0 flex-col items-end gap-1">
              {candidate.needsFollowUp && <FollowUpBadge />}
              <span className="text-[12px] text-muted-foreground">
                <RelativeTime value={candidate.lastSessionAt} />
              </span>
            </div>
          </div>
        ))
      )}
    </CardContent>
  </Card>
)
