import { AlertCircle } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'

/** Shared warning badge for a candidate with no session left ahead — used by the candidates list and the dashboard. */
export const FollowUpBadge = () => (
  <Badge className="gap-1 bg-warning/10 text-[11px] font-bold text-warning">
    <AlertCircle className="size-3" />
    <FormattedMessage id="coach.candidates.needsFollowUp" />
  </Badge>
)
