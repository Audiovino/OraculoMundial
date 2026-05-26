-- ============================================================================
-- MIGRATION: FIX CRÍTICO REGISTRO + RLS SEGURO + RESPETAR ADMIN ÚNICO FOCO3981
-- ============================================================================

-- ─── PARTE 1: Garantizar Admin Único (foco3981@gmail.com) ───────────────────
-- Eliminar a cualquier usuario de admin_users que NO sea foco3981@gmail.com
-- Esto responde a la solicitud: "foco3981 es el único administrador"
DELETE FROM public.admin_users WHERE email != 'foco3981@gmail.com';

-- ─── PARTE 2: Reparar la función Trigger handle_new_user_hermes() ──────────
-- Esta función se ejecuta AFTER INSERT en auth.users.
-- Anteriormente fallaba porque:
-- 1. No definía 'username' (que es NOT NULL en mundial_users).
-- 2. No definía 'id' (clave primaria de mundial_users) o no la mapeaba bien con user_id.
-- Solución: Insertar id, user_id, email, y obtener username de la metadata o email.

CREATE OR REPLACE FUNCTION public.handle_new_user_hermes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.mundial_users (id, user_id, email, username, created_at, updated_at)
  VALUES (
    new.id,                     -- id (Primary Key)
    new.id,                     -- user_id (Unique link to auth.users)
    new.email,                  -- email
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1), 'usuario'), -- username (NOT NULL)
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── PARTE 3: Backfill de Usuarios Existentes ──────────────────────────────
-- Popula la tabla mundial_users con los 8 usuarios que ya existen en auth.users
-- pero que no tienen perfil en mundial_users por fallos anteriores del trigger.

INSERT INTO public.mundial_users (id, user_id, email, username, created_at, updated_at)
SELECT 
  id, 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1), 'usuario'), 
  COALESCE(created_at, now()), 
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ─── PARTE 4: Políticas RLS Robustas para mundial_users ────────────────────
ALTER TABLE public.mundial_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.mundial_users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.mundial_users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.mundial_users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.mundial_users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.mundial_users;
DROP POLICY IF EXISTS "Permitir inserción de perfil propio" ON public.mundial_users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.mundial_users;

-- 1. INSERT propio: Cada usuario puede insertar su perfil al registrarse
CREATE POLICY "Users can insert own profile"
  ON public.mundial_users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. SELECT propio: Cada usuario puede leer su propio perfil
CREATE POLICY "Users can read own profile"
  ON public.mundial_users
  FOR SELECT
  USING (auth.uid() = id);

-- 3. SELECT admin: Solo los administradores registrados en admin_users pueden leer todos los perfiles
CREATE POLICY "Admins can read all users"
  ON public.mundial_users
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- 4. UPDATE propio: Cada usuario puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON public.mundial_users
  FOR UPDATE
  USING (auth.uid() = id);

-- 5. UPDATE admin: Los administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update all users"
  ON public.mundial_users
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ─── PARTE 5: Políticas RLS Robustas para admin_users ──────────────────────
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can check own admin status" ON public.admin_users;

-- 1. SELECT restringido: Cada usuario SOLAMENTE puede leer su propia fila.
-- Esto soluciona el RLS leak donde cualquier autenticado leía la tabla completa.
CREATE POLICY "Users can only read own admin record"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Modificaciones (INSERT/UPDATE/DELETE) son reservadas exclusivamente para el superadmin (service_role)
-- No se crean políticas públicas para esto.

-- ─── VERIFICACIÓN FINAL ───────────────────────────────────────────────────
SELECT 'admin_users' as table_name, count(*) as count FROM public.admin_users
UNION ALL
SELECT 'mundial_users' as table_name, count(*) as count FROM public.mundial_users;
