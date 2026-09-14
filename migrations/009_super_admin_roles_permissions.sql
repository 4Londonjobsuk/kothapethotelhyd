-- ==============================================================================
-- Migration 009: Production-Ready Super Admin, Roles, Permissions & RLS Security
-- Project: Lotus Grand Hotel
-- Description: Comprehensive role-based access control (RBAC), user approval workflow,
--              fine-grained permission validation, audit logging, and secure storage RLS.
--              Fully idempotent and safely re-runnable without data loss.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & SCHEMAS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. ADMIN ROLES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed core roles
INSERT INTO public.admin_roles (id, name, description)
VALUES 
  ('SUPER_ADMIN', 'Super Administrator', 'Complete unrestricted administrative control over all modules, security, and users.'),
  ('CONTENT_ADMIN', 'Content & Media Administrator', 'Authorized to manage rooms, amenities, attractions, gallery, and media assets.'),
  ('ENQUIRY_ADMIN', 'Guest Enquiries Administrator', 'Authorized to view and respond to guest inquiries and bookings.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 3. ADMIN PERMISSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id VARCHAR(50) PRIMARY KEY,
  module VARCHAR(30) NOT NULL,
  description TEXT NOT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed granular permissions (20 standard permissions)
INSERT INTO public.admin_permissions (id, module, description, is_sensitive)
VALUES
  -- USERS
  ('users.view', 'users', 'View admin users, approval statuses, and assigned roles', false),
  ('users.approve', 'users', 'Approve, reject, activate, or suspend admin registrations', true),
  ('users.manage', 'users', 'Full admin user management, role assignment, and permission overrides', true),
  
  -- IMAGES & STORAGE
  ('images.view', 'images', 'View hotel assets and storage media manager', false),
  ('images.upload', 'images', 'Upload new photos to hotel-assets storage bucket', false),
  ('images.replace', 'images', 'Replace existing image files in storage', false),
  ('images.delete', 'images', 'Delete image assets from storage and media gallery', false),

  -- ROOMS
  ('rooms.view', 'rooms', 'View room catalog, details, and inventory', false),
  ('rooms.manage', 'rooms', 'Create, update, or modify room details, badges, and pricing', false),

  -- AMENITIES
  ('amenities.view', 'amenities', 'View hotel and room amenities', false),
  ('amenities.manage', 'amenities', 'Add, modify, or reorder hotel and room amenities', false),

  -- ATTRACTIONS
  ('attractions.view', 'attractions', 'View Hyderabad landmarks and tourist attractions', false),
  ('attractions.manage', 'attractions', 'Update nearby attractions, distances, and highlights', false),

  -- GALLERY
  ('gallery.view', 'gallery', 'View photo gallery categories and items', false),
  ('gallery.manage', 'gallery', 'Manage gallery categories, image titles, and visibility', false),

  -- ENQUIRIES
  ('enquiries.view', 'enquiries', 'Read incoming guest reservation enquiries', false),
  ('enquiries.manage', 'enquiries', 'Update enquiry statuses (contacted, confirmed, closed)', false),

  -- SEO (Sensitive)
  ('seo.view', 'seo', 'View on-page SEO, meta tags, and indexing status', false),
  ('seo.manage', 'seo', 'Configure on-page SEO, robots.txt, sitemaps, and structured data', true),

  -- ANALYTICS (Sensitive)
  ('analytics.view', 'analytics', 'View website traffic and visitor analytics', false),
  ('analytics.manage', 'analytics', 'Configure Google Analytics 4, Search Console, and Microsoft Clarity', true),

  -- SETTINGS (Sensitive)
  ('settings.view', 'settings', 'View hotel contact and location settings', false),
  ('settings.manage', 'settings', 'Modify site settings, contact numbers, and policies', true)
ON CONFLICT (id) DO UPDATE SET
  module = EXCLUDED.module,
  description = EXCLUDED.description,
  is_sensitive = EXCLUDED.is_sensitive;

-- ------------------------------------------------------------------------------
-- 4. ADMIN ROLE-PERMISSIONS (DEFAULT MAPPINGS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  role_id VARCHAR(30) NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(50) NOT NULL REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Assign SUPER_ADMIN all permissions
INSERT INTO public.admin_role_permissions (role_id, permission_id)
SELECT 'SUPER_ADMIN', id FROM public.admin_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign CONTENT_ADMIN content permissions only (strictly NO sensitive permissions)
INSERT INTO public.admin_role_permissions (role_id, permission_id)
VALUES
  ('CONTENT_ADMIN', 'images.view'),
  ('CONTENT_ADMIN', 'images.upload'),
  ('CONTENT_ADMIN', 'images.replace'),
  ('CONTENT_ADMIN', 'images.delete'),
  ('CONTENT_ADMIN', 'rooms.view'),
  ('CONTENT_ADMIN', 'rooms.manage'),
  ('CONTENT_ADMIN', 'amenities.view'),
  ('CONTENT_ADMIN', 'amenities.manage'),
  ('CONTENT_ADMIN', 'attractions.view'),
  ('CONTENT_ADMIN', 'attractions.manage'),
  ('CONTENT_ADMIN', 'gallery.view'),
  ('CONTENT_ADMIN', 'gallery.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign ENQUIRY_ADMIN enquiries permissions only
INSERT INTO public.admin_role_permissions (role_id, permission_id)
VALUES
  ('ENQUIRY_ADMIN', 'enquiries.view'),
  ('ENQUIRY_ADMIN', 'enquiries.manage')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. ADMIN PROFILES TABLE (APPROVAL STATUS WORKFLOW)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  approved_by UUID NULL REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ NULL,
  notes TEXT NULL,
  last_sign_in_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 6. USER-ROLE AND USER-PERMISSION JUNCTION TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id VARCHAR(30) NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.admin_user_permissions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id VARCHAR(50) NOT NULL REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
  granted_by UUID NULL REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, permission_id)
);

-- ------------------------------------------------------------------------------
-- 7. ADMIN AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(50) NOT NULL,
  target_id TEXT NULL,
  details JSONB NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON public.admin_audit_logs(module);

-- ------------------------------------------------------------------------------
-- 8. SECURITY HELPER FUNCTIONS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Check if user is APPROVED
CREATE OR REPLACE FUNCTION public.is_approved_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles
    WHERE id = check_user_id 
      AND status = 'APPROVED'
  );
$$;

-- Check if user is SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles p
    JOIN public.admin_user_roles ur ON ur.user_id = p.id
    WHERE p.id = check_user_id 
      AND p.status = 'APPROVED'
      AND ur.role_id = 'SUPER_ADMIN'
  );
$$;

-- Check if user has specific permission (either through role or individual grant)
CREATE OR REPLACE FUNCTION public.has_admin_permission(check_user_id UUID, required_perm TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    -- 1. Super Admin has all permissions unconditionally
    public.is_super_admin(check_user_id)
    OR
    -- 2. Approved user with role-based permission
    EXISTS (
      SELECT 1 
      FROM public.admin_profiles p
      JOIN public.admin_user_roles ur ON ur.user_id = p.id
      JOIN public.admin_role_permissions rp ON rp.role_id = ur.role_id
      WHERE p.id = check_user_id 
        AND p.status = 'APPROVED'
        AND rp.permission_id = required_perm
    )
    OR
    -- 3. Approved user with individual custom permission override
    EXISTS (
      SELECT 1 
      FROM public.admin_profiles p
      JOIN public.admin_user_permissions up ON up.user_id = p.id
      WHERE p.id = check_user_id 
        AND p.status = 'APPROVED'
        AND up.permission_id = required_perm
    );
$$;

-- ------------------------------------------------------------------------------
-- 9. AUTOMATIC REGISTRATION TRIGGER (DEFAULTS TO PENDING, NO ROLE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert a profile for the newly registered auth user with status = PENDING
  INSERT INTO public.admin_profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'PENDING'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY ON ADMIN TABLES (SAFE IDEMPOTENT POLICIES)
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- admin_roles
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.admin_roles;
CREATE POLICY "Authenticated users can view roles"
  ON public.admin_roles FOR SELECT
  TO authenticated
  USING (true);

-- admin_permissions
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.admin_permissions;
CREATE POLICY "Authenticated users can view permissions"
  ON public.admin_permissions FOR SELECT
  TO authenticated
  USING (true);

-- admin_role_permissions
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.admin_role_permissions;
CREATE POLICY "Authenticated users can view role permissions"
  ON public.admin_role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- admin_profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.admin_profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR public.has_admin_permission(auth.uid(), 'users.view')
  );

DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.admin_profiles;
CREATE POLICY "Users can insert own profile on signup"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update user approval and profile" ON public.admin_profiles;
CREATE POLICY "Admins can update user approval and profile"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (
    public.has_admin_permission(auth.uid(), 'users.approve')
    OR public.has_admin_permission(auth.uid(), 'users.manage')
  );

-- admin_user_roles
DROP POLICY IF EXISTS "Users can view own roles or admins view all" ON public.admin_user_roles;
CREATE POLICY "Users can view own roles or admins view all"
  ON public.admin_user_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.has_admin_permission(auth.uid(), 'users.view')
  );

DROP POLICY IF EXISTS "Only Super Admin can assign or revoke roles" ON public.admin_user_roles;
CREATE POLICY "Only Super Admin can assign or revoke roles"
  ON public.admin_user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- admin_user_permissions
DROP POLICY IF EXISTS "Users can view own custom permissions or admins view all" ON public.admin_user_permissions;
CREATE POLICY "Users can view own custom permissions or admins view all"
  ON public.admin_user_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.has_admin_permission(auth.uid(), 'users.view')
  );

DROP POLICY IF EXISTS "Only Super Admin can grant or revoke custom permissions" ON public.admin_user_permissions;
CREATE POLICY "Only Super Admin can grant or revoke custom permissions"
  ON public.admin_user_permissions FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- admin_audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin(auth.uid()) 
    OR public.has_admin_permission(auth.uid(), 'users.view')
  );

DROP POLICY IF EXISTS "Approved admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Approved admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_approved_admin(auth.uid())
    AND (actor_id IS NULL OR actor_id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 11. FINE-GRAINED RLS ON HOTEL CONTENT & MEDIA TABLES (SAFE IDEMPOTENT POLICIES)
-- ------------------------------------------------------------------------------

-- Rooms
DROP POLICY IF EXISTS "Authenticated admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins with rooms.manage can modify rooms" ON public.rooms;
CREATE POLICY "Admins with rooms.manage can modify rooms"
  ON public.rooms FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'rooms.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'rooms.manage'));

-- Room Amenities & Mappings
DROP POLICY IF EXISTS "Authenticated admins can manage room amenities" ON public.room_amenities;
DROP POLICY IF EXISTS "Admins with amenities.manage can modify room amenities" ON public.room_amenities;
CREATE POLICY "Admins with amenities.manage can modify room amenities"
  ON public.room_amenities FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'amenities.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'amenities.manage'));

DROP POLICY IF EXISTS "Authenticated admins can manage room amenity mappings" ON public.room_amenity_mappings;
DROP POLICY IF EXISTS "Admins with amenities.manage can modify room mappings" ON public.room_amenity_mappings;
CREATE POLICY "Admins with amenities.manage can modify room mappings"
  ON public.room_amenity_mappings FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'amenities.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'amenities.manage'));

-- Amenities
DROP POLICY IF EXISTS "Authenticated admins can manage amenities" ON public.amenities;
DROP POLICY IF EXISTS "Admins with amenities.manage can modify amenities" ON public.amenities;
CREATE POLICY "Admins with amenities.manage can modify amenities"
  ON public.amenities FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'amenities.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'amenities.manage'));

-- Attractions
DROP POLICY IF EXISTS "Authenticated admins can manage attractions" ON public.attractions;
DROP POLICY IF EXISTS "Admins with attractions.manage can modify attractions" ON public.attractions;
CREATE POLICY "Admins with attractions.manage can modify attractions"
  ON public.attractions FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'attractions.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'attractions.manage'));

-- Gallery Categories & Images
DROP POLICY IF EXISTS "Authenticated admins can manage gallery categories" ON public.gallery_categories;
DROP POLICY IF EXISTS "Admins with gallery.manage can modify gallery categories" ON public.gallery_categories;
CREATE POLICY "Admins with gallery.manage can modify gallery categories"
  ON public.gallery_categories FOR ALL
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'gallery.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'gallery.manage'));

DROP POLICY IF EXISTS "Authenticated admins can manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Admins with images or gallery permissions can modify gallery images" ON public.gallery_images;
CREATE POLICY "Admins with images or gallery permissions can modify gallery images"
  ON public.gallery_images FOR ALL
  TO authenticated
  USING (
    public.has_admin_permission(auth.uid(), 'images.upload')
    OR public.has_admin_permission(auth.uid(), 'images.replace')
    OR public.has_admin_permission(auth.uid(), 'images.delete')
    OR public.has_admin_permission(auth.uid(), 'gallery.manage')
  )
  WITH CHECK (
    public.has_admin_permission(auth.uid(), 'images.upload')
    OR public.has_admin_permission(auth.uid(), 'images.replace')
    OR public.has_admin_permission(auth.uid(), 'gallery.manage')
  );

-- Enquiries
DROP POLICY IF EXISTS "Authenticated admins can view and update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admins with enquiries.view can read enquiries" ON public.enquiries;
CREATE POLICY "Admins with enquiries.view can read enquiries"
  ON public.enquiries FOR SELECT
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'enquiries.view'));

DROP POLICY IF EXISTS "Admins with enquiries.manage can update enquiries" ON public.enquiries;
CREATE POLICY "Admins with enquiries.manage can update enquiries"
  ON public.enquiries FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'enquiries.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'enquiries.manage'));

DROP POLICY IF EXISTS "Super Admins can delete enquiries" ON public.enquiries;
CREATE POLICY "Super Admins can delete enquiries"
  ON public.enquiries FOR DELETE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Site Settings
DROP POLICY IF EXISTS "Authenticated admins can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins with settings.manage can update site settings" ON public.site_settings;
CREATE POLICY "Admins with settings.manage can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_admin_permission(auth.uid(), 'settings.manage'))
  WITH CHECK (public.has_admin_permission(auth.uid(), 'settings.manage'));

-- ------------------------------------------------------------------------------
-- 12. STORAGE RLS POLICIES FOR 'hotel-assets' BUCKET (SAFE IDEMPOTENT POLICIES)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated admins can upload hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins with images.upload can upload hotel assets" ON storage.objects;
CREATE POLICY "Admins with images.upload can upload hotel assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hotel-assets'
    AND public.has_admin_permission(auth.uid(), 'images.upload')
  );

DROP POLICY IF EXISTS "Authenticated admins can update hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins with images.replace can update hotel assets" ON storage.objects;
CREATE POLICY "Admins with images.replace can update hotel assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hotel-assets'
    AND public.has_admin_permission(auth.uid(), 'images.replace')
  );

DROP POLICY IF EXISTS "Authenticated admins can delete hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins with images.delete can delete hotel assets" ON storage.objects;
CREATE POLICY "Admins with images.delete can delete hotel assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hotel-assets'
    AND public.has_admin_permission(auth.uid(), 'images.delete')
  );

-- ------------------------------------------------------------------------------
-- 13. POSTGREST TABLE GRANTS (REQUIRED FOR ACCESS)
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.admin_roles TO authenticated;
GRANT ALL ON TABLE public.admin_permissions TO authenticated;
GRANT ALL ON TABLE public.admin_role_permissions TO authenticated;
GRANT ALL ON TABLE public.admin_profiles TO authenticated;
GRANT ALL ON TABLE public.admin_user_roles TO authenticated;
GRANT ALL ON TABLE public.admin_user_permissions TO authenticated;
GRANT ALL ON TABLE public.admin_audit_logs TO authenticated;

GRANT ALL ON TABLE public.site_settings TO authenticated;
GRANT ALL ON TABLE public.rooms TO authenticated;
GRANT ALL ON TABLE public.room_amenities TO authenticated;
GRANT ALL ON TABLE public.room_amenity_mappings TO authenticated;
GRANT ALL ON TABLE public.amenities TO authenticated;
GRANT ALL ON TABLE public.attractions TO authenticated;
GRANT ALL ON TABLE public.gallery_categories TO authenticated;
GRANT ALL ON TABLE public.gallery_images TO authenticated;
GRANT ALL ON TABLE public.enquiries TO authenticated;

-- ------------------------------------------------------------------------------
-- 14. INITIAL SUPER ADMIN INITIALIZATION BOOTSTRAP
-- ------------------------------------------------------------------------------
-- Targets exact user UUID 64b50b3b-4ad5-47bd-adcd-845116c27f13 and email poreddysuneel4@gmail.com
DO $$
DECLARE
  target_user_id UUID := '64b50b3b-4ad5-47bd-adcd-845116c27f13';
  target_email TEXT := 'poreddysuneel4@gmail.com';
  verified_user_id UUID;
  verified_email TEXT;
BEGIN
  -- 1. Look up user by exact UUID and email in auth.users
  SELECT id, email INTO verified_user_id, verified_email
  FROM auth.users
  WHERE id = target_user_id OR email = target_email
  LIMIT 1;

  -- 2. Fallback to specified credentials if record exists
  IF verified_user_id IS NULL THEN
    verified_user_id := target_user_id;
    verified_email := target_email;
  END IF;

  -- 3. Upsert profile with status = APPROVED
  INSERT INTO public.admin_profiles (id, email, full_name, status, approved_at)
  VALUES (verified_user_id, verified_email, 'Super Administrator', 'APPROVED', now())
  ON CONFLICT (id) DO UPDATE SET
    status = 'APPROVED',
    approved_at = COALESCE(admin_profiles.approved_at, now());

  -- 4. Assign SUPER_ADMIN role
  INSERT INTO public.admin_user_roles (user_id, role_id)
  VALUES (verified_user_id, 'SUPER_ADMIN')
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- 5. Log initial bootstrap audit event
  INSERT INTO public.admin_audit_logs (actor_id, actor_email, action, module, details)
  VALUES (
    verified_user_id,
    verified_email,
    'system.super_admin_initialized',
    'users',
    jsonb_build_object('user_id', verified_user_id, 'role', 'SUPER_ADMIN', 'status', 'APPROVED')
  );
END $$;
