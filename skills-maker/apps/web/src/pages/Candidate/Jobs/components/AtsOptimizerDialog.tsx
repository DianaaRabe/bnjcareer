import { Loader2, Sparkles } from 'lucide-react'
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

type AtsOptimizerDialogProps = {
  job: JobListItem | null
  hasCv: boolean
  /** True while the offer-specific optimization is running. */
  isOptimizing: boolean
  onClose: () => void
  /** Runs the ATS optimization tailored to THIS offer, then routes to the CV page. */
  onConfirm: () => void
}

export const AtsOptimizerDialog = ({ job, hasCv, isOptimizing, onClose, onConfirm }: AtsOptimizerDialogProps) => (
  <Dialog open={job !== null} onOpenChange={(next) => !next && !isOptimizing && onClose()}>
    {job && (
      <DialogContent className="sm:max-w-[440px]" showCloseButton={!isOptimizing}>
        {isOptimizing ? (
          // While the LLM tailors the CV to this specific offer, swap the dialog for a loader.
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <DialogTitle>
              <FormattedMessage id="candidate.jobs.ats.optimizing.title" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage
                id="candidate.jobs.ats.optimizing.description"
                values={{ jobTitle: job.title }}
              />
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex size-9 items-center justify-center rounded-full bg-accent text-primary">
                <Sparkles className="size-4" />
              </div>
              <DialogTitle>
                <FormattedMessage id="candidate.jobs.ats.title" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage id="candidate.jobs.ats.subtitle" values={{ jobTitle: job.title }} />
              </DialogDescription>
            </DialogHeader>

            <p className="text-[13.5px] leading-relaxed text-foreground">
              <FormattedMessage
                id={hasCv ? 'candidate.jobs.ats.description' : 'candidate.jobs.ats.noCv.description'}
              />
            </p>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
                <FormattedMessage id="common.cancel" />
              </Button>
              <Button size="lg" className="flex-1" onClick={onConfirm}>
                <FormattedMessage id={hasCv ? 'candidate.jobs.ats.confirm' : 'candidate.jobs.ats.noCv.confirm'} />
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    )}
  </Dialog>
)
