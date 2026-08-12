import { ExternalLink, Sparkles } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { JobListItem } from '../constants'
import { JobCompanyAvatar } from './JobCompanyAvatar'
import { JobPostedTime } from './JobPostedTime'
import { JobSalaryBadge } from './JobSalaryBadge'
import { JobSourceMark } from './JobSourceMark'
import { JobTags } from './JobTags'

type JobCardProps = {
  job: JobListItem
  onOpenDetails: () => void
  onOptimize: () => void
}

export const JobCard = ({ job, onOpenDetails, onOptimize }: JobCardProps) => (
  <Card className="gap-3.5 p-5 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between gap-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <JobCompanyAvatar job={job} />
        <JobSourceMark job={job} />
      </div>
      {job.salary && <JobSalaryBadge salary={job.salary} />}
    </div>

    <div>
      <button
        type="button"
        onClick={onOpenDetails}
        className="text-left text-[15.5px] leading-snug font-bold text-foreground hover:text-primary-hover"
      >
        {job.title}
      </button>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {[job.company, job.location].filter(Boolean).join(' · ')}
      </p>
    </div>

    <JobTags tags={job.tags} isRemote={job.isRemote} />

    <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{job.description}</p>
    <JobPostedTime postedAt={job.postedAt} className="text-[11.5px] text-muted-foreground" />

    <Separator />

    <Button variant="outline" size="lg" className="justify-center" asChild>
      <a href={job.applyUrl} target="_blank" rel="noreferrer">
        <FormattedMessage id="candidate.jobs.card.apply" />
        <ExternalLink className="size-3.5" />
      </a>
    </Button>
    <div className="flex gap-2">
      <Button variant="outline" size="lg" className="flex-1 text-muted-foreground" onClick={onOpenDetails}>
        <FormattedMessage id="candidate.jobs.card.details" />
      </Button>
      <Button size="lg" className="flex-1 bg-accent text-primary hover:bg-accent/70" onClick={onOptimize}>
        <Sparkles className="size-3.5" />
        <FormattedMessage id="candidate.jobs.card.optimize" />
      </Button>
    </div>
  </Card>
)
