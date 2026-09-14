-- ==========================================================
-- GRANT SCHEMA AND TABLE PERMISSIONS TO anon & authenticated
-- In Supabase, table/view level GRANTs are required alongside RLS
-- ==========================================================

-- 1. Grant USAGE on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant SELECT on read-only tables and views
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.public_site_settings TO anon, authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.room_amenities TO anon, authenticated;
GRANT SELECT ON public.room_amenity_mappings TO anon, authenticated;
GRANT SELECT ON public.amenities TO anon, authenticated;
GRANT SELECT ON public.attractions TO anon, authenticated;
GRANT SELECT ON public.gallery_categories TO anon, authenticated;
GRANT SELECT ON public.gallery_images TO anon, authenticated;

-- 3. Grant INSERT on enquiries (for guest submissions)
GRANT INSERT ON public.enquiries TO anon, authenticated;

-- 4. Grant USAGE on all sequences in public schema (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
