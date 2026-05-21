-- ============================================================================
-- MUNDIAL 2026 - Integración API-Football
-- ============================================================================

-- 1. Crear tabla de partidos si no existe (con logos)
CREATE TABLE IF NOT EXISTS mundial_matches (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  stage TEXT NOT NULL,
  group_name TEXT,
  home_goals INTEGER,
  away_goals INTEGER,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'LIVE', 'FINISHED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurarnos de tener los índices necesarios
CREATE INDEX IF NOT EXISTS idx_matches_date ON mundial_matches(date);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON mundial_matches(stage);

-- Políticas de RLS
ALTER TABLE mundial_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Matches are publicly readable" ON mundial_matches;
CREATE POLICY "Matches are publicly readable" ON mundial_matches
  FOR SELECT USING (true);

-- 2. Función para procesar el resultado de los partidos y dar puntos
CREATE OR REPLACE FUNCTION process_match_result()
RETURNS TRIGGER AS $$
DECLARE
  actual_result TEXT;
BEGIN
  -- Procesamos solo si el estado acaba de cambiar a FINISHED
  IF NEW.status = 'FINISHED' AND (OLD.status IS NULL OR OLD.status != 'FINISHED') THEN
    
    -- Determinar resultado real
    IF NEW.home_goals > NEW.away_goals THEN
      actual_result := 'home_win';
    ELSIF NEW.home_goals < NEW.away_goals THEN
      actual_result := 'away_win';
    ELSE
      actual_result := 'draw';
    END IF;

    -- Actualizar puntos de predicciones correctas (10 puntos)
    UPDATE mundial_predictions
    SET points = 10,
        updated_at = NOW()
    WHERE match_id = NEW.id AND prediction = actual_result;

    -- Actualizar puntos de predicciones incorrectas (0 puntos)
    UPDATE mundial_predictions
    SET points = 0,
        updated_at = NOW()
    WHERE match_id = NEW.id AND prediction != actual_result;

    -- Recalcular total_points y games_played para los usuarios que participaron
    UPDATE mundial_rankings mr
    SET total_points = (
          SELECT COALESCE(SUM(points), 0)
          FROM mundial_predictions
          WHERE user_id = mr.user_id
        ),
        games_played = (
          SELECT COUNT(*)
          FROM mundial_predictions
          WHERE user_id = mr.user_id AND points IS NOT NULL
        ),
        updated_at = NOW()
    WHERE user_id IN (
      SELECT user_id FROM mundial_predictions WHERE match_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el Trigger sobre mundial_matches
DROP TRIGGER IF EXISTS match_finished_trigger ON mundial_matches;
CREATE TRIGGER match_finished_trigger
  AFTER UPDATE OF status ON mundial_matches
  FOR EACH ROW
  EXECUTE FUNCTION process_match_result();
