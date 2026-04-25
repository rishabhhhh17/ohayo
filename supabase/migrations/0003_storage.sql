-- =============================================================================
-- Knitd – 0003_storage.sql
-- Storage bucket + policies for product images (idempotent)
-- Run AFTER 0002_rls.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Bucket: product-images
-- public = true  → Supabase CDN serves files without a signed URL
-- file_size_limit = 5 MB
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,  -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage RLS policies on storage.objects
-- ---------------------------------------------------------------------------

-- Public SELECT: anyone can read product images
DROP POLICY IF EXISTS "product_images_public_select" ON storage.objects;
CREATE POLICY "product_images_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- INSERT: admin only
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
CREATE POLICY "product_images_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- UPDATE: admin only
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- DELETE: admin only
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());
