import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import type { QuickLink } from './useDashboard'

export const QuickAccessCard = ({ to, labelId, descriptionId }: QuickLink) => (
  <Link
    to={to}
    className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
  >
    <Card className="h-full transition-all group-hover:ring-primary/30 group-hover:shadow-md">
      <CardContent className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">
          <FormattedMessage id={labelId} />
        </p>
        <p className="text-xs text-muted-foreground">
          <FormattedMessage id={descriptionId} />
        </p>
      </CardContent>
    </Card>
  </Link>
)
