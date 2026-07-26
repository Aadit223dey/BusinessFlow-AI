-- ========================================================
-- Sprint 4: Staff Invitations Schema & RLS Policies
-- ========================================================

-- ========================================================
-- 1. CREATE INVITATIONS STATUS ENUM
-- ========================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invitation_status') THEN
    CREATE TYPE public.invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');
  END IF;
END $$;

-- ========================================================
-- 2. CREATE INVITATIONS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'STAFF'::public.user_role,
  token TEXT NOT NULL UNIQUE,
  status public.invitation_status NOT NULL DEFAULT 'PENDING'::public.invitation_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index for fast token lookups and tenant queries
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant ON public.invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- ========================================================
-- 3. ENABLE RLS & SECURITY DEFINER HELPER POLICIES
-- ========================================================
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "Invitations: Tenant Owner view" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Tenant Owner insert" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Tenant Owner update" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: Token lookup read" ON public.invitations;

-- Business Owners can view invitations created for their tenant
CREATE POLICY "Invitations: Tenant Owner view"
  ON public.invitations FOR SELECT
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

-- Business Owners can create invitations for their tenant
CREATE POLICY "Invitations: Tenant Owner insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role AND
    invited_by = auth.uid()
  );

-- Business Owners can update/revoke invitations for their tenant
CREATE POLICY "Invitations: Tenant Owner update"
  ON public.invitations FOR UPDATE
  USING (
    tenant_id = public.get_current_user_tenant_id() AND 
    public.get_current_user_role() = 'BUSINESS_OWNER'::public.user_role
  );

-- Allow public/anonymous token lookups for active invitation validation
CREATE POLICY "Invitations: Token lookup read"
  ON public.invitations FOR SELECT
  USING (status = 'PENDING'::public.invitation_status AND expires_at > NOW());
