CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  job_offer_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['sent'::text, 'pending'::text, 'rejected'::text, 'interview'::text])),
  match_score double precision,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT applications_job_offer_id_fkey FOREIGN KEY (job_offer_id) REFERENCES public.job_offers(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid,
  user_id uuid,
  status text DEFAULT 'booked'::text CHECK (status = ANY (ARRAY['booked'::text, 'canceled'::text])),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.calendar_events(id),
  CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid,
  title text,
  type text CHECK (type = ANY (ARRAY['1v1'::text, 'group'::text])),
  start_time timestamp without time zone,
  end_time timestamp without time zone,
  CONSTRAINT calendar_events_pkey PRIMARY KEY (id),
  CONSTRAINT calendar_events_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cvs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  content jsonb,
  template text,
  pdf_url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT cvs_pkey PRIMARY KEY (id),
  CONSTRAINT cvs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text,
  progress integer DEFAULT 0,
  target integer,
  CONSTRAINT goals_pkey PRIMARY KEY (id),
  CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.job_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text,
  description text,
  source text,
  url text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT job_offers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.match_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid UNIQUE,
  score double precision,
  gaps jsonb,
  suggestions jsonb,
  CONSTRAINT match_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT match_analyses_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid,
  sender_id uuid,
  content text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  phone text,
  bio text,
  avatar_url text,
  role text DEFAULT 'candidate'::text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  type text CHECK (type = ANY (ARRAY['pdf'::text, 'video'::text])),
  url text,
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  status text DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'closed'::text])),
  priority text,
  message text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_skills (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL,
  CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id),
  CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id)
);