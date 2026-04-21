-- Migration: Add onboarding fields to profiles
-- Run this in Supabase SQL Editor or via migration tool

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date       date,
  ADD COLUMN IF NOT EXISTS education_level  text,
  ADD COLUMN IF NOT EXISTS industry         text,
  ADD COLUMN IF NOT EXISTS current_status   text,
  ADD COLUMN IF NOT EXISTS strengths        jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weaknesses       jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS main_goal        text,
  ADD COLUMN IF NOT EXISTS specialization   text,
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS certifications   jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS previous_roles   jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS session_types    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS support_areas    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_onboarded     boolean NOT NULL DEFAULT false;

-- Update existing users who have complete profiles to be marked as onboarded
-- (adjust condition based on what "complete" means for your existing users)
UPDATE public.profiles
SET is_onboarded = true
WHERE first_name IS NOT NULL
  AND last_name IS NOT NULL
  AND bio IS NOT NULL;

-- Add constraint for current_status enum values
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_current_status_check
  CHECK (current_status IS NULL OR current_status = ANY (ARRAY['student', 'job_seeker', 'reconversion']));

-- Add constraint for main_goal enum values
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_main_goal_check
  CHECK (main_goal IS NULL OR main_goal = ANY (ARRAY['find_job', 'improve_cv', 'change_career', 'learn_skills', 'network']));
