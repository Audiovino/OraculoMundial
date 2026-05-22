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

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user?.id) {
                if (!isMounted.current) return;
                if (import.meta.env.DEV) console.debug('[Admin Auth] No user ID found');
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error: queryError } = await mundialSupabase
                    .from('admin_users')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();

                if (!isMounted.current) return;

                if (queryError) {
                    if (import.meta.env.DEV) console.debug('[Admin Auth] Query error:', queryError.code, queryError.message);
                    setIsAdmin(false);
                    setError(null);
                } else {
                    if (import.meta.env.DEV) console.debug('[Admin Auth] User admin check result:', data);
                    setIsAdmin(!!data);
                }
            } catch (err) {
                if (!isMounted.current) return;
                console.error('[Admin Auth] Error checking admin status:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setIsAdmin(false);
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user?.id]);

    return { isAdmin, loading, error };
};
