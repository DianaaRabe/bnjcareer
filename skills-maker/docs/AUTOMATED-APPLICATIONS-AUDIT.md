# Automated job applications — Phase 1 repository audit

Scope: `skills-maker/` (the decoupled stack). Produced before any code change, as required by
`BNJ_Skills_Maker_Automated_Applications_SKILL.md` §2.

Baseline verified on this checkout: `npx tsc --noEmit` clean, `npm test -w apps/api` → **187 tests, 0 fail**.

---

## 1. Verified stack (not taken from docs)

| Layer | Reality on disk |
| --- | --- |
| Frontend | `apps/web` — Vite + React 18 SPA, React Router, Apollo Client, Tailwind v4, shadcn/ui on Radix, lucide-react, sonner, react-intl |
| Backend | `apps/api` — Express 4 + Apollo Server 4 (**GraphQL-first**), `graphql-ws` subscriptions |
| Data | PostgreSQL + Prisma 5.22, 12 migrations in `prisma/migrations/` |
| Auth | JWT Bearer, `bcryptjs` hashes, per-request `ctx.user` |
| Tests | `node:test` via `npm run test -w apps/api` |

> The skill declares "Vite + Node/Express + PostgreSQL" — accurate, with one correction that shapes
> every API decision below: the API is **GraphQL, not REST**, except the binary upload route.

---

## 2. Audit findings (the 20 required points)

1. **Frontend entry points** — `apps/web/src/main.tsx` → `App.tsx` (React Router). Two shells:
   `components/layout/AppShell` (candidate) and `pages/Coach/CoachShell`. Routes centralized in
   `constants/routes.ts`; nav in `constants/navigation.ts`.
2. **Backend entry points** — `apps/api/src/index.ts`: one `/graphql` (HTTP + WS), `/uploads`
   (static + `routes/cvUpload.ts` multer router), `/health`.
3. **Schema / query layer** — `prisma/schema.prisma` with `@@map`/`@map` preserving legacy SQL names.
   Enums are real Postgres enums (project rule: prefer enums over free-text status).
4. **Auth / authorization** — `context.ts` decodes the Bearer token; `lib/rbac.ts` exposes
   `requireUser` / `requireRole`. Ownership is checked per service (e.g. `getOwnedCv`). No RLS,
   no policy layer — **every new read/write must filter by `ctx.user.id` explicitly**.
5. **Candidate profile** — `Profile` 1‑1 `User`: `firstName`, `lastName`, `phone`, `bio`, `birthDate`,
   `educationLevel`, `school`, `sector`, `situation`, `strengths[]`, `improvements[]`, `skills[]`,
   `objective`. **Missing for matching**: preferred locations, contract types, work time, remote,
   salary expectation, exclusions, language.
6. **CV storage / retrieval** — `Cv`: uploaded PDF on disk (`UPLOAD_DIR`, served at `/uploads/cv/*`),
   `extractedData` (LLM extraction), `optimizedData` + `improvements` (LLM optimization), `template`.
   Extraction and optimization are **synchronous** LLM calls inside the mutation.
   `optimizedHtml` exists in the schema but is **never written**.
7. **Cover-letter infrastructure** — **does not exist.** Zero occurrences in `apps/`.
8. **Existing `/jobs`** — `searchJobs` query: **jobs are never persisted**. Results live only for the
   duration of the call (+ a 10-minute in-memory LRU in `jobsService.ts`). `trackJobApplication`
   mutation → `lib/candidateTracking.recordApplication` → persists `JobOffer` + `Application`,
   deduped by offer **URL** or title+company.
9. **Job aggregators** — factory in `lib/jobs/index.ts`: France Travail, Apify (Indeed / LinkedIn /
   HelloWork), Jooble, International (curated). Uniform `JobProvider` interface:
   `isConfigured()`, `supportedFilters`, `search()`. **Reusable as-is** — this is the normalized job
   layer §4 asks for, extended with `externalId` + `canonicalKey`.
10. **Apify** — `apifyProvider.ts` + `apifyNormalizers.ts`; tokens `APIFY_API_TOKEN`, `APIFY_API_TOKEN_HELLOWORK`.
    `previewRuns.ts` serves pre-downloaded datasets from `JOBS_RUNS_DIR` when no keywords are given.
11. **Jooble** — `joobleProvider.ts`, `JOOBLE_API_KEY`.
12. **France Travail** — `franceTravailProvider.ts`, OAuth2 `client_credentials`
    (`FRANCE_TRAVAIL_CLIENT_ID/SECRET`). **Emails are anonymised by the API** — offers never carry a
    contact address, which is exactly why §8 contact enrichment is needed.
13. **Lusha** — **not implemented.** No client, no key, no reference in code. The only enrichment that
    exists is the Python prototype `../candidature-auto/enrichir.py` (free: DNS MX via `dns.google` →
    confirm the site really is the company → scrape contact/legal pages → fall back to a *flagged*
    `contact@domain` guess).

    **Now integrated** (`src/lib/enrichment/`), shaped against the live V3 API rather than the docs
    alone. Findings worth keeping:
    - Base `https://api.lusha.com/v3/`, auth via the `api_key` header.
    - `POST /v3/contacts/prospecting` with `filters.companies.include.domains` is what scopes a search
      to **one** company; without it a query returns unrelated people worldwide.
      `filters.contacts.include.existingDataPoints: ["work_email"]` restricts results to contacts whose
      email can actually be revealed, so no credits are spent on dead ends.
    - Search returns **non-PII previews only**; emails appear solely after `POST /v3/contacts/enrich`,
      which is the credit-spending call (1 credit per email + 1 per result). Phones cost 5 credits and
      are never requested — they are useless for an application.
    - `GET /v3/contacts/prospecting/filters/departments` returns **plain strings**, not the
      `{ id, name }` objects the docs show for `seniority`. The client accepts both; assuming one shape
      yields an empty list that reads as "no HR contacts found" rather than as an error.
    - `451` means Lusha blocked the record for legal reasons (GDPR) and must never be retried; `402`
      means credits are exhausted. Both are permanent. `429` and `5XX` are retried with backoff.
    - Verified live: department discovery returns 16 values and correctly resolves "Human Resources".
      The prospecting + enrich path is implemented per the documented contract but has **not** been
      exercised, because it spends account credits.
14. **Email infrastructure** — **no code at all** (no nodemailer, no Brevo SDK, no templates). But
    `BREVO_API_KEY`, `BREVO_SMTP_API_KEY`, `BREVO_SENDER_EMAIL` are already provisioned in
    `apps/api/.env` and `.env.example` and are currently **unused**. The Python prototype sends via
    `smtplib` + STARTTLS with a Gmail app password and a hardcoded BCC.
15. **Cron / background jobs** — **none.** No scheduler, no queue, no worker, no `setInterval`. The API
    is a single long-lived process (Render, 1 GB persistent disk). Work must therefore be triggered by
    an in-process scheduler *or* a separate Render cron service.
16. **Env / secrets** — Zod-validated `config/env.ts`; server refuses to boot without `DATABASE_URL`
    and `JWT_SECRET`; optional keys default to `''`. `.env` is gitignored and holds live values; nothing
    secret is committed. `NEXT_PUBLIC_*`-style leaking does not apply — Vite vars are public by design,
    so **no secret may ever land in a `VITE_*` var**.
17. **Logging / monitoring** — plain `console.log` / `console.error`, no correlation IDs, no redaction
    policy, no error tracker. Nothing structured to build on.
18. **UI design system** — Tailwind v4 tokens in `src/index.css` (`@theme inline`), 17 shadcn primitives
    in `components/ui/`, `AppSidebar` + `AppShell`, sonner toasts, `mob  ile-first`. **No test runner in
    `apps/web`** (project rules defer it).
19. **Notifications** — sonner toasts only. No email/push notification channel. Messaging
    (`Conversation`/`Message`) exists but is unrelated.
20. **Tests** — 23 files, 187 tests, all green. Style: pure-function units + mocked Prisma for services.
    `apps/web` has none.

### GraphQL / i18n surface already reserved for this feature

- `ROUTES.candidate.applications = /dashboard/applications` **already exists** and currently renders a
  `ComingSoon` placeholder.
- The i18n key `candidate.applications.title` is already present in **both** locales and already reads
  **"Mes candidatures"** / "My applications" — §14's sidebar label needs no new key.
- `ApplicationStatus { SENT PENDING REJECTED INTERVIEW }` and the `Application` / `JobOffer` /
  `MatchAnalysis` models already exist and are already consumed by the candidate dashboard
  (`myCoaching.recentApplications`) and the coach's candidate detail (`coachCandidate.applications`).

---

## 3. Reusable components (do not rebuild)

| Need | Reuse |
| --- | --- |
| Job discovery | `lib/jobs/*` provider factory + `searchJobs` (add `externalId`/`canonicalKey` to `NormalizedJob`) |
| Job↔offer persistence | `JobOffer` + `Application` + `lib/candidateTracking.recordApplication` |
| Matching engine | `graphql/modules/matching/*` — deterministic filters plus the existing LLM scorer (`matchingPrompts.ts`) |
| Prompt-injection defence | The `<<<OFFRE>>>` fenced-offer pattern in `matchingPrompts.ts`, plus `lib/cv/immutable.ts` verbatim constraints |
| CV grounding | `lib/cv/immutable.ts` formatters + `buildOptimizationPrompt(profile, extractedData, jobContext)` — already supports a **job context**, i.e. per-vacancy tailoring |
| LLM access | `lib/llmClient.callLLM` (multi-key, multi-model fallback, `jsonMode`) |
| Ownership guard | `lib/rbac.requireUser` + explicit `userId` filters |
| UI | `AppSidebar` + `NAV_ITEMS`, `components/ui/*`, sonner, `useTranslate`, `FormattedMessage` |
| Audit trail | `CoachAgreement` is the house pattern for an append-only, never-updated audit row |

---

## 4. Required schema changes (conceptual → concrete)

**Do not duplicate entities.** Extend `JobOffer`/`Application`; add only what is genuinely new.

New:

- `CandidateAutomationSettings` — enabled, frequency, nextRunAt, maxApplicationsPerRun,
  maxApplicationsPerDay, minMatchScore, criteria (locations, contract types), approvalMode.
- `AutomationRun` — id, candidateId, status, startedAt, completedAt, counters, errorSummary. Run
  identity prevents concurrent duplicate processing.
- `ApplicationEvent` — append-only audit (type, metadata, createdAt).
- `EmailMessage` — applicationId, provider, providerMessageId, providerThreadId, deliveryStatus,
  sentAt/deliveredAt/bouncedAt.
- `CandidateEmailAccount` — provider, encrypted refresh/access token, scopes, `disconnectedAt`.
- `JobContact` — jobId, email, contactName, source, verifiedAt (+ provenance, per §8).

Changes to existing:

- `JobOffer`: add `source`-scoped `externalId`, `canonicalKey` (unique), `location`, `companyWebsite`,
  `publishedAt`, `discoveredAt`, `tags`.
- `Application`: add `sentAt`, `recipientEmail`, `coverLetterReference`, `cvReference`, `source`
  (`MANUAL` | `AUTOMATED`), and the **unique `(userId, jobOfferId)`** constraint that makes §6
  idempotency a database guarantee rather than an application-code hope.
- `ApplicationStatus`: the existing four values come straight from the spec's tracking dashboard and are
  already consumed by the coach UI. The new lifecycle (§13) is a **separate** enum, not a mutation of
  the existing one — surfacing a delivery state must not break `coachCandidate.applications`.
- Indexes on `userId`, `canonicalKey`, `status`, `createdAt`, `nextRunAt`, `externalId`,
  `providerMessageId` — only where a query pattern actually exists.

---

## 5. Missing infrastructure (must be built)

1. Email sending + a provider abstraction (§12). Nothing exists.
2. A queue/worker or scheduler (§12, §17). Nothing exists. The API process is persistent, so an
   in-process claim-and-process loop is viable; a separate Render cron service is the scale-up path.
3. OAuth mailbox connection + **encrypted token storage** (§10). No crypto utility, no OAuth client, and
   no Google/Microsoft credentials in env. This is the largest single unknown.
4. Cover-letter generation (§9). Nothing exists.
5. Contact enrichment with provenance (§8) — Lusha is not integrated.
6. Server-side PDF for the CV attachment. `optimizedData` is rendered **client-side**; there is no
   server renderer, so an optimized-CV PDF attachment needs a new dependency.
7. Structured logging + correlation IDs, and a redaction rule (§27).
8. Rate limiting on sensitive endpoints (§18) — no middleware exists.

---

## 6. Risks

| Risk | Why it bites here | Mitigation |
| --- | --- | --- |
| Automated sending from a **platform** address vs each candidate's own mailbox | Deliverability and reply tracking differ completely; §10 mandates OAuth, which needs credentials nobody has yet | See decision Q2 |
| Sending real email during development | Skill §34.11 forbids it | Provider abstraction + a mandatory dry-run mode; tests never touch the network |
| Duplicate sends | `recordApplication`'s dedupe is application-level and URL/title based, not DB-enforced | Unique `(userId, jobOfferId)` + claim-based worker |
| Touching `Application`/`ApplicationStatus` | Already consumed by the candidate dashboard and coach UI | Additive columns only; new enum for the automation lifecycle |
| Auto-applying to irrelevant jobs | `sector`-derived criteria is the only current signal | Configurable `minMatchScore` + explicit candidate consent + bounded volume |
| Prompt injection via job descriptions | Descriptions are scraped, untrusted | Reuse the `<<<OFFRE>>>` fence + keep recipient/consent/BCC/limits in deterministic backend code |
| Migrating the wrong database | `.env` `DATABASE_URL` points at **Supabase**, and `prisma migrate status` reports **all 12 migrations unapplied** (the remote DB is empty). A local Postgres *is* listening on 5432 | See decision Q1 — do not guess |
| Email content leaking into logs | §27 forbids it | Central redaction helper from day one |

---

## 7. Deviations from the skill, and why

1. **§23 endpoint list is REST; this API is GraphQL.** Resolvers, `typeDefs`, codegen and the generated
   resolver types are the project contract (`CLAUDE.md` is authoritative for conventions). The candidate
   surface will therefore be GraphQL queries/mutations with identical semantics. Plain Express routes
   are reserved for what GraphQL cannot express: the OAuth redirect/callback and any provider webhook.
2. **BCC address conflict.** The skill's non-negotiable rule names `site.benjaminparienty@gmail.com`;
   the existing Python prototype BCCs `fanilo@bnjteammaker.fr`. The skill wins — hardcoded server-side,
   with no env override and no request path that can influence it.
3. **`JobApplication` (skill §22) → existing `Application`.** §22 explicitly forbids duplicating entities
   and tells us to reuse existing tables.
4. **Lusha (§8)**: the skill says "if already implemented" — it is not. See decision Q3.

---

## 8. Implementation sequence

Ordered as §32, adjusted to what is actually missing here:

| Phase | Work |
| --- | --- |
| 2 | Migrations: automation settings, canonical job identity, application columns + unique constraint, events, email messages/accounts, indexes |
| 3 | Application engine: canonicalization, dedupe, deterministic eligibility filters, reuse of the LLM matcher, idempotency |
| 4 | Email infrastructure: provider abstraction (dry-run by default), server-side BCC enforcement, retry/backoff, delivery state |
| 5 | Automation: due-candidate selection, run records, claim/locking, per-run and per-day limits, partial failure isolation |
| 6 | Candidate UI: `/dashboard/applications` (replacing `ComingSoon`), automation settings, email connection — built from `components/ui/*` |
| 7 | `/jobs` — "Déjà postulé" from backend application history, own applications only |
| 8 | Reply tracking (depends on the Q2 answer) |
| 9 | Tests: unit (normalization, dedupe, eligibility, BCC, idempotency, transitions, frequency), integration (ownership isolation, duplicate prevention, already-applied), failure cases |
| 10 | Hardening: indexes, rate limits, structured logging + redaction, secret review, performance |

---

## 9. Design decisions I am making (unless told otherwise)

- **BCC is a server-side constant.** Every outgoing application email carries it; no input, env var or
  resolver argument can remove it. A test asserts it on every send path.
- **Dry-run by default.** Real sending requires an explicit flag that is off in local/dev, per §34.11.
- **Additive migration only.** Existing `Application` rows, the coach view and the dashboard keep working.
- **Ownership from the session, never from the payload.** No new resolver takes a `candidateId`.
- **Partial failure isolation.** One aggregator or LLM failing marks its own source failed and the run
  continues, per §26.
