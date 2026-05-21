-- Añadir columna para los reportes de QA al historial de Hermes
-- Verificación de seguridad y adición de columna de QA
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hermes_logs' AND column_name='qa_data') THEN
        ALTER TABLE hermes_logs ADD COLUMN qa_data JSONB;
    END IF;
END $$;

-- Actualización de comentario de metadatos
COMMENT ON COLUMN hermes_logs.status IS 'Puede ser secure, warning, critical o qa_report';