-- ========================================================
-- Sprint 5: Customer Profile Extensions & Avatar Storage
-- ========================================================

-- 1. EXTEND PROFILES TABLE FOR CUSTOMER METADATA
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- 2. SUPABASE STORAGE BUCKET FOR AVATARS
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE RLS POLICIES
CREATE POLICY "Avatar Uploads: User explicit write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar Uploads: User explicit update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar Read: Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
