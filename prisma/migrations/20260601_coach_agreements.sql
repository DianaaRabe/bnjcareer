-- ============================================================================
-- Coach Agreement — terms-of-service acceptance for coaches
--
-- When a user with role='coach' first accesses /coach/*, they must accept
-- the revenue split agreement (25% on candidate subscriptions, 25% platform
-- fee on paid formations/workshops).
--
-- We record: their name as typed, acceptance timestamp, IP, user-agent,
-- and the contract version they agreed to. This gives Benjamin a legally
-- usable audit trail (admissible in French civil court under Article 1366
-- du Code civil — preuve par tous moyens électroniques).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.coach_agreements (
  id                              uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id                        uuid NOT NULL,
  contract_version                text NOT NULL,        -- e.g. "2026-06-01"
  signed_name                     text NOT NULL,        -- name as typed by the coach
  -- Revenue split snapshot (in case terms change later, we keep the values they agreed to)
  subscription_share_coach_pct    integer NOT NULL DEFAULT 25,   -- % of candidate subscription
  formation_share_platform_pct    integer NOT NULL DEFAULT 25,   -- % of formation price that goes to platform
  -- Audit trail
  accepted_at                     timestamptz NOT NULL DEFAULT now(),
  ip_address                      inet,
  user_agent                      text,
  revoked_at                      timestamptz,          -- non-null = agreement no longer valid

  CONSTRAINT coach_agreements_pkey PRIMARY KEY (id),
  CONSTRAINT coach_agreements_coach_id_fkey
    FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Fast lookup: "does this coach have a valid (non-revoked) agreement?"
CREATE INDEX IF NOT EXISTS idx_coach_agreements_coach_active
  ON public.coach_agreements(coach_id) WHERE revoked_at IS NULL;

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.coach_agreements ENABLE ROW LEVEL SECURITY;

-- A coach can read their own agreements
CREATE POLICY "Coaches can read their own agreements"
  ON public.coach_agreements FOR SELECT
  USING (auth.uid() = coach_id);

-- A coach can insert their own agreement (acceptance)
CREATE POLICY "Coaches can sign their own agreement"
  ON public.coach_agreements FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- Service role can do everything (admin operations, revocation, audit)
CREATE POLICY "Service role full access"
  ON public.coach_agreements FOR ALL
  USING (true) WITH CHECK (true);
