import { FormattedMessage, useIntl } from 'react-intl'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { FullscreenPanel } from './useCvOptimizationResult'

type CvFullscreenPreviewDialogProps = {
  panel: FullscreenPanel
  onClose: () => void
  originalCvUrl: string | null
  optimizedHtml: string
}

export const CvFullscreenPreviewDialog = ({
  panel,
  onClose,
  originalCvUrl,
  optimizedHtml,
}: CvFullscreenPreviewDialogProps) => {
  const intl = useIntl()

  return (
    <Dialog open={panel !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage
              id={panel === 'original' ? 'candidate.cv.optimization.original.label' : 'candidate.cv.optimization.optimized.label'}
            />
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-auto">
          {panel === 'original' ? (
            <iframe
              src={originalCvUrl ?? undefined}
              title={intl.formatMessage({ id: 'candidate.cv.optimization.original.label' })}
              className="h-[70vh] w-full rounded-lg border-0"
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: optimizedHtml }} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
