import { CalendarPlus } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { PersonCard } from '@/components/common/PersonCard/PersonCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CoachCertifications } from './CoachCertifications'
import { CoachIdentity } from './CoachIdentity'
import type { Coach } from '../useCoaches'

type CoachCardProps = {
  coach: Coach
}

export const CoachCard = ({ coach }: CoachCardProps) => (
  <PersonCard
    identity={<CoachIdentity coach={coach} />}
    bio={coach.bio}
    footer={
      <>
        <CoachCertifications certifications={coach.certifications} />

        {!coach.acceptingClients && (
          <Badge variant="secondary" className="w-fit text-[11px] font-semibold text-muted-foreground">
            <FormattedMessage id="candidate.coaches.closed" />
          </Badge>
        )}

        {/* No booking flow yet — the button states the intent rather than faking it. */}
        <Button size="lg" className="w-full gap-2" disabled>
          <CalendarPlus className="size-4" />
          <FormattedMessage id="candidate.coaches.book" />
        </Button>
      </>
    }
  />
)
