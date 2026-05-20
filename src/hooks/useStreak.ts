import { useState, useEffect, useCallback } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';

export interface StreakData {
  current: number;
  max: number;
  lastUpdated: string | null;
}

/**
 * Hook para manejar el sistema de rachas del usuario.
 * La racha sube cuando acertás al menos el resultado (V/E/D) en una jornada.
 * Se guarda en localStorage + Supabase.
 */
export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<StreakData>({ current: 0, max: 0, lastUpdated: null });
  const [loading, setLoading] = useState(true);

  // Cargar racha desde localStorage primero (instantáneo)
  useEffect(() => {
    const local = localStorage.getItem(`streak_${userId}`);
    if (local) {
      try { setStreak(JSON.parse(local)); } catch {}
    }
    setLoading(false);
  }, [userId]);

  // Cargar desde Supabase si hay usuario
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const { data } = await mundialSupabase
          .from('mundial_users')
          .select('streak_actual, streak_maximo, ultima_jornada_evaluada')
          .eq('id', userId)
          .single();

        if (data) {
          const s: StreakData = {
            current: data.streak_actual || 0,
            max: data.streak_maximo || 0,
            lastUpdated: data.ultima_jornada_evaluada || null,
          };
          setStreak(s);
          localStorage.setItem(`streak_${userId}`, JSON.stringify(s));
        }
      } catch {}
    };
    load();
  }, [userId]);

  /**
   * Evalúa si una predicción guardada extiende o corta la racha.
   * Llama esto después de que se confirma un resultado real.
   */
  const evaluateStreak = useCallback(async (
    predictedHome: number,
    predictedAway: number,
    actualHome: number,
    actualAway: number
  ) => {
    const getResult = (h: number, a: number) => h > a ? 'V' : h < a ? 'D' : 'E';
    const predicted = getResult(predictedHome, predictedAway);
    const actual = getResult(actualHome, actualAway);
    const correct = predicted === actual;

    setStreak(prev => {
      const newCurrent = correct ? prev.current + 1 : 0;
      const newMax = Math.max(prev.max, newCurrent);
      const updated: StreakData = {
        current: newCurrent,
        max: newMax,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`streak_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  return { streak, loading, evaluateStreak };
};
