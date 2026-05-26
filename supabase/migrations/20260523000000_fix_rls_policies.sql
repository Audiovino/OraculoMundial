-- Eliminar políticas antiguas que causan problemas
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin_users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;

-- CREAR NUEVAS POLÍTICAS (seguras y funcionales)

-- 1. Todos los usuarios autenticados PUEDEN LEER la tabla
CREATE POLICY "Authenticated users can read admin_users" ON admin_users FOR SELECT USING (auth.role() = 'authenticated');

-- 2. SOLO admins pueden INSERTAR
CREATE POLICY "Only admins can insert admin_users" ON admin_users FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM admin_users) AND auth.role() = 'authenticated'
);

-- 3. SOLO admins pueden ACTUALIZAR
CREATE POLICY "Only admins can update admin_users" ON admin_users FOR UPDATE
USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- 4. SOLO admins pueden ELIMINAR
CREATE POLICY "Only admins can delete admin_users" ON admin_users FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- VERIFICAR que las políticas existen
SELECT tablename, policyname, qual, with_check FROM pg_policies WHERE tablename = 'admin_users';
