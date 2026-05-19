-- ============================================
-- SETUP ADMIN DASHBOARD - SUPABASE SQL SCRIPT
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- para crear las tablas necesarias para el admin dashboard

-- 1. Crear tabla admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver la tabla
CREATE POLICY IF NOT EXISTS "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Política: Solo admins pueden insertar
CREATE POLICY IF NOT EXISTS "Admins can insert admin_users"
  ON admin_users
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- 2. Crear tabla notifications (opcional, para sistema de notificaciones)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- AGREGAR ADMINS (reemplaza YOUR_USER_ID)
-- ============================================
-- Descomenta y ejecuta para agregar un admin:
-- INSERT INTO admin_users (user_id, email)
-- VALUES ('YOUR_USER_ID', 'user@example.com')
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICAR SETUP
-- ============================================
-- Ejecuta estas queries para verificar:
-- SELECT * FROM admin_users;
-- SELECT * FROM notifications;
