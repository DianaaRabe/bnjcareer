import { FormattedMessage, FormattedNumber } from 'react-intl'

import { Badge } from '@/components/ui/badge'

type TrainingPriceProps = {
  /** Null means the training is free. */
  priceCents?: number | null
}

export const TrainingPrice = ({ priceCents }: TrainingPriceProps) =>
  priceCents == null ? (
    <Badge className="bg-success/10 font-bold text-success">
      <FormattedMessage id="candidate.formations.free" />
    </Badge>
  ) : (
    <span className="text-[15px] font-bold">
      <FormattedNumber
        value={priceCents / 100}
        style="currency"
        currency="EUR"
        maximumFractionDigits={0}
      />
    </span>
  )
