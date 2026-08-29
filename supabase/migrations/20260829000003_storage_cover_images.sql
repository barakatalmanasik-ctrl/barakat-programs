-- Storage bucket "covers" for program cover images uploaded from the admin dashboard.
-- Run this once in Supabase SQL Editor. Without it, image upload shows a friendly error
-- and admins can still paste a direct image URL instead.

-- 1) Create a public storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) RLS policies on storage.objects for the covers bucket
DO $$ BEGIN
  DROP POLICY IF EXISTS covers_public_read ON storage.objects;
  CREATE POLICY covers_public_read ON storage.objects FOR SELECT
    USING (bucket_id = 'covers');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS covers_auth_insert ON storage.objects;
  CREATE POLICY covers_auth_insert ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'covers');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS covers_auth_update ON storage.objects;
  CREATE POLICY covers_auth_update ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'covers');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS covers_auth_delete ON storage.objects;
  CREATE POLICY covers_auth_delete ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'covers');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;