-- ============================================================
-- 20260831000001_phase3_auth_fix.sql
-- PHASE 3 FIX (idempotent / safe to re-run)
--
-- Fixes, without touching existing data:
--   1. auto-create profiles row when a new user signs up
--      (handle_new_user trigger was NOT installed in the live DB)
--   2. welcome notification on profile creation
--   3. RLS policies for favorites (select/insert/delete own)
--   4. RLS policies for notifications (select/update/delete own + insert)
--   5. staff/admin helper functions (used later by bookings phase)
--   6. backfill: create profiles rows for existing auth.users that
--      have none (no deletes, no overwrites)
-- ============================================================

-- ─── 1. ENSURE user_role type ───────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'employee', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('welcome', 'promo', 'update', 'order', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. ENSURE PROFILES TABLE + COLUMNS ─────────────────────
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

ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN full_name SET DEFAULT '';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END $$;

-- ─── 3. HANDLE_NEW_USER TRIGGER (auto profile on signup) ────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    NEW.email,
    'customer'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    phone     = COALESCE(EXCLUDED.phone, profiles.phone),
    email     = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ─── 4. WELCOME NOTIFICATION TRIGGER ────────────────────────
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
    RAISE WARNING 'send_welcome_notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_welcome ON profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_notification();

-- ─── 5. HELPERS: is_admin / is_staff / is_employee ──────────
CREATE OR REPLACE FUNCTION is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_staff(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = uid AND role IN ('employee', 'admin'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. RLS ON PROFILES ─────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_insert_own ON profiles;
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ─── 7. ENSURE FAVORITES TABLE + RLS ────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  program_id    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT favorites_unique_user_program UNIQUE (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_program ON favorites(program_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS favorites_select_own ON favorites;
CREATE POLICY favorites_select_own ON favorites FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS favorites_insert_own ON favorites;
CREATE POLICY favorites_insert_own ON favorites FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS favorites_delete_own ON favorites;
CREATE POLICY favorites_delete_own ON favorites FOR DELETE USING (user_id = auth.uid());

-- ─── 8. ENSURE NOTIFICATIONS TABLE + RLS ────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          notification_type NOT NULL DEFAULT 'system',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_own ON notifications;
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_delete_own ON notifications;
CREATE POLICY notifications_delete_own ON notifications FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS notifications_insert_policy ON notifications;
CREATE POLICY notifications_insert_policy ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_staff());

-- ─── 9. BACKFILL PROFILES FOR EXISTING AUTH USERS ──────────
-- Creates profiles rows only where they are missing.
-- No deletes. No overwrites of existing values.
INSERT INTO profiles (id, full_name, phone, email, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  NULLIF(COALESCE(u.raw_user_meta_data ->> 'phone', ''), ''),
  u.email,
  'customer'::user_role
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE. Safe to re-run.
-- ============================================================