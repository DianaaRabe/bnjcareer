import type { Context } from '@/context.js'
import { toGraphQLCoach, type GraphQLCoach } from './coachesMappers.js'

export async function listCoaches(ctx: Context): Promise<GraphQLCoach[]> {
  const coaches = await ctx.prisma.coachProfile.findMany({
    where: { published: true },
    // Most experienced first; nulls last so an incomplete profile never leads the directory.
    orderBy: [{ yearsExperience: { sort: 'desc', nulls: 'last' } }, { createdAt: 'asc' }],
    include: { user: { include: { profile: true } } },
  })

  return coaches.map(toGraphQLCoach)
}
