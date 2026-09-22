import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLJSON } from 'graphql-scalars'
import { allTypeDefs } from './typeDefs.js'
import { authResolvers } from './modules/auth/resolvers.js'
import { profilesResolvers } from './modules/profiles/resolvers.js'
import { cvResolvers } from './modules/cv/resolvers.js'
import { jobsResolvers } from './modules/jobs/resolvers.js'
import { matchingResolvers } from './modules/matching/resolvers.js'
import { coachingResolvers } from './modules/coaching/resolvers.js'
import { trainingsResolvers } from './modules/trainings/resolvers.js'
import { coachesResolvers } from './modules/coaches/resolvers.js'
import { resourcesResolvers } from './modules/resources/resolvers.js'
import { assistantResolvers } from './modules/assistant/resolvers.js'
import { coachAgreementResolvers } from './modules/coachAgreement/resolvers.js'
import { coachDashboardResolvers } from './modules/coachDashboard/resolvers.js'
import { sessionsResolvers } from './modules/sessions/resolvers.js'

// Merges all modules — each new domain adds its typeDefs (in ./typeDefs.ts) + resolvers here.
export const schema = makeExecutableSchema({
  typeDefs: allTypeDefs,
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
    coachAgreementResolvers,
    coachDashboardResolvers,
    sessionsResolvers,
    { JSON: GraphQLJSON },
  ],
})
