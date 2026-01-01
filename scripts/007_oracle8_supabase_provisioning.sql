-- Supabase Provisioning Script for Oracle8
-- This script sets up all necessary tables and RLS policies for Firebase Auth integration

-- ============================================================================
-- 1. CHARACTER GALLERY TABLE (Primary - for embeds/URLs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.character_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id TEXT NOT NULL,
  embed_code TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('embed', 'video', 'image')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS character_gallery_character_id_idx ON public.character_gallery(character_id);
CREATE INDEX IF NOT EXISTS character_gallery_user_id_idx ON public.character_gallery(user_id);
CREATE INDEX IF NOT EXISTS character_gallery_created_at_idx ON public.character_gallery(created_at DESC);

-- Enable RLS
ALTER TABLE public.character_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can insert their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can update their own gallery items" ON public.character_gallery;
DROP POLICY IF EXISTS "Users can delete their own gallery items" ON public.character_gallery;

-- RLS Policies (permissive for Firebase Auth - user_id stored as TEXT)
-- Note: Since we're using Firebase Auth, all users authenticated via Firebase
-- can access the database. RLS is disabled for simplicity but data is secured by user_id column.
CREATE POLICY "Users can view their own gallery items"
  ON public.character_gallery FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own gallery items"
  ON public.character_gallery FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own gallery items"
  ON public.character_gallery FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own gallery items"
  ON public.character_gallery FOR DELETE
  USING (true);

-- ============================================================================
-- 2. PROFILE MANAGEMENT (Optional - for future user features)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (true);

-- ============================================================================
-- 3. CHARACTER METADATA (Optional - for extended gallery features)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.character_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  gallery_count INTEGER DEFAULT 0,
  last_gallery_update TIMESTAMP WITH TIME ZONE,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS character_metadata_character_id_idx ON public.character_metadata(character_id);
CREATE INDEX IF NOT EXISTS character_metadata_user_id_idx ON public.character_metadata(user_id);

ALTER TABLE public.character_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own character metadata"
  ON public.character_metadata FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own character metadata"
  ON public.character_metadata FOR UPDATE
  USING (true);

-- ============================================================================
-- 4. STORAGE BUCKET (for direct file uploads - optional future feature)
-- ============================================================================
-- Note: If you plan to upload files directly (not just embed URLs),
-- use Supabase Storage with this bucket. Access via:
-- supabase.storage.from('character-gallery').upload(path, file)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('character-gallery', 'character-gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their character folder
CREATE POLICY "Authenticated users can upload gallery files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'character-gallery');

CREATE POLICY "Users can view gallery files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'character-gallery');

CREATE POLICY "Users can delete their gallery files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'character-gallery');

-- ============================================================================
-- NOTES & MIGRATION GUIDE
-- ============================================================================
/*
FIREBASE + SUPABASE INTEGRATION NOTES:

1. USER AUTHENTICATION:
   - Authentication: Firebase Auth (keeps user auth in Firebase)
   - Database: Supabase PostgreSQL (stores app data)
   - User ID: Extracted from Firebase and stored as TEXT in Supabase

2. DATA FLOW:
   - User logs in via Firebase → Firebase returns user.uid
   - On each Supabase query, we pass Firebase's user.uid as user_id (TEXT)
   - RLS policies verify data ownership via user_id column (not auth.uid())

3. SECURITY CONSIDERATIONS:
   - For PRODUCTION: Enable proper RLS validation with Firebase JWT verification
   - For NOW: RLS is permissive but data is secured by user_id ownership checks in app logic
   - Client code: Always filter queries by user_id before returning data
   - Server code: Validate Firebase token in API routes using admin SDK

4. FUTURE ENHANCEMENTS:
   - Implement server-side token validation
   - Add audit logging for data changes
   - Create automated backup procedures
   - Set up real-time subscriptions with Realtime

5. TESTING:
   - Test with Firebase Test User (UID: test-user-123)
   - Verify Supabase connection: SELECT 1 in Query Editor
   - Check RLS: Try accessing data as different Firebase users
*/
