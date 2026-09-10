import type { CodegenConfig } from '@graphql-codegen/cli'

// Generates resolver types from the GraphQL schema (each module's typeDefs). Run: npm run codegen
const config: CodegenConfig = {
  schema: './src/graphql/modules/**/typeDefs.ts',
  generates: {
    './src/gql/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../context#Context',
        // Reuse Prisma enums as GraphQL enums — single source of truth.
        enumValues: {
          Role: '@prisma/client#Role',
          ProfileSituation: '@prisma/client#ProfileSituation',
          ProfileObjective: '@prisma/client#ProfileObjective',
          CvStatus: '@prisma/client#CvStatus',
          // The SDL declares these enums; the provider layer holds the matching TS types,
          // so resolvers and providers share one definition instead of two.
          JobSource: '../lib/jobs/types.js#JobSourceId',
          SalaryPeriod: '../lib/jobs/types.js#SalaryPeriod',
          ContractType: '../lib/jobs/types.js#ContractType',
          ExperienceLevel: '../lib/jobs/types.js#ExperienceLevel',
          WorkTime: '../lib/jobs/types.js#WorkTime',
          PostedWithin: '../lib/jobs/types.js#PostedWithin',
          JobFilterKind: '../lib/jobs/types.js#JobFilterKind',
          CoachingGoalKey: '../graphql/modules/coaching/coachingConstants.js#CoachingGoalKeyId',
          TrainingCategory: '@prisma/client#TrainingCategory',
          TrainingLevel: '@prisma/client#TrainingLevel',
          CoachExpertise: '@prisma/client#CoachExpertise',
          ResourceType: '@prisma/client#ResourceType',
          ResourceCategory: '@prisma/client#ResourceCategory',
          ResourceAccess: '@prisma/client#ResourceAccess',
          EventType: '@prisma/client#EventType',
          EventStatus: '@prisma/client#EventStatus',
          BookingStatus: '@prisma/client#BookingStatus',
          ApplicationStatus: '@prisma/client#ApplicationStatus',
        },
        // The service returns its own shapes — resolvers see those, not the SDL types.
        mappers: {
          Training: '../graphql/modules/trainings/trainingsMappers.js#GraphQLTraining',
          CoachTraining: '../graphql/modules/trainings/trainingsMappers.js#GraphQLCoachTraining',
          TrainingModule: '../graphql/modules/trainings/trainingsMappers.js#GraphQLTrainingModule',
          Coach: '../graphql/modules/coaches/coachesMappers.js#GraphQLCoach',
          CoachSession: '../graphql/modules/sessions/sessionsMappers.js#GraphQLCoachSession',
          SessionAttendee: '../graphql/modules/sessions/sessionsMappers.js#GraphQLSessionAttendee',
          Resource: '../graphql/modules/resources/resourcesMappers.js#GraphQLResource',
          CoachResource: '../graphql/modules/resources/resourcesMappers.js#GraphQLCoachResource',
        },
        useIndexSignature: true,
      },
    },
  },
}

export default config
