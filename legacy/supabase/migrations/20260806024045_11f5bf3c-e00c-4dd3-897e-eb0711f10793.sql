ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS references_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sca_compliance text;