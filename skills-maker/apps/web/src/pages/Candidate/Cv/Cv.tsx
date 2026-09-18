import { FileText, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

import { LoadingState } from '@/components/common/LoadingState/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader/PageHeader'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { CvDetailsAccordion } from './CvDetailsAccordion'
import { CvFormatSelector } from './CvFormatSelector'
import { CvImprovementsGrid } from './CvImprovementsGrid'
import { CvPreviewPane } from './CvPreviewPane'
import { CvUploadZone } from './CvUploadZone'
import { ReplaceCvDialog } from './ReplaceCvDialog'
import { buildRenderData } from './templates/types'
import { useCv } from './useCv'

export const Cv = () => {
  const cv = useCv()
  const intl = useIntl()
  const isOptimized = cv.isOptimized
  const renderData = buildRenderData(cv.extractedData, cv.optimizedData)

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
    <div className="flex flex-col gap-5">
      <PageHeader titleId="candidate.cv.title" descriptionId="candidate.cv.subtitle" />

      {cv.isLoading && !cv.hasCv ? (
        <LoadingState />
      ) : cv.hasCv ? (
        <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar: file, actions, format, details, improvements */}
          <aside className="flex flex-col gap-4">
            <div className="flex flex-col gap-3.5 rounded-lg border bg-card p-4 shadow-xs">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <FileText className="size-[18px]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cv.cvFileName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{cv.formatSize(cv.cvSizeBytes)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={cv.openAtsOptimizer} disabled={!cv.canOptimize || cv.isOptimizing}>
                  {cv.isOptimizing ? (
                    <Loader2 className="size-[15px] animate-spin" />
                  ) : (
                    <Sparkles className="size-[15px]" />
                  )}
                  <FormattedMessage id={isOptimized ? 'candidate.cv.optimization.reoptimize' : 'candidate.cv.actions.optimize'} />
                </Button>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={cv.viewCv} disabled={!cv.cvUrl}>
                    <FileText className="size-3.5" />
                    <FormattedMessage id="candidate.cv.actions.view" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary"
                    onClick={cv.openReplaceModal}
                  >
                    <RefreshCw className="size-3.5" />
                    <FormattedMessage id="candidate.cv.replace.trigger" />
                  </Button>
                </div>
              </div>
            </div>

            <CvFormatSelector
              orientation="sidebar"
              value={cv.selectedTemplate}
              onChange={cv.changeTemplate}
              disabled={cv.isOptimizing}
            />

            <CvDetailsAccordion
              name={cv.detailsName}
              onNameChange={cv.setDetailsName}
              title={cv.detailsTitle}
              onTitleChange={cv.setDetailsTitle}
              summary={cv.detailsSummary}
              onSummaryChange={cv.setDetailsSummary}
              onSave={cv.saveDetails}
            />

            {isOptimized && cv.improvements.length > 0 && (
              <Accordion type="single" collapsible className="rounded-lg border bg-card shadow-xs">
                <AccordionItem value="improvements" className="border-none">
                  <AccordionTrigger className="gap-4 px-4 hover:no-underline">
                    <div className="flex items-center gap-3.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="size-[18px]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold">
                          <FormattedMessage id="candidate.cv.optimization.tabs.improvements" /> ({cv.improvements.length})
                        </p>
                        <p className="text-xs font-normal text-muted-foreground">
                          <FormattedMessage
                            id="candidate.cv.optimization.summary"
                            values={{
                              total: cv.improvements.length,
                              high: cv.improvements.filter((i) => i.impact === 'high').length,
                            }}
                          />
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="border-t pt-3">
                      <CvImprovementsGrid improvements={cv.improvements} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </aside>

          {/* Preview pane */}
          <CvPreviewPane
            originalCvUrl={cv.cvUrl}
            renderData={renderData}
            template={cv.selectedTemplate}
            isOptimized={isOptimized}
            optimizedAt={cv.optimizedAt}
          />
        </div>
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
