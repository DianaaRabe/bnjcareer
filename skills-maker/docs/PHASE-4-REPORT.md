# Phase 4 — Email infrastructure (report)

Date: 2026-10-07
Scope: skill §10–§12 and §34.11 — a sendable email abstraction with a **strict dry-run
default**, a **server-enforced mandatory BCC** that the frontend can neither supply nor remove,
CV-attachment verification, idempotent delivery-state persistence, and the mandatory-BCC test
on **every** send path.

**The abstraction exists but is not wired into the pipeline.** Nothing in `src/` imports
`lib/email` except the module's own tests — verified by grep (`from '.../lib/email'` → no
application-code matches). The engine still stops at preparation (Phase 3 invariant intact);
connecting send to the pipeline is Phase 5 work and was deliberately left undone.

---

## 1. Files modified

### Added

| File | Role |
|---|---|
| `apps/api/src/lib/email/constants.ts` | `MANDATORY_BCC`, CV byte bounds, retry ceiling, backoff base |
| `apps/api/src/lib/email/types.ts` | `OutgoingEmail` (no `bcc`/`from` by design), `ProviderSendInput`, `SendResult`, `MailProvider` port, `EmailSendError` + `EmailErrorCode` |
| `apps/api/src/lib/email/buildMessage.ts` | `buildProviderInput` (the only writer of the BCC), `assertMandatoryBcc` |
| `apps/api/src/lib/email/cvAttachment.ts` | `verifyCvPdf`, `buildCvAttachment` (ports the Python `verifier_cv`) |
| `apps/api/src/lib/email/dryRunProvider.ts` | `createDryRunProvider` — asserts BCC, never touches the network |
| `apps/api/src/lib/email/brevoProvider.ts` | `createBrevoProvider` — Brevo v3 transactional API, retry/backoff, error classification |
| `apps/api/src/lib/email/store.ts` | `EmailStore` port, `nullEmailStore`, `createPrismaEmailStore` |
| `apps/api/src/lib/email/sender.ts` | `liveSendAllowed`, `resolveProvider`, `sendApplicationEmail` orchestration |
| `apps/api/src/lib/email/index.ts` | Curated named-export surface |
| `apps/api/src/lib/email/__tests__/buildMessage.test.ts` | 9 tests |
| `apps/api/src/lib/email/__tests__/cvAttachment.test.ts` | 7 tests |
| `apps/api/src/lib/email/__tests__/sender.test.ts` | 11 tests |

### Modified

| File | Change |
|---|---|
| `apps/api/src/config/env.ts` | Added `BREVO_API_KEY`, `BREVO_SMTP_API_KEY`, `BREVO_SENDER_EMAIL`, `EMAIL_SEND_LIVE` — all optional, all defaulting empty/`'false'` (gate defaults closed) |

---

## 2. Migrations

**None.** Phase 2's additive migration already carries every column this layer writes:
`EmailMessage` (unique `applicationId`, `provider`, `providerMessageId`, `providerThreadId`,
`deliveryStatus`, `attempts`, the `*At` timestamps, `failureCode`) and the
`EmailDeliveryStatus` / `EmailProvider` enums all exist.

**The remote Supabase database was not touched in this phase.** No `migrate`, `db push`,
`db reset`, seed or schema operation was run.

---

## 3. Tests executed

```
npx tsc --noEmit      → exit 0 (clean)
npm test              → 356 tests, 356 pass, 0 fail, EXIT=0
```

Baseline before this phase was 329 passing; **+27 tests**, all green.

`npm run lint` still cannot run — the package ships no `eslint.config.js` (pre-existing gap,
not a regression).

---

## 4. Mandatory BCC — how §11 is satisfied, honestly reported

The BCC is enforced at three independent layers, so no single mistake can drop it:

1. **Type system.** `OutgoingEmail` — the only shape a caller (eventually the GraphQL layer /
   frontend) can hand in — has **no `bcc` and no `from` field**. There is nothing to populate,
   so a request body literally cannot carry a BCC to override.
2. **Single writer.** `buildProviderInput` is the only code that sets `bcc`, and it writes
   `[MANDATORY_BCC]` as a literal — it never spreads or copies any caller value. A hostile
   payload that smuggles `bcc` through an untyped cast is ignored (tested).
3. **Pre-send assertion.** Every provider (`dryRun` and `brevo`) calls `assertMandatoryBcc`
   before it does anything, throwing if the address is absent. The check is case-insensitive.

| Required test | Status | Where |
|---|---|---|
| BCC always present on the built payload | ✅ | `buildMessage.test.ts` |
| Caller-smuggled `bcc` is ignored | ✅ | `buildMessage.test.ts` (untyped-object attack) |
| BCC never becomes the visible recipient | ✅ | `buildMessage.test.ts` (recipient = BCC → `INVALID_RECIPIENT`) |
| BCC present on the **dry-run** send path | ✅ | `sender.test.ts` |
| BCC present on the **live (persistable)** send path | ✅ | `sender.test.ts` (new honest live-path test) |
| `assertMandatoryBcc` throws when absent / passes case-insensitively | ✅ | `buildMessage.test.ts` |

---

## 5. Dry-run default — how §34.11 is satisfied

A real send requires **two independent switches, neither settable by a request body**:

1. `EMAIL_SEND_LIVE=true` in the environment (`liveSendAllowed()`), and
2. an explicit `live: true` at the call site, and
3. a configured provider (`isConfigured()` — Brevo needs key + sender).

If any one fails, `resolveProvider` returns the dry-run provider. Tested: default is dry-run;
`live: true` with the gate closed **still** falls back to dry-run and persists nothing.

---

## 6. Design decisions worth reviewing

1. **`OutgoingEmail` omits `bcc`/`from` on purpose.** The BCC guarantee is structural, not
   conventional — see §4.1. `from` is resolved server-side (`deps.from ?? env.BREVO_SENDER_EMAIL`).
2. **DRY_RUN never persists a delivery row.** Only a real provider updates `EmailMessage`
   (`persistable = provider.id !== 'DRY_RUN'`). A dry run is an observability no-op, so test and
   dev traffic never pollute the delivery ledger (tested).
3. **Idempotency by `applicationId`.** `sendApplicationEmail` short-circuits with
   `deduplicated:true` if the row is already `SENT` with a `providerMessageId`, and threads
   `applicationId` as the provider `Idempotency-Key`. A crashed-and-resumed worker cannot
   double-deliver (tested on the dedup short-circuit and the key passthrough).
4. **`allowLiveSend` test seam.** `resolveProvider`/`SendApplicationDeps` take an optional
   `allowLiveSend` that defaults to `liveSendAllowed()`. It is **default-closed** and exists only
   so tests can exercise the real-provider persistence path deterministically without setting
   process env. This replaced the earlier contrived tests that drove the store by hand — the
   live path is now exercised through `sendApplicationEmail` itself.
5. **CV verification ports the Python prototype.** `verifyCvPdf` checks the `%PDF-` magic and the
   `MIN_CV_BYTES`/`MAX_CV_BYTES` bounds; `buildCvAttachment` throws `ATTACHMENT_REJECTED` and
   normalises a missing/foreign extension to `cv.pdf`.
6. **BCC address follows the skill, not the prototype.** `site.benjaminparienty@gmail.com`
   (skill §11), not the Python prototype's `fanilo@bnjteammaker.fr`. Recorded in the audit.

---

## 7. Risks and unverified areas

| # | Item | Severity | Note |
|---|---|---|---|
| 1 | `createBrevoProvider` never makes a real HTTP call in tests | **High** | The payload shape, headers (`api-key`, `Idempotency-Key`), base64 attachment encoding and status→error classification are asserted against a fake `fetch`; no request has hit Brevo. A real send needs live credentials + `EMAIL_SEND_LIVE=true`, which must not happen without explicit authorization (§34.11) |
| 2 | `createPrismaEmailStore` tested only against a mocked Prisma | **High** | Same database gap as Phase 3 — no local/staging Postgres is configured. The upsert-by-`applicationId` and attempt-increment SQL shapes are asserted, not executed |
| 3 | No OAuth / `CandidateEmailAccount` token handling yet | Medium | Google/Microsoft providers and encrypted-token use are later phases; only Brevo (API-key) exists |
| 4 | Bounce / delivered / replied webhooks not implemented | Medium | `EmailMessage` has the columns; ingestion is Phase 8 (reply tracking) |
| 5 | Send not wired into the engine | By design | Phase 5. Grep confirms no `src/` import of `lib/email` |
| 6 | No rate limiting / structured redaction on the provider | Low | Phase 10 |

---

## 8. What is genuinely verified vs. theoretical

**Verified (executed, green):**
- The mandatory BCC on the built payload, against a hostile override, and on **both** the
  dry-run and the live persistable send paths.
- Recipient validation rejecting `noreply@…` and the BCC-as-recipient case before any provider call.
- `replyTo` defaulting to `from`; idempotency-key passthrough.
- CV PDF acceptance/rejection (magic bytes, too-small, empty) and attachment filename normalisation.
- The dry-run default under every gate combination, including `live:true` with the env gate closed.
- Delivery-state transitions `SENDING → SENT` and `SENDING → FAILED` (with attempt count) through
  `sendApplicationEmail` against an in-memory store, and the no-persist rule for dry runs.
- Idempotent short-circuit for an already-`SENT` application.

**Theoretical / not executed:**
- Any real HTTP call to Brevo.
- Any persistence against a real database.
- OAuth, mailbox providers, bounce/reply webhooks, the scheduler, the candidate UI — Phases 5–10.

---

## 9. Next

1. **Phase 5 — automation/scheduler.** Wire `sendApplicationEmail` into the worker that drains
   prepared applications: run records, claim/locking against double execution, per-run and daily
   ceilings, and partial-failure isolation (one bad vacancy must not fail the run).
2. Stand up a **local/staging Postgres** to retire the two high-severity "mocked-only" gaps from
   Phases 3 and 4 before real send is ever enabled.
3. A real Brevo send must stay gated behind explicit human authorization — do not set
   `EMAIL_SEND_LIVE=true` as part of normal development.
