import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
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

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
