# Fixes para Problemas en Celular

## Problemas Detectados

### 1. ✅ Panel Hermes Security visible para usuarios no-admin
**Causa**: Política RLS circular en `admin_users` impedía que usuarios verificaran su estado de admin.

**Solución Aplicada**:
- Actualizada migración RLS para permitir que usuarios autenticados consulten `admin_users` (solo su propio registro)
- La política ahora permite `SELECT` con `auth.uid() = user_id`

**Pendiente**:
- Aplicar la migración actualizada: `supabase db push`
- Agregar tu usuario como admin en la tabla `admin_users`

### 2. ⚠️ Pantalla blanca en sección de pronósticos
**Causa Probable**: Error de JavaScript que rompe el renderizado.

**Diagnóstico Necesario**:
1. Abrir DevTools en el celular (usar Eruda o conectar via USB)
2. Verificar errores en Console
3. Verificar si `filteredMatches` está vacío o si hay error en el map

**Solución Temporal**:
- Agregar error boundary para capturar errores de renderizado
- Agregar fallback UI cuando no hay partidos

### 3. ⚠️ Video tutorial no se reproduce
**Causa Probable**: Formato de video no compatible con navegador móvil o ruta incorrecta.

**Diagnóstico Necesario**:
1. Verificar que el video existe en `/public/videos/futbolm.mp4`
2. Verificar formato del video (debe ser H.264/AAC para compatibilidad móvil)
3. Verificar que el componente de video tiene atributos correctos (`playsinline`, `muted`, etc.)

**Solución**:
- Agregar atributos de compatibilidad móvil al tag `<video>`
- Considerar usar un poster/thumbnail como fallback

## Acciones Inmediatas

### 1. Aplicar migración RLS actualizada

```bash
supabase db push
```

### 2. Agregar tu usuario como admin

Ejecutar en SQL Editor de Supabase:

```sql
-- Primero, obtener tu user_id
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- Luego, insertar en admin_users
INSERT INTO admin_users (user_id, email)
VALUES ('TU_USER_ID_AQUI', 'tu-email@example.com')
ON CONFLICT (user_id) DO NOTHING;
```

### 3. Verificar logs en celular

Agregar Eruda para debugging en móvil:

```html
<!-- En index.html, antes de </body> -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

## Próximos Pasos

1. Aplicar migración RLS
2. Agregar usuario como admin
3. Desplegar a Vercel
4. Probar en celular con Eruda activado
5. Reportar errores específicos de Console para fix definitivo
