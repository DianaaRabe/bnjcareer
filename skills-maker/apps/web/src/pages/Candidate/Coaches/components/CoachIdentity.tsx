import { Briefcase, Star } from 'lucide-react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initialsOf } from '../constants'
import type { Coach } from '../useCoaches'

type CoachIdentityProps = {
  coach: Coach
}

export const CoachIdentity = ({ coach }: CoachIdentityProps) => {
  const fullName = [coach.firstName, coach.lastName].filter(Boolean).join(' ')

  return (
    <div className="flex items-start gap-4">
      <Avatar className="size-12">
        {coach.avatarUrl && <AvatarImage src={coach.avatarUrl} alt="" />}
        <AvatarFallback className="bg-accent text-sm font-bold text-primary">
          {initialsOf(coach.firstName, coach.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold">{fullName}</p>

        {coach.specialty && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-primary">
            <Briefcase className="size-3.5 flex-none" />
            <span className="truncate">{coach.specialty}</span>
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {coach.yearsExperience !== null && coach.yearsExperience !== undefined && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
              <FormattedMessage
                id="candidate.coaches.experience"
                values={{ count: coach.yearsExperience }}
              />
            </span>
          )}
          {coach.rating !== null && coach.rating !== undefined && (
            <span className="flex items-center gap-1 text-[12px] font-bold">
              <Star className="size-3 fill-brand-yellow text-brand-yellow" />
              <FormattedNumber value={coach.rating} minimumFractionDigits={1} />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
