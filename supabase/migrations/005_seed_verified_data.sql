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
