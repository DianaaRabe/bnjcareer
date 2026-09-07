import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { initialsOf, SITUATION_LABEL_IDS } from '../constants'
import { ApplicationsCard } from './components/ApplicationsCard'
import { GoalsCard } from './components/GoalsCard'
import { SessionsCard } from './components/SessionsCard'
import { CV_STATUS_LABEL_IDS } from './constants'
import { useCandidateDetail } from './useCandidateDetail'

export const CandidateDetail = () => {
  const { candidate, isLoading, errorMessageId, retry } = useCandidateDetail()

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
      <Link to={ROUTES.coach.candidates}>
        <ArrowLeft className="size-3.5" />
        <FormattedMessage id="coach.candidateDetail.back" />
      </Link>
    </Button>
  )

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <LoadingState />
      </div>
    )
  }

  if (errorMessageId || !candidate) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.candidateDetail.error.title"
          descriptionId={errorMessageId ?? 'coach.candidateDetail.error.unexpected'}
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      </div>
    )
  }

  const fullName = [candidate.firstName, candidate.lastName].filter(Boolean).join(' ')

  return (
    <div className="flex min-h-full flex-col gap-6">
      {backLink}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar className="size-16">
          {candidate.avatarUrl && <AvatarImage src={candidate.avatarUrl} alt="" />}
          <AvatarFallback className="bg-accent text-lg font-bold text-primary">
            {initialsOf(candidate.firstName, candidate.lastName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {fullName || <FormattedMessage id="coach.candidates.unnamed" />}
          </h1>
          {candidate.sector && <p className="mt-0.5 text-sm text-muted-foreground">{candidate.sector}</p>}
          {candidate.bio && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{candidate.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {candidate.situation && (
              <Badge variant="secondary" className="text-[11px] font-semibold text-muted-foreground">
                <FormattedMessage id={SITUATION_LABEL_IDS[candidate.situation]} />
              </Badge>
            )}
            <Badge variant="outline" className="text-[11px] font-semibold text-foreground">
              <FormattedMessage
                id={
                  candidate.cvStatus ? CV_STATUS_LABEL_IDS[candidate.cvStatus] : 'coach.candidateDetail.cvStatus.none'
                }
              />
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <ApplicationsCard applications={candidate.applications} />
          <GoalsCard goals={candidate.goals} />
        </div>
        <SessionsCard candidate={candidate} />
      </div>
    </div>
  )
}
