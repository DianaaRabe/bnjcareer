import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { useServer } from 'graphql-ws/use/ws'
import { WebSocketServer } from 'ws'
import { env } from './config/env.js'
import { schema } from './graphql/schema.js'
import { buildContext, contextFromAuthHeader, type Context } from './context.js'
import { cvUploadRouter } from './routes/cvUpload.js'

const SUBSCRIPTIONS_PATH = '/graphql'

async function main() {
  const app = express()
  const httpServer = createServer(app)

  // Subscriptions travel over WebSocket: HTTP cannot stream a GraphQL response.
  const wsServer = new WebSocketServer({ server: httpServer, path: SUBSCRIPTIONS_PATH })
  const wsCleanup = useServer(
    {
      schema,
      // The handshake carries no headers we control — the client sends the token here.
      context: (wsContext) => {
        const params = wsContext.connectionParams as { authorization?: string } | undefined
        return contextFromAuthHeader(params?.authorization)
      },
    },
    wsServer,
  )

  const apollo = new ApolloServer<Context>({
    schema,
    plugins: [
      {
        // Close live sockets when Apollo shuts down, otherwise the process hangs.
        async serverWillStart() {
          return { async drainServer() { await wsCleanup.dispose() } }
        },
      },
    ],
  })
  await apollo.start()

  app.use(
    '/graphql',
    cors({ origin: env.CORS_ORIGIN, credentials: true }),
    express.json(),
    expressMiddleware(apollo, { context: buildContext }),
  )

  app.use(
    '/uploads',
    cors({ origin: env.CORS_ORIGIN }),
    express.static(env.UPLOAD_DIR),
    cvUploadRouter,
  )

  app.get('/health', (_req, res) => res.json({ ok: true }))

  httpServer.listen(env.PORT, () => {
    console.log(`🚀 API ready at http://localhost:${env.PORT}/graphql`)
    console.log(`   subscriptions on ws://localhost:${env.PORT}${SUBSCRIPTIONS_PATH}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
