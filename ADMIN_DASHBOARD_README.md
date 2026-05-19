# 🎛️ Admin Dashboard - Oráculo Mundial

## ✨ Qué se agregó

Se implementó un **panel de administración completo** para gestionar el torneo de predicciones del Mundial 2026. El dashboard incluye:

### 📊 6 Pestañas Principales

1. **Resumen** - Métricas clave + actividad reciente + próximos partidos
2. **Partidos** - Datos en vivo, filtros, carga de resultados
3. **Ranking** - Top jugadores, exportación, compartir en WhatsApp
4. **Grupos** - Clasificaciones en vivo desde WC2026 API
5. **Análisis** - Estadísticas del torneo (campeón favorito, goleador, etc.)
6. **Configuración** - Enviar notificaciones, guía de APIs

### 🔐 Seguridad

- ✅ Solo usuarios registrados como **admins** pueden acceder
- ✅ Verificación automática de permisos en `/admin`
- ✅ Tabla `admin_users` en Supabase para control de acceso
- ✅ Botón "Admin" solo visible para admins en la navegación

### 🌐 APIs Gratuitas Integradas

| API | Función | Límite |
|-----|---------|--------|
| **WC2026 API** | Fixtures, scores, grupos | 100 req/día |
| **TheSportsDB** | Logos de equipos | Sin límites |
| **Supabase** | Base de datos | Incluido |

---

## 🚀 Instalación (3 pasos)

### Paso 1: Crear tablas en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido de `scripts/setup-admin-tables.sql`
3. Pégalo en el editor SQL y ejecuta

**Resultado esperado:**
```
✓ admin_users table created
✓ notifications table created
✓ Policies applied
```

### Paso 2: Agregar tu usuario como admin

1. Ve a **Supabase** → **Authentication** → **Users**
2. Copia el **UUID** del usuario que quieres hacer admin
3. En el SQL Editor, ejecuta:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('PEGA_EL_UUID_AQUI', 'tu@email.com')
ON CONFLICT (user_id) DO NOTHING;
```

4. Verifica que se insertó:
```sql
SELECT * FROM admin_users;
```

### Paso 3: Acceder al dashboard

- **Desarrollo:** `http://localhost:5173/admin`
- **Producción:** `https://oraculo-mundial.vercel.app/admin`

Deberías ver un botón **"Admin"** en la navegación (solo si eres admin).

---

## 📋 Archivos Creados/Modificados

### ✅ Nuevos Archivos

```
src/
  ├── hooks/
  │   └── useAdminAuth.ts              # Hook para verificar permisos de admin
  ├── components/
  │   ├── AdminPage.tsx                # Página protegida del admin
  │   └── AdminDashboard.tsx           # Dashboard completo (ya existía)
  └── services/
      └── worldcupApi.ts               # Integración con APIs (ya existía)

scripts/
  └── setup-admin-tables.sql           # Script SQL para Supabase

ADMIN_SETUP.md                         # Guía de configuración
ADMIN_DASHBOARD_README.md              # Este archivo
```

### 🔄 Archivos Modificados

```
src/
  ├── App.tsx                          # Agregó ruta /admin
  └── components/
      └── Navigation.tsx               # Agregó botón Admin (solo para admins)
```

---

## 🎯 Funcionalidades Detalladas

### 📊 Resumen
- **Usuarios Totales** - Cantidad de usuarios registrados
- **Predicciones** - Total de predicciones realizadas
- **Aciertos** - Predicciones correctas
- **Actividad Reciente** - Últimas acciones del grupo
- **Próximos Partidos** - Matches que faltan jugar

### ⚽ Partidos
- **Filtros:** En vivo / Próximos / Finalizados
- **Datos en vivo** desde WC2026 API
- **Formulario** para cargar resultados manualmente
- **Recalcular puntajes** automáticamente

### 🏆 Ranking
- **Top 10 jugadores** con posición y puntos
- **Histograma** de distribución de puntos
- **Exportar a JSON** para compartir
- **Generar mensaje WhatsApp** con ranking

### 🌍 Grupos
- **Clasificaciones en vivo** por grupo (A-H)
- **Datos desde WC2026 API**
- **Equipos clasificados** marcados en verde

### 📈 Análisis
- **Campeón favorito** - Quién creen que gana
- **Partido más difícil** - Menos aciertos
- **Goleador más elegido** - Predicción más popular
- **Estadísticas generales** del torneo

### ⚙️ Configuración
- **Enviar notificaciones** a todos los usuarios
- **Guía de APIs** disponibles
- **Estado de conexión** a servicios

---

## 🔧 Troubleshooting

### ❌ "Acceso Denegado" al entrar a `/admin`

**Solución:**
1. Verifica que tu usuario esté en `admin_users`:
```sql
SELECT * FROM admin_users WHERE user_id = 'TU_UUID';
```
2. Si no aparece, ejecuta el INSERT del Paso 2

### ❌ El botón "Admin" no aparece en la navegación

**Solución:**
1. Recarga la página (F5)
2. Cierra sesión y vuelve a iniciar
3. Verifica que estés registrado como admin en Supabase

### ❌ Las APIs no cargan datos

**Solución:**
1. Verifica conexión a internet
2. Abre la consola (F12) y busca errores
3. WC2026 API tiene límite de 100 requests/día
4. Espera 24 horas si alcanzaste el límite

### ❌ El dashboard se ve vacío

**Solución:**
1. Espera 2-3 segundos a que carguen los datos
2. Recarga la página (F5)
3. Verifica que haya datos en las tablas de Supabase

---

## 📝 Notas Importantes

✅ **No modifica datos existentes** - Solo agrega funcionalidades
✅ **100% reversible** - Puedes eliminar las tablas sin afectar el juego
✅ **APIs gratuitas** - No requieren tarjeta de crédito
✅ **Seguro** - Usa RLS (Row Level Security) de Supabase
✅ **Escalable** - Soporta miles de usuarios

---

## 🚀 Próximas Mejoras (Roadmap)

- [ ] Predicciones especiales (goleador, equipo con más goles)
- [ ] Bonus por racha (multiplicadores)
- [ ] Ligas privadas/grupos
- [ ] Exportar a Excel/PDF
- [ ] Gestión de usuarios (ban, editar)
- [ ] Historial de cambios
- [ ] Webhooks para notificaciones en tiempo real

---

## 💬 Soporte

Si tienes problemas:
1. Revisa este README
2. Consulta `ADMIN_SETUP.md` para configuración
3. Abre la consola del navegador (F12) para ver errores
4. Verifica que Supabase esté funcionando

---

**¡Listo! Tu admin dashboard está operativo.** 🎉
