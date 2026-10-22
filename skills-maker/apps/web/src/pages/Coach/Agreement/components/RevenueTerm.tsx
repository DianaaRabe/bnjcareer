import type { LucideIcon } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

type RevenueTermProps = {
  icon: LucideIcon
  titleId: string
  descriptionId: string
  footnoteId: string
  /** Both figures come from the API, so the page cannot state a split the signature contradicts. */
  sharePct: number
  remainderPct: number
}

export const RevenueTerm = ({
  icon: Icon,
  titleId,
  descriptionId,
  footnoteId,
  sharePct,
  remainderPct,
}: RevenueTermProps) => (
  <section className="flex flex-col gap-2">
    <h2 className="flex items-center gap-2 text-[14.5px] font-semibold">
      <Icon className="size-4 flex-none text-primary" strokeWidth={2} />
      <FormattedMessage id={titleId} />
    </h2>

    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
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

    <p className="text-[12.5px] text-muted-foreground">
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
  </section>
)
