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
            if (!user?.id) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            try {
                // Intentar consultar tabla admin_users
                const { data, error: queryError } = await mundialSupabase
                    .from('admin_users')
                    .select('user_id')
                    .eq('user_id', user.id)
                    .single();

                if (queryError && queryError.code !== 'PGRST116') {
                    // PGRST116 = no rows found (es normal si no es admin)
                    console.warn('[Admin Auth] Query error:', queryError);
                    setError(queryError.message);
                }

                setIsAdmin(!!data);
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
