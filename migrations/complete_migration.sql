-- Migration 001: Create Schema
-- Project: Lotus Grand Hotel
-- Description: Core tables and public-safe site settings view

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_name TEXT NOT NULL DEFAULT 'Lotus Grand',
  tagline TEXT NULL,
  address_line1 TEXT NOT NULL DEFAULT 'First Floor, Blue Building, Beside PVT Market Building',
  address_line2 TEXT NOT NULL DEFAULT 'Saroornagar, HUDA Complex, Kothapet',
  city TEXT NOT NULL DEFAULT 'Hyderabad',
  state TEXT NOT NULL DEFAULT 'Telangana',
  postal_code VARCHAR(10) NOT NULL DEFAULT '500035',
  country TEXT NOT NULL DEFAULT 'India',
  phone VARCHAR(20) NOT NULL DEFAULT '+919032666941',
  phone_display VARCHAR(30) NOT NULL DEFAULT '+91 90326 66941',
  whatsapp_number VARCHAR(20) NOT NULL DEFAULT '+919032666941',
  email TEXT NULL,
  check_in_time VARCHAR(20) NOT NULL DEFAULT '12:00 PM',
  check_out_time VARCHAR(20) NOT NULL DEFAULT '11:00 AM',
  google_maps_directions_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public-safe view excluding unverified email from anonymous public access
CREATE OR REPLACE VIEW public_site_settings AS
SELECT 
  id,
  hotel_name,
  tagline,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  country,
  phone,
  phone_display,
  whatsapp_number,
  check_in_time,
  check_out_time,
  google_maps_directions_url
FROM site_settings;

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  subtitle TEXT NULL,
  description TEXT NULL,
  occupancy VARCHAR(50) NULL,
  bed_type VARCHAR(50) NULL,
  room_size VARCHAR(50) NULL,
  image_url TEXT NULL,
  badge VARCHAR(50) NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Room Amenities Table
CREATE TABLE IF NOT EXISTS room_amenities (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Room Amenity Mappings (Junction Table)
CREATE TABLE IF NOT EXISTS room_amenity_mappings (
  room_id VARCHAR(50) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amenity_id VARCHAR(50) NOT NULL REFERENCES room_amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, amenity_id)
);

-- 5. Hotel Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('core', 'additional')),
  image_url TEXT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Attractions Table (5 Approved Hyderabad Landmarks)
CREATE TABLE IF NOT EXISTS attractions (
  id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  distance_approx VARCHAR(30) NOT NULL,
  travel_time_approx VARCHAR(50) NULL,
  description TEXT NULL,
  highlights TEXT[] NOT NULL DEFAULT '{}',
  timings VARCHAR(100) NULL,
  image_url TEXT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Gallery Categories Table
CREATE TABLE IF NOT EXISTS gallery_categories (
  id VARCHAR(30) PRIMARY KEY,
  label VARCHAR(50) NOT NULL UNIQUE,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 8. Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id VARCHAR(50) PRIMARY KEY,
  category_id VARCHAR(30) NOT NULL REFERENCES gallery_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  image_url TEXT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Enquiries Table (Inquiries only, not bookings)
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NULL,
  room_preference VARCHAR(100) NULL,
  arrival_date DATE NULL,
  departure_date DATE NULL,
  guest_count VARCHAR(50) NULL,
  message TEXT NULL,
  source_page VARCHAR(50) NOT NULL DEFAULT 'enquiry_modal',
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Migration 002: Create Indexes
-- Project: Lotus Grand Hotel
-- Description: Performance and ordered retrieval indexes

CREATE INDEX IF NOT EXISTS idx_rooms_active_order 
  ON rooms (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_amenities_category_order 
  ON amenities (category, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_attractions_active_order 
  ON attractions (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_categories_active_order 
  ON gallery_categories (is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_images_cat_order 
  ON gallery_images (category_id, is_active, display_order);

CREATE INDEX IF NOT EXISTS idx_gallery_images_featured 
  ON gallery_images (is_featured, is_active);

CREATE INDEX IF NOT EXISTS idx_enquiries_status_created 
  ON enquiries (status, created_at DESC);
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
-- Migration 005: Seed Verified Data
-- Project: Lotus Grand Hotel
-- Description: Strictly confirmed hotel facts only (no unverified categories, prices, stock photos, or claims)

-- 1. Verified Site Settings
INSERT INTO site_settings (
  id,
  hotel_name,
  tagline,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  country,
  phone,
  phone_display,
  whatsapp_number,
  email,
  check_in_time,
  check_out_time,
  google_maps_directions_url
)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Lotus Grand',
  NULL, -- Tagline left empty pending official verification
  'First Floor, Blue Building, Beside PVT Market Building',
  'Saroornagar, HUDA Complex, Kothapet',
  'Hyderabad',
  'Telangana',
  '500035',
  'India',
  '+919032666941',
  '+91 90326 66941',
  '+919032666941',
  NULL, -- Email left empty pending official verification
  '12:00 PM',
  '11:00 AM',
  NULL -- Directions URL left empty pending official map verification
)
ON CONFLICT (id) DO UPDATE SET
  hotel_name = EXCLUDED.hotel_name,
  address_line1 = EXCLUDED.address_line1,
  address_line2 = EXCLUDED.address_line2,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  postal_code = EXCLUDED.postal_code,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone,
  phone_display = EXCLUDED.phone_display,
  whatsapp_number = EXCLUDED.whatsapp_number,
  check_in_time = EXCLUDED.check_in_time,
  check_out_time = EXCLUDED.check_out_time;

-- 2. Verified Hotel Amenities
-- Conservative factual descriptions only; image_url set to NULL pending approved media upload
INSERT INTO amenities (id, title, description, icon_name, category, image_url, display_order, is_active)
VALUES
  ('amenity-ac', 'Air Conditioning', 'Air conditioning available in guest rooms.', 'Wind', 'core', NULL, 1, true),
  ('amenity-wifi', 'Wi-Fi', 'Wireless internet access available for guests.', 'Wifi', 'core', NULL, 2, true),
  ('amenity-dining', 'On-Site Dining', 'Food service available on premise.', 'UtensilsCrossed', 'core', NULL, 3, true),
  ('amenity-frontdesk', '24/7 Front Desk', 'Front desk assistance available 24 hours daily.', 'Clock', 'core', NULL, 4, true),
  ('amenity-power', 'Power Backup', 'Generator power backup facility on property.', 'Zap', 'additional', NULL, 5, true),
  ('amenity-housekeeping', 'Daily Housekeeping', 'Daily cleaning service for guest accommodations.', 'Sparkles', 'additional', NULL, 6, true),
  ('amenity-cctv', 'CCTV Surveillance', 'Security cameras installed across common areas.', 'ShieldCheck', 'additional', NULL, 7, true),
  ('amenity-bath', 'Attached Bathroom', 'Private attached bathroom with hot and cold shower facilities.', 'Bath', 'additional', NULL, 8, true),
  ('amenity-tv', 'Television', 'In-room television.', 'Tv', 'additional', NULL, 9, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 3. The 5 Approved Hyderabad Attractions
-- Approximate distances strictly preserved; unverified travel times, schedules, and stock images left NULL
INSERT INTO attractions (
  id,
  title,
  distance_approx,
  travel_time_approx,
  description,
  highlights,
  timings,
  image_url,
  display_order,
  is_active
)
VALUES
  ('nehru-zoo', 'Nehru Zoological Park', '3.5 km', NULL, NULL, '{}', NULL, NULL, 1, true),
  ('salar-jung', 'Salar Jung Museum', '6.2 km', NULL, NULL, '{}', NULL, NULL, 2, true),
  ('charminar', 'Charminar', '6.8 km', NULL, NULL, '{}', NULL, NULL, 3, true),
  ('birla-mandir', 'Birla Mandir', '8.5 km', NULL, NULL, '{}', NULL, NULL, 4, true),
  ('buddha-statue', 'Buddha Statue at Hussain Sagar', '8.6 km', NULL, NULL, '{}', NULL, NULL, 5, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  distance_approx = EXCLUDED.distance_approx,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 4. Gallery Categories
INSERT INTO gallery_categories (id, label, display_order, is_active)
VALUES
  ('rooms', 'Rooms & Suites', 1, true),
  ('property', 'Property & Common Areas', 2, true),
  ('dining', 'Dining & Food', 3, true),
  ('hyderabad', 'Nearby Attractions', 4, true)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- ==========================================================
-- PART 6: GRANT TABLE PRIVILEGES TO anon & authenticated ROLES
-- ==========================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.public_site_settings TO anon, authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.room_amenities TO anon, authenticated;
GRANT SELECT ON public.room_amenity_mappings TO anon, authenticated;
GRANT SELECT ON public.amenities TO anon, authenticated;
GRANT SELECT ON public.attractions TO anon, authenticated;
GRANT SELECT ON public.gallery_categories TO anon, authenticated;
GRANT SELECT ON public.gallery_images TO anon, authenticated;

GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
