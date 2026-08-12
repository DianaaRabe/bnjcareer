import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLJSON } from 'graphql-scalars'
import { authTypeDefs } from './modules/auth/typeDefs.js'
import { authResolvers } from './modules/auth/resolvers.js'
import { profilesTypeDefs } from './modules/profiles/typeDefs.js'
import { profilesResolvers } from './modules/profiles/resolvers.js'
import { cvTypeDefs } from './modules/cv/typeDefs.js'
import { cvResolvers } from './modules/cv/resolvers.js'
import { jobsTypeDefs } from './modules/jobs/typeDefs.js'
import { jobsResolvers } from './modules/jobs/resolvers.js'

// Merges all modules — each new domain adds its typeDefs + resolvers here.
export const schema = makeExecutableSchema({
  typeDefs: [
    authTypeDefs,
    profilesTypeDefs,
    cvTypeDefs,
    jobsTypeDefs,
  ],
  resolvers: [
    authResolvers,
    profilesResolvers,
    cvResolvers,
    jobsResolvers,
    { JSON: GraphQLJSON },
  ],
})
