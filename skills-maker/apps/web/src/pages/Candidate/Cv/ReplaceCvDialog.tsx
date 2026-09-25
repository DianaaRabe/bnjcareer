import type { ComponentProps } from 'react'
import { X } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CvUploadZone } from './CvUploadZone'

type ReplaceCvDialogProps = {
  open: boolean
  onClose: () => void
  zoneProps: ComponentProps<typeof CvUploadZone>
}

export const ReplaceCvDialog = ({ open, onClose, zoneProps }: ReplaceCvDialogProps) => {
  const intl = useIntl()

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-[480px]">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle>
            <FormattedMessage id="candidate.cv.replace.dialogTitle" />
          </DialogTitle>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: 'candidate.cv.replace.close' })}
            >
              <X className="size-[18px]" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <CvUploadZone {...zoneProps} compact />
      </DialogContent>
    </Dialog>
  )
}
