-- ====================================================================
-- 1. STABILIZE INVITATION TABLE & CONSTRAINTS
-- ====================================================================
DO $$ BEGIN
  CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_role public.user_role NOT NULL DEFAULT 'STAFF'::public.user_role,
  status public.invitation_status NOT NULL DEFAULT 'pending'::public.invitation_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_token TEXT
);

-- Case-insensitive unique partial index: Only ONE pending invite per email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_invitation_per_tenant 
ON public.invitations (tenant_id, LOWER(TRIM(email))) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_invitations_email_lookup 
ON public.invitations (LOWER(TRIM(email)), status);

-- ====================================================================
-- 2. ATOMIC DATABASE TRIGGER: AUTO-BIND STAFF INVITATION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_email_1 TEXT := 'developer223aadit@gmail.com';
  v_admin_email_2 TEXT := 'admin@businessflow.ai';
  v_user_email TEXT;
  v_invite RECORD;
  v_staff_id UUID;
BEGIN
  v_user_email := LOWER(TRIM(NEW.email));

  -- 1. Super Admin Auto-Elevation Check
  IF v_user_email = LOWER(TRIM(v_admin_email_1)) OR v_user_email = LOWER(TRIM(v_admin_email_2)) THEN
    INSERT INTO public.profiles (
      id, role, has_selected_role, has_completed_onboarding, first_name, last_name, updated_at
    )
    VALUES (
      NEW.id, 'SUPER_ADMIN'::public.user_role, TRUE, TRUE, 'Super', 'Admin', NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'SUPER_ADMIN'::public.user_role,
      has_selected_role = TRUE,
      has_completed_onboarding = TRUE,
      updated_at = NOW();
    RETURN NEW;
  END IF;

  -- 2. Active Pending Staff Invitation Lookup
  SELECT id, tenant_id, invited_role
  INTO v_invite
  FROM public.invitations
  WHERE LOWER(TRIM(email)) = v_user_email
    AND status = 'pending'::public.invitation_status
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invite.id IS NOT NULL THEN
    -- A. Create Profile configured as STAFF bound to Inviting Tenant
    INSERT INTO public.profiles (
      id,
      tenant_id,
      role,
      has_selected_role,
      has_completed_onboarding,
      first_name,
      last_name,
      updated_at
    )
    VALUES (
      NEW.id,
      v_invite.tenant_id,
      'STAFF'::public.user_role,
      TRUE,
      TRUE,
      COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = v_invite.tenant_id,
      role = 'STAFF'::public.user_role,
      has_selected_role = TRUE,
      has_completed_onboarding = TRUE,
      updated_at = NOW();

    -- B. Provision staff_members record (1:1 with Profile)
    INSERT INTO public.staff_members (
      profile_id,
      tenant_id,
      job_title,
      department,
      status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      v_invite.tenant_id,
      'Staff Member',
      'General',
      'ACTIVE'::public.employment_status,
      NOW(),
      NOW()
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      tenant_id = v_invite.tenant_id,
      status = 'ACTIVE'::public.employment_status,
      updated_at = NOW()
    RETURNING id INTO v_staff_id;

    -- C. Provision Baseline Staff Permissions
    INSERT INTO public.staff_permissions (staff_id, tenant_id, permission_key)
    VALUES
      (v_staff_id, v_invite.tenant_id, 'SERVICES_VIEW'),
      (v_staff_id, v_invite.tenant_id, 'APPOINTMENTS_VIEW'),
      (v_staff_id, v_invite.tenant_id, 'CUSTOMERS_VIEW')
    ON CONFLICT (staff_id, permission_key) DO NOTHING;

    -- D. Atomically Mark Invitation as Accepted
    UPDATE public.invitations
    SET 
      status = 'accepted'::public.invitation_status,
      accepted_at = NOW(),
      updated_at = NOW(),
      auth_user_id = NEW.id
    WHERE id = v_invite.id;

    RETURN NEW;
  END IF;

  -- 3. Standard Public Registration (Unassigned Profile)
  INSERT INTO public.profiles (
    id,
    role,
    has_selected_role,
    has_completed_onboarding,
    first_name,
    last_name,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL,
    FALSE,
    FALSE,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Schema cache refresh
NOTIFY pgrst, 'reload schema';
