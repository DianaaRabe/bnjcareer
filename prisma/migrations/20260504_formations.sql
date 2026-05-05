-- ============================================================================
-- Formations (Training) — Full Schema
-- Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Formations table (created by coaches)
CREATE TABLE IF NOT EXISTS public.formations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  duration_label text,                        -- ex: "30 jours", "6 semaines"
  price numeric(10,2) DEFAULT 0,              -- 0 = free
  level text DEFAULT 'débutant' CHECK (level IN ('débutant', 'intermédiaire', 'avancé')),
  category text,                              -- ex: "Entretien", "CV", "Reconversion"
  is_published boolean DEFAULT false,
  max_students integer,
  modules_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT formations_pkey PRIMARY KEY (id),
  CONSTRAINT formations_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_formations_coach_id ON public.formations(coach_id);
CREATE INDEX IF NOT EXISTS idx_formations_published ON public.formations(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_formations_category ON public.formations(category);

-- 2. Formation modules (lessons inside a formation)
CREATE TABLE IF NOT EXISTS public.formation_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,                             -- YouTube / Vimeo link
  transcript text,                            -- Written transcript of the video
  exercise_data jsonb DEFAULT '[]'::jsonb,    -- Array of {type, question, options[], correct_answer, explanation}
  duration_minutes integer,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT formation_modules_pkey PRIMARY KEY (id),
  CONSTRAINT formation_modules_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_formation_modules_formation_id ON public.formation_modules(formation_id);

-- 3. Milestones / checkpoints in a formation
CREATE TABLE IF NOT EXISTS public.formation_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  CONSTRAINT formation_milestones_pkey PRIMARY KEY (id),
  CONSTRAINT formation_milestones_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON DELETE CASCADE
);

-- 4. Student enrollments
CREATE TABLE IF NOT EXISTS public.formation_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL,
  student_id uuid NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  progress_pct integer DEFAULT 0,
  certificate_url text,                       -- PDF cert URL (paid feature)
  has_badge boolean DEFAULT false,            -- Free badge
  CONSTRAINT formation_enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT formation_enrollments_unique UNIQUE (formation_id, student_id),
  CONSTRAINT formation_enrollments_formation_id_fkey FOREIGN KEY (formation_id) REFERENCES public.formations(id) ON DELETE CASCADE,
  CONSTRAINT formation_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_formation_enrollments_student_id ON public.formation_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_formation_enrollments_formation_id ON public.formation_enrollments(formation_id);

-- 5. Module-level progress tracking
CREATE TABLE IF NOT EXISTS public.formation_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL,
  module_id uuid NOT NULL,
  completed boolean DEFAULT false,
  exercise_score integer,                     -- 0-100 for QCM
  open_answer text,                           -- Open-ended answer text
  completed_at timestamptz,
  CONSTRAINT formation_progress_pkey PRIMARY KEY (id),
  CONSTRAINT formation_progress_unique UNIQUE (enrollment_id, module_id),
  CONSTRAINT formation_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.formation_enrollments(id) ON DELETE CASCADE,
  CONSTRAINT formation_progress_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.formation_modules(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_formation_progress_enrollment_id ON public.formation_progress(enrollment_id);

-- ── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_progress ENABLE ROW LEVEL SECURITY;

-- formations: public read for published, coach manages own
CREATE POLICY "Public can view published formations"
  ON public.formations FOR SELECT
  USING (is_published = true OR coach_id = auth.uid());

CREATE POLICY "Coaches can insert their own formations"
  ON public.formations FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their own formations"
  ON public.formations FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their own formations"
  ON public.formations FOR DELETE
  USING (auth.uid() = coach_id);

-- modules: readable by enrolled students and coach
CREATE POLICY "Enrolled students and coach can view modules"
  ON public.formation_modules FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.formations f WHERE f.id = formation_id AND (f.coach_id = auth.uid() OR f.is_published = true))
  );

CREATE POLICY "Coaches manage their modules"
  ON public.formation_modules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.formations f WHERE f.id = formation_id AND f.coach_id = auth.uid())
  );

-- milestones: same as modules
CREATE POLICY "Anyone can view milestones of published formations"
  ON public.formation_milestones FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.formations f WHERE f.id = formation_id AND (f.coach_id = auth.uid() OR f.is_published = true))
  );

CREATE POLICY "Coaches manage their milestones"
  ON public.formation_milestones FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.formations f WHERE f.id = formation_id AND f.coach_id = auth.uid())
  );

-- enrollments: students see their own, coaches see their formation's enrollments
CREATE POLICY "Students see own enrollments"
  ON public.formation_enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Coaches see enrollments in their formations"
  ON public.formation_enrollments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.formations f WHERE f.id = formation_id AND f.coach_id = auth.uid())
  );

CREATE POLICY "Students can enroll"
  ON public.formation_enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- progress: student manages own
CREATE POLICY "Students manage their own progress"
  ON public.formation_progress FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.formation_enrollments e WHERE e.id = enrollment_id AND e.student_id = auth.uid())
  );

CREATE POLICY "Coaches can view progress in their formations"
  ON public.formation_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.formation_enrollments e
      JOIN public.formations f ON f.id = e.formation_id
      WHERE e.id = enrollment_id AND f.coach_id = auth.uid()
    )
  );

-- Service role bypass for API routes
CREATE POLICY "Service role bypass formations" ON public.formations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass modules" ON public.formation_modules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass milestones" ON public.formation_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass enrollments" ON public.formation_enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass progress" ON public.formation_progress FOR ALL USING (true) WITH CHECK (true);
