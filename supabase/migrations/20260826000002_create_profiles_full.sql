-- ============================================================
-- FIX: Ensure profiles + triggers exist and work correctly
-- Handles existing constraints gracefully
-- ============================================================

-- 1. Ensure profiles table exists (skip if already exists)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  email       TEXT,
  avatar_url  TEXT,
  role        user_role NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Ensure unique constraints (safe drop + recreate)
DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_phone_unique;
  ALTER TABLE profiles ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_unique;
  ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Ensure RLS policies exist
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_select_own ON profiles;
  CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_update_own ON profiles;
  CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_insert_own ON profiles;
  CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Recreate handle_new_user with SECURITY DEFINER
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

-- 6. Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 7. Recreate send_welcome_notification with SECURITY DEFINER + error handling
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
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recreate trigger on profiles
DROP TRIGGER IF EXISTS on_profile_created_welcome ON profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();

-- 9. Ensure notifications INSERT policy exists
DO $$ BEGIN
  DROP POLICY IF EXISTS notifications_insert_own ON notifications;
  CREATE POLICY notifications_insert_own ON notifications FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 10. Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
