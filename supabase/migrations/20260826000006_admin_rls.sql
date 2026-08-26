-- Admin RLS: allow admin to manage programs
-- First ensure the is_admin function exists (it should from 06_functions_triggers.sql)
-- Add admin ALL policy on programs if not exists
DO $$ BEGIN
  DROP POLICY IF EXISTS programs_manage_admin ON programs;
  CREATE POLICY programs_manage_admin ON programs FOR ALL
    USING (is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Ensure admin can read/write destinations
DO $$ BEGIN
  DROP POLICY IF EXISTS destinations_manage_admin ON destinations;
  CREATE POLICY destinations_manage_admin ON destinations FOR ALL
    USING (is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
