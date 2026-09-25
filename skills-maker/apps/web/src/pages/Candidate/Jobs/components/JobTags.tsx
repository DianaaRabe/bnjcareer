import { Wifi } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components/ui/badge'
import type { JobSalary } from '../constants'
import { JobSalaryBadge } from './JobSalaryBadge'

type JobTagsProps = {
  tags: string[]
  isRemote: boolean
  /** Rendered inline with the tags — the card header shows it separately instead. */
  salary?: JobSalary | null
}

export const JobTags = ({ tags, isRemote, salary = null }: JobTagsProps) => (
  <div className="flex flex-wrap gap-1.5">
    {isRemote && (
      <Badge variant="secondary" className="bg-success/10 font-semibold text-success">
        <Wifi />
        <FormattedMessage id="candidate.jobs.tag.remote" />
      </Badge>
    )}
    {tags.map((tag) => (
      <Badge key={tag} variant="secondary" className="font-semibold">
        {tag}
      </Badge>
    ))}
    {salary && <JobSalaryBadge salary={salary} />}
  </div>
)
