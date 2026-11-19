CREATE TABLE public.steam_library (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  generated_at timestamptz,
  games jsonb NOT NULL DEFAULT '[]'::jsonb,
  achievements_synced jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, generated_at, games) ON public.steam_library TO anon, authenticated;
GRANT ALL ON public.steam_library TO service_role;

ALTER TABLE public.steam_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read the Steam library snapshot"
ON public.steam_library
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.steam_library (id) VALUES (1) ON CONFLICT (id) DO NOTHING;