import type { MutationResolvers, QueryResolvers } from '@gql/resolvers-types.js'
import {
  cancelPreparedApplication,
  getMyAutomationRuns,
  getMyAutomationSettings,
  getMyPreparedApplications,
  setAutomationEnabled,
  updateAutomationSettings,
} from './automationService.js'

const myAutomationSettings: QueryResolvers['myAutomationSettings'] = (_parent, _args, ctx) =>
  getMyAutomationSettings(ctx)

const myAutomationRuns: QueryResolvers['myAutomationRuns'] = (_parent, args, ctx) =>
  getMyAutomationRuns(ctx, args.limit)

const myPreparedApplications: QueryResolvers['myPreparedApplications'] = (_parent, _args, ctx) =>
  getMyPreparedApplications(ctx)

const updateAutomationSettingsMutation: MutationResolvers['updateAutomationSettings'] = (_parent, args, ctx) =>
  updateAutomationSettings(ctx, args.input)

const setAutomationEnabledMutation: MutationResolvers['setAutomationEnabled'] = (_parent, args, ctx) =>
  setAutomationEnabled(ctx, args.enabled)

const cancelPreparedApplicationMutation: MutationResolvers['cancelPreparedApplication'] = (_parent, args, ctx) =>
  cancelPreparedApplication(ctx, args.id)

export const automationResolvers = {
  Query: {
    myAutomationSettings,
    myAutomationRuns,
    myPreparedApplications,
  },
  Mutation: {
    updateAutomationSettings: updateAutomationSettingsMutation,
    setAutomationEnabled: setAutomationEnabledMutation,
    cancelPreparedApplication: cancelPreparedApplicationMutation,
  },
}
