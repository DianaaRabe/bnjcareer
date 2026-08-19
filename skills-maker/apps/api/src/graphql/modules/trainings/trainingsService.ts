import type { Context } from '@/context.js'
import { toGraphQLTraining, type GraphQLTraining } from './trainingsMappers.js'

export async function listTrainings(ctx: Context): Promise<GraphQLTraining[]> {
  const trainings = await ctx.prisma.training.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })

  return trainings.map(toGraphQLTraining)
}
