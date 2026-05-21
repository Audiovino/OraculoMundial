# Fix: Conexión a Supabase desde Celular/Web Externa

## Problema
La aplicación no puede conectarse a Supabase cuando se accede desde celular o web externa (`oraculo-mundial.vercel.app`).

## ✅ ACTUALIZACIÓN: CORS no es el problema

**Supabase NO tiene configuración de CORS en el dashboard** — maneja CORS automáticamente a nivel de servidor y acepta requests de cualquier origen por defecto cuando usas la `anon key`.

El problema real es **RLS (Row Level Security)** — las políticas de acceso a las tablas.

---

## Causa Principal: Políticas RLS faltantes o incorrectas

### ✅ Solución Aplicada

Ya aplicamos la migración `20260523000000_fix_rls_policies.sql` que:

1. **Creó las tablas faltantes:**
   - `mundial_rankings`
   - `mundial_notifications`

2. **Configuró políticas RLS correctas para todas las tablas:**
   - `mundial_users` - lectura pública para usuarios autenticados, actualización/insert propio
   - `mundial_predictions` - lectura pública para rankings, insert/update propio
   - `mundial_matches` - lectura pública sin autenticación
   - `mundial_rankings` - lectura para usuarios autenticados
   - `mundial_notifications` - lectura/update propio, insert del sistema
   - `admin_users` - verificación propia

3. **Corrigió el tipo de datos en las comparaciones:**
   - Cambió `auth.uid()::text = id` por `auth.uid() = id` (uuid vs uuid)

### Verificar que la migración se aplicó correctamente

```bash
supabase db push
```

Deberías ver:
```
✅ Finished supabase db push.
```

---

## Diagnóstico Rápido

### Desde el navegador del celular:

1. Abrir DevTools (si es posible) o usar [Eruda](https://github.com/liriliri/eruda)
2. Verificar en Console si hay errores de RLS:
   ```
   new row violates row-level security policy for table "mundial_users"
   ```

### Desde Postman/Insomnia:

```
GET https://rthdnwkwocojijyfcrtr.supabase.co/rest/v1/mundial_matches
Headers:
  apikey: TU_ANON_KEY
  Authorization: Bearer TU_ANON_KEY
```

Si funciona en Postman pero no en el browser con usuario autenticado, es **RLS**.

---

## Otras Causas Posibles (menos probables)

### 1. Auth Providers no configurados

Verificar que los proveedores de auth estén habilitados.

**Solución:**
1. Ir a **Authentication > Providers**
2. Verificar que **Email** esté habilitado
3. Si usas Google/GitHub, agregar los callbacks:
   - `https://rthdnwkwocojijyfcrtr.supabase.co/auth/v1/callback`
   - `https://oraculo-mundial.vercel.app/auth/callback`

### 2. URL Mismatch

Verificar que la URL de Supabase en `.env.local` sea correcta:

```env
VITE_SUPABASE_URL=https://rthdnwkwocojijyfcrtr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Variables de entorno en Vercel

Verificar que las variables de entorno estén configuradas en Vercel:

1. Ir a Vercel Dashboard → tu proyecto
2. Settings → Environment Variables
3. Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas

---

## Checklist

- [x] Políticas RLS creadas para todas las tablas (migración aplicada)
- [x] Tipos de datos corregidos en políticas (uuid vs text)
- [x] Tablas faltantes creadas (mundial_rankings, mundial_notifications)
- [ ] Auth providers habilitados en Supabase
- [ ] URLs correctas en `.env.local`
- [ ] Variables de entorno en Vercel configuradas

---

## Próximos Pasos

1. **Desplegar a Vercel** con las nuevas políticas RLS
2. **Probar desde celular** — el problema debería estar resuelto
3. Si persiste, verificar logs en Supabase Dashboard → Logs → API Logs
