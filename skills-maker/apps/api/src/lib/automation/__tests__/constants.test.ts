import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AUTOMATION_CEILINGS,
  AUTOMATION_DEFAULTS,
  nextRunAt,
  resolveAutomationSettings,
  type AutomationSettingsRow,
} from '../constants.js'

const row = (overrides: Partial<AutomationSettingsRow> = {}): AutomationSettingsRow => ({
  enabled: true,
  frequency: 'WEEKLY',
  maxApplicationsPerRun: null,
  maxApplicationsPerDay: null,
  minMatchScore: null,
  approvalMode: true,
  keywords: [],
  locations: [],
  contractTypes: [],
  ...overrides,
})

describe('resolveAutomationSettings', () => {
  it('leaves automation disabled when there is no settings row at all', () => {
    const settings = resolveAutomationSettings(null)

    assert.equal(settings.enabled, false)
  })

  it('fills every unset value from the server defaults', () => {
    const settings = resolveAutomationSettings(row())

    assert.equal(settings.maxApplicationsPerRun, AUTOMATION_DEFAULTS.maxApplicationsPerRun)
    assert.equal(settings.maxApplicationsPerDay, AUTOMATION_DEFAULTS.maxApplicationsPerDay)
    assert.equal(settings.minMatchScore, AUTOMATION_DEFAULTS.minMatchScore)
    assert.equal(settings.approvalMode, true)
  })

  it('clamps a candidate value to the server ceiling instead of trusting it', () => {
    const settings = resolveAutomationSettings(
      row({ maxApplicationsPerRun: 999, maxApplicationsPerDay: 999, minMatchScore: 400 }),
    )

    assert.equal(settings.maxApplicationsPerRun, AUTOMATION_CEILINGS.maxApplicationsPerRun)
    assert.equal(settings.maxApplicationsPerDay, AUTOMATION_CEILINGS.maxApplicationsPerDay)
    assert.equal(settings.minMatchScore, AUTOMATION_CEILINGS.minMatchScore)
  })

  it('never lets automation be unlimited — a zero or negative value becomes 1', () => {
    const settings = resolveAutomationSettings(row({ maxApplicationsPerRun: 0, maxApplicationsPerDay: -3 }))

    assert.equal(settings.maxApplicationsPerRun, 1)
    assert.equal(settings.maxApplicationsPerDay, 1)
  })

  it('treats approvalMode strictly: only an explicit false turns review off', () => {
    assert.equal(resolveAutomationSettings(row({ approvalMode: true })).approvalMode, true)
    assert.equal(resolveAutomationSettings(row({ approvalMode: false })).approvalMode, false)
  })

  it('keeps a disabled row disabled', () => {
    assert.equal(resolveAutomationSettings(row({ enabled: false })).enabled, false)
  })

  it('copies filter arrays rather than aliasing the stored row', () => {
    const source = row({ keywords: ['dev'] })
    const settings = resolveAutomationSettings(source)

    settings.keywords.push('mutated')
    assert.deepEqual(source.keywords, ['dev'])
  })
})

describe('nextRunAt', () => {
  it('adds the frequency interval to the given instant', () => {
    const from = new Date('2026-01-01T00:00:00.000Z')

    assert.equal(nextRunAt('DAILY', from).toISOString(), '2026-01-02T00:00:00.000Z')
    assert.equal(nextRunAt('WEEKLY', from).toISOString(), '2026-01-08T00:00:00.000Z')
  })
})
