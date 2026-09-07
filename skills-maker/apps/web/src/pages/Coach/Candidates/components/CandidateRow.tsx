import { MessageSquare } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { RelativeTime } from '@/components/common/RelativeTime/RelativeTime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CandidateIdentity } from '../../components/CandidateIdentity'
import { FollowUpBadge } from '../../components/FollowUpBadge'
import { SITUATION_LABEL_IDS } from '../constants'
import type { Candidate } from '../useCandidates'

type CandidateRowProps = {
  candidate: Candidate
}

export const CandidateRow = ({ candidate }: CandidateRowProps) => (
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

    <div className="flex flex-none items-center gap-2">
      {/* No messaging flow yet — the button states the intent rather than faking it. */}
      <Button variant="outline" size="lg" className="w-full gap-2 lg:w-auto" disabled>
        <MessageSquare className="size-4" />
        <FormattedMessage id="coach.candidates.message" />
      </Button>
    </div>
  </li>
)
