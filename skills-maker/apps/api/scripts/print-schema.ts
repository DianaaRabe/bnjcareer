import { makeExecutableSchema } from '@graphql-tools/schema'
import { printSchema, lexicographicSortSchema } from 'graphql'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { allTypeDefs } from '../src/graphql/typeDefs.js'

// Emits the merged GraphQL SDL so the web build can run codegen fully offline
// (no live API needed on Vercel). Build the schema from typeDefs ONLY — no
// resolvers — so this stays free of env/Prisma/runtime imports.
const schema = makeExecutableSchema({ typeDefs: allTypeDefs })

const sdl = printSchema(lexicographicSortSchema(schema))

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.resolve(here, '../../web/schema.graphql')

writeFileSync(out, sdl + '\n', 'utf8')
console.log(`Wrote schema SDL -> ${out}`)
