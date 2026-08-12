import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { JobFilterKind, type ContractType, type ExperienceLevel, type JobSource } from '@/gql/graphql'
import {
  CONTRACT_TYPE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  POSTED_WITHIN_OPTIONS,
  WORK_TIME_OPTIONS,
  type JobFilters,
} from '../constants'
import { JobFilterGroup } from './JobFilterGroup'

type JobFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: JobFilters
  onChange: (filters: JobFilters) => void
  onApply: () => void
  onReset: () => void
  /** Filters the active source can honour — the others are not rendered at all. */
  supportedFilters: JobFilterKind[]
  source: JobSource
}

export const JobFiltersSheet = ({
  open,
  onOpenChange,
  filters,
  onChange,
  onApply,
  onReset,
  supportedFilters,
  source,
}: JobFiltersSheetProps) => {
  const intl = useIntl()
  const supports = (kind: JobFilterKind) => supportedFilters.includes(kind)

  const toggleContract = (value: ContractType) =>
    onChange({
      ...filters,
      contractTypes: filters.contractTypes.includes(value)
        ? filters.contractTypes.filter((type) => type !== value)
        : [...filters.contractTypes, value],
    })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-[380px]">
        <SheetHeader>
          <SheetTitle>
            <FormattedMessage id="candidate.jobs.filters.title" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <p className="text-[12.5px] text-muted-foreground">
            <FormattedMessage
              id="candidate.jobs.filters.sourceHint"
              values={{ source: intl.formatMessage({ id: `candidate.jobs.source.${source.toLowerCase()}` }) }}
            />
          </p>

          {supports(JobFilterKind.ContractType) && (
            <JobFilterGroup
              titleId="candidate.jobs.filters.contract.title"
              options={CONTRACT_TYPE_OPTIONS}
              isSelected={(value) => filters.contractTypes.includes(value)}
              onSelect={toggleContract}
            />
          )}

          {supports(JobFilterKind.ExperienceLevel) && (
            <JobFilterGroup
              titleId="candidate.jobs.filters.experience.title"
              options={EXPERIENCE_LEVEL_OPTIONS}
              isSelected={(value) => filters.experienceLevel === value}
              onSelect={(value: ExperienceLevel) =>
                onChange({ ...filters, experienceLevel: filters.experienceLevel === value ? null : value })
              }
            />
          )}

          {supports(JobFilterKind.WorkTime) && (
            <JobFilterGroup
              titleId="candidate.jobs.filters.workTime.title"
              options={WORK_TIME_OPTIONS}
              isSelected={(value) => filters.workTime === value}
              onSelect={(value) =>
                onChange({ ...filters, workTime: filters.workTime === value ? null : value })
              }
            />
          )}

          {supports(JobFilterKind.PostedWithin) && (
            <JobFilterGroup
              titleId="candidate.jobs.filters.posted.title"
              options={POSTED_WITHIN_OPTIONS}
              isSelected={(value) => filters.postedWithin === value}
              onSelect={(value) =>
                onChange({ ...filters, postedWithin: filters.postedWithin === value ? null : value })
              }
            />
          )}
        </div>

        <SheetFooter className="flex-row gap-2.5">
          <Button variant="outline" size="lg" className="flex-1" onClick={onReset}>
            <FormattedMessage id="candidate.jobs.filters.reset" />
          </Button>
          <Button size="lg" className="flex-1" onClick={onApply}>
            <FormattedMessage id="candidate.jobs.filters.apply" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
