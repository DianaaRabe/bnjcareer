-- Extend the resources table with coach, category, metadata and paywall columns
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS description    text,
  ADD COLUMN IF NOT EXISTS category       text DEFAULT 'Général',
  ADD COLUMN IF NOT EXISTS file_url       text,
  ADD COLUMN IF NOT EXISTS size_label     text,
  ADD COLUMN IF NOT EXISTS duration_label text,
  ADD COLUMN IF NOT EXISTS coach_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_published   boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_locked      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price          numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS views_count    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at     timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now();

-- Widen the type constraint to include replay, article, doc
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_type_check;
ALTER TABLE public.resources
  ADD CONSTRAINT resources_type_check
  CHECK (type = ANY (ARRAY['pdf','video','replay','article','doc']));

-- Copy url -> file_url for existing rows
UPDATE public.resources SET file_url = url WHERE file_url IS NULL AND url IS NOT NULL;

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- All published resources are visible to everyone (authenticated or not).
-- Locked resources are still visible (to show the paywall) — just the file_url is hidden client-side.
DROP POLICY IF EXISTS "resources_select" ON public.resources;
CREATE POLICY "resources_select"
  ON public.resources FOR SELECT
  USING (is_published = true OR coach_id = auth.uid());

DROP POLICY IF EXISTS "resources_insert" ON public.resources;
CREATE POLICY "resources_insert"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "resources_update" ON public.resources;
CREATE POLICY "resources_update"
  ON public.resources FOR UPDATE
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "resources_delete" ON public.resources;
CREATE POLICY "resources_delete"
  ON public.resources FOR DELETE
  USING (coach_id = auth.uid());
