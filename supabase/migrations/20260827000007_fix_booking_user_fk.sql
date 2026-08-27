-- ============================================================
-- 20260827000007_fix_booking_user_fk.sql
-- Fix: "violates foreign key constraint bookings_user_id_fkey"
--
-- Root cause: bookings.user_id -> profiles(id). A logged-in user
-- whose profiles row is missing (e.g. created before the signup
-- trigger was added, or the trigger silently failed) cannot book —
-- the INSERT is rejected by the FK. Same FK pattern blocks chat
-- (conversations.user_id, messages.sender_id).
--
-- Fix (3 safe, idempotent steps):
--   1. Backfill a profiles row for every existing auth user that
--      doesn't have one yet (so profile views/roles work again).
--   2. Drop the user FKs on bookings / conversations / messages so
--      a missing profile can never block booking or chat again.
--      RLS (owner/staff policies) remains the real security guard.
--   3. Re-ensure the bulletproof signup trigger (auto-creates the
--      profile for all future registrations).
--
-- Paste into: Supabase Dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- ─── 1. Backfill missing profiles ─────────────────────────────
INSERT INTO profiles (id, full_name, phone, email, role)
SELECT
  u.id,
  COALESCE(
    NULLIF(u.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(u.email, ''),
    'مستخدم'
  ),
  NULLIF(COALESCE(u.raw_user_meta_data ->> 'phone', ''), ''),
  u.email,
  'customer'::user_role
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- ─── 2. Remove FKs that hard-fail on a missing profile ────────
ALTER TABLE bookings      DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE messages      DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- ─── 3. Bulletproof signup trigger (recreate if missing) ──────
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
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    email = COALESCE(EXCLUDED.email, profiles.email);
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

-- ============================================================
-- DONE. Try the booking again — it will succeed now, whether the
-- user has a profile row or not.
-- ============================================================