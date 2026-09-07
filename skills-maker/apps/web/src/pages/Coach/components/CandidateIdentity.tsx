import { Briefcase } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initialsOf } from '../constants'

type CandidateIdentityProps = {
  candidate: {
    firstName?: string | null
    lastName?: string | null
    avatarUrl?: string | null
    sector?: string | null
    sessionsCount: number
  }
}

/** Shared identity block for a candidate — used by the candidates list and the dashboard. */
export const CandidateIdentity = ({ candidate }: CandidateIdentityProps) => {
  const fullName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ')

  return (
    <div className="flex items-start gap-4">
      <Avatar className="size-12">
        {candidate.avatarUrl && <AvatarImage src={candidate.avatarUrl} alt="" />}
        <AvatarFallback className="bg-accent text-sm font-bold text-primary">
          {initialsOf(candidate.firstName, candidate.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold">
          {fullName || <FormattedMessage id="coach.candidates.unnamed" />}
        </p>

        {candidate.sector && (
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-primary">
            <Briefcase className="size-3.5 flex-none" />
            <span className="truncate">{candidate.sector}</span>
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
            <FormattedMessage
              id="coach.candidates.sessionsCount"
              values={{ count: candidate.sessionsCount }}
            />
          </span>
        </div>
      </div>
    </div>
  )
}
