# Phase 5 — Automation / scheduler (report)

Date: 2026-10-07
Scope: skill §17 (and §26, §12) — a cron-driven worker that finds due candidates, claims one
run each against double execution, drains the Phase-3 pipeline, records a terminal run state and
sets the next due time. Per-candidate failure isolation and a default-closed, secret-gated
internal trigger.

**The scheduler still stops at preparation.** The Phase-3 invariant is intact: the pipeline
prepares applications, it does not send them. The run counter the skill calls `applicationsSent`
therefore records applications **prepared** this phase (mapped explicitly in the store, with a
comment). Wiring `sendApplicationEmail` into the drain is deliberately left for a later phase —
nothing here touches the email layer, and no real email can leave the process.

---

## 1. Files modified

### Added

| File | Role |
|---|---|
| `apps/api/src/lib/automation/scheduler.ts` | The batch coordinator (`runDueAutomations`), the `SchedulerStore` port, `statsFromOutcome`, the Prisma store, and `createSchedulerDeps` |
| `apps/api/src/routes/automationCron.ts` | Default-closed, secret-gated `POST /internal/automation/run` with a timing-safe compare and an aggregate-only response |
| `apps/api/src/lib/automation/__tests__/scheduler.test.ts` | 12 tests |

### Modified

| File | Change |
|---|---|
| `apps/api/src/lib/automation/engine.ts` | `runAutomationForCandidate` now returns `{ outcome, settings }` (`CandidateRunContext`) and accepts `RunAutomationOptions { runId, heartbeat }`; the pipeline takes an optional `heartbeat` callback, invoked a bounded number of times (after discovery, matching, budget) |
| `apps/api/src/lib/automation/index.ts` | Exported the scheduler surface and the new engine types |
| `apps/api/src/config/env.ts` | Added `AUTOMATION_CRON_SECRET` (optional, defaults empty → route refuses all requests) |
| `apps/api/src/index.ts` | Mounted `automationCronRouter` under `/internal` (no CORS) |
| `apps/api/.env.example` | Documented `AUTOMATION_CRON_SECRET` with the default-closed warning |

---

## 2. Migrations

**None.** Phase 2's additive migration already carries every column this layer writes:
`AutomationRun` (`status`, `startedAt`, `completedAt`, `heartbeatAt`, `jobsDiscovered`,
`jobsDeduplicated`, `jobsMatched`, `applicationsSent`, `failures`, `errorSummary`) and
`CandidateAutomationSettings` (`enabled`, `frequency`, `nextRunAt`, with
`@@index([enabled, nextRunAt])`). The enums `AutomationRunStatus` and `AutomationFrequency`
already exist.

**The remote Supabase database was not touched in this phase.** No `migrate`, `db push`,
`db reset`, seed or schema operation was run.

---

## 3. Tests executed

```
npx tsc --noEmit      → exit 0 (clean)
npm test              → 368 tests, 368 pass, 0 fail, EXIT=0
```

Baseline before this phase was 356 passing; **+12 tests**, all green.

`npm run lint` still cannot run — the package ships no `eslint.config.js` (pre-existing gap,
not a regression).

---

## 4. Concurrency claim — how §17 ("one run per candidate") is satisfied, honestly reported

The `AutomationRun` row **is** the lock. `claimRun` runs in a single `$transaction`:

1. **Reclaim a dead worker's run.** Any `RUNNING` row whose `heartbeatAt` is older than
   `now − RUN_STALE_AFTER_MS` (15 min) is marked `FAILED` with a `worker: reclaimed` summary. A
   crashed process therefore cannot block its candidate forever.
2. **Refuse a live run.** If a `RUNNING` row still exists after the reclaim sweep, `claimRun`
   returns `null` and the coordinator skips the candidate (`SKIPPED_LOCKED`) **without** running
   its pipeline (tested — the injected `runCandidate` is never called).
3. **Claim.** Otherwise it creates a fresh `RUNNING` row and returns its id.

The long pipeline refreshes `heartbeatAt` through the injected `heartbeat` callback, so a slow
run is not mistaken for a dead one.

**Honest limitation:** under READ COMMITTED two workers could in principle both pass step 2 and
create a row. The skill's defence-in-depth answer holds — the `Application @@unique([userId,
jobOfferId])` constraint makes a *duplicate application* impossible regardless, so the run-level
claim only saves wasted work, it is not the sole guarantee. This is documented in the module
header. A stricter `SELECT … FOR UPDATE` / serializable claim is a Phase-10 hardening option.

---

## 5. Partial-failure isolation — how §26 is satisfied

Two independent layers, both tested:

1. **Inside a run.** A source failing inside the pipeline surfaces as `outcome.failures`. The
   coordinator downgrades the run to **PARTIAL** (not FAILED) and keeps the per-source detail in
   `errorSummary`. The schedule still advances (tested).
2. **Across the batch.** Every candidate is processed in its own `try/catch`. A thrown pipeline
   marks *that* run `FAILED` (with zeroed stats and a `pipeline` error summary) and still advances
   its schedule; a `claimRun` that throws is confined to its candidate as `ERROR`. Neither aborts
   the batch — the remaining candidates still run (tested: `COMPLETED,FAILED,COMPLETED`).

---

## 6. Internal trigger — how the §17/§27 seam is satisfied

`POST /internal/automation/run` is an admin/worker endpoint, never a candidate route:

- **Default-closed.** With `AUTOMATION_CRON_SECRET` unset the route returns **503** for every
  request. Automation cannot be driven in an environment that did not explicitly opt in; there is
  no implicit dev allowance.
- **Secret-gated, timing-safe.** The shared secret travels in the `X-Automation-Secret` header
  (never a query string), compared with a constant-time `crypto.timingSafeEqual` wrapper that
  treats a length mismatch as a non-match without early return.
- **Mounted without CORS**, so no browser origin can reach it.
- **Redacted response (§27).** Only aggregate counts (`processed`, `claimed`, `skippedLocked`)
  leave the process — never candidate ids, offer text, or per-source detail. An infrastructural
  fault is logged server-side and answered with a generic `500`.

---

## 7. Design decisions worth reviewing

1. **The run row is the lock.** No separate advisory-lock table; the status + heartbeat columns
   that already had to exist carry the claim. See §4.
2. **`applicationsSent` records *prepared* counts this phase.** No send exists yet, so
   `statsFromOutcome` maps `outcome.prepared.length` onto the `applicationsSent` column. When send
   lands, this becomes the real sent count — the column name is already correct, only the source
   changes. Flagged so a reader does not mistake a prepared-only run for a delivering one.
3. **A FAILED run still reschedules.** A pipeline throw advances the candidate by the default
   `WEEKLY` interval rather than clearing its schedule, so one bad run does not wedge the
   candidate. A candidate who disabled automation mid-run has `nextRunAt` cleared to `null`
   instead (tested).
4. **Everything is injected.** `runDueAutomations` takes a `SchedulerStore` and a `runCandidate`
   function, plus optional `now`/`limit`. The whole coordinator is unit-tested with in-memory
   fakes — no database, no cron, no clock. The Prisma store and the real pipeline wiring live in
   `createPrismaSchedulerStore` / `createSchedulerDeps`, which are not exercised by tests (see §8).
5. **Bounded blast radius.** `findDueCandidates` takes a `limit` (default 25) so a single cron
   tick cannot process an unbounded number of candidates.

---

## 8. Risks and unverified areas

| # | Item | Severity | Note |
|---|---|---|---|
| 1 | `createPrismaSchedulerStore` tested only via the in-memory fake | **High** | Same database gap as Phases 3–4 — no local/staging Postgres. The `$transaction` claim, the stale-reclaim `updateMany`, the `completeRun` column mapping and the `rescheduleCandidate` `updateMany` are asserted in shape, not executed |
| 2 | READ COMMITTED claim race | Medium | Two workers could both claim; the `Application` unique constraint prevents duplicate applications regardless (§4). Stricter locking is Phase 10 |
| 3 | `createSchedulerDeps` / `runAutomationForCandidate` integration not exercised | Medium | The closure wiring the real pipeline + heartbeat is not under test; only the pure coordinator and the engine's pieces are |
| 4 | Send still not wired | By design | The scheduler drains to *prepared*, not *sent* (§2.2). Connecting `sendApplicationEmail` is a later phase |
| 5 | No cron actually scheduled | By design | The endpoint exists; an external scheduler (hébergeur cron) must POST to it. Not configured here |
| 6 | Daily ceiling (`maxApplicationsPerDay`) enforcement | Medium | Enforced inside the Phase-3 pipeline budget, not re-checked across concurrent runs; revisit when send lands |

---

## 9. What is genuinely verified vs. theoretical

**Verified (executed, green):**
- `statsFromOutcome` projection onto the five run counters.
- Happy path: claim → run → `completeRun(COMPLETED)` → reschedule by frequency (WEEKLY and DAILY).
- The `staleBefore = now − RUN_STALE_AFTER_MS` cutoff passed to the claim.
- PARTIAL on `outcome.failures`, with the per-source detail preserved and the schedule advanced.
- SKIPPED_LOCKED when the claim returns `null`, with the pipeline **never** run and no run/reschedule recorded.
- FAILED on a pipeline throw, with zeroed stats and the schedule still advanced.
- Batch isolation: one throwing candidate does not abort the batch; a throwing claim is confined as ERROR.
- `nextRunAt` cleared to `null` when the candidate disabled automation mid-run.
- The batch `limit` forwarded to the store; empty-due is a no-op.

**Theoretical / not executed:**
- Any persistence against a real database (the Prisma store).
- The real pipeline + heartbeat integration through `createSchedulerDeps`.
- Any HTTP call to the `/internal/automation/run` route (the handler logic is straightforward but untested end-to-end).
- Actual cron scheduling; email send; the candidate UI — Phases 6–10.

---

## 10. Next

1. **Phase 6 — candidate UI.** Replace the `/dashboard/applications` ComingSoon with the real
   automation settings (enable, frequency, ceilings, match threshold), the prepared-applications
   review/approval list, and the email-connection surface.
2. Stand up a **local/staging Postgres** to retire the high-severity "mocked-only" store gaps
   accumulating from Phases 3–5 before real send or real scheduling is ever enabled.
3. A real cron must stay gated behind `AUTOMATION_CRON_SECRET`; do not wire an always-on
   scheduler as part of normal development.
