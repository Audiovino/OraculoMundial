import { createClient } from '@supabase/supabase-js';

// Leer variables de entorno (Vite usa import.meta.env.VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validación
if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        '❌ [Supabase] CREDENCIALES FALTANTES. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local'
    );
}

// Crear cliente
export const mundialSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para Mundial
export interface MundialUser {
    id: string;
    email: string;
    username: string;
    created_at: string;
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
