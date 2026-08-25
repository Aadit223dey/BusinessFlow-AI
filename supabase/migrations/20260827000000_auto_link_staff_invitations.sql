-- ====================================================================
-- 1. ENHANCED handle_new_user() TRIGGER: ATOMIC INVITATION RESOLUTION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_email_1 TEXT := 'developer223aadit@gmail.com';
  v_admin_email_2 TEXT := 'admin@businessflow.ai';
  v_invite RECORD;
  v_staff_id UUID;
BEGIN
  -- Check 1: Super Admin Elevation
  IF LOWER(NEW.email) = LOWER(v_admin_email_1) OR LOWER(NEW.email) = LOWER(v_admin_email_2) THEN
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
      'SUPER_ADMIN'::public.user_role,
      TRUE,
      TRUE,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'Super'),
      COALESCE(NEW.raw_user_meta_data->>'last_name', 'Admin'),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'SUPER_ADMIN'::public.user_role,
      has_selected_role = TRUE,
      has_completed_onboarding = TRUE,
      updated_at = NOW();

    RETURN NEW;
  END IF;

  -- Check 2: Active Pending Staff Invitation Detection
  SELECT id, tenant_id, invited_role
  INTO v_invite
  FROM public.invitations
  WHERE LOWER(email) = LOWER(NEW.email)
    AND status = 'pending'::public.invitation_status
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invite.id IS NOT NULL THEN
    -- A. Create Profile pre-configured as STAFF
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
      tenant_id = EXCLUDED.tenant_id,
      role = EXCLUDED.role,
      has_selected_role = EXCLUDED.has_selected_role,
      has_completed_onboarding = EXCLUDED.has_completed_onboarding,
      first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
      last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
      updated_at = NOW();

    -- B. Provision staff_members record
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
      tenant_id = EXCLUDED.tenant_id,
      status = 'ACTIVE'::public.employment_status,
      updated_at = NOW()
    RETURNING id INTO v_staff_id;

    -- C. Provision baseline staff permissions
    INSERT INTO public.staff_permissions (staff_id, tenant_id, permission_key)
    VALUES
      (v_staff_id, v_invite.tenant_id, 'SERVICES_VIEW'),
      (v_staff_id, v_invite.tenant_id, 'APPOINTMENTS_VIEW'),
      (v_staff_id, v_invite.tenant_id, 'CUSTOMERS_VIEW')
    ON CONFLICT (staff_id, permission_key) DO NOTHING;

    -- D. Mark invitation as accepted atomically
    UPDATE public.invitations
    SET 
      status = 'accepted'::public.invitation_status,
      accepted_at = NOW(),
      updated_at = NOW(),
      auth_user_id = NEW.id
    WHERE id = v_invite.id;

    RETURN NEW;
  END IF;

  -- Check 3: Standard Organic Public Registration
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
