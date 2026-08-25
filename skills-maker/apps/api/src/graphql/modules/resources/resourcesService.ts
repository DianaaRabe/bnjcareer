import type { Context } from '@/context.js'
import { toGraphQLResource, type GraphQLResource } from './resourcesMappers.js'

export async function listResources(ctx: Context): Promise<GraphQLResource[]> {
  const resources = await ctx.prisma.resource.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return resources.map(toGraphQLResource)
}
