# 🔐 REPARACIÓN DE SEGURIDAD ADMIN - HERMES

**FECHA**: 26 de mayo de 2026
**PROBLEMA**: Dashboard admin visible para usuarios NO autorizados (ej: gera)
**SOLUCIÓN**: Revisión de tabla `admin_users` + RLS policies + mejoras en código

---

## 🚨 PASO 1: VERIFICAR QUIÉNES SON ADMINS EN SUPABASE

Ve a **Supabase Dashboard** → **SQL Editor** → Pega esto:

```sql
-- Ver todos los usuarios registrados como admin
SELECT user_id, email, created_at FROM admin_users;

-- Contar cuántos admins hay
SELECT COUNT(*) as total_admins FROM admin_users;

-- Ver si "gera" o el usuario problemático está en la lista
SELECT user_id, email FROM admin_users 
WHERE email ILIKE '%gera%' OR email ILIKE '%gerardo%';
```

**Si "gera" aparece en los resultados = ESE es el problema. Continúa al PASO 2.**

---

## ❌ PASO 2: ELIMINAR USUARIOS NO AUTORIZADOS DE ADMIN

Si "gera" está en la tabla admin_users pero NO debería ser admin:

```sql
-- OPCIÓN A: Eliminar por email
DELETE FROM admin_users 
WHERE email = 'gera@email.com';

-- OPCIÓN B: Eliminar por user_id (si lo tienes de la query anterior)
DELETE FROM admin_users 
WHERE user_id = 'UUID_DEL_USUARIO_AQUI';

-- VERIFICAR que se eliminó
SELECT * FROM admin_users;
```

⚠️ **NOTA**: Reemplaza el email/UUID con el valor real que aparezca en la tabla.

---

## 🔧 PASO 3: REPARAR LAS RLS POLICIES

Las políticas actuales son circulares. Ejecuta esto en **SQL Editor**:

```sql
-- Eliminar políticas antiguas que causan problemas
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin_users" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;

-- CREAR NUEVAS POLÍTICAS (seguras y funcionales)

-- 1. Todos los usuarios autenticados PUEDEN LEER la tabla
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. SOLO admins pueden INSERTAR
CREATE POLICY "Only admins can insert admin_users"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT user_id FROM admin_users)
    AND auth.role() = 'authenticated'
  );

-- 3. SOLO admins pueden ACTUALIZAR
CREATE POLICY "Only admins can update admin_users"
  ON admin_users
  FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- 4. SOLO admins pueden ELIMINAR
CREATE POLICY "Only admins can delete admin_users"
  ON admin_users
  FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- VERIFICAR que las políticas existen
SELECT tablename, policyname, qual, with_check 
FROM pg_policies 
WHERE tablename = 'admin_users';
```

---

## ✅ PASO 4: ACTUALIZACIÓN DE CÓDIGO (YA REALIZADO)

El código ha sido actualizado con:

### ✓ En `App.tsx`:
- Protección doble: no renderiza AdminPage si no es admin
- Logging de intentos de acceso no autorizado
- Redirección inmediata y forzada

### ✓ En `useAdminAuth.ts`:
- Validación estricta: verifica que el user_id retornado coincida
- Logging detallado para debugging
- Por defecto `FALSE` si hay cualquier error

### ✓ En `Navigation.tsx`:
- Botón Admin solo aparece si `isAdmin === true`
- Validación en tiempo real

---

## 🧪 PASO 5: VERIFICAR QUE FUNCIONÓ

### 5.1 En Supabase SQL Editor:

```sql
-- Ver estado actual de admin_users
SELECT user_id, email, created_at 
FROM admin_users 
ORDER BY created_at DESC;

-- Contar admins
SELECT COUNT(*) FROM admin_users;
```

### 5.2 En la app:

1. **Sé admin válido**:
   - Inicia sesión con tu usuario autorizado
   - Deberías ver el botón "Admin" en la navegación
   - Click en "Admin" debe mostrar el dashboard

2. **Sé usuario NO-admin** (ej: intenta con otra cuenta):
   - Inicia sesión como "gera" u otro usuario NO admin
   - NO debe aparecer el botón "Admin"
   - Si intentas acceder a la ruta, te redirige a "Juego"
   - Console muestra: `[Admin Auth] ✓ User is NOT admin`

---

## 🔍 TROUBLESHOOTING

### Si el botón Admin sigue apareciendo:

```bash
# En la consola del navegador (F12), ejecuta:
console.log('User admin status:', localStorage.getItem('adminStatus'));
console.log('Current user:', JSON.parse(localStorage.getItem('user') || '{}'));
```

Luego ve a **Supabase SQL Editor** y verifica:

```sql
SELECT * FROM admin_users WHERE email = 'EMAIL_DEL_USUARIO';
```

Si aparece, elimínalo. Si no aparece pero el botón sigue ahí = **hay un bug en cache. Limpia localStorage**:

```javascript
// En console del navegador:
localStorage.clear();
sessionStorage.clear();
// Recarga la página
location.reload();
```

---

## 📋 CHECKLIST FINAL

- [ ] He ejecutado la query de verificación en SQL Editor
- [ ] He identificado quién NO debe ser admin
- [ ] He eliminado usuarios no autorizados de `admin_users`
- [ ] He reemplazado las RLS policies
- [ ] He comprobado que las nuevas policies existen
- [ ] He desplegado el código actualizado a Vercel (push a main)
- [ ] He verificado con usuario NO-admin (no ver botón Admin)
- [ ] He verificado con usuario admin (sí ver botón Admin)
- [ ] La consola muestra logs de `[Admin Auth]` correctamente

---

## 🚀 DEPLOY

Una vez completados los pasos 1-4:

```bash
# En tu terminal local
git add .
git commit -m "fix: reparar seguridad admin - validaciones estrictas + RLS policies"
git push origin main
```

Vercel deployará automáticamente. Revisa los logs: `https://vercel.com/gerardoleiserson-gmailcoms-projects/oraculo-mundial`

---

## 📞 SOPORTE

Si después de estos pasos el problema persiste:
1. Toma screenshot de la tabla `admin_users` en Supabase
2. Toma screenshot de los logs en la consola del navegador (F12)
3. Revisa los logs de Vercel deployment

**El usuario "gera" NO debería poder ver el dashboard de admin. Punto final.**

