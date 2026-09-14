-- Migration 008: Admin Authenticated Policies & Storage Grants
-- Project: Lotus Grand Hotel
-- Description: Enable full administrative permissions for authenticated users while preserving public RLS constraints

GRANT ALL ON TABLE site_settings TO authenticated;
GRANT ALL ON TABLE rooms TO authenticated;
GRANT ALL ON TABLE room_amenities TO authenticated;
GRANT ALL ON TABLE room_amenity_mappings TO authenticated;
GRANT ALL ON TABLE amenities TO authenticated;
GRANT ALL ON TABLE attractions TO authenticated;
GRANT ALL ON TABLE gallery_categories TO authenticated;
GRANT ALL ON TABLE gallery_images TO authenticated;
GRANT ALL ON TABLE enquiries TO authenticated;

DROP POLICY IF EXISTS "Authenticated admins have full access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated admins have full access to rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated admins have full access to room_amenities" ON room_amenities;
DROP POLICY IF EXISTS "Authenticated admins have full access to room_amenity_mappings" ON room_amenity_mappings;
DROP POLICY IF EXISTS "Authenticated admins have full access to amenities" ON amenities;
DROP POLICY IF EXISTS "Authenticated admins have full access to attractions" ON attractions;
DROP POLICY IF EXISTS "Authenticated admins have full access to gallery_categories" ON gallery_categories;
DROP POLICY IF EXISTS "Authenticated admins have full access to gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Authenticated admins have full access to enquiries" ON enquiries;

CREATE POLICY "Authenticated admins have full access to site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to room_amenities"
  ON room_amenities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to room_amenity_mappings"
  ON room_amenity_mappings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to amenities"
  ON amenities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to attractions"
  ON attractions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to gallery_categories"
  ON gallery_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to gallery_images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins have full access to enquiries"
  ON enquiries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can upload hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can update hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete hotel assets" ON storage.objects;

CREATE POLICY "Authenticated admins can upload hotel assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hotel-assets');

CREATE POLICY "Authenticated admins can update hotel assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hotel-assets');

CREATE POLICY "Authenticated admins can delete hotel assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'hotel-assets');
