import { forwardRef } from 'react'

import { CvTemplate } from '@/gql/graphql'

import { AtsTemplate } from './AtsTemplate'
import { CreativeTemplate } from './CreativeTemplate'
import { ProfessionalTemplate } from './ProfessionalTemplate'
import type { CvRenderData } from './types'

interface CvTemplateRendererProps {
  template: CvTemplate
  data: CvRenderData
}

/**
 * Renders the chosen layout from layout-agnostic data. Switching `template` re-renders instantly,
 * with no LLM round-trip — only the structure changes, the content stays identical.
 * Forwards a ref to the root node so the PDF exporter can target the rendered DOM.
 */
export const CvTemplateRenderer = forwardRef<HTMLDivElement, CvTemplateRendererProps>(
  ({ template, data }, ref) => (
    <div ref={ref}>
      {template === CvTemplate.Professional ? (
        <ProfessionalTemplate data={data} />
      ) : template === CvTemplate.Creative ? (
        <CreativeTemplate data={data} />
      ) : (
        <AtsTemplate data={data} />
      )}
    </div>
  ),
)

CvTemplateRenderer.displayName = 'CvTemplateRenderer'
