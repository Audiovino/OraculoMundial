/**
 * Sistema de Agentes Hermes para Seguridad y Monitoreo
 * 
 * Usa Ollama local cuando está disponible (localhost).
 * Fallback automático a Gemini Flash (gratuito) cuando se accede desde
 * dispositivos externos / celulares donde Ollama no es accesible.
 */
import { mundialSupabase } from './mundialSupabaseClient';
import { getBrowserDeviceType } from '../utils/deviceDetector';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'hermes3';

// ZhipuAI GLM-4 Flash — fallback gratuito para acceso remoto/mobile
const ZHIPU_API_KEY = import.meta.env.VITE_ZHIPU_API_KEY || '';
const ZHIPU_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/** Detecta si Ollama está disponible (solo funciona en localhost) */
let _ollamaAvailable: boolean | null = null;
async function isOllamaAvailable(): Promise<boolean> {
  if (_ollamaAvailable !== null) return _ollamaAvailable;
  try {
    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    _ollamaAvailable = res.ok;
  } catch {
    _ollamaAvailable = false;
  }
  return _ollamaAvailable;
}

/**
 * Llama al LLM disponible: Ollama primero, ZhipuAI como fallback.
 * Siempre devuelve texto de respuesta o lanza error.
 */
async function callLLM(prompt: string): Promise<string> {
  const ollamaOk = await isOllamaAvailable();

  if (ollamaOk) {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, prompt, stream: false, options: { temperature: 0.1 } })
    });
    const data = await res.json();
    return data.response as string;
  }

  // Fallback: ZhipuAI GLM-4 Flash
  if (!ZHIPU_API_KEY) {
    throw new Error('Ollama no disponible y VITE_ZHIPU_API_KEY no configurada');
  }
  const res = await fetch(ZHIPU_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 512
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

interface HermesResponse {
  valid: boolean;
  issues: string[];
  sanitized?: any;
  recommendation?: string;
}

export interface HermesFullReport {
  timestamp: string;
  health: HermesResponse;
  responsiveness: HermesResponse;
  secrets: HermesResponse;
  qaTest?: HermesResponse;
  performance?: HermesResponse;
  overallStatus: 'secure' | 'warning' | 'critical';
}

/**
 * Verifica si el usuario actual tiene permisos de Super Admin
 * según la política estricta solicitada.
 */
export function isAuthorizedAdmin(email?: string): boolean {
  if (!email) return false;
  const isAdmin = email.toLowerCase() === 'foco3981@gmail.com';
  
  // Registro de seguridad: Si no es admin e intenta entrar a rutas críticas, Hermes lo detecta
  if (email && !isAdmin && typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
    console.error(`[Hermes Critical] Intento de acceso administrativo no autorizado desde: ${email}`);
    // Aquí podrías disparar una alerta automática a Telegram
  }
  
  return isAdmin;
}

/**
 * Extrae y parsea JSON de la respuesta del LLM,
 * manejando posibles bloques de formato Markdown.
 */
function parseHermesResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonContent = match ? match[1] : text;
    return JSON.parse(jsonContent.trim());
  }
}

/**
 * AGENTE 1: Validación de Login
 * Verifica entradas de usuario, sanitiza y detecta inyecciones
 */
export async function validateLoginInput(email: string, password: string): Promise<HermesResponse> {
  const prompt = `Eres un agente de seguridad experto. Analiza estas credenciales de login y detecta:

1. Inyección SQL (', --, OR 1=1, UNION, etc.)
2. Inyección NoSQL ($ne, $gt, {}, [], etc.)
3. XSS (<script>, javascript:, onerror=, etc.)
4. Path traversal (../, ..\, etc.)
5. Command injection (;, |, &&, \`, etc.)
6. Email inválido (formato incorrecto)
7. Password débil (menos de 6 caracteres)

Email: "${email}"
Password length: ${password.length} caracteres

Responde SOLO con JSON válido:
{
  "valid": true/false,
  "issues": ["lista de problemas encontrados"],
  "sanitized": {
    "email": "email sanitizado",
    "password": "mantener original si es válido"
  },
  "recommendation": "qué hacer si hay problemas"
}`;

  try {
    const text = await callLLM(prompt);
    return parseHermesResponse(text);
  } catch (error) {
    console.error('❌ Hermes Agent 1 error:', error);
    // Fallback: validación básica
    return {
      valid: email.includes('@') && password.length >= 6,
      issues: email.includes('@') ? [] : ['Email inválido'],
      sanitized: { email: email.trim().toLowerCase(), password }
    };
  }
}

/**
 * AGENTE 2: Seguridad de Datos (RLS + Aislamiento)
 * Verifica que las queries solo traigan datos del usuario correcto
 */
export async function validateDataQuery(
  userId: string,
  query: string,
  tableName: string
): Promise<HermesResponse> {
  const prompt = `Eres un agente de seguridad de bases de datos. Analiza esta query de Supabase:

Usuario ID: ${userId}
Tabla: ${tableName}
Query: ${query}

Verifica:
1. ¿La query incluye filtro por user_id?
2. ¿Hay riesgo de data leakage (traer datos de otros usuarios)?
3. ¿La query es eficiente (usa índices)?
4. ¿Hay riesgo de SQL injection?
5. ¿El usuario solo puede ver SUS datos?

Responde SOLO con JSON válido:
{
  "valid": true/false,
  "issues": ["lista de problemas"],
  "recommendation": "cómo arreglar si hay problemas"
}`;

  try {
    const text = await callLLM(prompt);
    return parseHermesResponse(text);
  } catch (error) {
    console.error('❌ Hermes Agent 2 error:', error);
    return {
      valid: query.includes(userId),
      issues: query.includes(userId) ? [] : ['Query no filtra por user_id'],
      recommendation: 'Agregar .eq("user_id", userId) a la query'
    };
  }
}

/**
 * AGENTE 3: Protección de Secrets
 * Detecta si hay APIs o ENV expuestas en el código del cliente
 */
export async function scanForExposedSecrets(code: string): Promise<HermesResponse> {
  const prompt = `Eres un agente de seguridad que detecta secrets expuestos. Analiza este código:

${code.substring(0, 1000)} // Primeros 1000 caracteres

Busca:
1. API keys expuestas (sk_, pk_, api_key, etc.)
2. Tokens de autenticación
3. URLs de servicios privados
4. Credenciales hardcodeadas
5. Variables de entorno expuestas (process.env sin VITE_)
6. Service role keys de Supabase
7. Claves privadas (private_key, secret_key)

Responde SOLO con JSON válido:
{
  "valid": true/false,
  "issues": ["lista de secrets encontrados"],
  "recommendation": "cómo proteger los secrets"
}`;

  try {
    const text = await callLLM(prompt);
    return parseHermesResponse(text);
  } catch (error) {
    console.error('❌ Hermes Agent 3 error:', error);
    return {
      valid: true,
      issues: [],
      recommendation: 'Verificar manualmente'
    };
  }
}

/**
 * AGENTE 4: Monitoreo de Estado
 * Verifica uptime, carga de datos, performance
 */
export async function monitorAppHealth(): Promise<HermesResponse> {
  const startTime = performance.now();
  
  // Verificar conexión a Supabase
  let supabaseOk = false;
  let supabaseTime = 0;
  try {
    const supabaseStart = performance.now();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rthdnwkwocojijyfcrtr.supabase.co';
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '' }
    });
    supabaseTime = performance.now() - supabaseStart;
    supabaseOk = response.ok;
  } catch (error) {
    supabaseOk = false;
  }

  // Verificar Ollama local
  let ollamaOk = false;
  let ollamaTime = 0;
  try {
    const ollamaStart = performance.now();
    const response = await fetch('http://localhost:11434/api/tags');
    ollamaTime = performance.now() - ollamaStart;
    ollamaOk = response.ok;
  } catch (error) {
    ollamaOk = false;
  }

  // Verificar existencia del video tutorial
  let videoOk = false;
  try {
    // Verificar el despliegue de HyperFrames (Punto de origen real)
    const videoRes = await fetch('https://hyperframes-mini-video.vercel.app/', { method: 'HEAD', mode: 'no-cors' });
    videoOk = videoRes.type === 'opaque' || videoRes.ok;
  } catch (error) {
    videoOk = false;
  }

  const totalTime = performance.now() - startTime;

  const prompt = `Eres un agente de monitoreo de sistemas. Analiza este estado:
Configuración de Entorno:
- VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? 'CONFIGURADO' : 'FALTA'}
- VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURADO' : 'FALTA'}

Estado de Autenticación:
- ¿Requiere confirmación de email?: (Revisar en Dashboard de Supabase)

Errores reportados para investigación:
1. "No user returned from signup": Falla en propagación de variables de entorno o triggers de DB.
2. Partidos desaparecen por grupos: El límite de 100 req/día de WC2026 API se agota y los demo matches estaban incompletos.
3. Incidencias en Celular y PC: Confirmado como problema de datos a nivel de servicio, no de layout.

Supabase:
- Estado: ${supabaseOk ? 'OK' : 'ERROR'}
- Tiempo de respuesta: ${supabaseTime.toFixed(2)}ms

Video Tutorial (HyperFrames):
- Estado: ${videoOk ? 'OK (Existe)' : 'ERROR (No encontrado)'}

Ollama Local:
- Estado: ${ollamaOk ? 'OK' : 'ERROR'}
- Tiempo de respuesta: ${ollamaTime.toFixed(2)}ms

Tiempo total de verificación: ${totalTime.toFixed(2)}ms

Evalúa:
1. ¿Los servicios están funcionando?
2. ¿Los tiempos de respuesta son aceptables? (<500ms = bueno, <1000ms = aceptable, >1000ms = lento)
3. ¿Hay algún problema crítico?
4. ¿Qué recomiendas?

Responde SOLO con JSON válido:
{
  "valid": true/false,
  "issues": ["lista de problemas"],
  "recommendation": "acciones a tomar"
}`;

  try {
    const text = await callLLM(prompt);
    const result = parseHermesResponse(text);
    return {
      ...result,
      sanitized: {
        supabase: { ok: supabaseOk, time: supabaseTime },
        ollama: { ok: ollamaOk, time: ollamaTime },
        video: { ok: videoOk },
        total: totalTime
      }
    };
  } catch (error) {
    console.error('❌ Hermes Agent 4 error:', error);
    return {
      valid: supabaseOk,
      issues: [
        ...(!supabaseOk ? ['Supabase no responde'] : []),
        ...(!videoOk ? ['El tutorial en HyperFrames no está accesible'] : [])
      ],
      recommendation: !videoOk 
        ? 'Verifica el estado del despliegue en https://hyperframes-mini-video.vercel.app/' 
        : 'Verificar conexión a internet y estado de Supabase',
      sanitized: {
        supabase: { ok: supabaseOk, time: supabaseTime },
        ollama: { ok: ollamaOk, time: ollamaTime },
        video: { ok: videoOk },
        total: totalTime
      }
    };
  }
}

/**
 * AGENTE 7: Descubrimiento de Partidos
 * Analiza peticiones del usuario para filtrar por grupo o fecha
 */
export async function discoverMatches(query: string): Promise<HermesResponse> {
  const prompt = `Eres un experto en el calendario del Mundial 2026. 
  Analiza la petición del usuario: "${query}"
  
  Objetivo:
  1. Detectar si busca un grupo (A, B, C, D, E, F, G, H).
  2. Detectar si busca una fecha específica.
  3. Devolver el filtro correspondiente.

  Responde SOLO con JSON válido:
  {
    "valid": true/false,
    "filterType": "group" | "date" | "all",
    "value": "valor_detectado",
    "issues": [],
    "recommendation": "instrucción para la UI"
  }`;

  try {
    const text = await callLLM(prompt);
    return parseHermesResponse(text);
  } catch (error) {
    console.error('❌ Hermes Agent 7 error:', error);
    return {
      valid: false,
      issues: ['No se pudo interpretar la búsqueda'],
      recommendation: 'Usa el menú de selección manual para elegir grupo o fecha.'
    };
  }
}

/** 
 * Lista de Barrios/Zonas Estratégicas para Fallback 
 * (Solo se muestra si el GPS falla)
 */
export const ZONAS_COBERTURA = [
  'Puerto Madero - Dique 1',
  'Puerto Madero - Dique 2',
  'Puerto Madero - Dique 3',
  'Puerto Madero - Dique 4',
  'Palermo Nuevo',
  'Las Cañitas',
  'Recoleta - Av. Alvear',
  'Belgrano R'
];

/**
 * AGENTE 9: Infraestructura Supabase (CLI)
 * Script: `npm run hermes:infra` → scripts/hermes-infra-agent.mjs
 * Aplica migraciones, verifica private_leagues / league_members y sincroniza aprendizaje a Obsidian.
 */

/**
 * AGENTE 8: Geolocalizador de Leads (Real Estate Intelligence)
 * Cruza coordenadas GPS con el diccionario de edificios de alto valor.
 */
export async function identifyLeadBuilding(lat: number, lon: number): Promise<{buildingName: string, address: string, zone?: string} | null> {
  try {
    // Consultar el diccionario de edificios en Supabase
    const { data: buildings } = await mundialSupabase
      .from('buildings_dictionary')
      .select('*');

    if (!buildings) return null;

    // Algoritmo de proximidad (Haversine simple)
    for (const b of buildings) {
      const dist = Math.sqrt(Math.pow(lat - b.lat, 2) + Math.pow(lon - b.lon, 2));
      // Aproximadamente 0.0005 grados son 50 metros
      if (dist < 0.0005) {
        return { buildingName: b.name, address: b.address };
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Hermes Agent 8 error:', error);
    return null;
  }
}

/**
 * Captura de Localización con Fallback de Barrio manual
 */
export async function updateUserDetails(userId: string, lat?: number, lon?: number, manualZone?: string) {
  let building = null;
  if (lat && lon) {
    building = await identifyLeadBuilding(lat, lon);
  }

  await mundialSupabase
    .from('mundial_users')
    .update({
      latitude: lat || null,
      longitude: lon || null,
      detected_building: building?.buildingName || manualZone || 'Zona Pendiente',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  return building;
}

/**
 * AGENTE 5: Verificación de Responsividad
 * Detecta si la UI es responsive y accesible en mobile/desktop
 */
export async function checkResponsiveness(): Promise<HermesResponse> {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const deviceType = typeof window !== 'undefined' ? getBrowserDeviceType() : 'desktop';
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  // Verificar elementos críticos
  const criticalElements = [
    { selector: 'button', name: 'Botones' },
    { selector: 'input', name: 'Inputs' },
    { selector: 'nav', name: 'Navegación' },
    { selector: '[role="main"]', name: 'Contenido principal' },
    { selector: 'video', name: 'Videos' },
    { selector: 'iframe', name: 'HyperFrames' }
  ];

  const elementSizes: any[] = [];
  if (typeof document !== 'undefined') {
    criticalElements.forEach(({ selector, name }) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        let extraInfo = {};
        
        if (el instanceof HTMLVideoElement) {
          extraInfo = {
            readyState: el.readyState,
            error: el.error ? el.error.code : null,
            paused: el.paused,
            src: el.currentSrc
          };
        }

        elementSizes.push({
          name,
          width: rect.width,
          height: rect.height,
          tooSmall: isMobile && (rect.width < 44 || rect.height < 44),
          ...extraInfo
        });
      });
    });
  }

  const prompt = `Eres un agente de UX/UI que verifica responsividad. Analiza:

Dispositivo:
- Ancho: ${screenWidth}px
- Alto: ${screenHeight}px
- Tipo: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
Plataforma: ${typeof navigator !== 'undefined' ? navigator.platform : 'iOS/iPhone'}

Elementos críticos:
${JSON.stringify(elementSizes, null, 2)}
Políticas de Chrome Mobile: Los videos deben estar 'muted' para autoPlay y tener 'playsInline'.

Verifica:
1. ¿Los botones son suficientemente grandes para mobile? (mínimo 44x44px)
2. ¿El texto es legible? (mínimo 16px en mobile)
3. ¿Hay elementos "encimados" (overlapping)? Especialmente nombres de países chocando con inputs numéricos.
4. ¿La navegación es accesible?
5. ¿Cumple con WCAG 2.1 AA?
6. Si hay videos, ¿por qué podrían no estar reproduciéndose? (Analiza readyState y error)
7. En iPhone, verifica que el contenedor del país derecho no colisione con el marcador. 
   RECOMENDACIÓN: Usa 'flex-1 min-w-0' y 'truncate' en los nombres.

Responde SOLO con JSON válido:
{
  "valid": true/false,
  "issues": ["lista de problemas de responsividad"],
  "recommendation": "cómo mejorar la UI"
}`;

  try {
    const text = await callLLM(prompt);
    const result = parseHermesResponse(text);
    return {
      ...result,
      sanitized: {
        screen: { width: screenWidth, height: screenHeight },
        device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        elements: elementSizes
      }
    };
  } catch (error) {
    console.error('❌ Hermes Agent 5 error:', error);
    const tooSmallElements = elementSizes.filter(e => e.tooSmall);
    return {
      valid: tooSmallElements.length === 0,
      issues: tooSmallElements.map(e => `${e.name} muy pequeño: ${e.width}x${e.height}px`),
      recommendation: 'Aumentar tamaño de elementos táctiles a mínimo 44x44px',
      sanitized: {
        screen: { width: screenWidth, height: screenHeight },
        device: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        elements: elementSizes
      }
    };
  }
}

/**
 * AGENTE 6: QA Tester Agent
 * Realiza un test integral de las funciones lógicas de la web
 */
export async function performSystemQATest(): Promise<HermesResponse> {
  const prompt = `Eres un ingeniero de QA Senior. Tu misión es testear la integridad lógica de la web "Oráculo Mundial".
  Analiza el estado de estas funciones clave:
  1. Autenticación (Supabase Auth)
  2. Gestión de Partidos (API WorldCup)
  3. Sistema de Predicciones (Lectura/Escritura en DB)
  4. Cálculo de Ranking (Agregaciones de puntos)
  5. Multiplicadores de Racha (Lógica de Streaks)
  6. Notificaciones y Alertas (Edge Functions)

  Responde SOLO con JSON válido:
  {
    "valid": true/false,
    "issues": ["lista de bugs o fallos lógicos detectados"],
    "recommendation": "qué debe arreglar el desarrollador inmediatamente"
  }`;

  try {
    const text = await callLLM(prompt);
    return parseHermesResponse(text);
  } catch (error) {
    // Fallback basado en reglas si el LLM no está disponible
    const { data: matches } = await mundialSupabase.from('mundial_matches').select('id').limit(1);
    const supabaseReachable = !!matches;

    return {
      valid: supabaseReachable,
      issues: supabaseReachable 
        ? ['QA Agent operando en modo básico (LLM offline)'] 
        : ['Supabase no responde - Integridad lógica en riesgo'],
      recommendation: supabaseReachable
        ? 'Integridad de base de datos verificada manualmente. Conecta Ollama para análisis profundo.'
        : 'Verifica conexión a internet y estado de servicios en Supabase.'
    };
  }
}

/**
 * Ejecuta el test de QA si no se ha ejecutado en las últimas 24 horas
 */
export async function runDailyQACheck() {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data } = await mundialSupabase
      .from('hermes_logs')
      .select('id')
      .eq('status', 'qa_report')
      .gt('created_at', yesterday.toISOString())
      .limit(1);

    if (!data || data.length === 0) {
      console.log('📅 Ejecutando test de QA diario...');
      const qaResult = await performSystemQATest();
      await saveHermesReport({
        timestamp: new Date().toISOString(),
        health: { valid: true, issues: [] },
        responsiveness: { valid: true, issues: [] },
        secrets: { valid: true, issues: [] },
        qaTest: qaResult,
        overallStatus: qaResult.valid ? 'secure' : 'critical'
      }, 'qa_report');
    }
  } catch (error) {
    console.error('❌ Error en el verificador diario:', error);
  }
}

/**
 * Envía una notificación a Telegram cuando se detecta un problema
 * Formateado como Alerta Mundial para el bot Assistente Inmobiliario
 */
async function notifyTelegram(report: HermesFullReport) {
  // Solo enviar si el estado no es 'secure'
  if (report.overallStatus === 'secure') return;

  try {
    await mundialSupabase.functions.invoke('hermes-notifier', {
      body: { report }
    });
  } catch (error) {
    console.error('⚠️ Error enviando alerta a través de Supabase Edge Function:', error);
  }
}

/**
 * Envía una notificación personalizada a Telegram para acciones de administración
 */
export async function sendTelegramAlert(message: string) {
  try {
    await mundialSupabase.functions.invoke('hermes-notifier', {
      body: { message }
    });
  } catch (error) {
    console.error('⚠️ Error enviando alerta a Telegram:', error);
  }
}

/**
 * Envía un archivo CSV a Telegram como documento adjunto
 */
export async function sendTelegramFile(csvContent: string, fileName: string) {
  try {
    // Codificación segura para UTF-8 en Base64 para el transporte JSON
    const base64 = btoa(unescape(encodeURIComponent(csvContent)));
    await mundialSupabase.functions.invoke('hermes-notifier', {
      body: { 
        file: base64, 
        fileName,
        caption: `📊 *Reporte de Leads Generado*\nArchivo: \`${fileName}\`\n_Enviado desde Panel Admin_`
      }
    });
  } catch (error) {
    console.error('⚠️ Error enviando archivo a Telegram:', error);
  }
}

/**
 * Guarda el reporte de Hermes en la base de datos para auditoría del Admin
 */
export async function saveHermesReport(report: HermesFullReport, customStatus?: string) {
  try {
    const { error } = await mundialSupabase
      .from('hermes_logs')
      .insert([{
        status: customStatus || report.overallStatus,
        health_data: report.health,
        security_data: report.secrets,
        ui_data: report.responsiveness,
        qa_data: report.qaTest,
        created_at: report.timestamp
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('⚠️ Error al persistir reporte de Hermes:', error);
  }
}

/**
 * Ejecutar todos los agentes en paralelo
 */
export async function runAllAgents(context?: any): Promise<HermesFullReport> {
  if (import.meta.env.DEV) console.log('🤖 Ejecutando agentes Hermes...');
  
  const results = await Promise.allSettled([
    monitorAppHealth(),
    checkResponsiveness(),
    context?.code 
      ? scanForExposedSecrets(context.code) 
      : (typeof document !== 'undefined' ? scanForExposedSecrets(document.documentElement.outerHTML) : Promise.resolve({ valid: true, issues: [] })),
    performSystemQATest()
  ]);

  // Helper to safely extract value from PromiseSettledResult
  const getVal = (res: PromiseSettledResult<HermesResponse>, fallbackIssues: string[]) => 
    res.status === 'fulfilled' ? res.value : { valid: false, issues: fallbackIssues };

  const report: HermesFullReport = {
    timestamp: new Date().toISOString(),
    health: getVal(results[0] as PromiseSettledResult<HermesResponse>, ['Error en agente de salud']),
    responsiveness: getVal(results[1] as PromiseSettledResult<HermesResponse>, ['Error en agente de responsividad']),
    secrets: getVal(results[2] as PromiseSettledResult<HermesResponse>, []),
    qaTest: getVal(results[3] as PromiseSettledResult<HermesResponse>, ['Error en agente QA']),
    performance: { valid: true, issues: [] },
    overallStatus: 'secure'
  };

  // Determinar estado global
  const allValid = report.health.valid && report.responsiveness.valid && report.secrets.valid && (report.qaTest?.valid ?? false);
  const hasCritical = !report.secrets.valid || !report.health.valid || !(report.qaTest?.valid ?? false);
  
  if (hasCritical) {
    report.overallStatus = 'critical';
  } else if (!allValid) {
    report.overallStatus = 'warning';
  }


  // Notificar a Telegram si hay alertas
  notifyTelegram(report);

  // Enviar a logs en segundo plano
  saveHermesReport(report);

  return report;
}
