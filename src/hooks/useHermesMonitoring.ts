import { useEffect, useState } from 'react';
import { runAllAgents, monitorAppHealth, checkResponsiveness } from '../services/hermesAgents';

interface MonitoringState {
  health: {
    supabase: { ok: boolean; time: number };
    ollama: { ok: boolean; time: number };
    total: number;
  } | null;
  responsiveness: {
    device: 'mobile' | 'tablet' | 'desktop';
    screen: { width: number; height: number };
    issues: string[];
  } | null;
  lastCheck: Date | null;
  isMonitoring: boolean;
}

/**
 * Hook para monitoreo automático con agentes Hermes
 * 
 * @param enabled - Si el monitoreo está activo
 * @param interval - Intervalo de monitoreo en ms (default: 5 minutos)
 */
export function useHermesMonitoring(enabled: boolean = true, interval: number = 5 * 60 * 1000) {
  const [state, setState] = useState<MonitoringState>({
    health: null,
    responsiveness: null,
    lastCheck: null,
    isMonitoring: false
  });

  useEffect(() => {
    if (!enabled) return;

    let intervalId: ReturnType<typeof setInterval>;

    const runMonitoring = async () => {
      setState(prev => ({ ...prev, isMonitoring: true }));

      try {
        const results = await runAllAgents();

        setState({
          health: results.health.sanitized as any,
          responsiveness: results.responsiveness.sanitized as any,
          lastCheck: new Date(),
          isMonitoring: false
        });

        // Log issues
        if (!results.health.valid) {
          console.warn('⚠️ Hermes Health Issues:', results.health.issues);
        }
        if (!results.responsiveness.valid) {
          console.warn('⚠️ Hermes Responsiveness Issues:', results.responsiveness.issues);
        }

      } catch (error) {
        console.error('❌ Hermes Monitoring Error:', error);
        setState(prev => ({ ...prev, isMonitoring: false }));
      }
    };

    // Ejecutar inmediatamente
    runMonitoring();

    // Ejecutar periódicamente
    intervalId = setInterval(runMonitoring, interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, interval]);

  return state;
}

/**
 * Hook para monitoreo de responsividad en tiempo real
 * Se ejecuta cuando cambia el tamaño de la ventana
 */
export function useResponsivenessMonitor() {
  const [issues, setIssues] = useState<string[]>([]);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkNow = async () => {
      const result = await checkResponsiveness();
      setIssues(result.issues);
      setDevice(result.sanitized?.device || 'desktop');

      if (!result.valid) {
        console.warn('⚠️ Responsiveness Issues:', result.issues);
        console.info('💡 Recommendation:', result.recommendation);
      }
    };

    // Ejecutar al montar
    checkNow();

    // Ejecutar cuando cambia el tamaño de ventana
    const handleResize = () => {
      checkNow();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { issues, device };
}

/**
 * Hook para monitoreo de salud de servicios
 * Se ejecuta periódicamente para verificar Supabase y Ollama
 */
export function useHealthMonitor(interval: number = 30000) {
  const [health, setHealth] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const result = await monitorAppHealth();
      setHealth(result.sanitized);
      setLastCheck(new Date());

      if (!result.valid) {
        console.error('❌ Health Check Failed:', result.issues);
        console.info('💡 Recommendation:', result.recommendation);
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { health, lastCheck };
}
