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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    // Verificar sesión al montar
    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            try {
                const { data: { session } } = await mundialSupabase.auth.getSession();
                if (!isMounted) return;

                if (session?.user) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        username: session.user.email?.split('@')[0] || 'usuario',
                        created_at: session.user.created_at || new Date().toISOString()
                    });
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
        };

        checkSession();

        // Escuchar cambios de autenticación
        const { data: { subscription } } = mundialSupabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;

            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryMode(true);
            }

            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    username: session.user.email?.split('@')[0] || 'usuario',
                    created_at: session.user.created_at || new Date().toISOString()
                });
            } else {
                setUser(null);
            }
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string, username: string) => {
        try {
            setError(null);
            
            // Registrar en Supabase Auth
            const { data: authData, error: authError } = await mundialSupabase.auth.signUp({
                email,
                password
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            // Crear registro en tabla mundial_users
            const { error: insertError } = await mundialSupabase
                .from('mundial_users')
                .insert([{
                    id: authData.user.id,
                    email,
                    username,
                    created_at: new Date().toISOString()
                }]);

            // Si falla por RLS, igual dejamos al usuario logueado
            // El perfil se puede crear después cuando RLS esté configurado
            if (insertError) {
                console.warn('⚠️ No se pudo crear perfil en mundial_users (RLS):', insertError.message);
                // Continuar de todas formas — el usuario existe en Auth
            }

            // Setear usuario con los datos disponibles
            setUser({
                id: authData.user.id,
                email,
                username,
                created_at: new Date().toISOString()
            });

        } catch (err: any) {
            setError(err.message || 'Error en registro');
            throw err;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            
            const { data, error: signInError } = await mundialSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) throw signInError;
            if (!data.user) throw new Error('No user returned from signin');

            // Obtener datos del usuario
            const { data: userData, error: fetchError } = await mundialSupabase
                .from('mundial_users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (fetchError) throw fetchError;
            if (userData) {
                setUser({
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    created_at: userData.created_at
                });
            }
        } catch (err: any) {
            setError(err.message || 'Error en inicio de sesión');
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
