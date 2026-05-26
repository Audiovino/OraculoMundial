# 🎯 Guía de Administración: API-Football + Scraping + Manual

## 📋 Resumen

Tu panel de administrador ahora tiene **3 formas de obtener resultados de partidos**:

1. **API-Football** (automático, requiere API key)
2. **Scraping con Hermes** (fallback con Ollama local)
3. **Entrada Manual** (último recurso)

---

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Asegúrate de tener estas variables configuradas:

```bash
# En Supabase (Edge Functions > Secrets)
API_SPORTS_KEY=tu_api_key_de_api_football
SUPABASE_URL=https://rthdnwkwocojijyfcrtr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# En Vercel (Settings > Environment Variables)
VITE_GROQ_API_KEY=tu_api_key_de_groq
VITE_AI_PROVIDER=cloud # O "local" para forzar Ollama
```

### 2. Desplegar Edge Function

```bash
cd c:\Proyectos\OraculoMundial

# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref rthdnwkwocojijyfcrtr

# Desplegar la función
supabase functions deploy sync-matches
```

### 3. Verificar Ollama Local

Para el scraping con Hermes, asegúrate de tener Ollama corriendo:

```powershell
# Verificar que Ollama esté corriendo
curl http://localhost:11434/api/tags

# Si no está corriendo, inicialo
ollama serve

# Verificar que tengas el modelo hermes3
ollama list
```

---

## 🎮 Cómo Usar el Panel

### Acceder al Panel

1. Inicia sesión en tu app: `http://localhost:5173`
2. Haz clic en el botón **"Admin"** en la navegación
3. Ve a la pestaña **"API & Scraping"**

---

## 🔄 Opción 1: Sincronizar desde API-Football

**Cuándo usar:** Cuando tengas requests disponibles en tu plan de API-Football.

**Pasos:**

1. Haz clic en **"Sincronizar desde API-Football"**
2. La Edge Function se ejecutará y traerá todos los partidos del Mundial 2026
3. Los partidos se insertarán/actualizarán en la tabla `mundial_matches`
4. Verás un mensaje de éxito con la cantidad de partidos sincronizados

**Ventajas:**
- ✅ Datos oficiales y confiables
- ✅ Incluye logos de equipos
- ✅ Actualización automática de estados (PENDING, LIVE, FINISHED)

**Desventajas:**
- ❌ Requiere API key (costo)
- ❌ Límite de requests por día

---

## 🤖 Opción 2: Scraping con Hermes (Ollama)

**Cuándo usar:** Cuando se te acaben los requests de API-Football o quieras ahorrar costos.

**Pasos:**

1. Asegúrate de que Ollama esté corriendo localmente
2. Haz clic en **"Scraping con Hermes (Ollama)"**
3. El agente Hermes buscará resultados en sitios confiables (FIFA.com, ESPN, Google Sports)
4. Los resultados se insertarán automáticamente en la base de datos

**Ventajas:**
- ✅ Gratis (usa Ollama local)
- ✅ Privado (no envía datos a APIs externas)
- ✅ Funciona sin internet (si ya tienes el modelo descargado)

**Desventajas:**
- ❌ Menos confiable que API oficial
- ❌ Puede no encontrar todos los partidos
- ❌ Requiere Ollama corriendo localmente

**Cómo funciona:**

El agente Hermes recibe este prompt:

```
Actúa como un scraper web. Busca los resultados más recientes del Mundial 2026 
en sitios confiables como FIFA.com, ESPN, o Google Sports.

Devuelve SOLO un JSON válido con este formato:
{
  "matches": [
    {
      "home_team": "Argentina",
      "away_team": "Brasil",
      "home_goals": 2,
      "away_goals": 1,
      "status": "FINISHED",
      "date": "2026-06-15T20:00:00Z"
    }
  ]
}
```

---

## ✏️ Opción 3: Entrada Manual

**Cuándo usar:** Cuando las otras dos opciones fallen o necesites corregir un resultado específico.

**Pasos:**

1. En la tabla de partidos, busca el partido que quieres editar
2. Haz clic en el botón **"Editar"** (ícono de lápiz)
3. Modifica los goles de cada equipo
4. Cambia el estado a "Finalizado" si es necesario
5. Haz clic en **"Guardar"** (ícono de check)

**Ventajas:**
- ✅ Control total
- ✅ Corrección inmediata de errores
- ✅ No requiere APIs ni scraping

**Desventajas:**
- ❌ Manual (requiere tiempo)
- ❌ Propenso a errores humanos

---

## 🔧 Troubleshooting

### Error: "No capacity available for model"

**Problema:** Ollama no está corriendo o el modelo hermes3 no está instalado.

**Solución:**

```powershell
# Iniciar Ollama
ollama serve

# Instalar hermes3 si no lo tienes
ollama pull hermes3
```

### Error: "Invalid response from API-Sports"

**Problema:** API key inválida o límite de requests excedido.

**Solución:**

1. Verifica tu API key en Supabase Dashboard > Settings > Edge Functions > Secrets
2. Revisa tu plan en [API-Football Dashboard](https://dashboard.api-football.com/)
3. Usa el scraping con Hermes como alternativa

### Error: "Error upserting batch"

**Problema:** Problema con la base de datos o permisos RLS.

**Solución:**

1. Verifica que la tabla `mundial_matches` exista:

```sql
SELECT * FROM mundial_matches LIMIT 1;
```

2. Verifica las políticas RLS:

```sql
SELECT * FROM pg_policies WHERE tablename = 'mundial_matches';
```

3. Si no existe, ejecuta la migración:

```bash
supabase db push
```

---

## 📊 Cómo Funciona el Sistema de Puntos

Cuando un partido cambia a estado `FINISHED`:

1. **Trigger automático** (`match_finished_trigger`) se dispara
2. **Función `process_match_result()`** calcula el resultado real:
   - `home_win`: Local ganó
   - `away_win`: Visitante ganó
   - `draw`: Empate
3. **Actualiza puntos** en `mundial_predictions`:
   - Predicción correcta: **10 puntos**
   - Predicción incorrecta: **0 puntos**
4. **Recalcula ranking** en `mundial_rankings`:
   - Suma total de puntos
   - Cuenta partidos jugados

**Todo es automático** — solo necesitas cargar el resultado final.

---

## 🎯 Flujo Recomendado

### Durante el Mundial:

1. **Antes del torneo:**
   - Sincroniza todos los partidos desde API-Football
   - Verifica que todos los partidos estén cargados

2. **Durante los partidos:**
   - Los partidos se actualizan automáticamente a estado `LIVE` (si usas API-Football)
   - O puedes cambiarlos manualmente a `LIVE` para generar emoción

3. **Después de cada partido:**
   - **Opción A:** Sincroniza desde API-Football (automático)
   - **Opción B:** Scrapea con Hermes (semi-automático)
   - **Opción C:** Edita manualmente el resultado

4. **Verifica el ranking:**
   - Ve a la pestaña "Ranking" para ver cómo se actualizaron los puntos
   - Comparte el ranking por WhatsApp para generar competencia

---

## 🔐 Seguridad

### Permisos de Admin

Solo los usuarios en la tabla `admin_users` pueden acceder al panel de administración.

Para agregar un admin:

```sql
INSERT INTO admin_users (user_id, email, role, created_at)
VALUES (
  'tu_user_id_de_supabase_auth',
  'foco3981@gmail.com',
  'super_admin',
  NOW()
);
```

### RLS (Row Level Security)

- **Lectura pública:** Todos pueden ver los partidos
- **Escritura restringida:** Solo admins pueden modificar partidos
- **Service Role:** La Edge Function usa el service role key para bypass RLS

---

## 📱 Compartir Resultados

### WhatsApp

Desde la pestaña "Ranking", haz clic en **"Compartir WhatsApp"** para generar un mensaje automático con el top 10.

### JSON Export

Haz clic en **"Descargar JSON"** para exportar todo el ranking en formato JSON.

---

## 🎉 ¡Listo!

Ahora tenés un sistema completo de administración con 3 niveles de fallback:

1. API-Football (oficial)
2. Scraping con Hermes (fallback gratuito)
3. Entrada manual (último recurso)

**¡Que empiece el torneo!** ⚽🏆
