import type { DragEvent } from 'react'
import { FileText, Loader2, Upload } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UPLOAD_STEP, type UploadStep } from './useCv'

type CvUploadZoneProps = {
  step: UploadStep
  isDragging: boolean
  pendingFile: File | null
  formatSize: (bytes: number) => string
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: (file: File | undefined) => void
  onPick: (file: File | undefined) => void
  onCancel: () => void
  onUpload: () => void
  /** Tighter padding for the dialog variant. */
  compact?: boolean
}

export const CvUploadZone = ({
  step,
  isDragging,
  pendingFile,
  formatSize,
  onDragOver,
  onDragLeave,
  onDrop,
  onPick,
  onCancel,
  onUpload,
  compact,
}: CvUploadZoneProps) => {
  const inputId = compact ? 'cv-file-input-dialog' : 'cv-file-input'

  if (step === UPLOAD_STEP.idle) {
    return (
      <div
        onClick={() => document.getElementById(inputId)?.click()}
        onDragOver={(e: DragEvent) => {
          e.preventDefault()
          onDragOver()
        }}
        onDragLeave={onDragLeave}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          onDragLeave()
          onDrop(e.dataTransfer.files[0])
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-center transition-colors',
          compact ? 'p-8' : 'p-9',
          isDragging ? 'border-ring bg-accent' : 'border-border-strong bg-card hover:bg-accent',
        )}
      >
        <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-muted text-primary">
          <Upload className="size-5" />
        </div>
        <p className="text-[15px] font-bold">
          <FormattedMessage id="candidate.cv.upload.cta.title" />
        </p>
        <p className="text-[13px] text-muted-foreground">
          <FormattedMessage id="candidate.cv.upload.cta.subtitle" />
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          <FormattedMessage id="candidate.cv.upload.cta.hint" />
        </p>
        <input
          id={inputId}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>
    )
  }

  const isUploading = step === UPLOAD_STEP.uploading

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border text-center',
        compact ? 'border-border bg-muted p-6' : 'border-2 border-dashed border-border-strong bg-muted p-14',
      )}
    >
      <FileText className="size-8 text-primary" />
      <p className="mt-1.5 text-sm font-bold">{pendingFile?.name}</p>
      <p className="text-xs text-muted-foreground">{formatSize(pendingFile?.size ?? 0)}</p>
      <div className="mt-3 flex items-center gap-2.5">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isUploading}>
          <FormattedMessage id="common.cancel" />
        </Button>
        <Button size="sm" onClick={onUpload} disabled={isUploading}>
          {isUploading && <Loader2 className="size-3.5 animate-spin" />}
          <FormattedMessage id="candidate.cv.upload.submit" />
        </Button>
      </div>
    </div>
  )
}
