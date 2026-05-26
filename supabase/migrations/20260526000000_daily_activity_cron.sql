-- ============================================================================
-- Cron Job: Reporte Diario de Actividad a Telegram
-- Se ejecuta automáticamente todos los días a las 22:00 UTC (19:00 Argentina)
-- ============================================================================
-- Requiere las extensiones pg_cron y pg_net habilitadas en Supabase
-- (Dashboard > Database > Extensions > buscar pg_cron y pg_net > Enable)

-- Habilitar extensiones (si no están habilitadas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Eliminar job anterior si existe (para idempotencia)
SELECT cron.unschedule('daily-activity-report')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'daily-activity-report'
);

-- Programar el reporte diario a las 22:00 UTC (19:00 hora Argentina)
SELECT cron.schedule(
    'daily-activity-report',        -- nombre del job
    '0 22 * * *',                   -- cron: todos los días a las 22:00 UTC
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/daily-activity-report',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := '{}'::jsonb
    );
    $$
);

-- Verificar que el job se creó correctamente
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname = 'daily-activity-report';
