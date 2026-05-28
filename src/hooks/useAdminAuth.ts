import { useEffect, useRef, useState } from 'react';
import { useMundialAuth } from '../contexts/MundialAuthContext';
import { mundialSupabase } from '../services/mundialSupabaseClient';

/**
 * Hook para verificar si el usuario actual es administrador
 * Busca en la tabla 'admin_users' si el user_id está registrado como admin
 */
export const useAdminAuth = () => {
  const { user } = useMundialAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Hard‑coded fallback admin email (replace with your own address if needed)
  const FALLBACK_ADMIN_EMAIL = 'gerardo@oraculo-mundial.com';

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Guard against missing Supabase configuration
      if (!mundialSupabase) {
        console.error('[Admin Auth] ❌ Supabase client not initialized');
        if (isMounted.current) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      if (!user?.id) {
        if (!isMounted.current) return;
        console.warn('[Admin Auth] ⚠️ No user ID found - NOT ADMIN');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await mundialSupabase
          .from('admin_users')
          .select('user_id, email')
          .eq('user_id', user.id)
          .single();

        if (!isMounted.current) return;

        if (queryError) {
          // PGSQL error codes:
          // PGRST116 = no rows returned (normal for non‑admins)
          if (queryError.code === 'PGRST116') {
            console.warn('[Admin Auth] ✓ User is NOT admin (no record in admin_users)');
            setIsAdmin(false);
            setError(null);
          } else {
            console.error('[Admin Auth] ❌ Query error:', queryError.code, queryError.message);
            setIsAdmin(false);
            setError(queryError.message);
          }
        } else if (data && data.user_id === user.id) {
          console.log('[Admin Auth] ✅ User IS admin:', data.email);
          setIsAdmin(true);
          setError(null);
        } else {
          console.warn('[Admin Auth] ⚠️ Data mismatch - NOT ADMIN');
          setIsAdmin(false);
          setError(null);
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error('[Admin Auth] ❌ Critical error checking admin status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAdmin(false);
      } finally {
        if (isMounted.current) setLoading(false);
      }

      // Fallback admin based on email
      if (!isAdmin && user?.email && user.email.toLowerCase() === FALLBACK_ADMIN_EMAIL.toLowerCase()) {
        console.log('[Admin Auth] ⚡️ Fallback admin granted for', user.email);
        setIsAdmin(true);
        setError(null);
      }
    };

    checkAdminStatus();
  }, [user?.id, user?.email]);

  return { isAdmin, loading, error };
};
