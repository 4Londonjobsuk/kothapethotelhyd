-- ==========================================================
-- TARGETED MINIMAL PRIVILEGE GRANTS FOR anon ROLE
-- Strictly NO wildcards (NO "ALL TABLES", NO "GRANT ALL")
-- Strictly NO SELECT, UPDATE, or DELETE on public.enquiries
-- ==========================================================

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON public.public_site_settings TO anon;
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT ON public.room_amenities TO anon;
GRANT SELECT ON public.room_amenity_mappings TO anon;
GRANT SELECT ON public.amenities TO anon;
GRANT SELECT ON public.attractions TO anon;
GRANT SELECT ON public.gallery_categories TO anon;
GRANT SELECT ON public.gallery_images TO anon;

GRANT INSERT ON public.enquiries TO anon;
