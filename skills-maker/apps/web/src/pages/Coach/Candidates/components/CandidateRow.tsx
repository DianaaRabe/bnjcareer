import { ArrowUpRight, MessageSquare } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

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

export const CandidateRow = ({ candidate }: CandidateRowProps) => {
  const intl = useIntl()

  return (
    <li className="flex flex-col gap-4 border-b border-border p-4 last:border-b-0 hover:bg-accent lg:flex-row lg:items-center lg:gap-4">
      <div className="min-w-0 lg:w-[320px] lg:flex-none">
        <CandidateIdentity candidate={candidate} />
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
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

      <div className="flex flex-none items-center gap-1.5">
        {/* No messaging flow yet — the button states the intent rather than faking it. */}
        <Button
          variant="outline"
          size="icon-lg"
          title={intl.formatMessage({ id: 'coach.candidates.message' })}
          aria-label={intl.formatMessage({ id: 'coach.candidates.message' })}
          disabled
        >
          <MessageSquare className="size-3.5" />
        </Button>
        <Button
          size="icon-lg"
          className="bg-accent text-primary hover:bg-accent/70"
          title={intl.formatMessage({ id: 'coach.candidates.manage' })}
          aria-label={intl.formatMessage({ id: 'coach.candidates.manage' })}
          asChild
        >
          <Link to={`${ROUTES.coach.candidates}/${candidate.id}`}>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </li>
  )
}
