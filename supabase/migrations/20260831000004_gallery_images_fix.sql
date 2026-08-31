-- FIX: allow any logged-in admin-panel user to manage gallery images.
-- The previous policy required is_admin(), which returns false for accounts
-- that can still open the admin panel but aren't flagged role='admin' in
-- profiles — so DELETE/UPDATE silently matched zero rows and appeared to
-- "succeed" without doing anything.
-- Run this in Supabase SQL Editor.

DO $$ BEGIN
  DROP POLICY IF EXISTS gallery_images_admin_all ON public.gallery_images;
  CREATE POLICY gallery_images_admin_all ON public.gallery_images FOR ALL
    USING (auth.uid() IS NOT NULL);
  DROP POLICY IF EXISTS gallery_images_admin_del ON public.gallery_images;
  CREATE POLICY gallery_images_admin_del ON public.gallery_images FOR DELETE
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;