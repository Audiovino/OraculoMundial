-- Tabla de miembros para ligas privadas (unirse con código)
CREATE TABLE IF NOT EXISTS public.league_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liga_id uuid NOT NULL REFERENCES public.private_leagues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (liga_id, user_id)
);

ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can join leagues" ON public.league_members;
CREATE POLICY "Users can join leagues"
  ON public.league_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own memberships" ON public.league_members;
CREATE POLICY "Users can read own memberships"
  ON public.league_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "League creators can read members" ON public.league_members;
CREATE POLICY "League creators can read members"
  ON public.league_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.private_leagues pl
      WHERE pl.id = liga_id AND pl.creador_id = auth.uid()
    )
  );

-- RLS para private_leagues (lectura por código / creación propia)
ALTER TABLE public.private_leagues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read leagues" ON public.private_leagues;
CREATE POLICY "Anyone authenticated can read leagues"
  ON public.private_leagues FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own leagues" ON public.private_leagues;
CREATE POLICY "Users can create own leagues"
  ON public.private_leagues FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creador_id);
