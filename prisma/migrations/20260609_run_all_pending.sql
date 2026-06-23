-- ============================================================================
-- MIGRATION COMBINÉE — À exécuter dans Supabase SQL Editor
-- https://supabase.com/dashboard/project/ogwrtegpknihxixgptqe/sql/new
--
-- Contient :
-- 1. Fix CASCADE DELETE sur toutes les FK (permet de supprimer des users)
-- 2. Table coach_agreements (si pas encore créée)
--
-- ⚠️  Safe to run multiple times (IF NOT EXISTS + DROP CONSTRAINT IF EXISTS)
-- ============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. FIX CASCADE DELETE
-- ═══════════════════════════════════════════════════════════════════════════

-- 1a. profiles → auth.users  (THE root fix — allows deleting from auth.users)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 1b. applications
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_user_id_fkey,
  ADD CONSTRAINT applications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1c. bookings
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1d. calendar_events
ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_coach_id_fkey,
  ADD CONSTRAINT calendar_events_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1e. conversation_participants
ALTER TABLE public.conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey,
  ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1f. cvs
ALTER TABLE public.cvs
  DROP CONSTRAINT IF EXISTS cvs_user_id_fkey,
  ADD CONSTRAINT cvs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1g. goals
ALTER TABLE public.goals
  DROP CONSTRAINT IF EXISTS goals_user_id_fkey,
  ADD CONSTRAINT goals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1h. messages — SET NULL pour conserver l'historique des conversations
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 1i. tickets
ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_user_id_fkey,
  ADD CONSTRAINT tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1j. user_skills
ALTER TABLE public.user_skills
  DROP CONSTRAINT IF EXISTS user_skills_user_id_fkey,
  ADD CONSTRAINT user_skills_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. COACH AGREEMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.coach_agreements (
  id                              uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id                        uuid NOT NULL,
  contract_version                text NOT NULL,
  signed_name                     text NOT NULL,
  subscription_share_coach_pct    integer NOT NULL DEFAULT 25,
  formation_share_platform_pct    integer NOT NULL DEFAULT 25,
  accepted_at                     timestamptz NOT NULL DEFAULT now(),
  ip_address                      inet,
  user_agent                      text,
  revoked_at                      timestamptz,

  CONSTRAINT coach_agreements_pkey PRIMARY KEY (id),
  CONSTRAINT coach_agreements_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coach_agreements_coach_active
  ON public.coach_agreements(coach_id) WHERE revoked_at IS NULL;

ALTER TABLE public.coach_agreements ENABLE ROW LEVEL SECURITY;

-- Drop policies first to avoid "already exists" errors
DROP POLICY IF EXISTS "Coaches can read their own agreements" ON public.coach_agreements;
DROP POLICY IF EXISTS "Coaches can sign their own agreement" ON public.coach_agreements;
DROP POLICY IF EXISTS "Service role full access" ON public.coach_agreements;

CREATE POLICY "Coaches can read their own agreements"
  ON public.coach_agreements FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can sign their own agreement"
  ON public.coach_agreements FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Service role full access"
  ON public.coach_agreements FOR ALL
  USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ENABLE CUSTOM SMTP EMAIL TEMPLATES (Auth > Email Templates)
-- ═══════════════════════════════════════════════════════════════════════════
-- After running this SQL, go to:
--   Supabase Dashboard > Auth > Email Templates
-- And customize the Reset Password email template if desired.
--
-- Then go to:
--   Supabase Dashboard > Auth > SMTP Settings
-- And configure a real SMTP provider (Resend, Brevo, etc.)
-- See instructions in the terminal output.

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE! You can now delete users from the Auth dashboard.
-- ═══════════════════════════════════════════════════════════════════════════
