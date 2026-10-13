import { CalendarPlus } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { PersonRow } from '@/components/common/PersonRow/PersonRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CoachCertifications } from './CoachCertifications'
import { CoachIdentity } from './CoachIdentity'
import type { Coach } from '../useCoaches'

type CoachRowProps = {
  coach: Coach
}

export const CoachRow = ({ coach }: CoachRowProps) => (
  <PersonRow
    identity={<CoachIdentity coach={coach} />}
    bio={coach.bio}
    meta={<CoachCertifications certifications={coach.certifications} />}
    action={
      <>
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
      </>
    }
  />
)
