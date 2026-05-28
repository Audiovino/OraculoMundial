-- Perfil social + aceptación legal
ALTER TABLE public.mundial_users
  ADD COLUMN IF NOT EXISTS building_name text,
  ADD COLUMN IF NOT EXISTS user_role text,
  ADD COLUMN IF NOT EXISTS legal_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS legal_terms_version text;

ALTER TABLE public.mundial_users
  DROP CONSTRAINT IF EXISTS mundial_users_user_role_check;

ALTER TABLE public.mundial_users
  ADD CONSTRAINT mundial_users_user_role_check
  CHECK (user_role IS NULL OR user_role IN ('intendente', 'encargado', 'vecino', 'otro'));

-- Chat por liga privada
CREATE TABLE IF NOT EXISTS public.liga_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liga_id uuid NOT NULL REFERENCES public.private_leagues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT 'usuario',
  message text NOT NULL CHECK (char_length(trim(message)) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_liga_messages_liga_created
  ON public.liga_messages (liga_id, created_at DESC);

ALTER TABLE public.liga_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "League members can read messages" ON public.liga_messages;
CREATE POLICY "League members can read messages"
  ON public.liga_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm
      WHERE lm.liga_id = liga_messages.liga_id AND lm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.private_leagues pl
      WHERE pl.id = liga_messages.liga_id AND pl.creador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "League members can post messages" ON public.liga_messages;
CREATE POLICY "League members can post messages"
  ON public.liga_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM public.league_members lm
        WHERE lm.liga_id = liga_messages.liga_id AND lm.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.private_leagues pl
        WHERE pl.id = liga_messages.liga_id AND pl.creador_id = auth.uid()
      )
    )
  );
