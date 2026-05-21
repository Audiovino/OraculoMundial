-- ============================================================================
-- FIX: Políticas RLS para acceso desde web externa/celular
-- ============================================================================

-- ============================================================================
-- CREAR TABLAS FALTANTES (si no existen)
-- ============================================================================

-- Crear mundial_rankings si no existe
CREATE TABLE IF NOT EXISTS mundial_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear mundial_notifications si no existe
CREATE TABLE IF NOT EXISTS mundial_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MUNDIAL_USERS - Perfil de usuarios
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE mundial_users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can read own profile" ON mundial_users;
DROP POLICY IF EXISTS "Users can update own profile" ON mundial_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON mundial_users;
DROP POLICY IF EXISTS "Users can view all profiles" ON mundial_users;

-- Política: Usuarios pueden leer todos los perfiles (para rankings)
CREATE POLICY "Users can view all profiles" ON mundial_users
  FOR SELECT TO authenticated USING (true);

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON mundial_users
  FOR UPDATE USING (auth.uid() = id);

-- Política: Usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON mundial_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- MUNDIAL_PREDICTIONS - Predicciones de partidos
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE mundial_predictions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Predictions are readable by authenticated users" ON mundial_predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON mundial_predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON mundial_predictions;
DROP POLICY IF EXISTS "Users can read own predictions" ON mundial_predictions;

-- Política: Usuarios autenticados pueden leer TODAS las predicciones (para rankings globales)
CREATE POLICY "Predictions are readable by authenticated users" ON mundial_predictions
  FOR SELECT TO authenticated USING (true);

-- Política: Usuarios pueden insertar sus propias predicciones
CREATE POLICY "Users can insert own predictions" ON mundial_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden actualizar sus propias predicciones
CREATE POLICY "Users can update own predictions" ON mundial_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- MUNDIAL_MATCHES - Partidos del mundial
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE mundial_matches ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Matches are publicly readable" ON mundial_matches;

-- Política: Partidos son públicos (lectura sin autenticación)
CREATE POLICY "Matches are publicly readable" ON mundial_matches
  FOR SELECT USING (true);

-- ============================================================================
-- MUNDIAL_RANKINGS - Ranking global
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE mundial_rankings ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Rankings are readable by authenticated users" ON mundial_rankings;
DROP POLICY IF EXISTS "Users can read own ranking" ON mundial_rankings;

-- Política: Usuarios autenticados pueden leer todos los rankings
CREATE POLICY "Rankings are readable by authenticated users" ON mundial_rankings
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- MUNDIAL_NOTIFICATIONS - Notificaciones
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE mundial_notifications ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can read own notifications" ON mundial_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON mundial_notifications;

-- Política: Usuarios pueden leer sus propias notificaciones
CREATE POLICY "Users can read own notifications" ON mundial_notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Sistema puede insertar notificaciones (para admin/functions)
CREATE POLICY "System can insert notifications" ON mundial_notifications
  FOR INSERT WITH CHECK (true);

-- Política: Usuarios pueden actualizar sus propias notificaciones (marcar como leída)
CREATE POLICY "Users can update own notifications" ON mundial_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- ADMIN_USERS - Tabla de administradores
-- ============================================================================

-- Habilitar RLS si no está habilitado
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;

-- Política: Usuarios autenticados pueden verificar si son admin (solo su propio registro)
CREATE POLICY "Users can check own admin status" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- Índices para mejorar performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON mundial_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON mundial_predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON mundial_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON mundial_rankings(user_id);
