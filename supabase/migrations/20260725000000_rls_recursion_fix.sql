-- ========================================================
-- Sprint 3.5: RLS Policy Recursion Fix
-- Replace all recursive RLS policies with SECURITY DEFINER
-- helper functions to eliminate infinite recursion errors.
-- ========================================================

-- ========================================================
-- 1. DROP ALL EXISTING POLICIES (clean slate)
-- ========================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business Owners can view tenant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins bypass profile access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Users can access own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Super Admin full access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Tenant Owner can view tenant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Self access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Super Admin bypass" ON public.profiles;
DROP POLICY IF EXISTS "Profiles: Same tenant view" ON public.profiles;

DROP POLICY IF EXISTS "Tenant owners can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can insert their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant members can view their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Tenant Members can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Owner can update own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Super Admin full access" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Read assigned tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Owner update tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: Authenticated user insert" ON public.tenants;

DROP POLICY IF EXISTS "Settings visible to tenant admin" ON public.business_settings;
DROP POLICY IF EXISTS "Settings insertable by tenant admin" ON public.business_settings;
DROP POLICY IF EXISTS "Settings updatable by tenant admin" ON public.business_settings;
DROP POLICY IF EXISTS "Settings: Tenant Members can read settings" ON public.business_settings;
DROP POLICY IF EXISTS "Settings: Tenant Owner can manage settings" ON public.business_settings;
DROP POLICY IF EXISTS "Settings: Tenant member read" ON public.business_settings;
DROP POLICY IF EXISTS "Settings: Tenant owner manage" ON public.business_settings;
DROP POLICY IF EXISTS "Settings: Authenticated insert" ON public.business_settings;

-- ========================================================
-- 2. CREATE/REPLACE SECURITY DEFINER HELPER FUNCTIONS
-- ========================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
DECLARE
  v_role public.user_role;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO v_tenant_id
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (public.get_current_user_role() = 'SUPER_ADMIN'::public.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ========================================================
-- 3. RE-ENABLE RLS AND APPLY NON-RECURSIVE POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- A. PROFILES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Profiles: Self access"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Profiles: Super Admin bypass"
  ON public.profiles FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Profiles: Same tenant view"
  ON public.profiles FOR SELECT
  USING (
    tenant_id IS NOT NULL AND
    tenant_id = public.get_current_user_tenant_id()
  );

-- --------------------------------------------------------
-- B. TENANTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Tenants: Read assigned tenant"
  ON public.tenants FOR SELECT
  USING (id = public.get_current_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Tenants: Owner update tenant"
  ON public.tenants FOR UPDATE
  USING (
    id = public.get_current_user_tenant_id() AND
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

CREATE POLICY "Tenants: Authenticated user insert"
  ON public.tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- C. BUSINESS SETTINGS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Settings: Tenant member read"
  ON public.business_settings FOR SELECT
  USING (tenant_id = public.get_current_user_tenant_id() OR public.is_super_admin());

CREATE POLICY "Settings: Tenant owner manage"
  ON public.business_settings FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

CREATE POLICY "Settings: Authenticated insert"
  ON public.business_settings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
