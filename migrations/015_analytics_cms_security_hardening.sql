-- ==============================================================================
-- 015_analytics_cms_security_hardening.sql
-- LOTUS GRAND HOTEL - ANALYTICS CMS RBAC SECURITY HARDENING & SINGLETON LOCKDOWN
-- ==============================================================================
-- Purpose:
-- 1. Ensure `analytics.manage` permission is registered in `public.admin_permissions`
--    following the exact schema from migration 009.
-- 2. Map `analytics.manage` to the `SUPER_ADMIN` role in `public.admin_role_permissions`.
-- 3. Create/verify the `public.analytics_settings` table and enable RLS.
-- 4. Strictly decouple SEO from Analytics in RLS policies:
--    - SELECT: public access (anon & authenticated) so visitor pages can load scripts.
--    - INSERT & UPDATE: restricted exclusively to users with `analytics.manage`
--      (Super Admins inherit this unconditionally via `public.has_admin_permission`).
--    - DELETE: NO delete policy is created (protects singleton row).
-- 5. Restrict database privileges:
--    - anon: SELECT only.
--    - authenticated: SELECT, INSERT, UPDATE only (NO DELETE, TRUNCATE, REFERENCES).
-- 6. Seed the singleton row ('default') safely without overwriting live values.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. REGISTER 'analytics.manage' PERMISSION (IDEMPOTENT)
-- ------------------------------------------------------------------------------
INSERT INTO public.admin_permissions (id, module, description, is_sensitive)
VALUES (
  'analytics.manage',
  'analytics',
  'Configure Google Analytics 4, Search Console, and Microsoft Clarity',
  true
)
ON CONFLICT (id) DO UPDATE SET
  module = EXCLUDED.module,
  description = EXCLUDED.description,
  is_sensitive = EXCLUDED.is_sensitive;

-- ------------------------------------------------------------------------------
-- 2. MAP 'analytics.manage' TO 'SUPER_ADMIN' ROLE
-- ------------------------------------------------------------------------------
INSERT INTO public.admin_role_permissions (role_id, permission_id)
VALUES ('SUPER_ADMIN', 'analytics.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. CREATE ANALYTICS SETTINGS TABLE & ENABLE RLS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  google_analytics_enabled BOOLEAN NOT NULL DEFAULT false,
  google_analytics_measurement_id TEXT NOT NULL DEFAULT '',
  clarity_enabled BOOLEAN NOT NULL DEFAULT false,
  clarity_project_id TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Policy 1: Anyone (anon + authenticated) can view analytics settings to load public scripts
DROP POLICY IF EXISTS "Public can view analytics settings" ON public.analytics_settings;
CREATE POLICY "Public can view analytics settings"
ON public.analytics_settings
FOR SELECT
TO public
USING (true);

-- Clean up any legacy or over-permissive insert policies
DROP POLICY IF EXISTS "Admins with analytics or seo manage can insert analytics settings" ON public.analytics_settings;
DROP POLICY IF EXISTS "Admins with analytics manage can insert analytics settings" ON public.analytics_settings;

-- Policy 2: Strictly require 'analytics.manage' for INSERT (decoupled from seo.manage)
CREATE POLICY "Admins with analytics manage can insert analytics settings"
ON public.analytics_settings
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
);

-- Clean up any legacy or over-permissive update policies
DROP POLICY IF EXISTS "Admins with analytics or seo manage can update analytics settings" ON public.analytics_settings;
DROP POLICY IF EXISTS "Admins with analytics manage can update analytics settings" ON public.analytics_settings;

-- Policy 3: Strictly require 'analytics.manage' for UPDATE (decoupled from seo.manage)
CREATE POLICY "Admins with analytics manage can update analytics settings"
ON public.analytics_settings
FOR UPDATE
TO authenticated
USING (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
)
WITH CHECK (
  public.has_admin_permission(auth.uid(), 'analytics.manage')
);

-- Explicitly ensure NO DELETE policy exists (singleton protection)
DROP POLICY IF EXISTS "Admins can delete analytics settings" ON public.analytics_settings;
DROP POLICY IF EXISTS "Public can delete analytics settings" ON public.analytics_settings;

-- ------------------------------------------------------------------------------
-- 5. MINIMAL LEAST-PRIVILEGE GRANTS (REMOVES UNNECESSARY 'GRANT ALL')
-- ------------------------------------------------------------------------------
REVOKE ALL ON TABLE public.analytics_settings FROM public;
REVOKE ALL ON TABLE public.analytics_settings FROM anon;
REVOKE ALL ON TABLE public.analytics_settings FROM authenticated;

-- Public visitor pages need to read tracking IDs
GRANT SELECT ON TABLE public.analytics_settings TO anon, authenticated;

-- Authenticated admins can only insert and update rows subject to RLS
-- (DELETE, TRUNCATE, and REFERENCES privileges are strictly withheld)
GRANT SELECT, INSERT, UPDATE ON TABLE public.analytics_settings TO authenticated;

-- ------------------------------------------------------------------------------
-- 6. SEED INITIAL DEFAULT SINGLETON RECORD (IDEMPOTENT)
-- ------------------------------------------------------------------------------
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
