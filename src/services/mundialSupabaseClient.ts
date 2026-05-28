import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno (Vite usa import.meta.env.VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient: any;
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ [Supabase] CREDENCIALES FALTANTES. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local');
    // Dummy client that always returns an error for queries
    supabaseClient = {
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { code: 'MISSING_CREDS', message: 'Supabase credentials missing' } })
                })
            })
        })
    } as any;
} else {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// Export the client (will be a real client or dummy depending on env)
export const mundialSupabase = supabaseClient;

// Tipos para Mundial
export interface SignUpProfile {
    username: string;
    buildingName: string;
    userRole: string;
    legalAccepted: boolean;
    termsVersion: string;
}

export interface MundialUser {
    id: string;
    email: string;
    username: string;
    created_at: string;
    building_name?: string | null;
    user_role?: string | null;
    legal_accepted_at?: string | null;
    legal_terms_version?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    location_source?: string | null;
    location_address?: string | null;
    location_city?: string | null;
    location_region?: string | null;
    location_country?: string | null;
    location_ip?: string | null;
    location_isp?: string | null;
    detected_building?: string | null;
    last_location_at?: string | null;
}

export interface MundialPrediction {
    id: string;
    user_id: string;
    match_id: string;
    prediction: string; // 'home_win' | 'draw' | 'away_win'
    points: number;
    created_at: string;
}

export interface MundialRanking {
    id: string;
    user_id: string;
    username: string;
    total_points: number;
    position: number;
    games_played: number;
    updated_at: string;
}
