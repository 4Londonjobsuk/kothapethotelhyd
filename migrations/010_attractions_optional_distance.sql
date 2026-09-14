-- Migration 010: Attractions Optional Distance and Show/Hide Control
-- Project: Lotus Grand Hotel
-- Description: Makes distance_approx optional (drops NOT NULL if present) and adds show_distance toggle flag

-- 1. Ensure distance_approx can be NULL (optional)
ALTER TABLE IF EXISTS public.attractions 
  ALTER COLUMN distance_approx DROP NOT NULL;

-- 2. Add show_distance boolean flag with default true (safe and backward compatible)
ALTER TABLE IF EXISTS public.attractions 
  ADD COLUMN IF NOT EXISTS show_distance BOOLEAN NOT NULL DEFAULT true;

-- 3. Document columns
COMMENT ON COLUMN public.attractions.distance_approx IS 'Approximate road distance from hotel, optional and editable';
COMMENT ON COLUMN public.attractions.show_distance IS 'Toggle to display or hide the distance on public website (default: true)';
