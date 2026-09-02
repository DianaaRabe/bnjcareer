import type { CodegenConfig } from '@graphql-codegen/cli'

// Generates TS types from the backend GraphQL schema. Requires the API running.
const config: CodegenConfig = {
  schema: 'http://localhost:4100/graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
  ignoreNoDocuments: true,
}

export default config
