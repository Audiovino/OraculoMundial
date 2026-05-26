-- ============================================================================
-- PASO 3: REPARACIÓN DE RLS POLICIES - ADMIN_USERS TABLE
-- ============================================================================
-- Fecha: 26 de mayo de 2026
-- Instrucciones: Copia TODO ESTO y pégalo en Supabase > SQL Editor
-- Luego: Haz click en "Run" para ejecutar todas las queries
-- ============================================================================

-- PASO A: ELIMINAR POLÍTICAS ANTIGUAS (causan problemas de circularidad)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin_users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;

-- PASO B: CREAR NUEVAS POLÍTICAS (seguras y funcionales)
-- ============================================================================

-- 1️⃣ POLÍTICA DE LECTURA (SELECT)
-- Todos los usuarios AUTENTICADOS pueden LEER la tabla admin_users
-- (Esto permite que el frontend verifique si el usuario es admin)
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2️⃣ POLÍTICA DE INSERCIÓN (INSERT)
-- SOLO admins EXISTENTES pueden INSERTAR nuevos admins
-- (Valida que el usuario que inserta esté en la tabla admin_users)
CREATE POLICY "Only admins can insert admin_users"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users)
    AND auth.role() = 'authenticated'
  );

-- 3️⃣ POLÍTICA DE ACTUALIZACIÓN (UPDATE)
-- SOLO admins pueden ACTUALIZAR registros de admin_users
-- (Valida que el usuario que actualiza esté en la tabla admin_users)
CREATE POLICY "Only admins can update admin_users"
  ON admin_users
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- 4️⃣ POLÍTICA DE ELIMINACIÓN (DELETE)
-- SOLO admins pueden ELIMINAR registros de admin_users
-- (Valida que el usuario que elimina esté en la tabla admin_users)
CREATE POLICY "Only admins can delete admin_users"
  ON admin_users
  FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- ============================================================================
-- PASO C: VERIFICACIÓN (ejecuta esto para confirmar que se crearon las políticas)
-- ============================================================================

-- Ver todas las políticas de la tabla admin_users
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Si ves estas 4 políticas, ¡TODO ESTÁ CORRECTO!:
-- 1. "Authenticated users can read admin_users"
-- 2. "Only admins can insert admin_users"
-- 3. "Only admins can update admin_users"
-- 4. "Only admins can delete admin_users"

-- ============================================================================
-- PASO D: VERIFICAR TABLA admin_users (datos actuales)
-- ============================================================================

-- Ver quiénes están registrados como admin
SELECT user_id, email, created_at
FROM admin_users
ORDER BY created_at DESC;

-- Si "gera" aparece en los resultados y NO debería ser admin, ejecuta:
-- DELETE FROM admin_users WHERE email = 'gera@email.com';

-- ============================================================================
-- FIN - Todas las políticas RLS han sido actualizado
-- ============================================================================
