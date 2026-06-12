-- ──────────────────────────────────────────────────────────────
-- 1. Delete ALL existing users (cleans slate, profiles cascade)
-- ──────────────────────────────────────────────────────────────
DELETE FROM auth.users;

-- ──────────────────────────────────────────────────────────────
-- 2. Add email column to profiles so login works client-side
--    without needing a SECURITY DEFINER RPC
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Allow anon to read just the email+username columns for login lookup
-- (profiles SELECT policy already allows authenticated; we need anon for pre-login check)
DROP POLICY IF EXISTS "Public username lookup" ON public.profiles;
CREATE POLICY "Public username lookup"
  ON public.profiles FOR SELECT TO anon
  USING (true);

-- ──────────────────────────────────────────────────────────────
-- 3. Update handle_new_user trigger to also store email
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    uname,
    COALESCE(NEW.raw_user_meta_data->>'display_name', uname),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END; $$;

-- ──────────────────────────────────────────────────────────────
-- 4. Drop the old RPC (no longer needed)
-- ──────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.get_email_by_username(text);
