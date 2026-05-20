# 🔍 Verificar y Arreglar Admin Status

## Paso 1: Verificar si tu usuario está en admin_users

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta:

```sql
-- Ver todos los admins
SELECT * FROM admin_users;

-- Ver tu usuario actual en auth
SELECT id, email FROM auth.users LIMIT 10;
```

---

## Paso 2: Si NO ves tu usuario en admin_users

Ejecuta esto (reemplaza `TU_UUID` con tu UUID real):

```sql
-- Insertar tu usuario como admin
INSERT INTO admin_users (user_id, email)
VALUES ('TU_UUID', 'tu@email.com')
ON CONFLICT (user_id) DO NOTHING;

-- Verificar que se insertó
SELECT * FROM admin_users WHERE user_id = 'TU_UUID';
```

---

## Paso 3: Verificar en la Consola del Navegador

1. Abre el dashboard
2. Presiona **F12** (consola)
3. Busca mensajes `[Admin Auth]`

**Deberías ver algo como:**

```
✅ [Admin Auth] Checking admin status for user: 550e8400-e29b-41d4-a716-446655440000
✅ [Admin Auth] Querying admin_users table...
✅ [Admin Auth] User IS admin: {user_id: "550e8400-e29b-41d4-a716-446655440000"}
```

O si NO eres admin:

```
❌ [Admin Auth] Checking admin status for user: 550e8400-e29b-41d4-a716-446655440000
❌ [Admin Auth] Querying admin_users table...
❌ [Admin Auth] User is NOT admin (no row found)
```

---

## Paso 4: Recargar la Página

Una vez que hayas insertado tu usuario como admin:

1. Recarga la página (F5)
2. Deberías ver el botón **"Admin"** en la navegación (color púrpura)
3. Haz click en él para ir al dashboard

---

## 🆘 Si Aún No Funciona

### Opción A: Verificar que la tabla existe

```sql
-- Ver si la tabla admin_users existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'admin_users';
```

Si no aparece, ejecuta el script `scripts/setup-admin-tables.sql` nuevamente.

### Opción B: Verificar RLS policies

```sql
-- Ver las políticas de admin_users
SELECT * FROM pg_policies 
WHERE tablename = 'admin_users';
```

### Opción C: Desactivar RLS temporalmente (para debugging)

```sql
-- Desactivar RLS en admin_users
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Luego intenta nuevamente
-- Si funciona, el problema es RLS
-- Vuelve a activar:
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist

- [ ] ¿Ejecutaste el script `setup-admin-tables.sql`?
- [ ] ¿Tu usuario está en la tabla `admin_users`?
- [ ] ¿Recargaste la página (F5)?
- [ ] ¿Ves mensajes `[Admin Auth]` en la consola?
- [ ] ¿Ves el botón "Admin" en la navegación?

---

## 💡 Solución Rápida

Si nada funciona, ejecuta esto en Supabase SQL Editor:

```sql
-- 1. Verificar que la tabla existe
SELECT COUNT(*) FROM admin_users;

-- 2. Ver tu usuario
SELECT id, email FROM auth.users WHERE email LIKE '%gerardo%' LIMIT 1;

-- 3. Copiar el UUID y ejecutar (reemplaza UUID_AQUI):
INSERT INTO admin_users (user_id, email)
VALUES ('UUID_AQUI', 'tu@email.com')
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificar que se insertó
SELECT * FROM admin_users;
```

Luego recarga la web (F5) y deberías ver el botón Admin.

---

**¿Necesitas ayuda?** Abre la consola (F12) y copia los mensajes `[Admin Auth]` aquí.
