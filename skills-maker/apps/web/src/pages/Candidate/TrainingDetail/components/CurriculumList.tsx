import { ListChecks } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { SectionHeader } from '@/components/common/SectionHeader/SectionHeader'
import { moduleDurationMessage } from '../constants'
import type { CurriculumModule } from '../useTrainingDetail'

type CurriculumListProps = {
  modules: CurriculumModule[]
}

export const CurriculumList = ({ modules }: CurriculumListProps) => (
  <section className="flex flex-col">
    <SectionHeader
      icon={ListChecks}
      titleId="candidate.trainingDetail.curriculum.title"
      className="border-b border-border pb-3.5"
      action={
        <span className="shrink-0 text-[12.5px] font-semibold text-muted-foreground">
          <FormattedMessage id="candidate.formations.modules" values={{ count: modules.length }} />
        </span>
      }
    />

    {modules.length === 0 ? (
      <p className="py-6 text-sm text-muted-foreground">
        <FormattedMessage id="candidate.trainingDetail.curriculum.empty" />
      </p>
    ) : (
      <ol className="flex flex-col">
        {modules.map((module) => {
          const duration = module.durationMinutes && moduleDurationMessage(module.durationMinutes)

          return (
            <li
              key={module.id}
              className="flex items-start gap-3.5 border-b border-border py-3.5 last:border-b-0"
            >
              <span className="flex size-7 flex-none items-center justify-center rounded-full bg-accent text-[12.5px] font-bold text-primary">
                {module.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-semibold">{module.title}</p>
                {module.summary && (
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{module.summary}</p>
                )}
              </div>
              {duration && (
                <span className="flex-none text-xs text-muted-foreground">
                  <FormattedMessage id={duration.id} values={{ count: duration.count }} />
                </span>
              )}
            </li>
          )
        })}
      </ol>
    )}
  </section>
)
