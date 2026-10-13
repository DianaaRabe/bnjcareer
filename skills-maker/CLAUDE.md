# Project Rules for Claude Code — Skills Maker (decoupled stack)

Monorepo: `apps/web` (Vite + React + Tailwind CSS + Radix UI primitives + Apollo Client) ·
`apps/api` (Express + Apollo Server + GraphQL + Prisma). Domain: candidates, coaches, admins —
CV, jobs, applications, coaching, formations, messaging, resources.

This is a lean scaffold, not a big architecture yet — apply these rules as real screens/modules
get built, don't pre-build structure nobody uses.

---

# Frontend — `apps/web`

## Mindset

- Senior frontend dev: predictable structure, typed boundaries, accessible UI.
- Production-grade: loading/error/empty states where relevant; keyboard-friendly.

## 1. UI vs business logic

- `.tsx` renders only (layout, conditional render, prop wiring). No Apollo `useQuery`/
  `useMutation` directly in pages — even a trivial one goes in a hook, for consistency.
- `useXxx.ts` owns state, handlers, effects, data fetching — same folder as its component.
- One folder per component/page; PascalCase for feature/page folders:

```text
pages/Dashboard/
  Dashboard.tsx        # UI only
  useDashboard.ts       # logic + data
```

## 2. File size

- Keep `.tsx`/`.ts` under ~150–200 lines. Split into child components, hooks, or `lib/`
  helpers before that — don't compress with less whitespace.

## 3. GraphQL (Apollo)

- Operation docs → `src/graphql/queries/` and `src/graphql/mutations/`, split by domain
  (`cv.ts`, `jobs.ts`, `coaching.ts`…). Barrel-export from `index.ts`.
- Generated types live in `src/gql/` (client preset) — never hand-edit; regenerate with
  `npm run codegen` (API must be running).
- Reused Apollo wiring (same operation in several screens) → `src/graphql/hooks/`, grouped
  by domain, barrel-exported. Feature-only orchestration stays in the feature's `useXxx.ts`.

## 4. Components & style

- Tailwind CSS v4 (CSS-first config, `@theme inline` in `src/index.css`, no `tailwind.config.js`
  theme mapping needed — colors/radius tokens are defined once in `index.css`).
- UI primitives: shadcn/ui on **Radix** (not the newer Base UI default — this repo pins
  `-b radix`). Add a component with `npx shadcn@latest add <name>` from `apps/web/` — it
  scaffolds the source into `src/components/ui/` and pulls only the `radix-ui` pieces that
  component needs. Never bulk-install; never hand-roll a primitive shadcn already provides.
- Compose feature components on top of `ui/` primitives; don't duplicate a primitive that
  already exists there.
- English names everywhere. Arrow functions for components and handlers.
- Icons: `lucide-react`.

## 5. Mobile-first

- Design smallest viewport first (~375px), then `sm:`/`md:`/`lg:` as enhancements. Prefer
  `flex-col` + `sm:flex-row`, not the reverse pattern.

## 6. Forms

- Controlled fields with `ui/` inputs. Complex forms: split into field subcomponents +
  `useXxx.ts` for validation/submit.

## 7. i18n

- `react-intl` is wired from the start. `IntlProvider` sits at the root (`main.tsx`);
  locale resolution lives in `src/lib/i18n.ts` (browser language → `fr` fallback).
- Messages: flat dot-notation keys in `src/lang/fr.json` and `src/lang/en-US.json`.
  Both files must stay in sync — add a key to **both** or the other locale falls back to
  the raw id. Namespace by domain (`auth.login.*`, `dashboard.*`, `common.*`).
- **Never inline a user-facing string in a `.tsx`.** In JSX use
  `<FormattedMessage id="…" />`; for attributes (`placeholder`, `aria-label`, `title`) use
  `useIntl().formatMessage({ id })`; in a `useXxx.ts` hook use `useTranslate()` from
  `src/hooks/useTranslate.ts`.
- Interpolation via `values={{ … }}` — including React nodes for embedded links; never
  concatenate translated fragments.
- Server messages (`apps/api` `constants/messages.ts`) are **not** localized: map the
  GraphQL `extensions.code` to a translation key in the feature hook, don't render
  `error.message` directly.

## 8. Constants

- Enums/const objects for string unions used in logic (status, route params). No duplicated
  magic strings — centralize in `constants/` or a colocated `*Ui.ts`.

## 9. Tests

- Behavior-focused tests for hooks and critical UI once a test runner is introduced
  (Vitest + Testing Library). Not required for the current scaffold stage.

## 10. Compliance gate (mandatory)

- Comments in code: English only, short (one line preferred), only where something is
  non-obvious (a constraint, a workaround, a subtle invariant). Don't over-comment.
- User-facing strings that might need localization later: keep them centralized (see
  backend `constants/messages.ts` for the pattern) rather than scattered inline.
- When you touch a file, fix obvious non-compliance nearby in the same change.

---

# Backend — `apps/api`

## Mindset

- Explicit authorization, predictable errors, no trust in client input.
- Thin GraphQL surface, fat service layer — resolvers decide **who** may call;
  services decide **what** is allowed and **how** data is read/written.

## 1. GraphQL module layout

Each domain → `src/graphql/modules/<module>/`:

| File           | Role                                                                            |
| -------------- | ------------------------------------------------------------------------------- |
| `typeDefs.ts`  | SDL for this domain (merged in `graphql/schema.ts`).                            |
| `resolvers.ts` | Thin wiring: auth guard (`requireUser`/`requireRole`) + delegate to service.    |
| `xService.ts`  | Business logic: Zod validation, Prisma calls, mapping.                          |
| `xMappers.ts`  | Prisma entity → GraphQL shape (never leak sensitive fields, e.g. passwordHash). |
| `__tests__/`   | Unit tests for the service.                                                     |

`auth/` is the reference module — copy its shape for new domains (`profiles`, `cv`, `jobs`…).

## 2. Resolvers stay thin

- Only: authorization + `return someService.method(ctx, …)`.
- Never in a resolver: Zod parsing, Prisma calls, pagination math, business rules.

## 3. Services own the logic

- Path: `graphql/modules/<module>/<module>Service.ts`.
- Owns: Zod validation, Prisma access, transformations, domain errors (`GraphQLError`
  with an `extensions.code`).
- If a service grows or creates cycles, split into focused files in the same folder —
  never push logic into resolvers.

## 4. Shared lib/

- `lib/prisma.ts` — singleton client.
- `lib/auth.ts` — password hashing (bcrypt).
- `lib/rbac.ts` — `requireUser`/`requireRole` guards, used by resolvers.
- `config/env.ts` — Zod-validated environment variables; the server refuses to boot if a
  required key is missing.

## 5. User-facing messages

- Centralize error/response strings in `src/constants/messages.ts` (English). This is the
  single place to introduce FR/EN switching later if the product ever needs it — never
  inline a user-facing string directly in a service or resolver.

## 6. Path aliases

- `@/*` → `src/*` for any import that crosses up (`../`) into another folder; `@gql/*` →
  `src/gql/*` is a dedicated shorthand for generated resolver types. Same-folder or
  child-folder imports (`./sibling.js`, `./subfolder/x.js`) stay relative — they're already
  short and don't need aliasing.
- Configured in `tsconfig.json` (`paths`), resolved at build time by `tsc-alias`
  (`npm run build`); `tsx watch` resolves both natively in dev.

## 7. Prisma / data

- Schema: `prisma/schema.prisma`, ported from the original `schema.sql` with `@@map`/`@map`
  preserving original table/column names (eases the future data migration).
- Prefer enums over free-text status fields. After any schema change: `npm run db:migrate`,
  then `npm run codegen` if GraphQL types depend on it.

## 8. Context

- `src/context.ts` defines `{ prisma, user }`, built per request by decoding the Bearer
  token. Services receive `ctx` — no ad-hoc Prisma client in a resolver.

## 9. Types & codegen

- `typescript-resolvers` (via `npm run codegen`) generates `src/gql/resolvers-types.ts` from
  the merged `typeDefs`. Every resolver is typed against it (`QueryResolvers['x']`,
  `MutationResolvers['x']`) — no `unknown`/`any` args on a resolver.

## 10. Tests

- Runner: `node:test` (`npm run test`). Unit-test service behavior; mock Prisma only when
  it meaningfully speeds up the test.

## 11. Compliance gate (mandatory)

- Comments in code: English only, short, only for non-obvious things.
- When you touch a file, scan nearby code and fix non-compliance in the same change.

---

# Git

- No AI attribution anywhere (no "Co-Authored-By: Claude", no "🤖 Generated with", no trailers in commits/PR)

# Relation front ↔ back

- The GraphQL schema is the contract. `apps/api` is the source of truth for permissions and
  business rules; the frontend encodes only UI validation and happy-path assumptions.
- After any backend schema change: restart `dev:api`, run `npm run codegen -w apps/api`
  (resolver types), then `npm run codegen -w apps/web` (client types).
