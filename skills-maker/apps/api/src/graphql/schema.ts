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
import { trainingsTypeDefs } from './modules/trainings/typeDefs.js'
import { trainingsResolvers } from './modules/trainings/resolvers.js'
import { coachesTypeDefs } from './modules/coaches/typeDefs.js'
import { coachesResolvers } from './modules/coaches/resolvers.js'
import { resourcesTypeDefs } from './modules/resources/typeDefs.js'
import { resourcesResolvers } from './modules/resources/resolvers.js'
import { assistantTypeDefs } from './modules/assistant/typeDefs.js'
import { assistantResolvers } from './modules/assistant/resolvers.js'

// Merges all modules — each new domain adds its typeDefs + resolvers here.
export const schema = makeExecutableSchema({
  typeDefs: [
    authTypeDefs,
    profilesTypeDefs,
    cvTypeDefs,
    jobsTypeDefs,
    matchingTypeDefs,
    coachingTypeDefs,
    trainingsTypeDefs,
    coachesTypeDefs,
    resourcesTypeDefs,
    assistantTypeDefs,
  ],
  resolvers: [
    authResolvers,
    profilesResolvers,
    cvResolvers,
    jobsResolvers,
    matchingResolvers,
    coachingResolvers,
    trainingsResolvers,
    coachesResolvers,
    resourcesResolvers,
    assistantResolvers,
    { JSON: GraphQLJSON },
  ],
})
