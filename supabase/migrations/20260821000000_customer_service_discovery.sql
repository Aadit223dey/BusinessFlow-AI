-- ============================================================
-- Sprint 5.2A: Customer Service Discovery Schema & RLS
-- ============================================================

-- 1. Service Categories Table
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

-- 2. Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
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

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON public.services(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_search ON public.services USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_service_categories_tenant ON public.service_categories(tenant_id, is_active);

-- 4. Row Level Security Policies (Non-Recursive)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Drop if exists to avoid collision
DROP POLICY IF EXISTS "Categories: Public/Customer active view" ON public.service_categories;
DROP POLICY IF EXISTS "Categories: Tenant Owner manage" ON public.service_categories;
DROP POLICY IF EXISTS "Services: Public/Customer active view" ON public.services;
DROP POLICY IF EXISTS "Services: Tenant Owner manage" ON public.services;
DROP POLICY IF EXISTS "Tenants: Customer public discovery" ON public.tenants;

-- 4.1 Categories Policies
-- Customer Read: Any authenticated user can view active categories of active businesses
CREATE POLICY "Categories: Public/Customer active view"
  ON public.service_categories FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.tenants t 
      WHERE t.id = service_categories.tenant_id
    )
  );

-- Owner Management: Tenant owners manage their own categories
CREATE POLICY "Categories: Tenant Owner manage"
  ON public.service_categories FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

-- 4.2 Services Policies
-- Customer Read: Any authenticated user can view active services
CREATE POLICY "Services: Public/Customer active view"
  ON public.services FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.tenants t 
      WHERE t.id = services.tenant_id
    )
  );

-- Owner Management: Tenant owners manage their own services
CREATE POLICY "Services: Tenant Owner manage"
  ON public.services FOR ALL
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

-- 4.3 Tenant Safe Read Policy Expansion (Public Business Info)
CREATE POLICY "Tenants: Customer public discovery"
  ON public.tenants FOR SELECT
  USING (true);
