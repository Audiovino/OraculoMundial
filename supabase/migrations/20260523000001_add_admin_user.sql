-- ============================================================================
-- Agregar usuario admin: foco3981@gmail.com
-- ============================================================================

-- Obtener el user_id del usuario con email foco3981@gmail.com
-- y agregarlo a la tabla admin_users

INSERT INTO admin_users (user_id, email)
SELECT id, email 
FROM auth.users 
WHERE email = 'foco3981@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verificar que se agregó correctamente
-- SELECT * FROM admin_users WHERE email = 'foco3981@gmail.com';
