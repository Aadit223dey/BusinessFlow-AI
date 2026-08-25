-- ============================================================================
-- Staff Invitation Rebuild: Stabilize RLS & Add Self-Read Policy
-- ============================================================================
-- This migration:
-- 1. Drops the old invitation_token-based RLS lookup policy
-- 2. Adds a self-read policy so authenticated users can read their own pending
--    invitations by matching LOWER(email) = LOWER(auth.jwt() ->> 'email')
-- 3. Creates a unique index to prevent duplicate pending invitations
-- 4. Ensures DELETE policy exists for Business Owners
-- ============================================================================

-- ── 1. Drop legacy token-based lookup policy (if it exists) ─────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invitations' AND policyname = 'Allow token validation lookup'
  ) THEN
    DROP POLICY "Allow token validation lookup" ON public.invitations;
  END IF;
END
$$;

-- ── 2. Self-Read Policy ─────────────────────────────────────────────────
-- Allows an authenticated user to SELECT their own pending invitations
-- so the verify-session endpoint can query without admin privileges.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invitations' AND policyname = 'Invited user can read own pending invitation'
  ) THEN
    CREATE POLICY "Invited user can read own pending invitation"
      ON public.invitations
      FOR SELECT
      TO authenticated
      USING (
        LOWER(email) = LOWER(auth.jwt() ->> 'email')
        AND status = 'pending'
      );
  END IF;
END
$$;

-- ── 3. DELETE policy for Business Owners ────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'invitations' AND policyname = 'Business owners can delete invitations'
  ) THEN
    CREATE POLICY "Business owners can delete invitations"
      ON public.invitations
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
            AND profiles.role = 'BUSINESS_OWNER'
            AND profiles.tenant_id = invitations.tenant_id
        )
      );
  END IF;
END
$$;

-- ── 4. Unique index: one pending invitation per email per tenant ────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
  ON public.invitations (tenant_id, LOWER(email))
  WHERE status = 'pending';
