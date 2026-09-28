import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { getToken } from '@/lib/auth'

export const GRAPHQL_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4100/graphql'

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
})

// Attach the JWT (from localStorage) to every request.
const authLink = setContext((_operation, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

// Subscriptions cannot travel over HTTP — they get their own socket to the same endpoint.
const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_URL.replace(/^http/, 'ws'),
    // The handshake carries no headers we control; the token goes in the connection payload.
    connectionParams: () => {
      const token = getToken()
      return token ? { authorization: `Bearer ${token}` } : {}
    },
  }),
)

const isSubscription = ({ query }: { query: Parameters<typeof getMainDefinition>[0] }) => {
  const definition = getMainDefinition(query)
  return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
}

export const apolloClient = new ApolloClient({
  link: split(isSubscription, wsLink, authLink.concat(httpLink)),
  cache: new InMemoryCache(),
})

/**
 * `extensions.code` of the first GraphQL error, if any. Server messages are not localized:
 * feature hooks map this code to a translation key rather than rendering `error.message`.
 */
export function getGraphQLErrorCode(err: unknown): string | undefined {
  const graphQLErrors = (err as { graphQLErrors?: { extensions?: { code?: string } }[] } | undefined)
    ?.graphQLErrors
  return graphQLErrors?.[0]?.extensions?.code
}
