# Phase 6 — Candidate UI (report)

Date: 2026-10-07
Scope: skill §13–§16, §25, §27 — the candidate-facing surface for automation. A GraphQL
module exposing the candidate's effective settings, their prepared-application review list and
their recent runs; and a React page (replacing the `/dashboard/applications` ComingSoon) to
toggle automation on/off, tune preferences and cancel a prepared application before it is sent.

**No send surface was built, on purpose.** The engine still stops at *preparation* (Phases 3–5).
The UI therefore offers **review + cancel**, not "approve → send": wiring an approve button to a
send that does not exist would be dishonest. The only mutation that fully means something today
is cancellation; enabling schedules a run that prepares, never delivers.

**Every resolver is candidate-scoped.** The signed-in user id is part of every `where` clause,
never a post-hoc filter — one account can neither read nor mutate another's settings or
applications (§8, §27). `hasContact` is exposed as a boolean; the resolved recipient address is
never serialised to the client (§8).

---

## 1. Files

### Added — API

| File | Role |
|---|---|
| `apps/api/src/graphql/modules/automation/typeDefs.ts` | SDL: `AutomationFrequency`/`AutomationRunStatus`/`AutomationStage` enums, `AutomationBounds`/`AutomationSettings`/`AutomationRunSummary`/`PreparedApplication` types, `UpdateAutomationSettingsInput`, three queries, three mutations |
| `apps/api/src/graphql/modules/automation/automationService.ts` | All candidate-scoped logic: load/update settings, explicit enable/disable, runs, prepared list, cancel |
| `apps/api/src/graphql/modules/automation/automationMappers.ts` | Maps the SDL types onto the service's own view shapes (house pattern) |
| `apps/api/src/graphql/modules/automation/resolvers.ts` | Thin resolvers delegating to the service |
| `apps/api/src/graphql/modules/automation/__tests__/automationService.test.ts` | 17 tests (in-memory Prisma double) |

### Added — Web

| File | Role |
|---|---|
| `apps/web/src/graphql/queries/automation.ts` | `MyAutomationSettings`, `MyAutomationRuns`, `MyPreparedApplications` documents |
| `apps/web/src/graphql/mutations/automation.ts` | `UpdateAutomationSettings`, `SetAutomationEnabled`, `CancelPreparedApplication` documents |
| `apps/web/src/graphql/hooks/automation/*` | Six typed hooks + barrel |
| `apps/web/src/pages/Candidate/Applications/Applications.tsx` | The page: master switch, settings column, review column |
| `apps/web/src/pages/Candidate/Applications/useApplications.ts` | View-model: hydrate draft, debounced autosave of preferences, toggle, cancel |
| `apps/web/src/pages/Candidate/Applications/components/AutomationSettingsCard.tsx` | Frequency, volume sliders (clamped to ceilings), approval-mode switch, keyword/location/contract chips |
| `apps/web/src/pages/Candidate/Applications/components/PreparedApplicationsList.tsx` | Review cards with score, contact-found badge, cover-letter preview, cancel |
| `apps/web/src/pages/Candidate/Applications/components/AutomationRunsCard.tsx` | Redacted run history (counters only) |

### Modified

| File | Change |
|---|---|
| `apps/api/src/graphql/typeDefs.ts` | Registered `automationTypeDefs` in `allTypeDefs` |
| `apps/api/src/graphql/schema.ts` | Registered `automationResolvers` |
| `apps/api/codegen.ts` | Added `AutomationFrequency` enumValue + four mappers |
| `apps/api/src/constants/messages.ts` | `automationSettingsInvalid`, `automationApplicationNotFound` |
| `apps/web/schema.graphql` | Regenerated committed SDL snapshot (`npm run schema:export`) |
| `apps/web/src/gql/*` | Regenerated client types (`npm run codegen`) |
| `apps/web/src/graphql/{queries,mutations}/index.ts` | Barrel exports for the new documents |
| `apps/web/src/App.tsx` | `/dashboard/applications` now renders `<CandidateApplications />` instead of `ComingSoon` |
| `apps/web/src/lang/{fr,en-US}.json` | ~48 `candidate.applications.*` messages (both locales) |

---

## 2. Migrations

**None.** This phase adds no columns and runs no schema operation. Every field the service reads
or writes already exists from Phase 2 (`CandidateAutomationSettings`, `Application`,
`AutomationRun`, `ApplicationEvent`). **The remote Supabase database was not touched.**

---

## 3. Tests executed

```
# API
npx tsc --noEmit      → exit 0 (clean)
npm test              → 385 tests, 385 pass, 0 fail

# Web
npx tsc --noEmit      → exit 0 (clean)
npm run build         → built OK (pre-existing chunk-size warning only)
```

Baseline before this phase was 368 passing; **+17 tests**, all green.

`npm run lint` still cannot run — no `eslint.config.js` ships (pre-existing gap, not a regression).

---

## 4. How the honesty rules are enforced in the UI/API seam

1. **Saving preferences can never enable automation (§25).** `updateAutomationSettings` writes
   *only* the preference fields; it never touches `enabled` or `nextRunAt`, and a first-time
   upsert creates the row `enabled: false`. Enabling is a separate, explicit mutation
   (`setAutomationEnabled`) wired to its own master switch in the UI. The debounced autosave in
   `useApplications` is deliberately scoped to the draft preferences and excludes the toggle.
2. **A missing row reads as disabled, never implied consent (§25).** `getMyAutomationSettings`
   resolves a null row through `resolveAutomationSettings(null)` → `enabled: false`, defaults, no
   schedule.
3. **The server owns the ceiling (§16).** The sliders are bounded by `ceilings` fetched from the
   server, and the backend clamps regardless at read time (`resolveAutomationSettings`), so a
   client that posts past the cap simply has no extra effect. `ceilings`/`defaults` are exposed
   read-only for display.
4. **No address leaks (§8).** `PreparedApplication.hasContact` is `Boolean(recipientEmail)`; the
   address itself is never in the SDL. Run history is counters-only (§27).
5. **Cancel is ownership-scoped.** `cancelPreparedApplication` is an `updateMany` whose `where`
   includes `userId`, `source: AUTOMATED` and a cancellable-stage set; a foreign or terminal id
   matches zero rows and is reported as `NOT_FOUND`. It records a `CANCELLED_BY_CANDIDATE` event.

---

## 5. Design decisions worth reviewing

1. **Review + cancel, not approve + send.** See the header. The page surfaces prepared work and
   lets the candidate pull an item before any (future) send. When send lands, an explicit approve
   action can be added against the same list.
2. **Mappers over SDL types.** The service returns its own view shapes (`string`-typed
   `status`/`stage`); `automationMappers.ts` points codegen at them, so resolvers hand GraphQL the
   service's shapes rather than re-deriving SDL enums. Mirrors trainings/coaches/resources.
3. **Debounced autosave for preferences, immediate for the toggle.** Preference edits save after
   900 ms of quiet (like the Profile page); the enable/disable toggle fires immediately and
   refetches settings so `nextRunAt` updates at once.
4. **The `applicationsPrepared` field.** The SDL names it honestly: it maps the `applicationsSent`
   column (which records prepared counts until send is wired — see Phase 5 §2) so the UI never
   implies deliveries that did not happen.
5. **Draft hydrated once.** `useApplications` seeds an editable draft from the server a single time
   then owns it, so autosave round-trips don't clobber in-flight edits.

---

## 6. Risks and unverified areas

| # | Item | Severity | Note |
|---|---|---|---|
| 1 | Service tested only against an in-memory Prisma double | **High** | Same database gap as Phases 3–5 — no local/staging Postgres. The `upsert`/`updateMany`/`findMany` calls are asserted in shape (args, scoping, never-enable), not executed against a real DB |
| 2 | No resolver/HTTP-level test | Medium | Resolvers are thin pass-throughs to the service; the service is unit-tested, but the GraphQL wiring itself is exercised only by codegen + typecheck, not a live query |
| 3 | Page not covered by a component/E2E test | Medium | The web app has no component-test harness; the page is verified by typecheck + production build only. Visual/interaction behaviour is unverified |
| 4 | Send still not wired | By design | Review list offers cancel, not approve-and-send (§1) |
| 5 | Email-connection surface | Deferred | The skill's "email-connection surface" is not built — there is no account-linking flow yet (belongs with Phase 4 email infra / a later phase). The page shows settings + review only |

---

## 7. What is genuinely verified vs. theoretical

**Verified (executed, green):**
- `getMyAutomationSettings`: null row → disabled + defaults + ceilings; a preference above the
  ceiling is clamped; `nextRunAt` serialised as ISO; anonymous caller rejected.
- `updateAutomationSettings`: never writes `enabled`; create path pins `enabled:false`/`nextRunAt:null`;
  only caller-sent fields forwarded; upsert scoped to the signed-in candidate; invalid frequency and
  out-of-range score rejected.
- `setAutomationEnabled`: enable schedules a run immediately; re-enable preserves an existing
  schedule; disable clears it.
- `getMyAutomationRuns`: `applicationsSent` mapped onto `applicationsPrepared`; dates ISO.
- `getMyPreparedApplications`: `hasContact` boolean with the address absent; null job offer falls
  back to a placeholder title.
- `cancelPreparedApplication`: `where` scoped to owner + `AUTOMATED` + cancellable stage, writes
  `CANCELLED`, records the event; count 0 → `NOT_FOUND` with no event.
- API full suite (385) and web typecheck + production build.

**Theoretical / not executed:**
- Any persistence against a real database.
- The GraphQL resolvers over HTTP; the Apollo client cache/refetch behaviour.
- The React page's rendering and interactions (no component-test harness).

---

## 8. Next

1. **Phase 7 — `/jobs` "Déjà postulé".** Surface already-applied offers in the job list, reading
   the `Application` rows this phase's queries already expose.
2. Stand up a **local/staging Postgres** to retire the recurring high-severity "mocked-only"
   gap (Phases 3–6) before real send or scheduling is enabled.
3. The email-connection surface + an explicit approve-and-send action land once Phase 4's send
   path is wired end-to-end.
