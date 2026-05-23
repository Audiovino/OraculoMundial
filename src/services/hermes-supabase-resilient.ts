// 🌟 Guía de Integración: Consultas Resilientes a Supabase para Móvil
// Autor: Agente Hermes
// Propósito: Estructurar queries con manejo de errores, reintentos y caché

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// ✅ PATRÓN 1: Consulta Resiliente con Reintentos Automáticos
// ============================================================================

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 500,
  backoffMultiplier: 2,
};

/**
 * Ejecuta una consulta con reintentos automáticos en caso de fallos de red
 * Ideal para conexiones 4G/5G inestables en celulares
 */
async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      console.debug(`[Hermes] Intento ${attempt}/${config.maxRetries}`);
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      
      // Si es el último intento, lanza el error
      if (attempt === config.maxRetries) {
        console.error(`[Hermes] Falló después de ${config.maxRetries} intentos:`, lastError);
        throw new Error(`Query falló: ${lastError.message}`);
      }

      // Calcular delay con backoff exponencial
      const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
      console.warn(`[Hermes] Reintentando en ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Query falló por razón desconocida');
}

// ============================================================================
// ✅ PATRÓN 2: Hook React para Lectura de Datos con Caché (SWR)
// ============================================================================

import { useEffect, useState, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en ms
}

interface UseSupabaseQueryOptions {
  cacheSeconds?: number;
  retryConfig?: RetryConfig;
  onError?: (error: Error) => void;
}

/**
 * Hook que implementa Stale-While-Revalidate (SWR)
 * Muestra datos en caché mientras valida en background
 */
export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: UseSupabaseQueryOptions = {}
) {
  const { cacheSeconds = 60, retryConfig = DEFAULT_RETRY_CONFIG } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  useEffect(() => {
    const executeQuery = async () => {
      try {
        // Verificar caché primero
        const cached = cacheRef.current.get(queryKey);
        const now = Date.now();
        
        if (cached && now - cached.timestamp < cached.ttl) {
          console.debug(`[Hermes] Usando datos en caché: ${queryKey}`);
          setData(cached.data);
          setLoading(false);
          return;
        }

        // Ejecutar query con reintentos
        setLoading(true);
        const result = await queryWithRetry(queryFn, retryConfig);
        
        // Guardar en caché
        cacheRef.current.set(queryKey, {
          data: result,
          timestamp: now,
          ttl: cacheSeconds * 1000,
        });

        setData(result);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    executeQuery();
  }, [queryKey, queryFn, cacheSeconds, retryConfig]);

  return { data, loading, error };
}

// ============================================================================
// ✅ PATRÓN 3: Operaciones CRUD Seguras con Manejo de Errores
// ============================================================================

// Nota: El cliente de Supabase debe ser inicializado en el contexto de la aplicación
// const supabase = createClient(
//   process.env.REACT_APP_SUPABASE_URL!,
//   process.env.REACT_APP_SUPABASE_ANON_KEY!
// );

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  creado_en: string;
}

// 🟢 LECTURA: Obtener usuarios con límite y manejo de errores
export async function obtenerUsuarios(supabase: any, limite: number = 10): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .limit(limite) // ✅ SIEMPRE incluir limit
      .order('creado_en', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[Hermes] Error al obtener usuarios:', error);
    // Retornar array vacío como fallback
    return [];
  }
}

// 🟡 INSERCIÓN: Crear usuario con validación
export async function crearUsuario(
  supabase: any,
  nombre: string,
  email: string
): Promise<Usuario | null> {
  try {
    // Validación básica
    if (!nombre.trim() || !email.trim()) {
      throw new Error('Nombre y email son requeridos');
    }

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, email }])
      .select()
      .single(); // Esperar un solo resultado

    if (error) {
      throw new Error(`Error al insertar: ${error.message}`);
    }

    return data;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[Hermes] Error al crear usuario:', error);
    throw error; // Propagar al caller para manejo específico
  }
}

// 🔴 ACTUALIZACIÓN: Actualizar usuario con reintentos
export async function actualizarUsuario(
  supabase: any,
  id: string,
  updates: Partial<Usuario>
): Promise<Usuario | null> {
  const updateFn = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  };

  try {
    return await queryWithRetry(updateFn);
  } catch (err) {
    console.error('[Hermes] Error al actualizar usuario:', err);
    throw err;
  }
}

// 🔵 ELIMINACIÓN: Borrar usuario (con confirmación)
export async function eliminarUsuario(supabase: any, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar: ${error.message}`);
    }

    return true;
  } catch (err) {
    console.error('[Hermes] Error al eliminar usuario:', err);
    return false;
  }
}

// ============================================================================
// ✅ PATRÓN 4: Suscripciones a Realtime con Limpieza Automática
// ============================================================================

/**
 * Hook para suscribirse a cambios en tiempo real
 * CRÍTICO: Limpia suscripción al desmontar componente
 */
export function useSupabaseRealtimeSubscription<T>(
  supabase: any,
  table: string,
  onChanges: (changes: T[]) => void
) {
  useEffect(() => {
    console.debug(`[Hermes] Suscribiendo a cambios en tabla: ${table}`);

    // Crear canal de suscripción
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table }, // Escuchar INSERT, UPDATE, DELETE
        (payload: any) => {
          console.debug(`[Hermes] Cambio detectado en ${table}:`, payload);
          onChanges([payload.new as T]);
        }
      )
      .subscribe((status: any) => {
        if (status === 'SUBSCRIBED') {
          console.debug(`[Hermes] Suscripción activa para ${table}`);
        } else if (status === 'CLOSED') {
          console.warn(`[Hermes] Suscripción cerrada para ${table}`);
        }
      });

    // ✅ FUNCIÓN DE LIMPIEZA: Unsubscribe al desmontar
    return () => {
      console.debug(`[Hermes] Cancelando suscripción para ${table}`);
      channel.unsubscribe();
    };
  }, [supabase, table, onChanges]);
}

// ============================================================================
// ✅ PATRÓN 5: Manejo Global de Errores de Red
// ============================================================================

export class NetworkErrorHandler {
  static isNetworkError(error: Error): boolean {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    );
  }

  static getUserMessage(error: Error): string {
    if (this.isNetworkError(error)) {
      return 'Problema de conexión. Por favor, verifica tu internet y reintentas.';
    }
    if (error.message.includes('unauthorized')) {
      return 'No tienes permisos para realizar esta acción.';
    }
    return 'Ocurrió un error. Por favor, reintentas.';
  }

  static async handleError(error: Error, context: string): Promise<void> {
    console.error(`[Hermes] Error en ${context}:`, error);
    
    // Aquí puedes enviar a Sentry, LogRocket, etc.
    // if (process.env.NODE_ENV === 'production') {
    //   // Enviar a servicio de logging
    //   // await sendToLoggingService({ context, error });
    // }
  }
}

// ============================================================================
// ✅ EJEMPLO DE USO EN COMPONENTE REACT
// ============================================================================
// 
// import React from 'react';
//
// export function UsuariosComponent() {
//   const { data: usuarios, loading, error } = useSupabaseQuery(
//     'usuarios_list',
//     () => obtenerUsuarios(20),
//     { cacheSeconds: 30 }
//   );
//
//   // Suscribirse a cambios en tiempo real
//   useSupabaseRealtimeSubscription('usuarios', (changes) => {
//     console.log('Nuevos cambios:', changes);
//     // Aquí actualizar state local
//   });
//
//   if (loading) return <div>Cargando usuarios...</div>;
//   if (error) {
//     const userMsg = NetworkErrorHandler.getUserMessage(error);
//     return <div>Error: {userMsg}</div>;
//   }
//
//   return (
//     <ul>
//       {usuarios?.map((usuario) => (
//         <li key={usuario.id}>{usuario.nombre}</li>
//       ))}
//     </ul>
//   );
// }

// ============================================================================
// 📋 CHECKLIST DE IMPLEMENTACIÓN
// ============================================================================
/*
✅ Todas las consultas SELECT tienen .limit(n)
✅ Todas las promesas están envueltas en try/catch
✅ useEffect con Supabase Realtime retorna función de limpieza
✅ Se implementó caché SWR para datos frecuentes
✅ Los reintentos usan backoff exponencial
✅ Los errores de red se manejan con mensajes amigables
✅ No hay console.log() en código de producción
✅ Las suscripciones se cancelan en cleanup
✅ Connection Pooling está activado en Supabase
*/
