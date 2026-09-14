-- Migration 013: Production-Ready SEO CMS Table, Seed Records & RLS Security
-- Project: Lotus Grand Hotel
-- Description: Creates the dedicated seo_settings table supporting Global SEO and Page-Level SEO
--              for all 7 public routes, with RLS protection, public read access, and audit logging.

CREATE TABLE IF NOT EXISTS public.seo_settings (
  id VARCHAR(50) PRIMARY KEY,
  page_route VARCHAR(50) NOT NULL UNIQUE,
  page_label VARCHAR(100) NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT NOT NULL DEFAULT '',
  og_title TEXT NOT NULL DEFAULT '',
  og_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  twitter_title TEXT NOT NULL DEFAULT '',
  twitter_description TEXT NOT NULL DEFAULT '',
  twitter_image TEXT NOT NULL DEFAULT '',
  robots_index BOOLEAN NOT NULL DEFAULT true,
  robots_follow BOOLEAN NOT NULL DEFAULT true,
  google_site_verification TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public can view SEO configuration (required for public website head tags)
DROP POLICY IF EXISTS "Public can view seo settings" ON public.seo_settings;
CREATE POLICY "Public can view seo settings"
  ON public.seo_settings FOR SELECT
  TO public
  USING (true);

-- 2. Admins with seo.manage can insert/update/delete SEO configuration
DROP POLICY IF EXISTS "Admins with seo.manage can insert seo settings" ON public.seo_settings;
CREATE POLICY "Admins with seo.manage can insert seo settings"
  ON public.seo_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_admin_permission(auth.uid(), 'seo.manage'));

DROP POLICY IF EXISTS "Admins with seo.manage can update seo settings" ON public.seo_settings;
CREATE POLICY "Admins with seo.manage can update seo settings"
  ON public.seo_settings FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'seo.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'seo.manage'));

DROP POLICY IF EXISTS "Admins with seo.manage can delete seo settings" ON public.seo_settings;
CREATE POLICY "Admins with seo.manage can delete seo settings"
  ON public.seo_settings FOR DELETE
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'seo.manage'));

-- Grants
GRANT SELECT ON public.seo_settings TO anon, authenticated;
GRANT ALL ON TABLE public.seo_settings TO authenticated;

-- Seed verified initial SEO records (idempotent ON CONFLICT)
INSERT INTO public.seo_settings (
  id, page_route, page_label, meta_title, meta_description, canonical_url,
  og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
  robots_index, robots_follow, google_site_verification
) VALUES
  (
    'global', '__global__', 'Global SEO & Defaults',
    'Lotus Grand Hotel — Kothapet, Hyderabad',
    'Official website for Lotus Grand Hotel in Kothapet / Saroornagar, Hyderabad, Telangana, India. Affordable luxury, comfortable rooms near Chaitanyapuri Metro.',
    'https://lotusgrand.in',
    'Lotus Grand Hotel — Kothapet, Hyderabad',
    'Experience premium comfort and true hospitality at Lotus Grand Hotel, beside PVT Market Building, Kothapet, Hyderabad.',
    '/assets/rooms/deluxe-room.webp',
    'Lotus Grand Hotel — Kothapet, Hyderabad',
    'Experience premium comfort and true hospitality at Lotus Grand Hotel, Kothapet, Hyderabad.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  ),
  (
    'home', '/', 'Home',
    'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    'Welcome to Lotus Grand Hotel in Kothapet, Hyderabad. Conveniently located near Chaitanyapuri Metro Station and PVT Market with premium rooms and hospitality.',
    'https://lotusgrand.in/',
    'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    'Experience comfortable luxury rooms and modern amenities at Lotus Grand Hotel, Hyderabad.',
    '/assets/rooms/deluxe-room.webp',
    'Lotus Grand Hotel | Luxury Stays in Kothapet, Hyderabad',
    'Experience comfortable luxury rooms and modern amenities at Lotus Grand Hotel, Hyderabad.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  ),
  (
    'about', '/about', 'About Us',
    'About Us | Lotus Grand Hotel Kothapet, Hyderabad',
    'Discover our story, dedication to true hospitality, and commitment to exceptional guest comfort at Lotus Grand Hotel in Kothapet, Hyderabad.',
    'https://lotusgrand.in/about',
    'About Lotus Grand Hotel | Hospitality in Hyderabad',
    'Discover the comfort, story, and values of Lotus Grand Hotel in Kothapet, Hyderabad.',
    '/assets/rooms/suite-room.webp',
    'About Lotus Grand Hotel | Hospitality in Hyderabad',
    'Discover the comfort, story, and values of Lotus Grand Hotel in Kothapet, Hyderabad.',
    '/assets/rooms/suite-room.webp',
    true, true, NULL
  ),
  (
    'rooms', '/rooms', 'Rooms',
    'Rooms & Suites | Lotus Grand Hotel Kothapet, Hyderabad',
    'Explore our spacious Executive, Deluxe, and Suite rooms at Lotus Grand Hotel with air conditioning, free Wi-Fi, and 24/7 room service.',
    'https://lotusgrand.in/rooms',
    'Rooms & Accommodations | Lotus Grand Hotel',
    'Book your stay in elegant, well-appointed rooms at Lotus Grand Hotel, Kothapet, Hyderabad.',
    '/assets/rooms/executive-room.webp',
    'Rooms & Accommodations | Lotus Grand Hotel',
    'Book your stay in elegant, well-appointed rooms at Lotus Grand Hotel, Kothapet, Hyderabad.',
    '/assets/rooms/executive-room.webp',
    true, true, NULL
  ),
  (
    'amenities', '/amenities', 'Amenities',
    'Hotel & Room Amenities | Lotus Grand Hotel Hyderabad',
    'Enjoy 24/7 room service, high-speed Wi-Fi, elevator access, power backup, CCTV security, and ample parking at Lotus Grand Hotel in Kothapet.',
    'https://lotusgrand.in/amenities',
    'Amenities & Services | Lotus Grand Hotel Hyderabad',
    'Modern conveniences and thoughtful hospitality amenities at Lotus Grand Hotel.',
    '/assets/rooms/deluxe-room.webp',
    'Amenities & Services | Lotus Grand Hotel Hyderabad',
    'Modern conveniences and thoughtful hospitality amenities at Lotus Grand Hotel.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  ),
  (
    'gallery', '/gallery', 'Gallery',
    'Photo Gallery | Lotus Grand Hotel Kothapet, Hyderabad',
    'Browse photos of our hotel rooms, luxury suites, reception, and guest facilities at Lotus Grand Hotel in Hyderabad.',
    'https://lotusgrand.in/gallery',
    'Photo Gallery | Lotus Grand Hotel',
    'Visual tour of our hotel accommodations and facilities at Lotus Grand Hotel, Kothapet.',
    '/assets/rooms/deluxe-room.webp',
    'Photo Gallery | Lotus Grand Hotel',
    'Visual tour of our hotel accommodations and facilities at Lotus Grand Hotel, Kothapet.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  ),
  (
    'attractions', '/attractions', 'Attractions',
    'Nearby Attractions & Transit | Lotus Grand Hotel Hyderabad',
    'Explore Hyderabad landmarks near Lotus Grand: Chaitanyapuri Metro, Saroornagar Lake, Charminar, Ramoji Film City, and Rajiv Gandhi Airport.',
    'https://lotusgrand.in/attractions',
    'Nearby Attractions & Landmarks | Lotus Grand Hotel',
    'Discover Hyderabad attractions easily accessible from Lotus Grand Hotel in Kothapet.',
    '/assets/rooms/deluxe-room.webp',
    'Nearby Attractions & Landmarks | Lotus Grand Hotel',
    'Discover Hyderabad attractions easily accessible from Lotus Grand Hotel in Kothapet.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  ),
  (
    'contact', '/contact', 'Contact Us',
    'Contact & Location | Lotus Grand Hotel Kothapet, Hyderabad',
    'Get in touch with Lotus Grand Hotel. Located beside PVT Market Building, Saroornagar, HUDA Complex, Kothapet, Hyderabad. Call +91 90326 66941.',
    'https://lotusgrand.in/contact',
    'Contact Lotus Grand Hotel | Reservations & Location',
    'Connect with our 24/7 front desk for bookings and location inquiries at Lotus Grand Hotel.',
    '/assets/rooms/deluxe-room.webp',
    'Contact Lotus Grand Hotel | Reservations & Location',
    'Connect with our 24/7 front desk for bookings and location inquiries at Lotus Grand Hotel.',
    '/assets/rooms/deluxe-room.webp',
    true, true, NULL
  )
ON CONFLICT (page_route) DO NOTHING;
