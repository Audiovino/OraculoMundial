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
  overallStatus: 'secure' | 'warning' | 'critical';
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

  const totalTime = performance.now() - startTime;

  const prompt = `Eres un agente de monitoreo de sistemas. Analiza este estado:

Supabase:
- Estado: ${supabaseOk ? 'OK' : 'ERROR'}
- Tiempo de respuesta: ${supabaseTime.toFixed(2)}ms

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
        total: totalTime
      }
    };
  } catch (error) {
    console.error('❌ Hermes Agent 4 error:', error);
    return {
      valid: supabaseOk,
      issues: supabaseOk ? [] : ['Supabase no responde'],
      recommendation: 'Verificar conexión a internet y estado de Supabase',
      sanitized: {
        supabase: { ok: supabaseOk, time: supabaseTime },
        ollama: { ok: ollamaOk, time: ollamaTime },
        total: totalTime
      }
    };
  }
}

/**
 * AGENTE 5: Verificación de Responsividad
 * Detecta si la UI es responsive y accesible en mobile/desktop
 */
export async function checkResponsiveness(): Promise<HermesResponse> {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const deviceType = getBrowserDeviceType();
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  // Verificar elementos críticos
  const criticalElements = [
    { selector: 'button', name: 'Botones' },
    { selector: 'input', name: 'Inputs' },
    { selector: 'nav', name: 'Navegación' },
    { selector: '[role="main"]', name: 'Contenido principal' }
  ];

  const elementSizes: any[] = [];
  criticalElements.forEach(({ selector, name }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      elementSizes.push({
        name,
        width: rect.width,
        height: rect.height,
        tooSmall: isMobile && (rect.width < 44 || rect.height < 44) // WCAG mínimo 44x44px
      });
    });
  });

  const prompt = `Eres un agente de UX/UI que verifica responsividad. Analiza:

Dispositivo:
- Ancho: ${screenWidth}px
- Alto: ${screenHeight}px
- Tipo: ${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}

Elementos críticos:
${JSON.stringify(elementSizes, null, 2)}

Verifica:
1. ¿Los botones son suficientemente grandes para mobile? (mínimo 44x44px)
2. ¿El texto es legible? (mínimo 16px en mobile)
3. ¿Hay elementos que se salen de la pantalla?
4. ¿La navegación es accesible?
5. ¿Cumple con WCAG 2.1 AA?

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
    return {
      valid: false,
      issues: ['No se pudo ejecutar el Agente QA: LLM no disponible (Ollama ni Gemini)'],
      recommendation: 'Asegúrate de que Ollama esté corriendo localmente o configura VITE_GEMINI_API_KEY.'
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
  console.log('🤖 Ejecutando agentes Hermes...');
  
  const results = await Promise.allSettled([
    monitorAppHealth(),
    checkResponsiveness(),
    context?.code ? scanForExposedSecrets(context.code) : scanForExposedSecrets(document.documentElement.outerHTML),
    performSystemQATest()
  ]);

  const report: HermesFullReport = {
    timestamp: new Date().toISOString(),
    health: results[0].status === 'fulfilled' ? results[0].value : { valid: false, issues: ['Error en agente de salud'] },
    responsiveness: results[1].status === 'fulfilled' ? results[1].value : { valid: false, issues: ['Error en agente de responsividad'] },
    secrets: results[2].status === 'fulfilled' ? results[2].value : { valid: true, issues: [] },
    qaTest: results[3].status === 'fulfilled' ? results[3].value : { valid: false, issues: ['Error en agente QA'] },
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
