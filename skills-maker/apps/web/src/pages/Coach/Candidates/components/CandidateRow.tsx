import { ArrowUpRight } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { PersonRow } from '@/components/common/PersonRow/PersonRow'
import { RelativeTime } from '@/components/common/RelativeTime/RelativeTime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { CandidateIdentity } from '../../components/CandidateIdentity'
import { FollowUpBadge } from '../../components/FollowUpBadge'
import { SITUATION_LABEL_IDS } from '../../constants'
import type { Candidate } from '../useCandidates'

type CandidateRowProps = {
  candidate: Candidate
}

export const CandidateRow = ({ candidate }: CandidateRowProps) => (
  <PersonRow
    identity={<CandidateIdentity candidate={candidate} />}
    bio={candidate.bio}
    meta={
      <div className="flex flex-wrap items-center gap-2">
        {candidate.needsFollowUp && <FollowUpBadge />}
        {candidate.situation && (
          <Badge variant="secondary" className="text-[11px] font-semibold text-muted-foreground">
            <FormattedMessage id={SITUATION_LABEL_IDS[candidate.situation]} />
          </Badge>
        )}
        <span className="text-[12.5px] text-muted-foreground">
          <FormattedMessage id="coach.candidates.lastSession" />{' '}
          <RelativeTime value={candidate.lastSessionAt} />
        </span>
      </div>
    }
    action={
      <Button asChild size="lg" className="w-full gap-2 lg:w-auto">
        <Link to={`${ROUTES.coach.candidates}/${candidate.id}`}>
          <ArrowUpRight className="size-4" />
          <FormattedMessage id="coach.candidates.manage" />
        </Link>
      </Button>
    }
  />
)
