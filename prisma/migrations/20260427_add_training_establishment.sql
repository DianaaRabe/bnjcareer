-- Add training_establishment column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_establishment text;

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.training_establishment IS 'The training establishment or school for candidates.';
