import { forwardRef, useState } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useIntl } from 'react-intl'

import type { CvTemplate } from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { CvTemplateRenderer } from './templates/CvTemplateRenderer'
import type { CvRenderData } from './templates/types'

const MIN_ZOOM = 0.4
const MAX_ZOOM = 1
const STEP = 0.1
const DEFAULT_ZOOM = 0.6

interface CvScaledPreviewProps {
  template: CvTemplate
  data: CvRenderData
  className?: string
}

/**
 * Renders the CV zoomed out by default so a full page fits without much scrolling.
 * The zoom is purely visual (CSS `zoom` on the wrapper); the forwarded ref points at the
 * natural-size renderer so the PDF export stays full resolution.
 */
export const CvScaledPreview = forwardRef<HTMLDivElement, CvScaledPreviewProps>(
  ({ template, data, className }, ref) => {
    const intl = useIntl()
    const [zoom, setZoom] = useState(DEFAULT_ZOOM)

    const clamp = (v: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(v * 10) / 10))
    const iconBtn =
      'flex size-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'

    return (
      <div className={cn('flex flex-col', className)}>
        <div className="flex items-center justify-end gap-1 border-b bg-muted/40 px-3 py-1.5">
          <button
            type="button"
            className={iconBtn}
            onClick={() => setZoom((z) => clamp(z - STEP))}
            disabled={zoom <= MIN_ZOOM}
            aria-label={intl.formatMessage({ id: 'candidate.cv.preview.zoomOut' })}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-11 text-center text-xs font-medium tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setZoom((z) => clamp(z + STEP))}
            disabled={zoom >= MAX_ZOOM}
            aria-label={intl.formatMessage({ id: 'candidate.cv.preview.zoomIn' })}
          >
            <Plus className="size-4" />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setZoom(DEFAULT_ZOOM)}
            aria-label={intl.formatMessage({ id: 'candidate.cv.preview.zoomReset' })}
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-muted p-4">
          <div style={{ zoom }}>
            <CvTemplateRenderer ref={ref} template={template} data={data} />
          </div>
        </div>
      </div>
    )
  },
)

CvScaledPreview.displayName = 'CvScaledPreview'
