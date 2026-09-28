import { Flame } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

type StreakBannerProps = {
  days: number
}

export const StreakBanner = ({ days }: StreakBannerProps) => (
  <section className="flex items-center gap-3 border-b border-border py-[18px]">
    <Flame className="size-[19px] shrink-0 text-warning" strokeWidth={2} />
    <div>
      <h2 className="text-[14.5px] font-semibold">
        <FormattedMessage id="candidate.coaching.streak.title" />
      </h2>
      <p className="mt-0.5 text-[12.5px] text-muted-foreground">
        <FormattedMessage id="candidate.coaching.streak.days" values={{ count: days }} />
      </p>
    </div>
  </section>
)
