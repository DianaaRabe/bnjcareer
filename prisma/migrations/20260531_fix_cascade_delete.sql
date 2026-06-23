-- ============================================================================
-- Fix: Add ON DELETE CASCADE to all FK constraints referencing profiles(id)
-- and fix profiles → auth.users cascade.
--
-- Root cause: the original schema.sql was missing ON DELETE CASCADE on all
-- core tables. Newer tables (formations, coach_events, job_cv_versions)
-- already have it. This migration patches the 10 old constraints.
--
-- Run this in Supabase SQL Editor → it is safe to run multiple times.
-- ============================================================================

-- 1. profiles → auth.users  (THE root fix — allows deleting from auth.users)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. applications
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_user_id_fkey,
  ADD CONSTRAINT applications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. bookings
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. calendar_events (old table — different from coach_events)
ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_coach_id_fkey,
  ADD CONSTRAINT calendar_events_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. conversation_participants
ALTER TABLE public.conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey,
  ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. cvs
ALTER TABLE public.cvs
  DROP CONSTRAINT IF EXISTS cvs_user_id_fkey,
  ADD CONSTRAINT cvs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. goals
ALTER TABLE public.goals
  DROP CONSTRAINT IF EXISTS goals_user_id_fkey,
  ADD CONSTRAINT goals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. messages — SET NULL pour conserver l'historique des conversations
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 9. tickets
ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_user_id_fkey,
  ADD CONSTRAINT tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 10. user_skills
ALTER TABLE public.user_skills
  DROP CONSTRAINT IF EXISTS user_skills_user_id_fkey,
  ADD CONSTRAINT user_skills_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- Vérification : liste toutes les FK qui referent profiles(id)
-- (à lancer après pour confirmer que tout est bien CASCADE)
-- ============================================================================
-- SELECT
--   tc.table_name,
--   kcu.column_name,
--   rc.delete_rule
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.key_column_usage kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.referential_constraints rc
--   ON tc.constraint_name = rc.constraint_name
-- JOIN information_schema.key_column_usage ccu
--   ON rc.unique_constraint_name = ccu.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND ccu.table_name = 'profiles'
-- ORDER BY tc.table_name;
