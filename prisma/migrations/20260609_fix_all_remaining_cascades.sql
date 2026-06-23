-- ============================================================================
-- FIX: Toutes les FK manquantes de CASCADE
--
-- La migration 20260531 ne couvrait que les FK vers profiles(id) et auth.users.
-- Mais la chaîne de suppression passe aussi par d'autres tables :
--
--   auth.users → profiles → coach_events → bookings (bloque ici!)
--   auth.users → profiles → applications → match_analyses (bloque ici!)
--
-- Cette migration ajoute ON DELETE CASCADE sur TOUTES les FK restantes
-- pour permettre la suppression complète d'un user depuis le dashboard.
--
-- ⚠️ Safe to run multiple times (DROP IF EXISTS + ADD)
-- ============================================================================

-- ─── 1. profiles → auth.users ───────────────────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── 2. FK vers profiles(id) — toutes en CASCADE ───────────────────────────
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_user_id_fkey,
  ADD CONSTRAINT applications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_user_id_fkey,
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.calendar_events
  DROP CONSTRAINT IF EXISTS calendar_events_coach_id_fkey,
  ADD CONSTRAINT calendar_events_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey,
  ADD CONSTRAINT conversation_participants_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.cvs
  DROP CONSTRAINT IF EXISTS cvs_user_id_fkey,
  ADD CONSTRAINT cvs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.goals
  DROP CONSTRAINT IF EXISTS goals_user_id_fkey,
  ADD CONSTRAINT goals_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
  ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_user_id_fkey,
  ADD CONSTRAINT tickets_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.user_skills
  DROP CONSTRAINT IF EXISTS user_skills_user_id_fkey,
  ADD CONSTRAINT user_skills_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── 3. FK INTER-TABLES (les manquantes qui bloquaient la chaîne) ───────────

-- bookings → coach_events (LE FIX PRINCIPAL)
-- Quand un coach est supprimé, ses events sont CASCADE-deleted,
-- ce qui doit aussi supprimer les bookings sur ces events.
-- NB: Le FK pointe vers coach_events (pas calendar_events) — les bookings
-- utilisent coach_events en production.
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_event_id_fkey,
  ADD CONSTRAINT bookings_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.coach_events(id) ON DELETE CASCADE;

-- match_analyses → applications
-- Quand un candidat est supprimé, ses applications sont CASCADE-deleted,
-- ce qui doit aussi supprimer les analyses de matching.
ALTER TABLE public.match_analyses
  DROP CONSTRAINT IF EXISTS match_analyses_application_id_fkey,
  ADD CONSTRAINT match_analyses_application_id_fkey
    FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;

-- applications → job_offers (SET NULL — on garde l'offre même si on supprime la candidature)
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_job_offer_id_fkey,
  ADD CONSTRAINT applications_job_offer_id_fkey
    FOREIGN KEY (job_offer_id) REFERENCES public.job_offers(id) ON DELETE SET NULL;

-- messages → conversations (CASCADE — si la conversation est supprimée, les messages aussi)
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey,
  ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- conversation_participants → conversations
ALTER TABLE public.conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_fkey,
  ADD CONSTRAINT conversation_participants_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- user_skills → skills (CASCADE — si le skill est supprimé, le lien aussi)
ALTER TABLE public.user_skills
  DROP CONSTRAINT IF EXISTS user_skills_skill_id_fkey,
  ADD CONSTRAINT user_skills_skill_id_fkey
    FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;

-- ─── 4. Coach agreements (si pas encore créée) ─────────────────────────────

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

DROP POLICY IF EXISTS "Coaches can read their own agreements" ON public.coach_agreements;
DROP POLICY IF EXISTS "Coaches can sign their own agreement" ON public.coach_agreements;
DROP POLICY IF EXISTS "Service role full access" ON public.coach_agreements;

CREATE POLICY "Coaches can read their own agreements"
  ON public.coach_agreements FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can sign their own agreement"
  ON public.coach_agreements FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Service role full access"
  ON public.coach_agreements FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- ✅ DONE — Tu peux maintenant supprimer des users depuis le dashboard Supabase
-- ============================================================================
