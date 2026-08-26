-- ============================================================
-- DIAGNOSTIC: Find the exact cause of signup failure
-- Run this FIRST, then share the results
-- ============================================================

-- 1. Check if profiles table exists and its columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Check constraints on profiles
SELECT 
  conname, 
  contype, 
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- 3. Check if handle_new_user function exists and has SECURITY DEFINER
SELECT 
  proname, 
  prosecdef as is_security_definer,
  proowner::regrole as owner
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'send_welcome_notification');

-- 4. Check triggers on auth.users
SELECT 
  trigger_name, 
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- 5. Check RLS policies on profiles
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Check RLS policies on notifications
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'notifications';

-- 7. Check if notifications table has the 'type' column with correct enum
SELECT 
  column_name, 
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND column_name = 'type';

-- 8. Check existing users (to see if there are duplicate emails/phones)
SELECT email, phone, COUNT(*) 
FROM profiles 
GROUP BY email, phone 
HAVING COUNT(*) > 1;
