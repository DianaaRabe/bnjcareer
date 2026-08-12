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
        },
        useIndexSignature: true,
      },
    },
  },
}

export default config
