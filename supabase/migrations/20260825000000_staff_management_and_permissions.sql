-- ========================================================
-- Sprint 6: Staff Management & Permissions Architecture
-- Migration: 20260825000000_staff_management_and_permissions.sql
-- ========================================================

-- ========================================================
-- 1. EMPLOYEE STATUS ENUM
-- ========================================================
DO $$ BEGIN
  CREATE TYPE public.employment_status AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================================
-- 2. STAFF PROFILES EXTENSION TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL DEFAULT 'Staff Member',
  department TEXT NOT NULL DEFAULT 'General',
  phone_number TEXT,
  status public.employment_status NOT NULL DEFAULT 'ACTIVE'::public.employment_status,
  hired_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rapid lookup and tenant isolation
CREATE INDEX IF NOT EXISTS idx_staff_members_tenant ON public.staff_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_profile ON public.staff_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status ON public.staff_members(tenant_id, status);

-- ========================================================
-- 3. STAFF PERMISSIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_permission UNIQUE (staff_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_staff_permissions_lookup ON public.staff_permissions(staff_id, permission_key);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_tenant ON public.staff_permissions(tenant_id);

-- ========================================================
-- 4. SECURITY DEFINER HELPER: STAFF PERMISSION CHECK
-- ========================================================
CREATE OR REPLACE FUNCTION public.has_staff_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_role public.user_role;
  v_has_perm BOOLEAN := false;
BEGIN
  v_role := public.get_current_user_role();

  -- Super Admin and Business Owner always have full permission override
  IF v_role = 'SUPER_ADMIN'::public.user_role OR v_role = 'BUSINESS_OWNER'::public.user_role THEN
    RETURN true;
  END IF;

  -- Staff check
  IF v_role = 'STAFF'::public.user_role THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.staff_permissions sp
      JOIN public.staff_members sm ON sm.id = sp.staff_id
      WHERE sm.profile_id = auth.uid()
        AND sm.status = 'ACTIVE'::public.employment_status
        AND sp.permission_key = required_permission
    ) INTO v_has_perm;
    RETURN v_has_perm;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========================================================
-- 5. AUTO-UPDATE TRIGGER FOR updated_at
-- ========================================================
CREATE OR REPLACE FUNCTION public.update_staff_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_members_updated_at ON public.staff_members;
CREATE TRIGGER trg_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_staff_members_updated_at();

-- ========================================================
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- 6.1 Staff Members Policies
CREATE POLICY "Staff Members: Tenant Owner full access"
  ON public.staff_members FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  )
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  );

CREATE POLICY "Staff Members: Staff self view"
  ON public.staff_members FOR SELECT
  USING (
    profile_id = auth.uid() AND
    tenant_id = public.get_current_user_tenant_id()
  );

-- 6.2 Staff Permissions Policies
CREATE POLICY "Staff Permissions: Tenant Owner full access"
  ON public.staff_permissions FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  )
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  );

CREATE POLICY "Staff Permissions: Staff self view"
  ON public.staff_permissions FOR SELECT
  USING (
    staff_id IN (
      SELECT id FROM public.staff_members WHERE profile_id = auth.uid()
    )
  );

-- 7. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
