import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import {
  CATEGORY_ICONS,
  CATEGORY_LABEL_IDS,
  LEVEL_LABEL_IDS,
  LEVEL_STYLES,
} from '@/pages/Candidate/Formations/constants'
import { CurriculumList } from './components/CurriculumList'
import { TrainingSummary } from './components/TrainingSummary'
import { useTrainingDetail } from './useTrainingDetail'

export const TrainingDetail = () => {
  const { training, isLoading, errorMessageId, retry } = useTrainingDetail()

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit gap-1.5 text-muted-foreground">
      <Link to={ROUTES.candidate.formations}>
        <ArrowLeft className="size-3.5" />
        <FormattedMessage id="candidate.trainingDetail.back" />
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

  if (errorMessageId || !training) {
    return (
      <div className="flex min-h-full flex-col gap-5">
        {backLink}
        <EmptyState
          icon={TriangleAlert}
          titleId="candidate.trainingDetail.error.title"
          descriptionId={errorMessageId ?? 'candidate.trainingDetail.error.unexpected'}
          action={
            <Button variant="outline" size="lg" className="mt-2" onClick={retry}>
              <FormattedMessage id="common.retry" />
            </Button>
          }
        />
      </div>
    )
  }

  const CategoryIcon = CATEGORY_ICONS[training.category]

  return (
    <div className="flex min-h-full flex-col gap-5">
      {backLink}

      <PageHeader titleId="candidate.trainingDetail.eyebrow" descriptionId="candidate.trainingDetail.subtitle" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex items-start gap-4">
            <div className="flex size-12 flex-none items-center justify-center rounded-lg bg-accent">
              <CategoryIcon className="size-[21px] text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-[11.5px] font-semibold text-muted-foreground">
                  <FormattedMessage id={CATEGORY_LABEL_IDS[training.category]} />
                </Badge>
                <Badge className={cn('text-[11.5px] font-semibold', LEVEL_STYLES[training.level])}>
                  <FormattedMessage id={LEVEL_LABEL_IDS[training.level]} />
                </Badge>
              </div>
              <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{training.title}</h2>
              {training.description && (
                <p className="mt-1.5 text-sm text-muted-foreground">{training.description}</p>
              )}
            </div>
          </header>

          <CurriculumList modules={training.curriculum} />
        </div>

        <TrainingSummary training={training} />
      </div>
    </div>
  )
}
