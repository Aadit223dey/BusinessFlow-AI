-- Migration: 20260724000000_multi_role_architecture.sql
-- Description: Multi-role identity architecture (SUPER_ADMIN, BUSINESS_OWNER, STAFF, CUSTOMER)
-- with automated Super Admin email elevation, role selection flags, and non-recursive RLS policies.

-- 1. Create public.user_role ENUM
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('SUPER_ADMIN', 'BUSINESS_OWNER', 'STAFF', 'CUSTOMER');
  END IF;
END $$;

-- 2. Update public.profiles Table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT NULL;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_selected_role BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Helper SECURITY DEFINER functions (bypasses RLS to prevent policy infinite recursion)
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

-- 4. Automated Super Admin & User Trigger (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'dey223aadit@gmail.com';
BEGIN
  IF LOWER(NEW.email) = LOWER(admin_email) THEN
    INSERT INTO public.profiles (id, role, has_selected_role, has_completed_onboarding, first_name, last_name)
    VALUES (
      NEW.id,
      'SUPER_ADMIN'::public.user_role,
      TRUE,
      TRUE,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'Super'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin')
    );
  ELSE
    INSERT INTO public.profiles (id, role, has_selected_role, has_completed_onboarding, first_name, last_name)
    VALUES (
      NEW.id,
      NULL,
      FALSE,
      FALSE,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Non-recursive RLS Policies on public.profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Business Owners can view tenant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins bypass profile access" ON public.profiles;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Business Owners can view profiles tied to their explicit tenant_id (using SECURITY DEFINER helper)
CREATE POLICY "Business Owners can view tenant profiles"
  ON public.profiles FOR SELECT
  USING (
    tenant_id IS NOT NULL 
    AND tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = 'BUSINESS_OWNER'::public.user_role
  );

-- Super Admins maintain bypass permissions across all rows (using SECURITY DEFINER helper)
CREATE POLICY "Super Admins bypass profile access"
  ON public.profiles FOR ALL
  USING (public.is_super_admin(auth.uid()));
