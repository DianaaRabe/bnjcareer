import { BookOpen, Clock, GraduationCap, Star } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import { TrainingPrice } from '@/pages/Candidate/Formations/components/TrainingPrice'
import { durationMessage } from '@/pages/Candidate/Formations/constants'
import type { TrainingDetail } from '../useTrainingDetail'

type TrainingSummaryProps = {
  training: TrainingDetail
}

const Row = ({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 text-[13.5px] text-muted-foreground">
    <Icon className="size-4 flex-none" />
    {children}
  </div>
)

export const TrainingSummary = ({ training }: TrainingSummaryProps) => {
  const duration = durationMessage(training.durationDays)

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <TrainingPrice priceCents={training.priceCents} />

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <Row icon={BookOpen}>
          <FormattedMessage id="candidate.formations.modules" values={{ count: training.modules }} />
        </Row>
        <Row icon={Clock}>
          <FormattedMessage id={duration.id} values={{ count: duration.count }} />
        </Row>
        {training.instructor && (
          <Row icon={Star}>{training.instructor}</Row>
        )}
        {training.certificate && (
          <Row icon={GraduationCap}>
            <FormattedMessage id="candidate.formations.certificate" />
          </Row>
        )}
      </div>

      {/* Enrolment has no backing model yet — the button states the intent without faking it. */}
      <Button size="lg" className="w-full" disabled>
        <FormattedMessage id="candidate.trainingDetail.enroll" />
      </Button>
      <p className="text-center text-[12px] text-muted-foreground">
        <FormattedMessage id="candidate.trainingDetail.enroll.soon" />
      </p>
    </aside>
  )
}
