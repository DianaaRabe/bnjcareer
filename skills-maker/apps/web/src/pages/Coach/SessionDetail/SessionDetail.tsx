import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { DangerZone } from '@/components/common/DangerZone/DangerZone'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { EventStatus } from '@/gql/graphql'
import { EVENT_STATUS_LABEL_IDS, EVENT_STATUS_STYLES } from '../constants'
import { AttendeesList } from './components/AttendeesList'
import { SessionFieldsForm } from './components/SessionFieldsForm'
import { useSessionDetail } from './useSessionDetail'

export const SessionDetail = () => {
  const detail = useSessionDetail()

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
      <Link to={ROUTES.coach.sessions}>
        <ArrowLeft className="size-3.5" />
        <FormattedMessage id="coach.sessionDetail.back" />
      </Link>
    </Button>
  )

  if (detail.isLoading) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <LoadingState />
      </div>
    )
  }

  if (detail.loadErrorMessageId || !detail.session) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.sessionDetail.error.title"
          descriptionId={detail.loadErrorMessageId ?? 'coach.sessionDetail.error.unexpected'}
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={detail.retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-5">
      {backLink}

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{detail.session.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <FormattedMessage id="coach.sessionDetail.subtitle" />
          </p>
        </div>
        <Badge className={EVENT_STATUS_STYLES[detail.session.status]}>
          <FormattedMessage id={EVENT_STATUS_LABEL_IDS[detail.session.status]} />
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[1.5fr_1fr]">
        <SessionFieldsForm detail={detail} />

        <div className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          <AttendeesList
            attendees={detail.session.attendees}
            isRemoving={detail.isCancelingBooking}
            onRemove={detail.removeAttendee}
          />

          {detail.session.status !== EventStatus.Canceled && (
            <DangerZone
              titleId="coach.sessionDetail.danger.title"
              descriptionId="coach.sessionDetail.danger.description"
              triggerId="coach.sessionDetail.danger.trigger"
              confirmId="coach.sessionDetail.danger.confirm"
              isLoading={detail.isCanceling}
              onConfirm={detail.cancel}
            />
          )}
        </div>
      </div>
    </div>
  )
}
