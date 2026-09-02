import { ExternalLink, Sparkles } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import type { JobListItem } from '../constants'
import { JobCompanyAvatar } from './JobCompanyAvatar'
import { JobPostedTime } from './JobPostedTime'
import { JobSourceMark } from './JobSourceMark'
import { JobTags } from './JobTags'

type JobRowProps = {
  job: JobListItem
  onOpenDetails: () => void
  onOptimize: () => void
}

export const JobRow = ({ job, onOpenDetails, onOptimize }: JobRowProps) => {
  const intl = useIntl()

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 hover:bg-accent sm:flex-row sm:items-center sm:gap-4">
      <JobCompanyAvatar job={job} className="size-10" />

      <div className="min-w-0 flex-[2]">
        <button
          type="button"
          onClick={onOpenDetails}
          className="max-w-full truncate text-left text-sm font-bold text-foreground hover:text-primary-hover"
        >
          {job.title}
        </button>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-muted-foreground">
          <span>{[job.company, job.location].filter(Boolean).join(' · ')}</span>
          <span aria-hidden>·</span>
          <JobSourceMark job={job} />
          <span aria-hidden>·</span>
          <JobPostedTime postedAt={job.postedAt} />
        </div>
      </div>

      <div className="flex-1">
        <JobTags tags={job.tags} isRemote={job.isRemote} salary={job.salary} />
      </div>

      <div className="flex flex-none items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-lg"
          title={intl.formatMessage({ id: 'candidate.jobs.card.apply' })}
          aria-label={intl.formatMessage({ id: 'candidate.jobs.card.apply' })}
          asChild
        >
          <a href={job.applyUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="size-3.5" />
          </a>
        </Button>
        <Button
          size="icon-lg"
          className="bg-accent text-primary hover:bg-accent/70"
          title={intl.formatMessage({ id: 'candidate.jobs.card.optimize' })}
          aria-label={intl.formatMessage({ id: 'candidate.jobs.card.optimize' })}
          onClick={onOptimize}
        >
          <Sparkles className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
