-- Migration: 20260724010000_fix_rls_recursion.sql
-- Description: Complete RLS audit and redesign to eliminate infinite recursion in profiles,
-- tenants, and business_settings tables using SECURITY DEFINER helper functions.

-- 1. Helper SECURITY DEFINER functions (bypass RLS internally to prevent recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id(user_id uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'SUPER_ADMIN'::public.user_role FROM public.profiles WHERE id = user_id LIMIT 1),
    false
  );
$$;

-- 2. Clean up & redesign RLS Policies on public.profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business Owners can view tenant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins bypass profile access" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Business Owners can view tenant profiles"
  ON public.profiles FOR SELECT
  USING (
    tenant_id IS NOT NULL 
    AND tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'::public.user_role
  );

CREATE POLICY "Super Admins bypass profile access"
  ON public.profiles FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 3. Clean up & redesign RLS Policies on public.tenants
DROP POLICY IF EXISTS "Tenant owners can view their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can insert their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant members can view their tenant" ON public.tenants;

CREATE POLICY "Tenant owners can view their own tenant"
  ON public.tenants FOR SELECT
  USING (owner_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant owners can insert their own tenant"
  ON public.tenants FOR INSERT
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant owners can update their own tenant"
  ON public.tenants FOR UPDATE
  USING (owner_id = auth.uid() OR public.is_super_admin(auth.uid()))
  WITH CHECK (owner_id = auth.uid() OR public.is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view their tenant"
  ON public.tenants FOR SELECT
  USING (id = public.get_user_tenant_id(auth.uid()));

-- 4. Clean up & redesign RLS Policies on public.business_settings
DROP POLICY IF EXISTS "Settings visible to tenant admin" ON public.business_settings;
DROP POLICY IF EXISTS "Settings insertable by tenant admin" ON public.business_settings;
DROP POLICY IF EXISTS "Settings updatable by tenant admin" ON public.business_settings;

CREATE POLICY "Settings visible to tenant admin"
  ON public.business_settings FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
    OR tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Settings insertable by tenant admin"
  ON public.business_settings FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  );

CREATE POLICY "Settings updatable by tenant admin"
  ON public.business_settings FOR UPDATE
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  )
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())
    OR public.is_super_admin(auth.uid())
  );
