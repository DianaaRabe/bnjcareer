-- ============================================================================
-- Job CV Versions Table — Job-Specific CV Optimization Feature
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Create the job_cv_versions table
CREATE TABLE IF NOT EXISTS public.job_cv_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_offer_id uuid,
  base_cv_id uuid,
  job_title text NOT NULL,
  job_company text,
  job_description text,
  job_url text,
  match_score_before double precision,
  match_score_after double precision,
  optimized_html text,
  improvements jsonb DEFAULT '[]'::jsonb,
  match_summary text,
  cv_data jsonb,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_cv_versions_pkey PRIMARY KEY (id),
  CONSTRAINT job_cv_versions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT job_cv_versions_job_offer_id_fkey FOREIGN KEY (job_offer_id) REFERENCES public.job_offers(id) ON DELETE SET NULL,
  CONSTRAINT job_cv_versions_base_cv_id_fkey FOREIGN KEY (base_cv_id) REFERENCES public.cvs(id) ON DELETE SET NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_job_cv_versions_user_id ON public.job_cv_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_job_cv_versions_user_status ON public.job_cv_versions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_cv_versions_job ON public.job_cv_versions(user_id, job_title);

-- Enable Row Level Security
ALTER TABLE public.job_cv_versions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own versions
CREATE POLICY "Users can view their own job_cv_versions"
  ON public.job_cv_versions
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Users can insert their own versions
CREATE POLICY "Users can insert their own job_cv_versions"
  ON public.job_cv_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own versions
CREATE POLICY "Users can update their own job_cv_versions"
  ON public.job_cv_versions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: Service role full access (for admin client in API routes)
CREATE POLICY "Service role full access on job_cv_versions"
  ON public.job_cv_versions
  FOR ALL
  USING (true)
  WITH CHECK (true);
