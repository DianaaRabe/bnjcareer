import { RelativeTime } from '@/components/common/RelativeTime/RelativeTime'

type JobPostedTimeProps = { postedAt: string | null | undefined; className?: string }

export const JobPostedTime = ({ postedAt, className }: JobPostedTimeProps) => (
  <RelativeTime value={postedAt} className={className} />
)
