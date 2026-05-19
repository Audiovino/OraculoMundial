# Admin Dashboard Setup Guide

## 🔧 Configuración Requerida

### 1. Crear tabla `admin_users` en Supabase

Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Crear tabla admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden ver la tabla
CREATE POLICY "Admins can view admin_users"
  ON admin_users
  FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Política: Solo admins pueden insertar
CREATE POLICY "Admins can insert admin_users"
  ON admin_users
  FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
```

### 2. Crear tabla `notifications` (opcional, para sistema de notificaciones)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);
```

### 3. Agregar un usuario como admin

Ejecuta este SQL reemplazando `YOUR_USER_ID` con el UUID del usuario:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('YOUR_USER_ID', 'user@example.com')
ON CONFLICT (user_id) DO NOTHING;
```

**Para obtener el UUID de un usuario:**
1. Ve a Supabase → Authentication → Users
2. Copia el UUID del usuario que quieres hacer admin
3. Ejecuta el SQL anterior con ese UUID

### 4. Acceder al Admin Dashboard

- Navega a `http://localhost:5173/admin` (desarrollo) o `/admin` (producción)
- El sistema verificará automáticamente si eres admin
- Si no eres admin, verás un mensaje de acceso denegado

---

## 📊 Funcionalidades del Admin Dashboard

### Pestaña: Resumen
- Métricas clave (usuarios, predicciones, aciertos)
- Actividad reciente del grupo
- Próximos partidos

### Pestaña: Partidos
- Datos en vivo desde WC2026 API
- Filtro por estado (en vivo / próximos / finalizados)
- Formulario para cargar resultados manualmente

### Pestaña: Ranking
- Top participantes con posición y puntos
- Histograma de distribución de puntos
- Botón para generar mensaje de WhatsApp

### Pestaña: Grupos
- Tablas en vivo con clasificados (datos de WC2026 API)
- Clasificación por grupo

### Pestaña: Análisis
- Quién pronostican campeón
- Partido más difícil de predecir
- Goleador más elegido

### Pestaña: Configuración
- Enviar notificaciones a todos los usuarios
- Guía de APIs disponibles

---

## 🔑 APIs Gratuitas Integradas

| API | Qué da | Límite |
|-----|--------|--------|
| **WC2026 API** | Fixtures, scores en vivo, grupos | 100 req/día, sin tarjeta |
| **TheSportsDB** | Logos e imágenes de equipos | Sin límites, sin key |
| **Supabase** | Base de datos PostgreSQL | Incluido en el proyecto |

---

## 🚀 Próximos Pasos

1. ✅ Crear tabla `admin_users` en Supabase
2. ✅ Agregar tu usuario como admin
3. ✅ Navegar a `/admin` para acceder al dashboard
4. ⏳ Implementar notificaciones (tabla `notifications`)
5. ⏳ Agregar predicciones especiales (goleador, equipo con más goles)
6. ⏳ Implementar bonus por racha
7. ⏳ Crear ligas privadas/grupos

---

## 🐛 Troubleshooting

### "Acceso Denegado" al entrar a `/admin`
- Verifica que tu usuario esté en la tabla `admin_users`
- Ejecuta: `SELECT * FROM admin_users WHERE user_id = 'YOUR_USER_ID';`
- Si no aparece, ejecuta el SQL de inserción

### Las APIs no cargan datos
- Verifica que tengas conexión a internet
- Revisa la consola del navegador (F12) para errores
- WC2026 API tiene límite de 100 requests/día

### El dashboard se ve vacío
- Espera a que carguen los datos (puede tardar 2-3 segundos)
- Recarga la página (F5)
- Verifica que haya datos en las tablas de Supabase

---

## 📝 Notas

- El admin dashboard NO modifica datos existentes, solo agrega funcionalidades
- Todos los cambios son reversibles
- Las APIs son 100% gratuitas y no requieren tarjeta de crédito
