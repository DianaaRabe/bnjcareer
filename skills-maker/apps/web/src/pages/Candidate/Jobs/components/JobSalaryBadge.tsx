import { FormattedMessage, FormattedNumber } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { SalaryPeriod } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import type { JobSalary } from '../constants'

type JobSalaryBadgeProps = { salary: JobSalary; className?: string }

const Amount = ({ value, currency }: { value: number; currency: string }) => (
  <FormattedNumber value={value} style="currency" currency={currency} maximumFractionDigits={0} />
)

const PERIOD_LABEL_IDS: Record<SalaryPeriod, string> = {
  [SalaryPeriod.Hour]: 'candidate.jobs.salary.period.hour',
  [SalaryPeriod.Month]: 'candidate.jobs.salary.period.month',
  [SalaryPeriod.Year]: 'candidate.jobs.salary.period.year',
}

export const JobSalaryBadge = ({ salary, className }: JobSalaryBadgeProps) => {
  const badgeClassName = cn('bg-success/10 font-semibold text-success', className)

  // Sources publish free text; we only format when the amount could be parsed out of it.
  if (salary.min == null || !salary.currency || !salary.period) {
    return (
      <Badge variant="secondary" className={badgeClassName}>
        {salary.label}
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={badgeClassName}>
      <FormattedMessage
        id={salary.max == null ? 'candidate.jobs.salary.from' : 'candidate.jobs.salary.range'}
        values={{
          min: <Amount value={salary.min} currency={salary.currency} />,
          max: salary.max == null ? null : <Amount value={salary.max} currency={salary.currency} />,
          period: <FormattedMessage id={PERIOD_LABEL_IDS[salary.period]} />,
        }}
      />
    </Badge>
  )
}
