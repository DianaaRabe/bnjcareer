import { FormattedMessage } from 'react-intl'

import { Card, CardContent } from '@/components/ui/card'
import { STAT_FORMAT, type StatFormat, type StatItem } from './useDashboard'

const VALUE_MESSAGE_IDS: Record<StatFormat, string> = {
  [STAT_FORMAT.count]: 'common.format.count',
  [STAT_FORMAT.percent]: 'common.format.percent',
  [STAT_FORMAT.ratio]: 'common.format.ratio',
}

export const StatCard = ({ labelId, value, total, format }: StatItem) => (
  <Card>
    <CardContent className="flex flex-col gap-1">
      <p className="text-2xl font-bold tracking-tight text-foreground">
        <FormattedMessage id={VALUE_MESSAGE_IDS[format]} values={{ value, total }} />
      </p>
      <p className="text-xs text-muted-foreground">
        <FormattedMessage id={labelId} />
      </p>
    </CardContent>
  </Card>
)
