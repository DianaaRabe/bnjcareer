import { cn } from '@/lib/utils'
import type { JobListItem } from '../constants'

type JobCompanyAvatarProps = { job: JobListItem; className?: string }

export const JobCompanyAvatar = ({ job, className }: JobCompanyAvatarProps) => (
  <span
    aria-hidden
    className={cn(
      'flex size-9 flex-none items-center justify-center rounded-xl text-sm font-bold',
      job.avatar.bg,
      job.avatar.fg,
      className,
    )}
  >
    {job.initial}
  </span>
)
