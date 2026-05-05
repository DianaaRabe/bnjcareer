-- Ajout des colonnes pour les évènements payants
ALTER TABLE public.coach_events 
ADD COLUMN is_paid boolean DEFAULT false,
ADD COLUMN price numeric(10,2) DEFAULT 0;
