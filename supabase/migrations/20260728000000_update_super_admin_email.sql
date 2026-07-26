-- ========================================================
-- Update Super Admin Email to developer223aadit@gmail.com
-- ========================================================

-- 1. UPDATE TRIGGER FUNCTION FOR AUTOMATED ELEVATION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'developer223aadit@gmail.com';
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
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'SUPER_ADMIN'::public.user_role,
      has_selected_role = TRUE,
      has_completed_onboarding = TRUE;
  ELSE
    INSERT INTO public.profiles (id, role, has_selected_role, has_completed_onboarding, first_name, last_name)
    VALUES (
      NEW.id,
      NULL,
      FALSE,
      FALSE,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. ERASE OLD SUPER ADMIN ACCOUNT & PROFILE (dey223aadit@gmail.com)
DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'dey223aadit@gmail.com'
);
DELETE FROM auth.users WHERE LOWER(email) = 'dey223aadit@gmail.com';

-- 3. ELEVATE developer223aadit@gmail.com TO SUPER ADMIN (IF ACCOUNT ALREADY EXISTS)
UPDATE public.profiles
SET 
  role = 'SUPER_ADMIN'::public.user_role,
  has_selected_role = TRUE,
  has_completed_onboarding = TRUE
WHERE id IN (
  SELECT id FROM auth.users WHERE LOWER(email) = 'developer223aadit@gmail.com'
);
