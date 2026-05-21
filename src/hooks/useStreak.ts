import { useState, useEffect, useCallback } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';

export interface StreakData {
  current: number;
  max: number;
  multiplier: number;
  lastUpdated: string | null;
}

/**
 * Lógica de multiplicadores basada en la racha actual.
 * Exportada para ser usada en el Ranking del Admin.
 */
export const calculateMultiplier = (currentStreak: number): number => {
  if (currentStreak >= 8) return 2.0;   // Racha épica: Doble puntos
  if (currentStreak >= 5) return 1.5;   // Racha caliente: 50% extra
  if (currentStreak >= 3) return 1.2;   // Buena racha: 20% extra
  return 1.0;                           // Normal
};

/**
 * Hook para manejar el sistema de rachas del usuario.
 * La racha sube cuando acertás al menos el resultado (V/E/D) en una jornada.
 * Se guarda en localStorage + Supabase.
 */
export const useStreak = (userId: string | undefined) => {
  const [streak, setStreak] = useState<StreakData>({ current: 0, max: 0, multiplier: 1, lastUpdated: null });
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
        const { data, error } = await mundialSupabase
          .from('mundial_users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const s: StreakData = {
            current: Number(data.streak_actual ?? data.current_streak ?? data.streak ?? 0),
            max: Number(data.streak_maximo ?? data.max_streak ?? data.streak_max ?? 0),
            multiplier: calculateMultiplier(Number(data.streak_actual ?? 0)),
            lastUpdated: data.ultima_jornada_evaluada ?? data.last_evaluated ?? data.updated_at ?? null,
          };
          setStreak(s);
          localStorage.setItem(`streak_${userId}`, JSON.stringify(s));
        }
      } catch (err: any) {
        console.warn('[useStreak] Could not load streak from Supabase:', err?.message || err);
      }
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
        multiplier: calculateMultiplier(newCurrent),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(`streak_${userId}`, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  return { streak, loading, evaluateStreak };
};
