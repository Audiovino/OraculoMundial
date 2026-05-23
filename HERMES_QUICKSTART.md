# 🌟 Agente Hermes - Quick Start

## ¿Qué es el Agente Hermes?

Un **analizador inteligente** que audita tu código para garantizar que funcione perfecto en **dispositivos móviles**. Detecta:

- ❌ Promesas sin manejo de errores
- ❌ Consultas Supabase que descargan miles de registros
- ❌ Fugas de memoria en useEffect
- ❌ Código que congela la app en redes 4G/5G

---

## 🚀 Uso Rápido

### Opción 1: Usar el System Prompt Configurado

**Si usas GitHub Copilot, Claude, o ChatGPT:**

1. Abre `scripts/HERMES_SYSTEM_PROMPT.md`
2. Copia el contenido completo
3. Pégalo en el "System Prompt" de tu IDE/IA
4. En una nueva conversación, pide: *"Analiza la carpeta ./src y reporta problemas"*

### Opción 2: Ejecutar el Script Python

**En tu terminal:**

```bash
# Desde la carpeta del proyecto
python scripts/hermes_fullstack_analyser.py
```

**Resultado:**
- Genera un reporte con hallazgos
- Categoriza por severidad (CRÍTICO, ALTO, MEDIO, BAJO)
- Propone soluciones para cada problema

---

## 📊 Ejemplo de Hallazgo

```
🔴 CRÍTICO [promesa_sin_catch]
   Promesa o llamada Supabase sin manejo de errores
   Archivo: src/components/UsersPage.tsx (3x)
   → Envuelve en try/catch o añade .catch(error => console.error(error))
```

---

## 🎯 Los 4 Pilares del Agente Hermes

### 1️⃣ Sintaxis Correcta
- Promesas con `.catch()` o `try/catch`
- Funciones sin errores silenciosos
- Variables correctamente declaradas

### 2️⃣ Queries Optimizadas a Supabase
- **SIEMPRE** `.limit(n)` en SELECT
- Suscripciones con `unsubscribe()` en cleanup
- Connection Pooling activado

### 3️⃣ Edge Functions Rápidas
- `runtime: 'edge'` en rutas críticas
- Timeouts >= 1000ms
- Sin Cold Starts prolongados

### 4️⃣ Datos en Caché (SWR)
- Mostrar datos locales primero
- Validar en background
- Nunca pantalla en blanco

---

## 📁 Estructura de Archivos Creados

```
proyecto/
├── scripts/
│   ├── HERMES_SYSTEM_PROMPT.md          ← System Prompt del agente
│   ├── hermes_fullstack_analyser.py     ← Script de análisis
│   └── ...
├── src/
│   └── services/
│       └── hermes-supabase-resilient.ts ← Ejemplos de código resiliente
└── HERMES_SETUP_GUIDE.md                ← Guía completa de configuración
```

---

## 💻 Ejemplo: Consulta Resiliente

**ANTES (Frágil en móvil):**
```typescript
const data = await supabase
  .from('usuarios')
  .select('*'); // ❌ Puede traer 10,000 registros
```

**DESPUÉS (Resiliente):**
```typescript
const { data } = await supabase
  .from('usuarios')
  .select('*')
  .limit(20)       // ✅ Máximo 20 registros
  .order('id', { ascending: false });

// Con manejo de errores
try {
  // ...
} catch (error) {
  console.error('Error:', error);
  return [];
}
```

---

## ✅ Checklist de Implementación

Después de correr el Agente Hermes:

- [ ] Todas las promesas tienen `.catch()` o están en `try/catch`
- [ ] Todas las queries Supabase tienen `.limit(n)`
- [ ] Los useEffect Supabase retornan cleanup function
- [ ] Las rutas API críticas tienen `runtime: 'edge'`
- [ ] Existe caché SWR/React Query para datos
- [ ] Connection Pooling activado en Supabase
- [ ] No hay `console.log()` en producción
- [ ] Los timeouts son >= 1000ms
- [ ] Las imágenes usan `loading='lazy'`

---

## 🔗 Archivos Relacionados

- **System Prompt completo:** `scripts/HERMES_SYSTEM_PROMPT.md`
- **Guía de setup:** `HERMES_SETUP_GUIDE.md`
- **Ejemplos de código:** `src/services/hermes-supabase-resilient.ts`
- **Script de análisis:** `scripts/hermes_fullstack_analyser.py`

---

## ❓ Preguntas Frecuentes

**P: ¿El script modifica mis archivos?**
A: No. Solo reporta hallazgos (modo SOLO LECTURA).

**P: ¿Cómo incorporo esto en CI/CD?**
A: Ve a `HERMES_SETUP_GUIDE.md` → sección "Ejecución Automática"

**P: ¿Y si tengo falsos positivos?**
A: Edita los regex en `hermes_fullstack_analyser.py` → sección `PATRONES_*`

**P: ¿Dónde veo ejemplos de código correcto?**
A: En `src/services/hermes-supabase-resilient.ts` (patrones 1-5 documentados)

---

## 🎬 Próximos Pasos

1. **Ejecuta el análisis:**
   ```bash
   python scripts/hermes_fullstack_analyser.py
   ```

2. **Lee los hallazgos:**
   - Prioriza los 🔴 CRÍTICOS
   - Luego los 🟠 ALTOS
   - Luego los 🟡 MEDIOS

3. **Aplica las soluciones:**
   - Copia código desde `hermes-supabase-resilient.ts`
   - Adapta a tu contexto
   - Test en celular

4. **Valida mejoras:**
   - Vuelve a ejecutar el script
   - Mira reducción de hallazgos
   - Verifica performance en móvil (Lighthouse, DevTools)

---

**¡Tu app móvil está lista para ser resiliente! 🚀**

Última actualización: 2026-05-23
