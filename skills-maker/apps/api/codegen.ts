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
        },
        useIndexSignature: true,
      },
    },
  },
}

export default config
