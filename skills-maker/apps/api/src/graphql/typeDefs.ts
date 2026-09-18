import { authTypeDefs } from './modules/auth/typeDefs.js'
import { profilesTypeDefs } from './modules/profiles/typeDefs.js'
import { cvTypeDefs } from './modules/cv/typeDefs.js'
import { jobsTypeDefs } from './modules/jobs/typeDefs.js'
import { matchingTypeDefs } from './modules/matching/typeDefs.js'
import { coachingTypeDefs } from './modules/coaching/typeDefs.js'
import { trainingsTypeDefs } from './modules/trainings/typeDefs.js'
import { coachesTypeDefs } from './modules/coaches/typeDefs.js'
import { resourcesTypeDefs } from './modules/resources/typeDefs.js'
import { assistantTypeDefs } from './modules/assistant/typeDefs.js'
import { coachAgreementTypeDefs } from './modules/coachAgreement/typeDefs.js'
import { coachDashboardTypeDefs } from './modules/coachDashboard/typeDefs.js'

// Single source of truth for the module typeDefs. Imported by schema.ts (with
// resolvers, for the runtime schema) and by scripts/print-schema.ts (typeDefs
// only, to emit the committed SDL that the web build's codegen consumes offline).
export const allTypeDefs = [
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
  coachAgreementTypeDefs,
  coachDashboardTypeDefs,
]
