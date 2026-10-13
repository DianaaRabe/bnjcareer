// Maps the applications SDL types onto the service's own view shapes, so resolvers return
// those shapes (plain strings for enum fields) rather than the generated SDL types. Mirrors the
// automation module's mapper approach — see codegen.ts `mappers`.
export type {
  ApplicationDeliveryView as GraphQLApplicationDelivery,
  CandidateApplicationView as GraphQLCandidateApplication,
  CandidateApplicationStatsView as GraphQLCandidateApplicationStats,
} from './applicationsService.js'
