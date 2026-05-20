# 🔍 Admin Dashboard - Debugging Guide

## El Dashboard Está Vacío - ¿Por Qué?

Si ves el admin dashboard pero **no hay datos**, aquí está lo que está pasando:

### 1️⃣ Abre la Consola del Navegador (F12)

1. Presiona **F12** en tu navegador
2. Ve a la pestaña **"Console"**
3. Busca mensajes que empiezan con `[Admin]`

**Ejemplo de lo que verás:**

```
[Admin] Initializing dashboard...
[Admin] Loading matches from API...
[Admin] Matches loaded: {total: 80, upcoming: 45, live: 2, completed: 33}
[Admin] Loading standings...
[Admin] Standings loaded: 8 groups
```

---

## 📊 Qué Datos Carga el Dashboard

### 1. **Partidos** (desde WC2026 API)
- ✅ Próximos partidos
- ✅ Partidos en vivo
- ✅ Partidos finalizados
- ✅ Clasificaciones por grupo

**Si no ves partidos:**
- Verifica conexión a internet
- WC2026 API tiene límite de 100 requests/día
- Abre la consola y busca errores

### 2. **Usuarios y Predicciones** (desde Supabase)
- ❌ Tabla `mundial_users` - probablemente NO existe
- ❌ Tabla `mundial_predictions` - probablemente NO existe
- ❌ Tabla `mundial_notifications` - probablemente NO existe

**Por eso ves:**
- "Usuarios: 0"
- "Predicciones: 0"
- "Ranking: vacío"

---

## ✅ Cómo Arreglarlo

### Opción 1: Crear las Tablas en Supabase (Recomendado)

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta este script:

```sql
-- Crear tabla mundial_users
CREATE TABLE IF NOT EXISTS mundial_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla mundial_predictions
CREATE TABLE IF NOT EXISTS mundial_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  homeScore INT,
  awayScore INT,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla mundial_notifications
CREATE TABLE IF NOT EXISTS mundial_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_mundial_predictions_user_id ON mundial_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_mundial_notifications_user_id ON mundial_notifications(user_id);
```

3. Haz click en **"Run"**

---

### Opción 2: Insertar Datos de Prueba

Si quieres ver el dashboard con datos, ejecuta:

```sql
-- Insertar usuario de prueba
INSERT INTO mundial_users (user_id, username, email)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Test User',
  'test@example.com'
)
ON CONFLICT (user_id) DO NOTHING;

-- Insertar predicciones de prueba
INSERT INTO mundial_predictions (user_id, match_id, homeScore, awayScore, score)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'match_1',
  2,
  1,
  10
),
(
  (SELECT id FROM auth.users LIMIT 1),
  'match_2',
  1,
  1,
  5
);
```

---

## 🔧 Verificar Qué Está Pasando

### En la Consola (F12)

Busca estos mensajes:

```
✅ [Admin] Dashboard stats loaded: {users: 5, predictions: 20, completed: 15}
✅ [Admin] Matches loaded: {total: 80, upcoming: 45, live: 2, completed: 33}
✅ [Admin] Standings loaded: 8 groups
✅ [Admin] Tournament stats loaded: {...}
```

O errores como:

```
❌ [Admin] No mundial_users table or empty: relation "mundial_users" does not exist
❌ [Admin] Error loading matches: Network error
```

---

## 📋 Checklist de Debugging

- [ ] ¿Abriste la consola (F12)?
- [ ] ¿Ves mensajes `[Admin]`?
- [ ] ¿Hay errores de red?
- [ ] ¿Las tablas existen en Supabase?
- [ ] ¿Hay datos en las tablas?
- [ ] ¿Tienes conexión a internet?
- [ ] ¿WC2026 API está disponible?

---

## 🎯 Lo Que Debería Ver

### Pestaña "Resumen"
- ✅ Usuarios: número > 0
- ✅ Predicciones: número > 0
- ✅ Próximos Partidos: lista de partidos
- ✅ Actividad Reciente: últimas predicciones

### Pestaña "Partidos"
- ✅ En Vivo: número de partidos en vivo
- ✅ Próximos: número de partidos próximos
- ✅ Finalizados: número de partidos finalizados
- ✅ Lista de partidos

### Pestaña "Ranking"
- ✅ Botón "Cargar Ranking"
- ✅ Tabla con usuarios y puntos

### Pestaña "Grupos"
- ✅ Clasificaciones por grupo (A-H)
- ✅ Equipos y puntos

### Pestaña "Análisis"
- ✅ Estadísticas del torneo
- ✅ Partidos completados, en vivo, próximos

---

## 🚀 Próximos Pasos

1. **Crear las tablas** en Supabase (Opción 1 arriba)
2. **Insertar datos de prueba** (Opción 2 arriba)
3. **Recargar el dashboard** (F5)
4. **Verificar en la consola** que los datos cargan

---

## 💬 Preguntas Frecuentes

### "¿Por qué no veo usuarios?"
→ La tabla `mundial_users` no existe o está vacía. Crea la tabla con el script SQL.

### "¿Por qué no veo predicciones?"
→ La tabla `mundial_predictions` no existe o está vacía. Crea la tabla con el script SQL.

### "¿Por qué no veo partidos?"
→ WC2026 API no está respondiendo. Verifica conexión a internet.

### "¿Cómo sé si las tablas existen?"
→ En Supabase, ve a **Table Editor** y busca `mundial_users`, `mundial_predictions`, `mundial_notifications`.

---

## 📞 Soporte

Si tienes problemas:
1. Abre la consola (F12)
2. Copia los mensajes `[Admin]`
3. Verifica que las tablas existan en Supabase
4. Ejecuta el script SQL para crear las tablas
5. Recarga la página (F5)

¡El dashboard debería funcionar ahora! 🎉
