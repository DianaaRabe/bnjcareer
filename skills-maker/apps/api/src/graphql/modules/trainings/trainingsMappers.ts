import type { Training, TrainingModule } from '@prisma/client'

export type TrainingWithCount = Training & { _count: { curriculum: number } }
export type TrainingWithCurriculum = TrainingWithCount & { curriculum: TrainingModule[] }

export type GraphQLTrainingModule = {
  id: string
  title: string
  summary: string | null
  position: number
  durationMinutes: number | null
}

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
  curriculum?: GraphQLTrainingModule[]
}

export function toGraphQLTrainingModule(module: TrainingModule): GraphQLTrainingModule {
  return {
    id: module.id,
    title: module.title,
    summary: module.summary,
    position: module.position,
    durationMinutes: module.durationMinutes,
  }
}

/** Drops the catalog-management fields (published, createdAt) the candidate has no use for. */
export function toGraphQLTraining(training: TrainingWithCount): GraphQLTraining {
  return {
    id: training.id,
    title: training.title,
    description: training.description,
    category: training.category,
    level: training.level,
    priceCents: training.priceCents,
    // Derived, never stored — the curriculum rows are the single source of truth.
    modules: training._count.curriculum,
    durationDays: training.durationDays,
    instructor: training.instructor,
    certificate: training.certificate,
  }
}

export function toGraphQLTrainingDetail(training: TrainingWithCurriculum): GraphQLTraining {
  return {
    ...toGraphQLTraining(training),
    curriculum: training.curriculum.map(toGraphQLTrainingModule),
  }
}
