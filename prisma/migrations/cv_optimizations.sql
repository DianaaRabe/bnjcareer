-- ============================================================================
-- CV Optimizations Table — ATS CV Optimizer Feature
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Create the cv_optimizations table
CREATE TABLE IF NOT EXISTS public.cv_optimizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  original_cv_url text NOT NULL,
  optimized_html text,
  optimized_cv_url text,
  improvements jsonb DEFAULT '[]'::jsonb,
  cv_data jsonb,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cv_optimizations_pkey PRIMARY KEY (id),
  CONSTRAINT cv_optimizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS idx_cv_optimizations_user_id ON public.cv_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_optimizations_status ON public.cv_optimizations(user_id, status);

-- Enable Row Level Security
ALTER TABLE public.cv_optimizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own optimizations
CREATE POLICY "Users can view their own cv_optimizations"
  ON public.cv_optimizations
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own optimizations
CREATE POLICY "Users can insert their own cv_optimizations"
  ON public.cv_optimizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own optimizations
CREATE POLICY "Users can update their own cv_optimizations"
  ON public.cv_optimizations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can do everything (for admin client in API routes)
CREATE POLICY "Service role full access on cv_optimizations"
  ON public.cv_optimizations
  FOR ALL
  USING (true)
  WITH CHECK (true);
