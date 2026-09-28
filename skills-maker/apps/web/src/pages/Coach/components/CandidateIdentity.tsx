import { Briefcase } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { PersonIdentity } from '@/components/common/PersonIdentity/PersonIdentity'

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
    <PersonIdentity
      firstName={candidate.firstName}
      lastName={candidate.lastName}
      avatarUrl={candidate.avatarUrl}
      name={fullName || <FormattedMessage id="coach.candidates.unnamed" />}
      subtitle={
        candidate.sector && (
          <>
            <Briefcase className="size-3.5 flex-none" />
            <span className="truncate">{candidate.sector}</span>
          </>
        )
      }
      meta={
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11.5px] font-semibold text-muted-foreground">
          <FormattedMessage id="coach.candidates.sessionsCount" values={{ count: candidate.sessionsCount }} />
        </span>
      }
    />
  )
}
