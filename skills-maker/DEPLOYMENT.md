# Deployment — Vercel (web) + Render (API) + Supabase (Postgres)

This monorepo does **not** deploy as a single Vercel project. The API is a
long-running process (Express + Apollo) with **WebSocket subscriptions** and
**disk-backed file uploads**, neither of which works on Vercel's serverless
functions. So:

| Piece            | Where it runs                    | Why                                  |
| ---------------- | -------------------------------- | ------------------------------------ |
| `apps/web` (SPA) | **Vercel**                       | Static Vite build, CDN-served        |
| `apps/api`       | **Render** (or Railway/Fly)      | Persistent Node + WebSockets + disk  |
| Database         | **Supabase** (managed Postgres)  | `DATABASE_URL` only                  |

> Local development is unchanged: keep running the local Postgres + `npm run dev`.
> None of the files below touch your local `.env` or `schema.prisma`. The Supabase
> connection string lives **only** in the host's environment variables.

---

## 1. Database (Supabase)

1. Create a Supabase project. Copy the connection string from
   **Project settings → Database → Connection string**.
2. Because the API is a **persistent** process (not serverless), use the
   **direct connection (port 5432)** as `DATABASE_URL` — a single long-lived
   process doesn't need pgBouncer pooling, and `prisma migrate deploy` needs a
   direct connection anyway:
   ```
   postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
3. Migrations run automatically from the API's `startCommand`
   (`prisma migrate deploy`). To run them by hand instead:
   ```bash
   DATABASE_URL="…5432…" npm run db:migrate:deploy -w apps/api
   ```
4. (Optional) Seed once: `DATABASE_URL="…" npm run db:seed -w apps/api`.

---

## 2. API (Render)

`render.yaml` at the repo root describes the service. In the Render dashboard:

1. **New → Blueprint**, point it at this repo. It picks up `render.yaml`.
2. Set the secret env vars (marked `sync: false`):
   - `DATABASE_URL` → the Supabase string from step 1.
   - `JWT_SECRET` → `openssl rand -hex 32`.
   - `CORS_ORIGIN` → the deployed web URL, e.g. `https://your-app.vercel.app`.
   - Any optional keys you use (GROQ, APIFY, France Travail, Brevo…).
3. A **1 GB persistent disk** is mounted at `/var/data`; `UPLOAD_DIR` and
   `JOBS_RUNS_DIR` point inside it so uploaded CVs survive restarts/redeploys.
4. Deploy. Health check is `GET /health`. Note the public URL, e.g.
   `https://skills-maker-api.onrender.com`.

> WebSockets: the `starter` plan (or above) is required — the free tier sleeps
> and drops sockets, breaking GraphQL subscriptions.

---

## 3. Web (Vercel)

> ⚠️ **Repo layout.** The git repo root is `E:/BNJ Career`, an **older** project.
> This app lives in the **nested workspace** `skills-maker/` (its own
> `package-lock.json`). The existing Vercel deployment (bnj-skills-maker.vercel.app)
> currently points at the OLD `E:/BNJ Career/apps` — that's why it shows the old UI.
> The steps below re-point it at `skills-maker/apps/web`.

### The web build is fully OFFLINE — no live API needed

GraphQL codegen reads a **committed SDL snapshot** (`apps/web/schema.graphql`)
instead of introspecting a running server, so `vercel --prod` works even before
the API/DB exist. Regenerate the snapshot after any API schema change:

```bash
npm run schema:export -w apps/api   # rewrites apps/web/schema.graphql
```

### One-time Vercel setup (CLI)

From the **`skills-maker/` workspace root** (so Vercel installs the workspace):

```bash
cd skills-maker
vercel link            # link to the existing "bnj-skills-maker" project (or create one)
```

Then in the Vercel **project settings** (dashboard or CLI):

- **Root Directory** → `apps/web`  ← the key change that swaps old UI for new.
- Leave Install Command on **auto** (Vercel detects the npm workspace and installs
  from the `skills-maker` root — do NOT force `npm ci`, it would run in `apps/web`
  where there is no lockfile). Build/output come from `apps/web/vercel.json`.
- Environment variable:
  - `VITE_API_URL` → the API's `/graphql` URL once it's deployed, e.g.
    `https://skills-maker-api.onrender.com/graphql` (the WebSocket URL is derived
    automatically: `http→ws`, `https→wss`). Until the API exists you can set a
    placeholder — the UI loads but data calls will fail until the API is up.

### Every deploy after that

```bash
cd skills-maker
vercel --prod
```

---

## Deploy order

The web build no longer depends on a live API, so the UI can ship first:

1. **Web** on Vercel — ship the new UI immediately (`vercel --prod`).
2. **Supabase** DB ready + migrated (when you create it).
3. **API** on Render, then set `VITE_API_URL` on Vercel to its URL and redeploy web.

Only redeploy web after an API schema change **and** after re-running
`npm run schema:export -w apps/api` so codegen picks up the new SDL.

## Notes / caveats

- `apps/web/schema.graphql` **is committed** (the offline schema snapshot);
  `apps/web/src/gql` and `apps/api/src/gql` stay gitignored — both builds
  regenerate them via `codegen` (already wired into the build commands).
- `introspection: true` is enabled on the API too, so you can alternatively point
  codegen at a live server by setting `CODEGEN_SCHEMA_URL` — but the committed SDL
  is the default and needs no server.
- If you later move the API to a host with an ephemeral filesystem, uploaded
  files will be lost on redeploy — keep a persistent disk or switch uploads to
  object storage (e.g. Supabase Storage / S3).
- The `SUPABASE_*` keys in `apps/api/.env.example` are only for a one-off data
  migration and are not read at runtime.
