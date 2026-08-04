import type { RefObject } from 'react'
import { FileText, Sparkles, ZoomIn } from 'lucide-react'
import { FormattedMessage, useIntl } from 'react-intl'

type CvComparisonPanelProps = {
  originalCvUrl: string | null
  optimizedHtml: string
  optimizedContentRef: RefObject<HTMLDivElement>
  onZoom: (panel: 'original' | 'optimized') => void
}

export const CvComparisonPanel = ({
  originalCvUrl,
  optimizedHtml,
  optimizedContentRef,
  onZoom,
}: CvComparisonPanelProps) => {
  const intl = useIntl()

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-destructive" />
            <span className="text-sm font-semibold">
              <FormattedMessage id="candidate.cv.optimization.original.label" />
            </span>
          </div>
          <button
            onClick={() => onZoom('original')}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
            aria-label={intl.formatMessage({ id: 'candidate.cv.optimization.zoom' })}
          >
            <ZoomIn className="size-4" />
          </button>
        </div>
        <div className="h-[480px] overflow-auto bg-background p-3">
          {originalCvUrl ? (
            <iframe
              src={originalCvUrl}
              title={intl.formatMessage({ id: 'candidate.cv.optimization.original.label' })}
              className="size-full rounded-md border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileText className="size-8 opacity-40" />
              <p className="text-[13px]">
                <FormattedMessage id="candidate.cv.optimization.original.empty" />
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-primary/20 bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-primary/15 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-success" />
            <span className="text-sm font-semibold text-primary">
              <FormattedMessage id="candidate.cv.optimization.optimized.label" />
            </span>
            <Sparkles className="size-3.5 text-primary" />
          </div>
          <button
            onClick={() => onZoom('optimized')}
            className="cursor-pointer text-primary/50 hover:text-primary"
            aria-label={intl.formatMessage({ id: 'candidate.cv.optimization.zoom' })}
          >
            <ZoomIn className="size-4" />
          </button>
        </div>
        <div className="h-[480px] overflow-auto bg-background p-3">
          <div ref={optimizedContentRef} dangerouslySetInnerHTML={{ __html: optimizedHtml }} />
        </div>
      </div>
    </div>
  )
}
