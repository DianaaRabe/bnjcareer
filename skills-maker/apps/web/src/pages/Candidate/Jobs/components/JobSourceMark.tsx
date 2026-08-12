import { FormattedMessage } from 'react-intl'

import { cn } from '@/lib/utils'
import { JOB_SOURCE_LABEL_IDS, type JobListItem } from '../constants'

type JobSourceMarkProps = { job: JobListItem; className?: string }

export const JobSourceMark = ({ job, className }: JobSourceMarkProps) => (
  <span className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
    <span className="inline-block size-1.5 rounded-full" style={{ background: job.sourceColor }} />
    <FormattedMessage id={JOB_SOURCE_LABEL_IDS[job.source]} />
  </span>
)
