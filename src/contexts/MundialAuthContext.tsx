import React, { createContext, useContext, useEffect, useState } from 'react';
import { mundialSupabase, MundialUser } from '../services/mundialSupabaseClient';

interface MundialAuthContextType {
    user: MundialUser | null;
    loading: boolean;
    signUp: (email: string, password: string, username: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    error: string | null;
    isRecoveryMode: boolean;
}

const MundialAuthContext = createContext<MundialAuthContextType | undefined>(undefined);

export const MundialAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<MundialUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    const syncUserWithSession = async (session: any) => {
        if (session?.user) {
            try {
                const dbPromise = mundialSupabase
                    .from('mundial_users')
                    .select('id, email, username, created_at')
                    .eq('id', session.user.id)
                    .single();
                
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout de DB')), 5000)
                );

                const { data: profile } = await Promise.race([dbPromise, timeoutPromise]) as any;

                if (profile) {
                    setUser({
                        id: profile.id,
                        email: profile.email,
                        username: profile.username,
                        created_at: profile.created_at
                    });
                    return;
                }
            } catch (err) {
                // Si la tabla no responde, fallback al perfil del token.
                console.warn("Error o timeout sincronizando usuario:", err);
            }

            setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'usuario',
                created_at: session.user.created_at || new Date().toISOString()
            });
            return;
        }

        setUser(null);
    };

    // Verificar sesión al montar
    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            try {
                // Timeout de seguridad: si Supabase no responde en 5s, seguir sin sesión
                const sessionPromise = mundialSupabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout: Supabase no respondió')), 5000)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
                if (!isMounted) return;

                await syncUserWithSession(session);
            } catch (err) {
                console.error('Error checking session:', err);
                // En caso de timeout o error, permitir que la app cargue sin sesión
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = mundialSupabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;

            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true);
            } else if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                setIsRecoveryMode(false);
            }

            await syncUserWithSession(session);
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, username: string) => {
        try {
            setError(null);
            setLoading(true);
            
            const { data: authData, error: authError } = await mundialSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username } // guardar username en metadata como backup
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            // Usar upsert para evitar duplicados si el perfil ya existe parcialmente
            const { error: upsertError } = await mundialSupabase
                .from('mundial_users')
                .upsert([{
                    id: authData.user.id,
                    email,
                    username,
                    created_at: new Date().toISOString()
                }], { onConflict: 'id' });

            if (upsertError) {
                // No bloquear el registro — el perfil se puede recuperar en el próximo login
                console.warn('⚠️ Perfil no creado en mundial_users (RLS o error):', upsertError.message);
            }

            // NO setear user aquí — dejar que onAuthStateChange lo maneje

        } catch (err: any) {
            setError(err.message || 'Error en registro');
            setLoading(false);
            throw err;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);
            
            const { data, error: signInError } = await mundialSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;
            if (!data.user) throw new Error('No user returned from signin');

            // NO setear user aquí – el auth state change sincronizará el usuario.
        } catch (err: any) {
            setError(err.message || 'Error en inicio de sesión');
            setLoading(false);
            throw err;
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await mundialSupabase.auth.signOut();
            setUser(null);
        } catch (err: any) {
            setError(err.message || 'Error al cerrar sesión');
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            const { error: resetError } = await mundialSupabase.auth.resetPasswordForEmail(email);
            if (resetError) {
                console.error("Supabase Reset Password Error:", resetError);
                throw resetError;
            }
        } catch (err: any) {
            setError(err.message || 'Error al solicitar el restablecimiento de contraseña');
            throw err;
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            setError(null);
            const { error: updateError } = await mundialSupabase.auth.updateUser({
                password: newPassword
            });
            if (updateError) throw updateError;
            
            // Una vez actualizada, salimos del modo recuperación
            setIsRecoveryMode(false);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la contraseña');
            throw err;
        }
    };

    return (
        <MundialAuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword, updatePassword, error, isRecoveryMode }}>
            {children}
        </MundialAuthContext.Provider>
    );
};

export const useMundialAuth = () => {
    const context = useContext(MundialAuthContext);
    if (!context) {
        throw new Error('useMundialAuth must be used within MundialAuthProvider');
    }
    return context;
};
