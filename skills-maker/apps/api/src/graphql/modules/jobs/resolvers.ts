import type { QueryResolvers } from '@gql/resolvers-types.js'
import { requireUser } from '@/lib/rbac.js'
import { listConfiguredSources, searchJobs } from './jobsService.js'
import { toGraphQLJob } from './jobsMappers.js'

const jobSources: QueryResolvers['jobSources'] = (_parent, _args, ctx) => {
  requireUser(ctx)
  return listConfiguredSources()
}

const searchJobsQuery: QueryResolvers['searchJobs'] = async (_parent, args, ctx) => {
  requireUser(ctx)
  const { jobs, total, source } = await searchJobs(args.input)
  return { source, total, jobs: jobs.map(toGraphQLJob) }
}

export const jobsResolvers = {
  Query: { jobSources, searchJobs: searchJobsQuery },
}
