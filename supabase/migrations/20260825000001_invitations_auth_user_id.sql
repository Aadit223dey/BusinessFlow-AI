-- ========================================================
-- Sprint 6.1: Add auth_user_id column to public.invitations
-- Allows linking public.invitations tracking to auth.users record created by inviteUserByEmail
-- ========================================================

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invitations_auth_user ON public.invitations(auth_user_id);

NOTIFY pgrst, 'reload schema';
