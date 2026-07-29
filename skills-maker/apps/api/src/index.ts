import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { env } from './config/env.js'
import { schema } from './graphql/schema.js'
import { buildContext, type Context } from './context.js'

async function main() {
  const app = express()

  const apollo = new ApolloServer<Context>({ schema })
  await apollo.start()

  app.use(
    '/graphql',
    cors({ origin: env.CORS_ORIGIN, credentials: true }),
    express.json(),
    expressMiddleware(apollo, { context: buildContext }),
  )

  app.get('/health', (_req, res) => res.json({ ok: true }))

  app.listen(env.PORT, () => {
    console.log(`🚀 API ready at http://localhost:${env.PORT}/graphql`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
