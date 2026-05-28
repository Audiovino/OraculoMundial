import { useEffect, useState } from 'react';

/**
 * Stub hook for Hermes monitoring (placeholder).
 * Returns empty data structures to keep the UI functional while the real
 * monitoring implementation is being developed.
 */
export const useHermesMonitoring = () => {
  // No-op – could be extended later to integrate actual monitoring logic.
  return {} as any;
};

/**
 * Stub hook for responsiveness monitoring.
 * Returns a static device identifier and no issues.
 */
export const useResponsivenessMonitor = () => {
  const [device] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [issues] = useState<string[]>([]);
  return { device, issues };
};

/**
 * Stub hook for health monitoring of external services.
 * Simulates healthy responses with dummy timings.
 */
export const useHealthMonitor = (intervalMs: number = 30000) => {
  const [health, setHealth] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const check = () => {
      setHealth({
        supabase: { ok: true, time: 120 },
        ollama: { ok: true, time: 80 },
      });
      setLastCheck(new Date());
    };
    check();
    const timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return { health, lastCheck };
};
