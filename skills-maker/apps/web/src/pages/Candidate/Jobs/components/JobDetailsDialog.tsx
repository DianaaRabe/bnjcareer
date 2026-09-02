import { ExternalLink, Sparkles } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { JobListItem } from '../constants'
import { JobPostedTime } from './JobPostedTime'
import { JobSourceMark } from './JobSourceMark'
import { JobTags } from './JobTags'

type JobDetailsDialogProps = {
  job: JobListItem | null
  onClose: () => void
  onOptimize: (job: JobListItem) => void
}

export const JobDetailsDialog = ({ job, onClose, onOptimize }: JobDetailsDialogProps) => (
  <Dialog open={job !== null} onOpenChange={(next) => !next && onClose()}>
    {job && (
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
          <DialogDescription>
            {[job.company, job.location].filter(Boolean).join(' · ')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-muted-foreground">
          <JobSourceMark job={job} />
          <JobPostedTime postedAt={job.postedAt} />
        </div>

        <JobTags tags={job.tags} isRemote={job.isRemote} salary={job.salary} />

        {/* Real listings run long — keep the dialog itself from growing past the viewport. */}
        <p className="max-h-[45vh] overflow-y-auto text-[13.5px] leading-relaxed whitespace-pre-line text-foreground">
          {job.description}
        </p>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button size="lg" asChild>
            <a href={job.applyUrl} target="_blank" rel="noreferrer">
              <FormattedMessage id="candidate.jobs.card.apply" />
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={() => onOptimize(job)}>
            <Sparkles className="size-3.5" />
            <FormattedMessage id="candidate.jobs.card.optimize" />
          </Button>
        </DialogFooter>
      </DialogContent>
    )}
  </Dialog>
)
