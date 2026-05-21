-- Crear tabla para los reportes de auditoría de los Agentes Hermes
CREATE TABLE IF NOT EXISTS hermes_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL, -- 'secure', 'warning', 'critical'
    health_data JSONB,    -- Métricas de performance y uptime
    security_data JSONB,  -- Resultados de escaneo de secrets
    ui_data JSONB         -- Métricas de responsividad y accesibilidad
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE hermes_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo los usuarios registrados en 'admin_users' pueden leer estos logs
CREATE POLICY "Admins can view hermes_logs" 
ON hermes_logs 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users 
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Política: Cualquier usuario autenticado puede enviar un reporte (para monitoreo distribuido)
CREATE POLICY "Authenticated users can insert hermes_logs" 
ON hermes_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Índice para búsquedas rápidas por fecha
CREATE INDEX IF NOT EXISTS idx_hermes_logs_created_at ON hermes_logs (created_at DESC);