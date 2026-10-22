import { StatCard, STAT_FORMAT } from '@/components/common/StatCard/StatCard'
import type { MyApplicationStatsQuery } from '@/gql/graphql'

type Stats = MyApplicationStatsQuery['myApplicationStats']

/** The four counters that matter most to a candidate glancing at their pipeline. */
export const ApplicationsStats = ({ stats }: { stats: Stats }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <StatCard
      labelId="candidate.applications.stats.total"
      value={stats.total}
      format={STAT_FORMAT.count}
    />
    <StatCard
      labelId="candidate.applications.stats.sent"
      value={stats.sent}
      format={STAT_FORMAT.count}
    />
    <StatCard
      labelId="candidate.applications.stats.interview"
      value={stats.interview}
      format={STAT_FORMAT.count}
    />
    <StatCard
      labelId="candidate.applications.stats.awaitingReview"
      value={stats.awaitingReview}
      format={STAT_FORMAT.count}
    />
  </div>
)
