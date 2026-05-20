-- ============================================================================
-- AGREGAR TABLA admin_users AL ESQUEMA EXISTENTE
-- ============================================================================
-- Ejecuta este archivo en Supabase SQL Editor
-- ============================================================================

-- 1. Crear tabla admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- 3. Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_users' 
    AND policyname = 'Admins can view admin_users'
  ) THEN
    CREATE POLICY "Admins can view admin_users"
      ON admin_users
      FOR SELECT
      USING (auth.uid() IN (SELECT user_id FROM admin_users));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_users' 
    AND policyname = 'Admins can insert admin_users'
  ) THEN
    CREATE POLICY "Admins can insert admin_users"
      ON admin_users
      FOR INSERT
      WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
  END IF;
END $$;

-- 5. Crear tabla notifications (para sistema de notificaciones)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 7. Habilitar RLS en notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 8. Crear política para notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications"
      ON notifications
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================================================
-- VERIFICAR QUE TODO ESTÁ CREADO
-- ============================================================================
-- Ejecuta estas queries para verificar:
-- SELECT * FROM admin_users;
-- SELECT * FROM notifications;
-- SELECT * FROM information_schema.tables WHERE table_name IN ('admin_users', 'notifications');

-- ============================================================================
-- AGREGAR TU USUARIO COMO ADMIN
-- ============================================================================
-- Reemplaza 'TU_UUID' con tu UUID real de auth.users
-- INSERT INTO admin_users (user_id, email)
-- VALUES ('TU_UUID', 'tu@email.com')
-- ON CONFLICT (user_id) DO NOTHING;
