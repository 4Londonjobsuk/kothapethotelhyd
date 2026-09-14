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
