-- ========================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS (REQUIRED FOR RLS)
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
-- 2. CREATE INVITATIONS STATUS ENUM
-- ========================================================
DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ========================================================
-- 3. CREATE INVITATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_role public.user_role NOT NULL DEFAULT 'STAFF'::public.user_role,
  invitation_token TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'pending'::public.invitation_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ
);

-- Indexes for rapid token verification and tenant list filtering
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON public.invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email_tenant ON public.invitations(email, tenant_id);

-- Partial Unique Index: Prevent duplicate active (pending) invites to the same email within the same tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_invitation_per_tenant 
ON public.invitations (tenant_id, LOWER(email)) 
WHERE status = 'pending';

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invitations_updated_at ON public.invitations;
CREATE TRIGGER trigger_set_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========================================================
-- 4. ROW-LEVEL SECURITY (RLS) & NON-RECURSIVE POLICIES
-- ========================================================
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Invitations: Tenant Owner view" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Tenant Owner insert" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Tenant Owner update" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Token validation lookup" ON public.invitations;

-- Policy 1: Business Owners can view invitations created for their tenant
CREATE POLICY "Invitations: Tenant Owner view"
  ON public.invitations FOR SELECT
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  );

-- Policy 2: Business Owners can insert invitations for their tenant
CREATE POLICY "Invitations: Tenant Owner insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role AND
    invited_by = auth.uid()
  );

-- Policy 3: Business Owners can update (e.g., cancel) invitations for their tenant
CREATE POLICY "Invitations: Tenant Owner update"
  ON public.invitations FOR UPDATE
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    (public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role OR public.is_super_admin())
  );

-- Policy 4: Public/Anonymous token verification for active invitation lookup
CREATE POLICY "Invitations: Token validation lookup"
  ON public.invitations FOR SELECT
  USING (status = 'pending'::public.invitation_status AND expires_at > NOW());
