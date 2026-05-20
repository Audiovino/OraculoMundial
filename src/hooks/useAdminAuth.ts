import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const checkAdminStatus = async () => {
            console.log('[Admin Auth] Checking admin status for user:', user?.id);

            if (!user?.id) {
                console.log('[Admin Auth] No user ID found');
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Intentar consultar tabla admin_users
                console.log('[Admin Auth] Querying admin_users table...');
                const { data, error: queryError } = await mundialSupabase
                    .from('admin_users')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();

                if (queryError) {
                    // Si la tabla no existe o la política falla, no bloqueamos la app.
                    console.warn('[Admin Auth] Query error:', queryError.code, queryError.message);
                    setIsAdmin(false);
                    setError(null);
                } else {
                    console.log('[Admin Auth] User IS admin:', data);
                    setIsAdmin(!!data);
                }
            } catch (err) {
                console.error('[Admin Auth] Error checking admin status:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user?.id]);

    return { isAdmin, loading, error };
};
