import { useRef } from 'react'
import { Download, Eye, Loader2, Sparkles } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CvTemplate } from '@/gql/graphql'
import { CvFullscreenPreviewDialog } from './CvFullscreenPreviewDialog'
import { CvScaledPreview } from './CvScaledPreview'
import type { CvRenderData } from './templates/types'
import { useCvOptimizationResult } from './useCvOptimizationResult'

type CvPreviewPaneProps = {
  originalCvUrl: string | null
  renderData: CvRenderData
  template: CvTemplate
  isOptimized: boolean
  optimizedAt: string | null
}

/** Right pane: the live, zoom-out CV preview plus download / view-original actions when optimized. */
export const CvPreviewPane = ({
  originalCvUrl,
  renderData,
  template,
  isOptimized,
  optimizedAt,
}: CvPreviewPaneProps) => {
  const { fullscreenPanel, openFullscreen, closeFullscreen, isDownloading, downloadPdf } =
    useCvOptimizationResult()
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold">
            <FormattedMessage id="candidate.cv.preview.title" />
          </p>
          {isOptimized && (
            <>
              <Badge variant="secondary" className="text-primary">
                <Sparkles className="mr-1 size-3" />
                <FormattedMessage id="candidate.cv.optimization.badge" />
              </Badge>
              {optimizedAt && (
                <span className="text-xs text-muted-foreground">
                  <FormattedDate value={optimizedAt} day="numeric" month="long" year="numeric" />
                </span>
              )}
            </>
          )}
        </div>
        {isOptimized && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => openFullscreen('original')} disabled={!originalCvUrl}>
              <Eye className="size-3.5" />
              <FormattedMessage id="candidate.cv.preview.viewOriginal" />
            </Button>
            <Button size="sm" onClick={() => downloadPdf(contentRef.current)} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              <FormattedMessage
                id={isDownloading ? 'candidate.cv.optimization.downloading' : 'candidate.cv.optimization.download'}
              />
            </Button>
          </div>
        )}
      </div>

      <CvScaledPreview ref={contentRef} template={template} data={renderData} className="min-h-0 flex-1" />

      <CvFullscreenPreviewDialog
        panel={fullscreenPanel}
        onClose={closeFullscreen}
        originalCvUrl={originalCvUrl}
        renderData={renderData}
        template={template}
      />
    </div>
  )
}
