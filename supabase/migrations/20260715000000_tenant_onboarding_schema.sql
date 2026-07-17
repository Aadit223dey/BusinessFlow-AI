-- ============================================================
-- Sprint 3: Tenant Onboarding Database Schema
-- Creates multi-tenant workspace tables, business settings,
-- and structural storage constraints with RLS isolation.
-- ============================================================

-- 1. Add onboarding completion flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean NOT NULL DEFAULT false;

-- 2. Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE,
  category text NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  phone text,
  email text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  postal_code text,
  country text NOT NULL DEFAULT 'US',
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- 3. Create business_settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Working hours configuration (stored as JSONB for flexibility)
  working_hours jsonb NOT NULL DEFAULT '{
    "monday":    {"enabled": true,  "open": "09:00", "close": "17:00"},
    "tuesday":   {"enabled": true,  "open": "09:00", "close": "17:00"},
    "wednesday": {"enabled": true,  "open": "09:00", "close": "17:00"},
    "thursday":  {"enabled": true,  "open": "09:00", "close": "17:00"},
    "friday":    {"enabled": true,  "open": "09:00", "close": "17:00"},
    "saturday":  {"enabled": false, "open": "09:00", "close": "17:00"},
    "sunday":    {"enabled": false, "open": "09:00", "close": "17:00"}
  }'::jsonb,

  -- Slot configuration
  appointment_duration_minutes integer NOT NULL DEFAULT 30,
  buffer_between_appointments integer NOT NULL DEFAULT 0,
  max_advance_booking_days integer NOT NULL DEFAULT 30,

  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),

  UNIQUE(tenant_id)
);

-- 4. Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for tenants
CREATE POLICY "Tenant owners can view their own tenant"
  ON public.tenants FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Tenant owners can insert their own tenant"
  ON public.tenants FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Tenant owners can update their own tenant"
  ON public.tenants FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 6. RLS policies for business_settings
CREATE POLICY "Settings visible to tenant admin"
  ON public.business_settings FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Settings insertable by tenant admin"
  ON public.business_settings FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Settings updatable by tenant admin"
  ON public.business_settings FOR UPDATE
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- 7. Members of tenant can read tenant info via profiles.tenant_id
CREATE POLICY "Tenant members can view their tenant"
  ON public.tenants FOR SELECT
  USING (
    id IN (
      SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- 8. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Attach triggers
CREATE TRIGGER set_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Create storage bucket for business assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business_assets',
  'business_assets',
  false,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 11. Storage RLS policies
CREATE POLICY "Tenant admins can upload business assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business_assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant admins can view business assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business_assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant admins can update business assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business_assets'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'business_assets'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant admins can delete business assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business_assets'
    AND auth.role() = 'authenticated'
  );
