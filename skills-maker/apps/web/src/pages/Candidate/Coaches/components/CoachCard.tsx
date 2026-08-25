import { CalendarPlus } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CoachCertifications } from './CoachCertifications'
import { CoachIdentity } from './CoachIdentity'
import type { Coach } from '../useCoaches'

type CoachCardProps = {
  coach: Coach
}

export const CoachCard = ({ coach }: CoachCardProps) => (
  <Card className="flex h-full flex-col gap-4 p-4">
    <CoachIdentity coach={coach} />

    <CardContent className="flex flex-1 flex-col gap-4 p-0">
      {coach.bio && (
        // Clamped rather than truncated server-side: the full text stays available to a detail page.
        <p className="line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">
          {coach.bio}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-4">
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
      </div>
    </CardContent>
  </Card>
)
