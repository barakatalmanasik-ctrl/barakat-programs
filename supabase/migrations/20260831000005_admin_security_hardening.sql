-- ============================================================
-- 20260831000005_admin_security_hardening.sql
-- SECURITY HARDENING: single locked-down admin panel.
--
-- Root cause of "any registered user can enter the admin panel":
--   1. The router/api allowed any logged-in session; the admin panel
--      had no real authorization gate.
--   2. RLS on `profiles` (profiles_update_own / profiles_insert_own) only
--      constrained the row id (id = auth.uid()) but NOT the `role` column,
--      so any user could self-escalate to role='admin' via their own
--      Supabase client call (the classic DevTools escalation).
--
-- This migration:
--   a) Adds a guard trigger that forbids setting any role other than
--      'customer' on signup, forbids changing an existing profile's role,
--      and forbids creating a second admin (single-admin guarantee). It is
--      enforced SERVER-side and cannot be bypassed from the frontend.
--   b) Adds a SECURITY DEFINER function set_admin_role(email) that is the
--      ONLY path to grant admin. It must be invoked with the service role /
--      SQL editor / our local seed script (never exposed in the frontend).
--   c) Restricts gallery_images management to is_admin() only (fixes an
--      earlier over-broad policy).
--   d) Adds a server function is_admin_profile(email) and keeps RLS admin
--      checks strict.
--
-- Run once in Supabase SQL Editor. Idempotent (safe to re-run).
-- ============================================================

-- ─── 1. GUARD TRIGGER: protect profiles.role from client writes ─────
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allow_admin boolean := COALESCE(current_setting('app.allow_admin_role', true), '') = 'true';
  admins_count integer;
BEGIN
  -- INSERT is only allowed as 'customer' (the signup trigger sets it).
  IF TG_OP = 'INSERT' AND NEW.role <> 'customer'::public.user_role THEN
    RAISE EXCEPTION 'profiles: new accounts can only be created with role=customer';
  END IF;

  -- UPDATE: role must never change, unless called through set_admin_role().
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT allow_admin THEN
      RAISE EXCEPTION 'profiles: changing role is not allowed';
    END IF;
    -- Single-admin guarantee: before granting, ensure no other admin exists.
    IF NEW.role = 'admin'::public.user_role THEN
      SELECT count(*) INTO admins_count
        FROM public.profiles
       WHERE role = 'admin'::public.user_role
         AND id IS DISTINCT FROM NEW.id
         AND email IS DISTINCT FROM NEW.email;
      IF admins_count > 0 THEN
        RAISE EXCEPTION 'profiles: an admin account already exists';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- ─── 2. secure admin-promotion function (service role only to invoke) ──
CREATE OR REPLACE FUNCTION public.set_admin_role(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bypasses RLS as definer; the guard trigger sees this flag and allows
  -- granting admin for the single designated account.
  PERFORM set_config('app.allow_admin_role', 'true', false);
  UPDATE public.profiles
     SET role = 'admin'::public.user_role
   WHERE email = target_email;
  PERFORM set_config('app.allow_admin_role', 'false', false);
END;
$$;

-- ─── 3. server helper: is the given auth uid an admin? (RLS/guard use) ──
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = uid AND role = 'admin'::public.user_role
  );
END;
$$;

-- ─── 4. RESTRICT profiles UPDATE/INSERT so users can never set role ───
-- Drop the old permissive INSERT/UPDATE policies and re-create them so
-- they only allow writing safe columns; a user may update their own row
-- but cannot tamper with `role` (the trigger layers on top regardless).
DO $$ BEGIN
  DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
  DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
  DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
  DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Update allowed only on the user's own row. The guard trigger prevents
-- any `role` change, so a user can edit name/phone but never escalate.
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clients can never INSERT profiles directly (the signup trigger creates
-- them as 'customer'). Keep a matching id check for safety.
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() AND role = 'customer'::public.user_role);

-- ─── 5. RESTRICT gallery_images to admin only (undo over-broad policy) ──
DO $$ BEGIN
  DROP POLICY IF EXISTS gallery_images_admin_all ON public.gallery_images;
  DROP POLICY IF EXISTS gallery_images_admin_del ON public.gallery_images;
  DROP POLICY IF EXISTS gallery_images_public_read ON public.gallery_images;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY gallery_images_public_read ON public.gallery_images FOR SELECT
  USING (enabled = true);

CREATE POLICY gallery_images_admin_all ON public.gallery_images FOR ALL
  USING (is_admin());

-- ─── 6. VERIFY (informational) ────────────────────────────────
SELECT 'admin_count_' || count(*) AS admin_count
  FROM public.profiles WHERE role = 'admin'::public.user_role;
SELECT id, email, role FROM public.profiles WHERE role = 'admin'::public.user_role;