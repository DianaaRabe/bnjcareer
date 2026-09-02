import { FormattedMessage } from 'react-intl'

import type { CvImprovement } from './useCv'

const CATEGORY_LABEL_IDS: Record<string, string> = {
  structure: 'candidate.cv.optimization.category.structure',
  keywords: 'candidate.cv.optimization.category.keywords',
  content: 'candidate.cv.optimization.category.content',
  formatting: 'candidate.cv.optimization.category.formatting',
  skills: 'candidate.cv.optimization.category.skills',
  profile: 'candidate.cv.optimization.category.profile',
}

const IMPACT_LABEL_IDS: Record<string, string> = {
  high: 'candidate.cv.optimization.impact.high',
  medium: 'candidate.cv.optimization.impact.medium',
  low: 'candidate.cv.optimization.impact.low',
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'bg-primary/15 text-primary',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
}

type CvImprovementsGridProps = {
  improvements: CvImprovement[]
}

export const CvImprovementsGrid = ({ improvements }: CvImprovementsGridProps) => (
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {improvements.map((improvement, i) => {
      const categoryLabelId = CATEGORY_LABEL_IDS[improvement.category]
      const impactLabelId = IMPACT_LABEL_IDS[improvement.impact] ?? IMPACT_LABEL_IDS.low
      const impactStyle = IMPACT_STYLES[improvement.impact] ?? IMPACT_STYLES.low

      return (
        <div key={i} className="rounded-lg border bg-card p-4 shadow-xs">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              {categoryLabelId ? <FormattedMessage id={categoryLabelId} /> : improvement.category}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${impactStyle}`}>
              <FormattedMessage id={impactLabelId} />
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{improvement.description}</p>
        </div>
      )
    })}
  </div>
)
