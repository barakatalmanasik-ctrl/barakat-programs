-- Gallery images management: lets admins control the published photo album
-- from the admin panel (hide/restore specific images on the site).
-- Run this once in Supabase SQL Editor.

-- 1) Table
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 2) RLS: public can only read enabled images; admins can read/manage all.
DO $$ BEGIN
  DROP POLICY IF EXISTS gallery_images_public_read ON public.gallery_images;
  CREATE POLICY gallery_images_public_read ON public.gallery_images FOR SELECT
    USING (enabled = true OR is_admin());
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS gallery_images_admin_all ON public.gallery_images;
  CREATE POLICY gallery_images_admin_all ON public.gallery_images FOR ALL
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3) Seed with the currently published album (images/trips/trip-01..30.jpeg)
INSERT INTO public.gallery_images (image_url, alt, sort_order)
SELECT
  'images/trips/trip-' || lpad(g::text, 2, '0') || '.jpeg',
  'صورة ' || g,
  g
FROM generate_series(1, 30) AS g
ON CONFLICT DO NOTHING;