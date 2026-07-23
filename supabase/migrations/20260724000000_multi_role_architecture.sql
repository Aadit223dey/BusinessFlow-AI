-- Migration: 20260724000000_multi_role_architecture.sql
-- Description: Multi-role identity architecture (SUPER_ADMIN, BUSINESS_OWNER, STAFF, CUSTOMER)
-- with automated Super Admin email elevation, role selection flags, and RLS policies.

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

-- 3. Automated Super Admin & User Trigger (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'admin@businessflow.ai';
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

-- 4. Update RLS Policies on public.profiles
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

-- Business Owners can view profiles tied to their explicit tenant_id
CREATE POLICY "Business Owners can view tenant profiles"
  ON public.profiles FOR SELECT
  USING (
    tenant_id IS NOT NULL 
    AND tenant_id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND role = 'BUSINESS_OWNER'::public.user_role
    )
  );

-- Super Admins maintain bypass permissions across all rows
CREATE POLICY "Super Admins bypass profile access"
  ON public.profiles FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'::public.user_role
  );
