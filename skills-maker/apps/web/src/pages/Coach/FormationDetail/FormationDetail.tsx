import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { DangerZone } from '@/components/common/DangerZone/DangerZone'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { CurriculumEditor } from './components/CurriculumEditor'
import { TrainingFieldsForm } from './components/TrainingFieldsForm'
import { useFormationDetail } from './useFormationDetail'

export const FormationDetail = () => {
  const detail = useFormationDetail()

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
      <Link to={ROUTES.coach.formations}>
        <ArrowLeft className="size-3.5" />
        <FormattedMessage id="coach.formationDetail.back" />
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

  if (detail.loadErrorMessageId || !detail.training) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <EmptyState
          icon={TriangleAlert}
          titleId="coach.formationDetail.error.title"
          descriptionId={detail.loadErrorMessageId ?? 'coach.formationDetail.error.unexpected'}
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
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{detail.training.title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          <FormattedMessage id="coach.formationDetail.subtitle" />
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-border pt-8 lg:grid-cols-[1.5fr_1fr]">
        <TrainingFieldsForm detail={detail} />

        <div className="flex flex-col gap-8 lg:border-l lg:border-border lg:pl-8">
          <CurriculumEditor trainingId={detail.training.id} curriculum={detail.training.curriculum ?? []} />
          <DangerZone
            titleId="coach.formationDetail.danger.title"
            descriptionId="coach.formationDetail.danger.description"
            triggerId="coach.formationDetail.danger.trigger"
            confirmId="coach.formationDetail.danger.confirm"
            isLoading={detail.isDeleting}
            onConfirm={detail.remove}
          />
        </div>
      </div>
    </div>
  )
}
