import { Award } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import { VISIBLE_CERTIFICATIONS } from '../constants'

type CoachCertificationsProps = {
  certifications: string[]
}

export const CoachCertifications = ({ certifications }: CoachCertificationsProps) => {
  const intl = useIntl()

  if (certifications.length === 0) {
    return null
  }

  const visible = certifications.slice(0, VISIBLE_CERTIFICATIONS)
  const hidden = certifications.slice(VISIBLE_CERTIFICATIONS)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((certification) => (
        <Badge
          key={certification}
          variant="secondary"
          className="gap-1 text-[11px] font-semibold text-muted-foreground"
        >
          <Award className="size-3" />
          {certification}
        </Badge>
      ))}
      {hidden.length > 0 && (
        // The full list is the tooltip — the card stays one line whatever the coach entered.
        <span
          className="text-[11px] font-semibold text-muted-foreground"
          title={hidden.join(', ')}
        >
          {intl.formatMessage({ id: 'candidate.coaches.certifications.more' }, { count: hidden.length })}
        </span>
      )}
    </div>
  )
}
