# ✅ Admin Dashboard - Setup Final

## 🎯 Objetivo

Agregar la tabla `admin_users` a tu Supabase existente para que funcione el admin dashboard.

---

## 📋 Paso 1: Ejecutar Script SQL

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia TODO el contenido de: `scripts/add-admin-users-table.sql`
3. Pégalo en el SQL Editor
4. Haz click en **"Run"**

**Resultado esperado:**
```
✓ admin_users table created
✓ notifications table created
✓ Policies applied
```

---

## 👤 Paso 2: Agregar tu Usuario como Admin

1. En Supabase, ve a **Authentication** → **Users**
2. Busca tu usuario: `foco3981@gmail.com`
3. Copia su **UUID** (el código largo)

4. En **SQL Editor**, ejecuta:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('PEGA_EL_UUID_AQUI', 'foco3981@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
```

**Ejemplo real:**
```sql
INSERT INTO admin_users (user_id, email)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'foco3981@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
```

5. Verifica que se insertó:
```sql
SELECT * FROM admin_users;
```

---

## 🌐 Paso 3: Acceder al Admin Dashboard

1. Ve a: `https://oraculo-mundial.vercel.app/admin`
2. Deberías ver el **Admin Dashboard** con 6 pestañas

---

## 📊 ¿Qué Ves en el Dashboard?

### Pestaña "Resumen"
- Usuarios totales
- Predicciones
- Partidos próximos

### Pestaña "Partidos"
- Partidos en vivo
- Próximos partidos
- Partidos finalizados
- Formulario para cargar resultados

### Pestaña "Ranking"
- Top jugadores
- Exportar a JSON
- Compartir en WhatsApp

### Pestaña "Grupos"
- Clasificaciones por grupo (A-H)
- Equipos y puntos

### Pestaña "Análisis"
- Estadísticas del torneo
- Partidos completados/en vivo/próximos

### Pestaña "Configuración"
- Enviar notificaciones
- Información de APIs

---

## 🔍 Verificar que Funciona

1. Abre la consola (F12)
2. Busca mensajes `[Admin Auth]`

**Si eres admin, deberías ver:**
```
✅ [Admin Auth] User IS admin: {user_id: "..."}
```

**Si NO eres admin:**
```
⚠️ [Admin Auth] User is NOT admin (no row found)
```

---

## 🆘 Si Algo No Funciona

### "No veo el botón Admin"
- Recarga la página (F5)
- Intenta Ctrl+Shift+R (hard refresh)
- Verifica que estés autenticado

### "El dashboard está vacío"
- Espera 2-3 segundos a que carguen los datos
- Abre la consola (F12) y busca errores
- Verifica que las tablas existan en Supabase

### "Error: tabla no existe"
- Ejecuta el script `add-admin-users-table.sql` nuevamente
- Verifica que no haya errores en la ejecución

---

## 📝 Resumen

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Ejecutar script SQL | ✅ |
| 2 | Agregar usuario como admin | ✅ |
| 3 | Acceder a `/admin` | ✅ |
| 4 | Ver dashboard | ✅ |

---

**¡Listo! Tu admin dashboard está operativo.** 🎉
