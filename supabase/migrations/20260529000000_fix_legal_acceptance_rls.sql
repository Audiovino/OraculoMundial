-- Fix: Allow users to update their own legal acceptance fields in mundial_users
-- This was causing the legal modal to reappear after acceptance because the UPDATE was silently blocked by RLS

-- Ensure RLS is enabled on mundial_users
ALTER TABLE IF EXISTS mundial_users ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting update policies
DROP POLICY IF EXISTS "Users can update own profile" ON mundial_users;
DROP POLICY IF EXISTS "Users can update their own legal acceptance" ON mundial_users;

-- Allow users to update their own row (needed for legal acceptance, location, etc.)
CREATE POLICY "Users can update own profile" ON mundial_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also ensure users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON mundial_users;
CREATE POLICY "Users can read own profile" ON mundial_users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users (needed for admin dashboard)
DROP POLICY IF EXISTS "Admins can read all users" ON mundial_users;
CREATE POLICY "Admins can read all users" ON mundial_users
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Verify policies
SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE tablename = 'mundial_users';
