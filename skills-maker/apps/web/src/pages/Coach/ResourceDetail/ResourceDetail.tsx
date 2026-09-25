import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { DangerZone } from '@/components/common/DangerZone/DangerZone'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { ResourceFieldsForm } from './components/ResourceFieldsForm'
import { useResourceDetail } from './useResourceDetail'

export const ResourceDetail = () => {
  const detail = useResourceDetail()

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
      <Link to={ROUTES.coach.resources}>
        <ArrowLeft className="size-3.5" />
        <FormattedMessage id="coach.resourceDetail.back" />
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

  if (detail.loadErrorMessageId || !detail.resource) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.resourceDetail.error.title"
          descriptionId={detail.loadErrorMessageId ?? 'coach.resourceDetail.error.unexpected'}
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

      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{detail.resource.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <FormattedMessage id="coach.resourceDetail.subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[1.5fr_1fr]">
        <ResourceFieldsForm detail={detail} />

        <div className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          <DangerZone
            titleId="coach.resourceDetail.danger.title"
            descriptionId="coach.resourceDetail.danger.description"
            triggerId="coach.resourceDetail.danger.trigger"
            confirmId="coach.resourceDetail.danger.confirm"
            isLoading={detail.isDeleting}
            onConfirm={detail.remove}
          />
        </div>
      </div>
    </div>
  )
}
