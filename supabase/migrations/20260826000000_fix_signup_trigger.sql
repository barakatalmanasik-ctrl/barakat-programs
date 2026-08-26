-- ============================================================
-- Fix: "Database error saving new user" during signup
-- Problem: Trigger chain fails, rolling back user creation
-- Solution: Recreate functions with SECURITY DEFINER + safe INSERT policies
-- ============================================================

-- 1. Recreate handle_new_user() with SECURITY DEFINER
--    This function creates a profile when a new user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recreate send_welcome_notification() with SECURITY DEFINER
--    This function sends a welcome notification after profile creation

CREATE OR REPLACE FUNCTION send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'مرحباً بك في بركات المناسك',
    'اكتشف أجمل البرامج السياحية والدينية معنا. نتمنى لك رحلة ممتعة!',
    'welcome'::notification_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add safe INSERT policy on profiles
--    Safety net: allows authenticated users to insert their own profile

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_insert_own' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_insert_own
      ON profiles FOR INSERT
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- 4. Add safe INSERT policy on notifications
--    Ensures welcome notification trigger works for all users

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'notifications_insert_own' AND tablename = 'notifications'
  ) THEN
    CREATE POLICY notifications_insert_own
      ON notifications FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 5. Recreate triggers to ensure they reference the updated functions

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
