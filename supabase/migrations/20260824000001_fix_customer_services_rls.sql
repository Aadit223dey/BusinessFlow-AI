-- ========================================================
-- Sprint 6: Customer Service Discovery & Multi-Tenant RLS Fix
-- ========================================================

-- 1. Ensure RLS is active
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 2. Drop prior conflicting policies on services
DROP POLICY IF EXISTS "Services: Tenant Owner manage" ON public.services;
DROP POLICY IF EXISTS "Services: Customer active view" ON public.services;
DROP POLICY IF EXISTS "Services: Public/Customer active view" ON public.services;
DROP POLICY IF EXISTS "Services: Customer discovery view" ON public.services;
DROP POLICY IF EXISTS "Services: Public discovery" ON public.services;
DROP POLICY IF EXISTS "Services: Super Admin bypass" ON public.services;

-- 3. Services Policies
-- Owner Management: Full CRUD for Tenant Owner
CREATE POLICY "Services: Tenant Owner manage"
  ON public.services FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  )
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

-- Customer Discovery: All authenticated users can view active services
CREATE POLICY "Services: Customer discovery view"
  ON public.services FOR SELECT
  USING (is_active = true);

-- Super Admin Bypass
CREATE POLICY "Services: Super Admin bypass"
  ON public.services FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 4. Service Categories Policies
DROP POLICY IF EXISTS "Categories: Tenant Owner manage" ON public.service_categories;
DROP POLICY IF EXISTS "Categories: Customer active view" ON public.service_categories;
DROP POLICY IF EXISTS "Categories: Public/Customer active view" ON public.service_categories;
DROP POLICY IF EXISTS "Categories: Customer discovery view" ON public.service_categories;
DROP POLICY IF EXISTS "Categories: Super Admin bypass" ON public.service_categories;

CREATE POLICY "Categories: Tenant Owner manage"
  ON public.service_categories FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  )
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

CREATE POLICY "Categories: Customer discovery view"
  ON public.service_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Categories: Super Admin bypass"
  ON public.service_categories FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 5. Tenants & Business Settings Discovery Policies for Customers
DROP POLICY IF EXISTS "Tenants: Customer public discovery" ON public.tenants;
CREATE POLICY "Tenants: Customer public discovery"
  ON public.tenants FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Settings: Customer public discovery" ON public.business_settings;
CREATE POLICY "Settings: Customer public discovery"
  ON public.business_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 6. Refresh PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
