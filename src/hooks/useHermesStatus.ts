import { useEffect, useState } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';

export function useHermesStatus() {
  const [status, setStatus] = useState<'secure' | 'warning' | 'critical' | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await mundialSupabase
          .from('hermes_logs')
          .select('status')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          setStatus(data.status as any);
        }
      } catch (err) {
        console.error("Error fetching Hermes status:", err);
      }
    };

    fetchStatus();

    // Suscribirse a cambios en tiempo real para reaccionar al instante
    const channel = mundialSupabase
      .channel('hermes_realtime_alerts')
      .on('postgres_changes', { event: 'INSERT', table: 'hermes_logs' }, (payload) => {
        setStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      mundialSupabase.removeChannel(channel);
    };
  }, []);

  return status;
}