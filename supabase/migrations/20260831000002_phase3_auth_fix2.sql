-- ============================================================
-- 20260831000002_phase3_auth_fix2.sql
-- PHASE 3 FIX #2 (idempotent / safe to re-run)
--
-- Root cause of "auto profile still not created":
--   handle_new_user() was SECURITY DEFINER with NO search_path
--   and UNQUALIFIED identifiers. When GoTrue fires the trigger,
--   its session search_path cannot resolve `profiles` / casts,
--   so INSERT failed and the old `WHEN OTHERS` handler swallowed
--   the error silently.
--
-- Fix: schema-qualify EVERY object, pin SET search_path = public,
--   and stop swallowing errors in the profile trigger so any
--   future failure is loud and visible.
--
-- Also re-installs both triggers deterministically and runs the
-- profiles backfill again so existing users (including test
-- users) get rows without overwriting anything.
-- ============================================================

-- ─── 0. DIAGNOSTIC (read current state before fixing) ───────
SELECT tgname, tgenabled, tgrelid::regclass AS trigger_table,
       pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgname IN ('on_auth_user_created', 'on_profile_created_welcome')
ORDER BY tgname;

-- ─── 1. ENSURE user_role / notification_type types ──────────
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'employee', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('welcome', 'promo', 'update', 'order', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 2. HANDLE_NEW_USER (schema-qualified, NO error swallow) ─
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data ->> 'phone', ''), ''),
    NEW.email,
    'customer'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    phone     = COALESCE(EXCLUDED.phone, public.profiles.phone),
    email     = COALESCE(EXCLUDED.email, public.profiles.email);
  RETURN NEW;
END;
$$;

-- ─── 3. WELCOME NOTIFICATION (schema-qualified, error-safe) ──
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'مرحباً بك في بركات المناسك',
    'اكتشف أجمل البرامج السياحية والدينية معنا. نتمنى لك رحلة ممتعة!',
    'welcome'::public.notification_type
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'send_welcome_notification failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ─── 4. HELPERS is_admin / is_staff (schema-qualified) ───────
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'::public.user_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = uid AND role IN ('employee'::public.user_role, 'admin'::public.user_role));
END;
$$;

-- ─── 5. RE-INSTALL TRIGGERS (deterministic) ──────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_notification();

-- ─── 6. BACKFILL MISSING PROFILES (no deletes / overwrites) ─
INSERT INTO public.profiles (id, full_name, phone, email, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  NULLIF(COALESCE(u.raw_user_meta_data ->> 'phone', ''), ''),
  u.email,
  'customer'::public.user_role
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- ─── 7. VERIFICATION COUNTS ──────────────────────────────────
SELECT count(*) AS profiles_total FROM public.profiles;
SELECT id, full_name, role FROM public.profiles
WHERE id IN ('5a48c516-95be-4e90-8360-d53f1e0248c3', 'd3d9904c-f431-4212-9b1a-4911c7a90976');

-- ============================================================
-- DONE. Safe to re-run.
-- ============================================================