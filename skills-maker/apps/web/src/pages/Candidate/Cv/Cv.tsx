import { FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Button } from '@/components/ui/button'
import { CvDetailsAccordion } from './CvDetailsAccordion'
import { CvOptimizationResult } from './CvOptimizationResult'
import { CvUploadZone } from './CvUploadZone'
import { ReplaceCvDialog } from './ReplaceCvDialog'
import { useCv } from './useCv'

export const Cv = () => {
  const cv = useCv()
  const intl = useIntl()
  const isOptimized = cv.status === 'OPTIMIZED' && !!cv.optimizedHtml

  const replaceTrigger = (
    <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={cv.openReplaceModal}>
      <RefreshCw className="size-3.5" />
      <FormattedMessage id="candidate.cv.replace.trigger" />
    </Button>
  )

  const zoneProps = {
    step: cv.uploadStep,
    isDragging: cv.isDragging,
    pendingFile: cv.pendingFile,
    formatSize: cv.formatSize,
    onDragOver: () => cv.setIsDragging(true),
    onDragLeave: () => cv.setIsDragging(false),
    onDrop: cv.pickFile,
    onPick: cv.pickFile,
    onCancel: cv.cancelSelection,
    onUpload: cv.startUpload,
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader titleId="candidate.cv.title" descriptionId="candidate.cv.subtitle" />

      {cv.isLoading && !cv.hasCv ? (
        <LoadingState />
      ) : cv.hasCv ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-success/15 text-success">
                <FileText className="size-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{cv.cvFileName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{cv.formatSize(cv.cvSizeBytes)}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Button size="lg" onClick={cv.openAtsOptimizer} disabled={!cv.canOptimize || cv.isOptimizing}>
                {cv.isOptimizing ? <Loader2 className="size-[15px] animate-spin" /> : <Sparkles className="size-[15px]" />}
                <FormattedMessage id="candidate.cv.actions.optimize" />
              </Button>
              <Button size="lg" variant="outline" onClick={cv.viewCv} disabled={!cv.cvUrl}>
                <FormattedMessage id="candidate.cv.actions.view" />
              </Button>
            </div>
          </div>

          <CvDetailsAccordion
            name={cv.detailsName}
            onNameChange={cv.setDetailsName}
            title={cv.detailsTitle}
            onTitleChange={cv.setDetailsTitle}
            summary={cv.detailsSummary}
            onSummaryChange={cv.setDetailsSummary}
            onSave={cv.saveDetails}
          />

          {isOptimized ? (
            <>
              <CvOptimizationResult
                originalCvUrl={cv.cvUrl}
                optimizedHtml={cv.optimizedHtml!}
                optimizedAt={cv.optimizedAt}
                improvements={cv.improvements}
                onReOptimize={cv.openAtsOptimizer}
                isReOptimizing={cv.isOptimizing}
              />
              <div className="flex justify-end">{replaceTrigger}</div>
            </>
          ) : (
            <div className="flex flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
              <p className="border-b p-3.5 px-5 text-[13px] font-semibold">
                <FormattedMessage id="candidate.cv.preview.title" />
              </p>
              <div className="h-[480px] overflow-auto bg-muted">
                {cv.cvUrl ? (
                  <iframe
                    src={cv.cvUrl}
                    title={intl.formatMessage({ id: 'candidate.cv.preview.iframeTitle' })}
                    className="block size-full border-0"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
                    <FileText className="size-8" />
                    <p className="text-[13px]">
                      <FormattedMessage id="candidate.cv.preview.empty" />
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t p-3 px-5">{replaceTrigger}</div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Button
            variant="secondary"
            className="self-end rounded-full"
            disabled
            title={intl.formatMessage({ id: 'candidate.cv.ats.disabledHint' })}
          >
            <Sparkles className="size-3.5" />
            <FormattedMessage id="candidate.cv.ats.toast.title" />
          </Button>
          <CvUploadZone {...zoneProps} />
        </div>
      )}

      <ReplaceCvDialog open={cv.replaceOpen} onClose={cv.closeReplaceModal} zoneProps={zoneProps} />
    </div>
  )
}
