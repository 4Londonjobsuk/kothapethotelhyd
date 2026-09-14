-- Migration 004: Storage Bucket and Policies
-- Project: Lotus Grand Hotel
-- Description: Create public bucket for hotel media assets with public read-only access

-- 1. Insert bucket into storage.buckets if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-assets',
  'hotel-assets',
  true,
  10485760, -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 2. Drop existing policy if present
DROP POLICY IF EXISTS "Public can view hotel assets" ON storage.objects;

-- 3. Public Read-Only Access Policy
CREATE POLICY "Public can view hotel assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'hotel-assets');

-- Public users CANNOT insert, update, or delete files.
-- Authenticated admin upload policies are deferred until admin roles are implemented.
