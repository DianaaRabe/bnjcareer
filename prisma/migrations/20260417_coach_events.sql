-- Création de la table pour les rendez-vous / sessions des coachs
CREATE TABLE public.coach_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['1v1'::text, 'group'::text])),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  max_participants integer DEFAULT 1,
  meet_link text,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT coach_events_pkey PRIMARY KEY (id),
  CONSTRAINT coach_events_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Activation du RLS pour la table
ALTER TABLE public.coach_events ENABLE ROW LEVEL SECURITY;

-- Les coachs peuvent voir leurs propres évènements
CREATE POLICY "Coachs can view their own events"
ON public.coach_events FOR SELECT TO authenticated
USING (auth.uid() = coach_id);

-- Les coachs peuvent créer leurs propres évènements
CREATE POLICY "Coachs can insert their own events"
ON public.coach_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = coach_id);

-- Les coachs peuvent modifier leurs propres évènements
CREATE POLICY "Coachs can update their own events"
ON public.coach_events FOR UPDATE TO authenticated
USING (auth.uid() = coach_id);

-- Les coachs peuvent supprimer leurs propres évènements
CREATE POLICY "Coachs can delete their own events"
ON public.coach_events FOR DELETE TO authenticated
USING (auth.uid() = coach_id);
