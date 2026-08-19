import type { Training } from '@prisma/client'

export type GraphQLTraining = {
  id: string
  title: string
  description: string | null
  category: Training['category']
  level: Training['level']
  priceCents: number | null
  modules: number
  durationDays: number
  instructor: string | null
  certificate: boolean
}

/** Drops the catalog-management fields (published, createdAt) the candidate has no use for. */
export function toGraphQLTraining(training: Training): GraphQLTraining {
  return {
    id: training.id,
    title: training.title,
    description: training.description,
    category: training.category,
    level: training.level,
    priceCents: training.priceCents,
    modules: training.modules,
    durationDays: training.durationDays,
    instructor: training.instructor,
    certificate: training.certificate,
  }
}
