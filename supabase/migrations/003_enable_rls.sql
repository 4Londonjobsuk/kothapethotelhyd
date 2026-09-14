-- Migration 003: Enable Row Level Security (RLS) & Policies
-- Project: Lotus Grand Hotel
-- Description: Public read-only for active hotel content, public write-only for enquiries

-- 1. Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_amenity_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view active rooms" ON rooms;
DROP POLICY IF EXISTS "Public can view room amenities" ON room_amenities;
DROP POLICY IF EXISTS "Public can view room amenity mappings" ON room_amenity_mappings;
DROP POLICY IF EXISTS "Public can view active amenities" ON amenities;
DROP POLICY IF EXISTS "Public can view active attractions" ON attractions;
DROP POLICY IF EXISTS "Public can view active gallery categories" ON gallery_categories;
DROP POLICY IF EXISTS "Public can view active gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Public can submit enquiries" ON enquiries;

-- 3. Public Read Policies for Hotel Content
CREATE POLICY "Public can view site settings" 
  ON site_settings FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public can view active rooms" 
  ON rooms FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public can view room amenities" 
  ON room_amenities FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public can view room amenity mappings" 
  ON room_amenity_mappings FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Public can view active amenities" 
  ON amenities FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public can view active attractions" 
  ON attractions FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public can view active gallery categories" 
  ON gallery_categories FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

CREATE POLICY "Public can view active gallery images" 
  ON gallery_images FOR SELECT 
  TO anon, authenticated 
  USING (is_active = true);

-- 4. Public Insert Policy for Enquiries
-- Allows any public visitor to submit an inquiry; requires basic contact info (name and phone)
CREATE POLICY "Public can submit enquiries" 
  ON enquiries FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (
    char_length(trim(full_name)) > 0 AND 
    char_length(trim(phone)) >= 7
  );

-- No public SELECT, UPDATE, or DELETE policies exist for enquiries.
-- No public INSERT, UPDATE, or DELETE policies exist for hotel content tables.
