import type { CodegenConfig } from '@graphql-codegen/cli'

// Generates TS types from the backend GraphQL schema.
//
// By default we read the committed SDL snapshot (schema.graphql) so the build is
// fully offline — no running API required (this is what makes `vercel --prod` work).
// Regenerate the snapshot after any API schema change: `npm run schema:export -w apps/api`.
//
// To introspect a live API instead (e.g. against a deployed server), set
// CODEGEN_SCHEMA_URL to its /graphql endpoint.
const config: CodegenConfig = {
  schema: process.env.CODEGEN_SCHEMA_URL || './schema.graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
  ignoreNoDocuments: true,
}

export default config
