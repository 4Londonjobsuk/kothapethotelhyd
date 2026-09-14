-- ==============================================================================
-- 014_analytics_cms.sql
-- LOTUS GRAND HOTEL - ANALYTICS CMS (GOOGLE ANALYTICS 4 & MICROSOFT CLARITY)
-- ==============================================================================
-- Purpose:
-- 1. Create `public.analytics_settings` table to store Google Analytics 4
--    Measurement ID and Microsoft Clarity Project ID with enable/disable toggles.
-- 2. Configure Row Level Security (RLS):
--    - Public & authenticated read access (SELECT) so public pages can evaluate
--      whether to load client-side tracking scripts.
--    - Admin-only write access (INSERT, UPDATE) restricted to users with
--      'analytics.manage' or 'seo.manage' permissions (or Super Admins).
-- 3. Seed default record ('default') with tracking disabled by default.
-- ==============================================================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  google_analytics_enabled BOOLEAN NOT NULL DEFAULT false,
  google_analytics_measurement_id TEXT NOT NULL DEFAULT '',
  clarity_enabled BOOLEAN NOT NULL DEFAULT false,
  clarity_project_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- Policy 1: Anyone (anon + authenticated) can view analytics settings to load public scripts
DROP POLICY IF EXISTS "Public can view analytics settings" ON public.analytics_settings;
CREATE POLICY "Public can view analytics settings"
ON public.analytics_settings
FOR SELECT
TO public
USING (true);

-- Policy 2: Admins with analytics.manage or seo.manage can insert settings
DROP POLICY IF EXISTS "Admins with analytics or seo manage can insert analytics settings" ON public.analytics_settings;
CREATE POLICY "Admins with analytics or seo manage can insert analytics settings"
ON public.analytics_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
  OR public.has_admin_permission(auth.uid(), 'seo.manage')
);

-- Policy 3: Admins with analytics.manage or seo.manage can update settings
DROP POLICY IF EXISTS "Admins with analytics or seo manage can update analytics settings" ON public.analytics_settings;
CREATE POLICY "Admins with analytics or seo manage can update analytics settings"
ON public.analytics_settings
FOR UPDATE
TO authenticated
USING (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
  OR public.has_admin_permission(auth.uid(), 'seo.manage')
)
WITH CHECK (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
  OR public.has_admin_permission(auth.uid(), 'seo.manage')
);

-- 4. GRANT PRIVILEGES
GRANT SELECT ON public.analytics_settings TO anon, authenticated;
GRANT ALL ON TABLE public.analytics_settings TO authenticated;

-- 5. SEED INITIAL DEFAULT ROW
INSERT INTO public.analytics_settings (
  id,
  google_analytics_enabled,
  google_analytics_measurement_id,
  clarity_enabled,
  clarity_project_id
) VALUES (
  'default',
  false,
  '',
  false,
  ''
)
ON CONFLICT (id) DO NOTHING;
