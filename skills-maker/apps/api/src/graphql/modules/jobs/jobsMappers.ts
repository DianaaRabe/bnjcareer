import type { Job, JobSalary } from '@gql/resolvers-types.js'
import type { NormalizedJob, NormalizedSalary } from '@/lib/jobs/index.js'

function toGraphQLSalary(salary: NormalizedSalary | null): JobSalary | null {
  if (!salary) return null
  return {
    label: salary.label,
    min: salary.min,
    max: salary.max,
    currency: salary.currency,
    period: salary.period,
  }
}

export function toGraphQLJob(job: NormalizedJob): Job {
  return {
    id: job.id,
    source: job.source,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    applyUrl: job.applyUrl,
    postedAt: job.postedAt,
    salary: toGraphQLSalary(job.salary),
    tags: job.tags,
    isRemote: job.isRemote,
  }
}
