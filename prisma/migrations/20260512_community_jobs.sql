-- ─────────────────────────────────────────────────────────────────────────────
-- Community Tenant: Companies + Local Jobs
-- Used exclusively by the community.bnjcareer.com tenant.
-- Jobs are managed via the admin dashboard (no external aggregators).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Companies ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.companies (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL,
  logo_url     text,
  website_url  text,
  description  text,
  sector       text,
  size_label   text,       -- ex: "10-50 employés"
  location     text,
  tenant_id    text        NOT NULL DEFAULT 'community',
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ── Local Jobs ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.local_jobs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  company_id        uuid        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description       text,
  location          text,
  contract_type     text        CHECK (contract_type IN ('CDI','CDD','Alternance','Stage','Freelance','Mission')),
  salary_label      text,       -- ex: "45-55k€"
  experience_level  text,       -- ex: "Junior", "Confirmé", "Senior"
  remote            text        CHECK (remote IN ('Non','Partiel','Complet')),
  application_url   text,       -- external apply link (optional)
  application_email text,       -- apply by email (optional)
  skills            text[],     -- array of skill tags
  tenant_id         text        NOT NULL DEFAULT 'community',
  is_active         boolean     NOT NULL DEFAULT true,
  expires_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_companies_tenant   ON public.companies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_active   ON public.companies(is_active);
CREATE INDEX IF NOT EXISTS idx_local_jobs_company ON public.local_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_local_jobs_tenant  ON public.local_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_local_jobs_active  ON public.local_jobs(is_active);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_jobs ENABLE ROW LEVEL SECURITY;

-- Companies: any authenticated user can read active companies
DROP POLICY IF EXISTS "companies_select" ON public.companies;
CREATE POLICY "companies_select"
  ON public.companies FOR SELECT
  USING (is_active = true OR created_by = auth.uid());

-- Admin-only writes on companies
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert"
  ON public.companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "companies_update" ON public.companies;
CREATE POLICY "companies_update"
  ON public.companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "companies_delete" ON public.companies;
CREATE POLICY "companies_delete"
  ON public.companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Local jobs: authenticated users read active jobs
DROP POLICY IF EXISTS "local_jobs_select" ON public.local_jobs;
CREATE POLICY "local_jobs_select"
  ON public.local_jobs FOR SELECT
  USING (is_active = true OR created_by = auth.uid());

-- Admin-only writes on local_jobs
DROP POLICY IF EXISTS "local_jobs_insert" ON public.local_jobs;
CREATE POLICY "local_jobs_insert"
  ON public.local_jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "local_jobs_update" ON public.local_jobs;
CREATE POLICY "local_jobs_update"
  ON public.local_jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "local_jobs_delete" ON public.local_jobs;
CREATE POLICY "local_jobs_delete"
  ON public.local_jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
