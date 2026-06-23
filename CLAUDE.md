# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BNJ Career is a **multi-tenant employment assistance platform** built on Next.js 14 (App Router) + Supabase + Turborepo. It serves three tenants (FR, Africa, Community) from a single codebase, each with distinct branding, features, and job sources. The platform includes AI-powered CV optimization, job scraping, coaching, messaging, and e-learning.

## Commands

```bash
# Development
npm run dev              # Start all apps via Turbo (Next.js on localhost:3000)

# Build
npm run build            # Build all apps

# Lint
npm run lint             # Lint all apps

# Seeding (from project root)
npm run seed             # Main seed: coaches, candidates, formations, sessions
npm run seed:bnj         # Test user seed (Benjamin & Fanilo)
npm run seed:messaging   # Messaging/conversation seed
npm run seed:resources   # Resource library seed
```

Dev server runs at `http://localhost:3000`. Switch tenants locally via `?tenant=community` or `?tenant=africa` query param.

## Architecture

### Monorepo Structure

```
apps/web/          # Main Next.js 14 application (App Router)
packages/          # Shared packages (ui, types, ai) — mostly stubs for now
prisma/            # Seed scripts + schema reference (actual schema lives in Supabase)
```

### Multi-Tenant System

**Tenant detection chain** (middleware.ts): `?tenant=` query param > `x-tenant-id` cookie > hostname mapping > default (FR)

Tenant configs live in `apps/web/tenants/{fr,africa,community}/config.ts`, registered in `tenants/registry.ts`. Each config defines:
- **branding** — colors (CSS RGB values for Tailwind var injection), logo, fonts
- **features** — boolean flags controlling entire UI sections
- **jobs** — provider type (`aggregator` for Apify scraping vs `local-db` for Supabase)
- **seo/hero** — per-tenant landing page content

| Feature | FR | Africa | Community |
|---|---|---|---|
| Job Source | Indeed + LinkedIn + HelloWork | Indeed + LinkedIn | Local Supabase DB |
| Admin Dashboard | No | No | Yes |
| Color Scheme | Purple + Yellow | Purple + Orange | Blue + Gold |

**CSS variable injection**: FR defaults in `globals.css :root`, others via `<style>` tag in `app/layout.tsx`. Tailwind references them as `bg-brand-primary`, `text-brand-accent`, etc.

### Core Lib Modules (`apps/web/lib/`)

- **`tenant/`** — `context.tsx` (client hooks: `useTenant()`, `useFeatures()`, `useBranding()`), `server.ts` (server-side resolution + CSS var builder)
- **`supabase/`** — `client.ts` (browser), `server.ts` (RSC/route handlers), `admin.ts` (service role, bypasses RLS)
- **`llm/client.ts`** — Centralized multi-provider wrapper (Groq primary, OpenRouter fallback). Multi-key rotation (up to 5 keys per provider with Fisher-Yates shuffle). `callLLM()`, `callLLMStream()`, `extractCVOptimization()`, `parseLLMJson()`.
- **`cv/immutable.ts`** — Server-side CV data extractors to prevent LLM hallucination. Contact info, experiences, education are extracted before LLM call and injected as verbatim constraints.
- **`jobs/`** — Factory pattern: `aggregator.ts` (Apify-based scraping) vs `local-db.ts` (Supabase). `factory.ts` returns correct provider per tenant config.

### Key Route Groups

- `/(auth)/` — Login flows (candidate + coach), OAuth callback
- `/dashboard/` — Candidate space (profile, CV, jobs, scrapper, coaching, formations, messages, resources, subscriptions)
- `/coach/` — Coach space (candidates, calendar, formations, messages, resources). Protected by agreement gate in `coach/layout.tsx`.
- `/admin/` — Community-only admin (companies, jobs, members)
- `/api/` — Route handlers for scraping (Indeed, HelloWork), CV optimization, chat, messaging, admin operations, coach agreement

### Auth & Role Routing

Middleware handles role-based routing:
- **Candidates** → `/dashboard`
- **Coaches** → `/coach` (requires signed agreement, otherwise redirected to `/coach-agreement`)
- **Admins** → `/admin` (only if tenant has `adminDashboard` feature flag)

Supabase auth with Google OAuth. Tenant preserved through OAuth flow via `intended_tenant` cookie set before redirect, read in `/auth/callback/route.ts`.

## Environment Variables

Required in `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY              # Primary LLM provider (free tier)
GROQ_API_KEY_2            # Optional rotation key (up to _5)
APIFY_API_TOKEN           # Indeed/LinkedIn scraping
APIFY_API_TOKEN_HELLOWORK # HelloWork scraping
BREVO_SMTP_API_KEY        # Email sending
BREVO_API_KEY
BREVO_SENDER_EMAIL
```

Optional:
```
LLM_PROVIDER              # "groq" | "openrouter" (auto-detected from available keys)
LLM_MODEL                 # Override specific model
OPENROUTER_API_KEY        # Fallback LLM provider
MAKE_WELCOME_WEBHOOK_URL  # Make.com webhook for onboarding
```

## Conventions

- **Language**: All user-facing text is in French. Code comments mix French and English.
- **Tenant-aware components**: Use `useFeatures()` hook to conditionally render based on tenant feature flags. Never hardcode tenant-specific behavior.
- **LLM calls**: Always use `callLLM()` from `lib/llm/client.ts`, never direct fetch to provider APIs. Include anti-hallucination constraints for any CV-related prompts.
- **Admin operations**: Use `createAdminClient()` from `lib/supabase/admin.ts` for operations that bypass RLS (user deletion, cross-user data access).
- **Supabase schema**: Managed directly in Supabase dashboard, not via Prisma migrations. The `prisma/` folder is only for seeding.
- **Path alias**: `@/*` maps to `apps/web/*` (e.g., `@/lib/supabase/server`, `@/components/layout/Sidebar`).
