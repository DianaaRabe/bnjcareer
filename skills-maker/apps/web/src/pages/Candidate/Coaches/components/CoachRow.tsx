import { CalendarPlus } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CoachCertifications } from './CoachCertifications'
import { CoachIdentity } from './CoachIdentity'
import type { Coach } from '../useCoaches'

type CoachRowProps = {
  coach: Coach
}

export const CoachRow = ({ coach }: CoachRowProps) => (
  <li className="flex flex-col gap-3.5 border-b border-border p-4 last:border-b-0 hover:bg-accent lg:flex-row lg:items-center lg:gap-5">
    <div className="min-w-0 lg:w-[300px] lg:flex-none">
      <CoachIdentity coach={coach} />
    </div>

    <div className="min-w-0 flex-1 lg:flex lg:flex-col lg:gap-2">
      {coach.bio && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {coach.bio}
        </p>
      )}
      <CoachCertifications certifications={coach.certifications} />
    </div>

    <div className="flex flex-none items-center gap-3">
      {!coach.acceptingClients && (
        <Badge variant="secondary" className="text-[11px] font-semibold text-muted-foreground">
          <FormattedMessage id="candidate.coaches.closed" />
        </Badge>
      )}
      {/* No booking flow yet — the button states the intent rather than faking it. */}
      <Button size="lg" className="w-full gap-2 lg:w-auto" disabled>
        <CalendarPlus className="size-4" />
        <FormattedMessage id="candidate.coaches.book" />
      </Button>
    </div>
  </li>
)
