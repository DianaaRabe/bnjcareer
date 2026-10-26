// Mapper shapes for the automation module. The service returns these view types directly, so the
// resolvers hand GraphQL the service's own shapes rather than re-deriving the SDL types. Referenced
// from codegen.ts `mappers`, mirroring the trainings/coaches/resources modules.
import type {
  AutomationRunSummaryView,
  AutomationSettingsView,
  PreparedApplicationView,
} from './automationService.js'

export type GraphQLAutomationSettings = AutomationSettingsView
export type GraphQLAutomationBounds = AutomationSettingsView['ceilings']
export type GraphQLAutomationRunSummary = AutomationRunSummaryView
export type GraphQLPreparedApplication = PreparedApplicationView
