-- ============================================================
-- VERIFICATION: Check everything is set up correctly
-- Run AFTER successful signup
-- ============================================================

-- 1. Check the new user in auth.users
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Check profiles table has the user
SELECT id, full_name, phone, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Check welcome notification was created
SELECT user_id, title, message, type, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Check trigger functions exist
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'send_welcome_notification');

-- 5. Check triggers exist
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'on_profile_created_welcome');
