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
                    // PGRST116 = no rows returned (normal for non-admins)
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
                    // DOUBLE-CHECK: Verify the returned user_id matches current user\n                    console.log('[Admin Auth] ✅ User IS admin:', data.email);
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
                setIsAdmin(false); // DEFAULT TO FALSE ON ERROR
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user?.id]);

    return { isAdmin, loading, error };
};
