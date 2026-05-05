-- ============================================================================
-- Add candidature email tracking columns to applications table
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Add columns for email candidature tracking
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS company_email text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS sent_at timestamptz DEFAULT now();

-- Update the status CHECK constraint to include 'sent' if not already present
-- (The existing constraint already includes 'sent', so this is a safety check)

-- Index for querying sent candidatures by user
CREATE INDEX IF NOT EXISTS idx_applications_user_sent
  ON public.applications(user_id, status)
  WHERE status = 'sent';

-- Index for querying by company email
CREATE INDEX IF NOT EXISTS idx_applications_company_email
  ON public.applications(company_email)
  WHERE company_email IS NOT NULL;
