import { Briefcase, Star } from 'lucide-react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { PersonIdentity } from '@/components/common/PersonIdentity/PersonIdentity'
import type { Coach } from '../useCoaches'

type CoachIdentityProps = {
  coach: Coach
}

export const CoachIdentity = ({ coach }: CoachIdentityProps) => (
  <PersonIdentity
    firstName={coach.firstName}
    lastName={coach.lastName}
    avatarUrl={coach.avatarUrl}
    name={[coach.firstName, coach.lastName].filter(Boolean).join(' ')}
    subtitle={
      coach.specialty && (
        <>
          <Briefcase className="size-3.5 flex-none" />
          <span className="truncate">{coach.specialty}</span>
        </>
      )
    }
    meta={
      <>
        {coach.yearsExperience !== null && coach.yearsExperience !== undefined && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
            <FormattedMessage id="candidate.coaches.experience" values={{ count: coach.yearsExperience }} />
          </span>
        )}
        {coach.rating !== null && coach.rating !== undefined && (
          <span className="flex items-center gap-1 text-[12px] font-bold">
            <Star className="size-3 fill-brand-yellow text-brand-yellow" />
            <FormattedNumber value={coach.rating} minimumFractionDigits={1} />
          </span>
        )}
      </>
    }
  />
)
