-- ========================================================
-- Sprint 6: Business Owner Service Management Schema & RLS
-- ========================================================

-- ========================================================
-- 1. SERVICE CATEGORIES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_category_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- ========================================================
-- 2. SERVICES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  buffer_time_minutes INT NOT NULL DEFAULT 0 CHECK (buffer_time_minutes >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_service_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- ========================================================
-- 3. INDEXES FOR HIGH-THROUGHPUT FILTERING
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON public.services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON public.services(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_tenant_id ON public.service_categories(tenant_id);

-- ========================================================
-- 4. AUTOMATIC TIMESTAMP TRIGGER
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_services_updated_at ON public.services;
CREATE TRIGGER tr_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_service_categories_updated_at ON public.service_categories;
CREATE TRIGGER tr_service_categories_updated_at
BEFORE UPDATE ON public.service_categories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ========================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed to prevent duplicate error
DROP POLICY IF EXISTS "Categories: Tenant Owner manage" ON public.service_categories;
DROP POLICY IF EXISTS "Services: Tenant Owner manage" ON public.services;
DROP POLICY IF EXISTS "Services: Super Admin bypass" ON public.services;
DROP POLICY IF EXISTS "Categories: Super Admin bypass" ON public.service_categories;

-- 5.1 Service Categories Policies (Strict Non-Recursive)
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

-- 5.2 Services Policies (Strict Non-Recursive)
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

-- Super Admin Global Bypass Policy
CREATE POLICY "Services: Super Admin bypass"
  ON public.services FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Categories: Super Admin bypass"
  ON public.service_categories FOR ALL
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
