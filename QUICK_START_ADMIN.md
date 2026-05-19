# ⚡ Quick Start - Admin Dashboard

## 3 Pasos para Activar el Admin Dashboard

### 📍 Paso 1: Ejecutar Script SQL en Supabase (2 minutos)

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia TODO el contenido de este archivo:
   ```
   scripts/setup-admin-tables.sql
   ```
3. Pégalo en el editor SQL
4. Haz click en **"Run"** (botón azul)
5. Espera a que termine (deberías ver ✓ sin errores)

**Resultado esperado:**
```
✓ admin_users table created
✓ notifications table created
✓ Policies applied
```

---

### 👤 Paso 2: Agregar tu Usuario como Admin (1 minuto)

1. En Supabase, ve a **Authentication** → **Users**
2. Busca tu usuario y **copia su UUID** (es un código largo)
3. Vuelve a **SQL Editor**
4. Ejecuta este comando (reemplaza `YOUR_UUID`):

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('YOUR_UUID', 'tu@email.com')
ON CONFLICT (user_id) DO NOTHING;
```

5. Haz click en **"Run"**

**Verificar que funcionó:**
```sql
SELECT * FROM admin_users;
```

Deberías ver tu usuario en la tabla.

---

### 🎛️ Paso 3: Acceder al Dashboard (30 segundos)

1. **Desarrollo:** Abre `http://localhost:5173/admin`
2. **Producción:** Abre `https://oraculo-mundial.vercel.app/admin`

**Resultado esperado:**
- ✅ Ves un botón **"Admin"** en la navegación (color púrpura)
- ✅ Haces click y ves el dashboard con 6 pestañas
- ✅ Datos cargan en 2-3 segundos

---

## 🎯 Qué Puedes Hacer Ahora

### 📊 Resumen
Ver métricas clave: usuarios, predicciones, aciertos

### ⚽ Partidos
Cargar resultados de partidos manualmente

### 🏆 Ranking
Ver top jugadores y exportar a JSON

### 🌍 Grupos
Ver clasificaciones en vivo del Mundial

### 📈 Análisis
Estadísticas del torneo (campeón favorito, goleador, etc.)

### ⚙️ Configuración
Enviar notificaciones a todos los usuarios

---

## ❌ Si Algo No Funciona

### "Acceso Denegado" en `/admin`
```sql
-- Verifica que estés en la tabla admin_users
SELECT * FROM admin_users WHERE user_id = 'TU_UUID';

-- Si no aparece, ejecuta el INSERT del Paso 2 de nuevo
```

### No veo el botón "Admin" en la navegación
- Recarga la página (F5)
- Cierra sesión y vuelve a iniciar
- Abre la consola (F12) y busca errores

### Las APIs no cargan datos
- Verifica conexión a internet
- WC2026 API tiene límite de 100 requests/día
- Espera 24 horas si alcanzaste el límite

---

## 📚 Documentación Completa

Para más detalles, lee:
- `ADMIN_SETUP.md` - Configuración detallada
- `ADMIN_DASHBOARD_README.md` - Manual completo
- `ADMIN_IMPLEMENTATION_COMPLETE.md` - Resumen técnico

---

## 🚀 ¡Listo!

Tu admin dashboard está operativo. Disfruta del panel de administración.

**¿Preguntas?** Revisa los archivos de documentación o abre la consola (F12) para ver errores.
