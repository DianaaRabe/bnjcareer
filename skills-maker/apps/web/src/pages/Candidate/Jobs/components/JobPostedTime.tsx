import { FormattedRelativeTime } from 'react-intl'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

/** Coarsest unit that still yields a non-zero value, so "3 days ago" wins over "72 hours ago". */
const toRelativeParts = (postedAt: string) => {
  const elapsedMs = Math.max(Date.now() - new Date(postedAt).getTime(), 0)
  if (elapsedMs >= DAY_MS) return { value: -Math.floor(elapsedMs / DAY_MS), unit: 'day' as const }
  if (elapsedMs >= HOUR_MS) return { value: -Math.floor(elapsedMs / HOUR_MS), unit: 'hour' as const }
  return { value: -Math.floor(elapsedMs / MINUTE_MS), unit: 'minute' as const }
}

/** Null when the source publishes no date — the caller renders nothing then. */
type JobPostedTimeProps = { postedAt: string | null | undefined; className?: string }

export const JobPostedTime = ({ postedAt, className }: JobPostedTimeProps) => {
  if (!postedAt) return null

  const { value, unit } = toRelativeParts(postedAt)

  return (
    <span className={className}>
      <FormattedRelativeTime value={value} unit={unit} numeric="auto" />
    </span>
  )
}
