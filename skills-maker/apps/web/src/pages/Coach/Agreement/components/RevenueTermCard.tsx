import type { LucideIcon } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Card } from '@/components/ui/card'

type RevenueTermCardProps = {
  icon: LucideIcon
  titleId: string
  descriptionId: string
  footnoteId: string
  /** Both figures come from the API, so the page cannot state a split the signature contradicts. */
  sharePct: number
  remainderPct: number
}

export const RevenueTermCard = ({
  icon: Icon,
  titleId,
  descriptionId,
  footnoteId,
  sharePct,
  remainderPct,
}: RevenueTermCardProps) => (
  <Card className="flex flex-col gap-4 p-4">
    <div className="flex items-center gap-2">
      <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-accent">
        <Icon className="size-4 text-primary" />
      </div>
      <h2 className="text-[14.5px] font-semibold">
        <FormattedMessage id={titleId} />
      </h2>
    </div>

    <p className="text-[13px] leading-relaxed text-muted-foreground">
      <FormattedMessage
        id={descriptionId}
        values={{
          share: (
            <strong className="font-bold text-primary">
              <FormattedMessage id="common.format.percent" values={{ value: sharePct }} />
            </strong>
          ),
        }}
      />
    </p>

    <p className="text-[12px] text-muted-foreground">
      <FormattedMessage
        id={footnoteId}
        values={{
          remainder: (
            <strong className="font-semibold text-foreground">
              <FormattedMessage id="common.format.percent" values={{ value: remainderPct }} />
            </strong>
          ),
        }}
      />
    </p>
  </Card>
)
