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
import { matchingTypeDefs } from './modules/matching/typeDefs.js'
import { matchingResolvers } from './modules/matching/resolvers.js'
import { coachingTypeDefs } from './modules/coaching/typeDefs.js'
import { coachingResolvers } from './modules/coaching/resolvers.js'

// Merges all modules — each new domain adds its typeDefs + resolvers here.
export const schema = makeExecutableSchema({
  typeDefs: [
    authTypeDefs,
    profilesTypeDefs,
    cvTypeDefs,
    jobsTypeDefs,
    matchingTypeDefs,
    coachingTypeDefs,
  ],
  resolvers: [
    authResolvers,
    profilesResolvers,
    cvResolvers,
    jobsResolvers,
    matchingResolvers,
    coachingResolvers,
    { JSON: GraphQLJSON },
  ],
})
