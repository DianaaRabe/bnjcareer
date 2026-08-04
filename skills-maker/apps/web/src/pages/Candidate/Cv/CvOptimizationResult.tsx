import { useRef } from 'react'
import { Download, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { FormattedDate, FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CvImprovement } from './useCv'
import { CvComparisonPanel } from './CvComparisonPanel'
import { CvFullscreenPreviewDialog } from './CvFullscreenPreviewDialog'
import { CvImprovementsGrid } from './CvImprovementsGrid'
import { useCvOptimizationResult } from './useCvOptimizationResult'

type CvOptimizationResultProps = {
  originalCvUrl: string | null
  optimizedHtml: string
  optimizedAt: string | null
  improvements: CvImprovement[]
  onReOptimize: () => void
  isReOptimizing: boolean
}

export const CvOptimizationResult = ({
  originalCvUrl,
  optimizedHtml,
  optimizedAt,
  improvements,
  onReOptimize,
  isReOptimizing,
}: CvOptimizationResultProps) => {
  const { fullscreenPanel, openFullscreen, closeFullscreen, isDownloading, downloadPdf } =
    useCvOptimizationResult(optimizedHtml)
  const optimizedContentRef = useRef<HTMLDivElement>(null)

  const highImpactCount = improvements.filter((i) => i.impact === 'high').length

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-5 shadow-xs">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-[18px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">
                <FormattedMessage id="candidate.cv.optimization.optimized.label" />
              </h2>
              <Badge variant="secondary" className="text-primary">
                <FormattedMessage id="candidate.cv.optimization.badge" />
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <FormattedMessage
                id="candidate.cv.optimization.summary"
                values={{ total: improvements.length, high: highImpactCount }}
              />
              {optimizedAt && (
                <>
                  {' · '}
                  <FormattedDate value={optimizedAt} day="numeric" month="long" year="numeric" />
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Button variant="outline" size="lg" onClick={onReOptimize} disabled={isReOptimizing}>
            <RefreshCw className={`size-3.5 ${isReOptimizing ? 'animate-spin' : ''}`} />
            <FormattedMessage id="candidate.cv.optimization.reoptimize" />
          </Button>
          <Button size="lg" onClick={() => downloadPdf(optimizedContentRef.current)} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            <FormattedMessage
              id={isDownloading ? 'candidate.cv.optimization.downloading' : 'candidate.cv.optimization.download'}
            />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="comparison">
        <TabsList>
          <TabsTrigger value="comparison">
            <FormattedMessage id="candidate.cv.optimization.tabs.comparison" />
          </TabsTrigger>
          <TabsTrigger value="improvements">
            <FormattedMessage id="candidate.cv.optimization.tabs.improvements" /> ({improvements.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="comparison">
          <CvComparisonPanel
            originalCvUrl={originalCvUrl}
            optimizedHtml={optimizedHtml}
            optimizedContentRef={optimizedContentRef}
            onZoom={openFullscreen}
          />
        </TabsContent>
        <TabsContent value="improvements">
          <CvImprovementsGrid improvements={improvements} />
        </TabsContent>
      </Tabs>

      <CvFullscreenPreviewDialog
        panel={fullscreenPanel}
        onClose={closeFullscreen}
        originalCvUrl={originalCvUrl}
        optimizedHtml={optimizedHtml}
      />
    </div>
  )
}
