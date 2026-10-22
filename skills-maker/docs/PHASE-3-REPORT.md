# Phase 3 — Application engine (report)

Date: 2026-10-06
Scope: skill §4–§9 and §16, plus the review gate of the current phase order:
`discovery → normalization → canonicalization → deduplication → matching → eligibility → already-applied → preparation`.

**The pipeline stops at preparation.** No code path in `src/` can reach an email provider —
verified by grepping the whole tree for `nodemailer|brevo|sendgrid|resend|smtp|sendMail|sendEmail|gmail`
(one match, a comment). Constraint 6 is therefore satisfied by construction, not by convention.

---

## 1. Files modified

### Added

| File | Role |
|---|---|
| `apps/api/src/lib/jobs/canonical.ts` | URL canonicalization, `normalizeText`, `canonicalJobKey`, `dedupeJobs` (pure) |
| `apps/api/src/lib/automation/constants.ts` | Server defaults + absolute ceilings, `resolveAutomationSettings`, `nextRunAt`, `RUN_STALE_AFTER_MS` |
| `apps/api/src/lib/automation/types.ts` | `CanonicalJob`, `MatchedJob`, `PreparedApplication`, `SkippedJob`, `PipelineOutcome`, stage/skip unions |
| `apps/api/src/lib/automation/eligibility.ts` | Deterministic post-AI gates, budget maths, recipient validation |
| `apps/api/src/lib/automation/coverLetter.ts` | Grounded prompt, parser, `generateCoverLetter` (LLM injectable) |
| `apps/api/src/lib/automation/store.ts` | `AutomationStore` port, `nullAutomationStore`, `createPrismaAutomationStore` |
| `apps/api/src/lib/automation/engine.ts` | The ordered pipeline, `buildSearchQuery`, `startOfDayUtc`, `runAutomationForCandidate` |
| `apps/api/src/lib/automation/index.ts` | Curated public surface |
| `apps/api/src/lib/cv/immutable.ts` | `cvImmutable.ts` moved out of the GraphQL layer (see §5) |
| `apps/api/src/lib/jobs/__tests__/canonical.test.ts` | 12 tests |
| `apps/api/src/lib/automation/__tests__/constants.test.ts` | 8 tests |
| `apps/api/src/lib/automation/__tests__/eligibility.test.ts` | 19 tests |
| `apps/api/src/lib/automation/__tests__/coverLetter.test.ts` | 10 tests |
| `apps/api/src/lib/automation/__tests__/engine.test.ts` | 23 tests |
| `apps/api/src/lib/automation/__tests__/store.test.ts` | 8 tests |

### Modified

| File | Change |
|---|---|
| `apps/api/src/lib/jobs/types.ts` | `NormalizedJob` gained optional `externalId`, `companyWebsite`, `rawSourceReference` (additive — every provider still compiles) |
| `apps/api/src/lib/jobs/index.ts` | Re-exports the canonicalization helpers |
| `apps/api/src/graphql/modules/matching/matchingService.ts` | New exported `scoreJobOffer(extractedData, offer)`; `analyzeJobMatch` now calls it. No behaviour change — same prompt, same parser |
| `apps/api/src/graphql/modules/matching/matchingPrompts.ts` | Import path of the immutable formatters |
| `apps/api/src/graphql/modules/cv/cvPrompts.ts` | Import path of the immutable formatters |
| `docs/AUTOMATED-APPLICATIONS-AUDIT.md` | Corrected the `cvImmutable.ts` reference after the move |

---

## 2. Migrations

**None.** Phase 3 needed no schema change: Phase 2's additive migration
(`20261006150000_add_automated_job_applications`) already carries every column this engine
writes (`canonicalKey`, `stage`, `skipReason`, `recipientEmail`, `coverLetter*`, plus the
`@@unique([userId, jobOfferId])` idempotency constraint).

**The remote Supabase database was not touched in this phase.** No `migrate`, `db push`,
`db reset`, seed or schema operation was run.

---

## 3. Tests executed

```
npx tsc --noEmit            → exit 0 (clean)
npm test -w apps/api        → 329 tests, 329 pass, 0 fail, EXIT=0
```

Baseline before this phase was 249 passing; **+80 tests**, all green.

`npm run lint` **cannot run**: the package ships no `eslint.config.js` and ESLint 9 refuses to
start without one. This is a pre-existing repository gap, not a regression.

---

## 4. Constraint 8 coverage — honestly reported

| Required test | Status | Where |
|---|---|---|
| Candidate A/B isolation | ✅ tested | `engine.test.ts` — another candidate's application is invisible; the daily counter is queried for the processed candidate only |
| Duplicate application | ✅ tested | `engine.test.ts` (write returns `created:false` → `ALREADY_APPLIED`) and `store.test.ts` (P2002 → reuse existing row) |
| Duplicate worker execution | ✅ tested | `engine.test.ts` — the second pass sees the vacancy in `findApplied` and never calls the matcher |
| Mandatory BCC | ⛔ **not applicable yet** | No send path exists in Phase 3. Belongs to Phase 4 and is the first thing that phase must test |
| Disabled automation | ✅ tested | `engine.test.ts` — zero provider calls, zero writes |
| Daily / run limits | ✅ tested | `engine.test.ts` — run ceiling spends the budget on the best scores; a reached daily ceiling prepares nothing |
| Invalid recipient | ✅ tested | `engine.test.ts` (`no-reply@` → `NO_CONTACT`), `eligibility.test.ts` |
| OAuth token never exposed | ⛔ **not applicable yet** | No OAuth code exists. Phase 4 |
| LLM malformed output | ✅ partially | `coverLetter.test.ts` (parser rejects empty/short/garbage) and `engine.test.ts` (matcher `null`/throw and letter throw → `REQUIRES_REVIEW`, nothing persisted) |
| Provider timeout / failure | ✅ tested | `engine.test.ts` — a throwing provider is recorded in `failures` and the healthy source still produces an application |

---

## 5. Design decisions worth reviewing

1. **Key priority inverted vs. the skill's literal wording.** Skill §4 lists
   `source + externalId` first. We put the **canonical URL** first, because that is the only
   identity shared *across* aggregators — the entire purpose of deduplication — and keep
   `source + externalId` as the second tier, text as the last. Title alone is never an identity.
2. **`already-applied` hoisted above `matching`.** It is a free indexed lookup; paying an LLM
   call for a vacancy the candidate already applied to is waste. The gate is *also* enforced
   again by the database unique constraint at write time, so a race cannot slip through — the
   pipeline order in the report is a decision vocabulary, not the only line of defence.
3. **Guessed contacts never auto-send.** A `contact@domain` pattern guess is prepared for the
   candidate's review under approval mode; with `approvalMode:false` it is treated as *no
   contact*. This is stricter than the schema requires and matches skill §8.
4. **`approvalMode` semantics.** Prepared rows start at `READY_TO_SEND` under approval and at
   `PREPARING` otherwise. In both cases they are rows, not sends.
5. **Layer fix.** `cvImmutable.ts` moved from `src/graphql/modules/cv/` to `src/lib/cv/immutable.ts`
   because the engine (a `lib/` module) needs the same grounding formatters, and `lib/` importing
   from `graphql/` is an inversion. Both callers were updated; `tsc` and the full suite confirm
   no breakage.
6. **Daily budget counts *prepared* automated rows, not *sent* ones.** Under approval mode
   prepared ≠ sent; counting preparations is the stricter choice and bounds LLM spend too.

---

## 6. Risks and unverified areas

| # | Item | Severity | Note |
|---|---|---|---|
| 1 | `createPrismaAutomationStore` is tested only against a mocked Prisma, never a live database | **High** | Constraint 1 asks for a local/staging database; none is configured yet (no connection string was provided). The SQL shapes are asserted, the queries are not executed |
| 2 | `runAutomationForCandidate` (real wiring) is untested | Medium | Needs the database above |
| 3 | Real LLM cover-letter generation never exercised end-to-end | Medium | Prompt and parser are asserted; the round trip to Groq/OpenRouter is not |
| 4 | Real provider discovery inside the engine never exercised | Medium | Fakes only. The providers themselves are exercised elsewhere in the codebase |
| 5 | Matching is sequential | Medium | 40 discovered jobs = 40 sequential LLM calls. A worker timeout could truncate a run; consider bounded concurrency before Phase 5 |
| 6 | `countPreparedSince` filters `stage: { not: 'CANCELLED' }` on a nullable column | Low | Prisma's `not` is three-valued; automated rows always carry a stage, so no row is lost today, but the predicate is fragile |
| 7 | `jobText()` concatenates the full description for keyword/location matching | Low | CPU-bound on 40 jobs; acceptable, worth revisiting if discovery limits grow |
| 8 | No lint gate | Low | Pre-existing: the package has no ESLint flat config |
| 9 | Rate limiting / structured logging / redaction | Not started | Phase 10 |

---

## 7. What is genuinely verified vs. theoretical

**Verified (executed, green):**
- URL and job canonicalization; cross-source collapsing; most-complete-record selection.
- Settings resolution: defaults, ceiling clamping, "enabled only when explicit".
- Every deterministic eligibility rule and the budget arithmetic.
- The ordered pipeline end to end, against injected fakes: consent gate, isolation, idempotency,
  dedup, provider failure isolation, matcher/letter failure routing, contact classification,
  run/daily limits, staged preparation, audit event emission.
- The store's query shapes, its P2002 idempotency behaviour and its contact-provenance upgrade rule.
- The cover-letter prompt's grounding and fence, and the parser's rejection bounds.

**Theoretical / not executed:**
- Any persistence against a real database.
- Any real LLM call from the engine.
- Any real contact enrichment from the engine.
- Anything about email, OAuth, the scheduler or the candidate UI — those are Phases 4–10 and
  are deliberately untouched.

---

## 8. Next

1. Stand up a **local/staging Postgres** so the store and `runAutomationForCandidate` can be
   verified for real — this is the one high-severity gap.
2. Phase 4: email provider abstraction with a strict `dry-run` default, hardcoded BCC constant,
   and the mandatory-BCC test on every send path.
