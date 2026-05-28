import React, { createContext, useContext, useEffect, useState } from 'react';
import { mundialSupabase, MundialUser, SignUpProfile } from '../services/mundialSupabaseClient';
import { captureUserLocation } from '../services/locationService';
import { LEGAL_TERMS_VERSION } from '../content/legalTexts';

interface MundialAuthContextType {
    user: MundialUser | null;
    loading: boolean;
    signUp: (email: string, password: string, profile: SignUpProfile) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    acceptLegalTerms: () => Promise<void>;
    error: string | null;
    isRecoveryMode: boolean;
}

const MundialAuthContext = createContext<MundialAuthContextType | undefined>(undefined);

const PROFILE_SELECT =
    'id, email, username, created_at, building_name, user_role, legal_accepted_at, legal_terms_version, latitude, longitude, location_source, location_address, location_city, location_region, location_country, detected_building, last_location_at';

export const MundialAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<MundialUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);

    const mapProfile = (profile: Record<string, unknown>, session: { user: { id: string; email?: string; user_metadata?: { username?: string }; created_at?: string } }): MundialUser => ({
        id: profile.id as string,
        email: (profile.email as string) || session.user.email || '',
        username: (profile.username as string) || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'usuario',
        created_at: (profile.created_at as string) || session.user.created_at || new Date().toISOString(),
        building_name: (profile.building_name as string) ?? null,
        user_role: (profile.user_role as string) ?? null,
        legal_accepted_at: (profile.legal_accepted_at as string) ?? null,
        legal_terms_version: (profile.legal_terms_version as string) ?? null,
        latitude: profile.latitude as number | null | undefined,
        longitude: profile.longitude as number | null | undefined,
        location_source: profile.location_source as string | null | undefined,
        location_address: profile.location_address as string | null | undefined,
        location_city: profile.location_city as string | null | undefined,
        location_region: profile.location_region as string | null | undefined,
        location_country: profile.location_country as string | null | undefined,
        detected_building: profile.detected_building as string | null | undefined,
        last_location_at: profile.last_location_at as string | null | undefined,
    });

    const syncUserWithSession = async (session: { user: { id: string; email?: string; user_metadata?: { username?: string }; created_at?: string } } | null) => {
        if (session?.user) {
            try {
                const dbPromise = mundialSupabase
                    .from('mundial_users')
                    .select(PROFILE_SELECT)
                    .eq('id', session.user.id)
                    .single();

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout de DB')), 5000)
                );

                const { data: profile } = (await Promise.race([dbPromise, timeoutPromise])) as { data: Record<string, unknown> | null };

                if (profile) {
                    setUser(mapProfile(profile, session));
                    return;
                }
            } catch (err) {
                console.warn('Error o timeout sincronizando usuario:', err);
            }

            setUser({
                id: session.user.id,
                email: session.user.email || '',
                username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'usuario',
                created_at: session.user.created_at || new Date().toISOString(),
            });
            return;
        }

        setUser(null);
    };

    useEffect(() => {
        let isMounted = true;

        const checkSession = async () => {
            try {
                const sessionPromise = mundialSupabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout: Supabase no respondió')), 5000)
                );

                const { data: { session } } = (await Promise.race([sessionPromise, timeoutPromise])) as {
                    data: { session: Parameters<typeof syncUserWithSession>[0] };
                };
                if (!isMounted) return;

                await syncUserWithSession(session);
            } catch (err) {
                console.error('Error checking session:', err);
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = mundialSupabase.auth.onAuthStateChange(async (event: string, session: Parameters<typeof syncUserWithSession>[0]) => {
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

    const signUp = async (email: string, password: string, profile: SignUpProfile) => {
        if (!profile.legalAccepted) {
            throw new Error('Debés aceptar los términos legales para registrarte.');
        }

        try {
            setError(null);
            setLoading(true);

            const { data: authData, error: authError } = await mundialSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: profile.username,
                        building_name: profile.buildingName,
                        user_role: profile.userRole,
                    },
                },
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from signup');

            const now = new Date().toISOString();
            const { error: upsertError } = await mundialSupabase.from('mundial_users').upsert(
                [
                    {
                        id: authData.user.id,
                        user_id: authData.user.id,
                        email,
                        username: profile.username,
                        building_name: profile.buildingName,
                        user_role: profile.userRole,
                        legal_accepted_at: now,
                        legal_terms_version: profile.termsVersion || LEGAL_TERMS_VERSION,
                        created_at: now,
                    },
                ],
                { onConflict: 'id' }
            );

            if (upsertError) {
                console.warn('⚠️ Perfil no creado en mundial_users (RLS o error):', upsertError.message);
            }

            await captureUserLocation(authData.user.id, true).catch((err) => {
                console.warn('[Ubicación] No se pudo capturar la ubicación en el registro:', err);
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error en registro';
            setError(message);
            setLoading(false);
            throw err;
        }
    };

    const acceptLegalTerms = async () => {
        if (!user?.id) throw new Error('Sin sesión activa');
        const now = new Date().toISOString();
        const { error: updateError } = await mundialSupabase
            .from('mundial_users')
            .update({
                legal_accepted_at: now,
                legal_terms_version: LEGAL_TERMS_VERSION,
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        setUser({
            ...user,
            legal_accepted_at: now,
            legal_terms_version: LEGAL_TERMS_VERSION,
        });
    };

    const signIn = async (email: string, password: string) => {
        try {
            setError(null);
            setLoading(true);

            const { data, error: signInError } = await mundialSupabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;
            if (!data.user) throw new Error('No user returned from signin');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error en inicio de sesión';
            setError(message);
            setLoading(false);
            throw err;
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await mundialSupabase.auth.signOut();
            setUser(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al cerrar sesión';
            setError(message);
            throw err;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            const { error: resetError } = await mundialSupabase.auth.resetPasswordForEmail(email);
            if (resetError) throw resetError;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al solicitar el restablecimiento de contraseña';
            setError(message);
            throw err;
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            setError(null);
            const { error: updateError } = await mundialSupabase.auth.updateUser({
                password: newPassword,
            });
            if (updateError) throw updateError;
            setIsRecoveryMode(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al actualizar la contraseña';
            setError(message);
            throw err;
        }
    };

    return (
        <MundialAuthContext.Provider
            value={{
                user,
                loading,
                signUp,
                signIn,
                signOut,
                resetPassword,
                updatePassword,
                acceptLegalTerms,
                error,
                isRecoveryMode,
            }}
        >
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
