import { useEffect, useRef, useState } from 'react';
import { mundialSupabase } from '../services/mundialSupabaseClient';

export function useHermesStatus() {
  const [status, setStatus] = useState<'secure' | 'warning' | 'critical' | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data, error } = await mundialSupabase
          .from('hermes_logs')
          .select('status')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data && isMounted.current) {
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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'hermes_logs' } as any, (payload: any) => {
        if (isMounted.current) setStatus(payload.new.status);
      })
      .subscribe();

    return () => {
      if (channel?.unsubscribe) {
        channel.unsubscribe();
      } else {
        mundialSupabase.removeChannel(channel);
      }
    };
  }, []);

  return status;
}