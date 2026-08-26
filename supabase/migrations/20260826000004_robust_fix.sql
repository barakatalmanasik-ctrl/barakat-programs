-- ============================================================
-- ROBUST FIX: Handle all edge cases for signup
-- ============================================================

-- 1. Make handle_new_user robust against duplicates
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Make welcome notification robust
CREATE OR REPLACE FUNCTION send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'مرحباً بك في بركات المناسك',
    'اكتشف أجمل البرامج السياحية والدينية معنا. نتمنى لك رحلة ممتعة!',
    'welcome'::notification_type
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure triggers are attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created_welcome ON profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();

-- 4. Ensure RLS policies exist
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_insert_own ON profiles;
  CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS notifications_insert_own ON notifications;
  CREATE POLICY notifications_insert_own ON notifications FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. List ALL auth users and their profiles (for debugging)
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  au.raw_user_meta_data,
  p.id as profile_id,
  p.full_name,
  p.email as profile_email
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC;
