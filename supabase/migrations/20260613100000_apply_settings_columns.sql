-- ──────────────────────────────────────────────────────────────
-- Apply all settings-related columns to profiles table
-- Safe to run multiple times (IF NOT EXISTS / ON CONFLICT)
-- ──────────────────────────────────────────────────────────────

-- 1. Extended profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS website          TEXT,
  ADD COLUMN IF NOT EXISTS gender           TEXT,
  ADD COLUMN IF NOT EXISTS gender_custom    TEXT,
  ADD COLUMN IF NOT EXISTS account_type     TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS two_fa_enabled   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS story_privacy    TEXT NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS reel_privacy     TEXT NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS tag_permissions  TEXT NOT NULL DEFAULT 'everyone',
  ADD COLUMN IF NOT EXISTS hidden_words     TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deactivated_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notif_prefs      JSONB NOT NULL DEFAULT '{"likes":true,"comments":true,"follows":true,"follow_requests":true,"messages":true,"live":true,"email_notifs":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_prefs    JSONB NOT NULL DEFAULT '{"dark_mode":true,"language":"en","data_saver":false}'::jsonb;

-- 2. Add CHECK constraints only if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_gender_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_gender_check
      CHECK (gender IN ('male','female','non_binary','prefer_not_to_say','custom'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_type_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_type_check
      CHECK (account_type IN ('personal','creator','business'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_story_privacy_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_story_privacy_check
      CHECK (story_privacy IN ('everyone','followers','close_friends','no_one'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_reel_privacy_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_reel_privacy_check
      CHECK (reel_privacy IN ('everyone','followers','no_one'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_tag_permissions_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_tag_permissions_check
      CHECK (tag_permissions IN ('everyone','followers','no_one'));
  END IF;
END $$;

-- 3. Restricted users table
CREATE TABLE IF NOT EXISTS public.restricted_users (
  restrictor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restricted_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (restrictor_id, restricted_id),
  CONSTRAINT no_self_restrict CHECK (restrictor_id <> restricted_id)
);

ALTER TABLE public.restricted_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.restricted_users TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='restricted_users' AND policyname='Own restrict list') THEN
    CREATE POLICY "Own restrict list" ON public.restricted_users
      FOR SELECT TO authenticated USING (auth.uid() = restrictor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='restricted_users' AND policyname='Can restrict') THEN
    CREATE POLICY "Can restrict" ON public.restricted_users
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = restrictor_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='restricted_users' AND policyname='Can unrestrict') THEN
    CREATE POLICY "Can unrestrict" ON public.restricted_users
      FOR DELETE TO authenticated USING (auth.uid() = restrictor_id);
  END IF;
END $$;

-- 4. Muted users table
CREATE TABLE IF NOT EXISTS public.muted_users (
  muter_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (muter_id, muted_id),
  CONSTRAINT no_self_mute CHECK (muter_id <> muted_id)
);

ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.muted_users TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='muted_users' AND policyname='Own mute list') THEN
    CREATE POLICY "Own mute list" ON public.muted_users
      FOR SELECT TO authenticated USING (auth.uid() = muter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='muted_users' AND policyname='Can mute') THEN
    CREATE POLICY "Can mute" ON public.muted_users
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = muter_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='muted_users' AND policyname='Can unmute') THEN
    CREATE POLICY "Can unmute" ON public.muted_users
      FOR DELETE TO authenticated USING (auth.uid() = muter_id);
  END IF;
END $$;

-- 5. RPCs
CREATE OR REPLACE FUNCTION public.update_notif_prefs(_prefs jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles SET notif_prefs = _prefs WHERE id = auth.uid();
END; $$;
REVOKE EXECUTE ON FUNCTION public.update_notif_prefs(jsonb) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_notif_prefs(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_content_prefs(_prefs jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles SET content_prefs = _prefs WHERE id = auth.uid();
END; $$;
REVOKE EXECUTE ON FUNCTION public.update_content_prefs(jsonb) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.update_content_prefs(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_blocked_users()
RETURNS TABLE(id uuid, username text, display_name text, avatar_url text, blocked_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.display_name, p.avatar_url, b.created_at
  FROM public.blocked_users b
  JOIN public.profiles p ON p.id = b.blocked_id
  WHERE b.blocker_id = auth.uid()
  ORDER BY b.created_at DESC;
END; $$;
REVOKE EXECUTE ON FUNCTION public.get_blocked_users() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_blocked_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_restricted_users()
RETURNS TABLE(id uuid, username text, display_name text, avatar_url text, restricted_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.display_name, p.avatar_url, r.created_at
  FROM public.restricted_users r
  JOIN public.profiles p ON p.id = r.restricted_id
  WHERE r.restrictor_id = auth.uid()
  ORDER BY r.created_at DESC;
END; $$;
REVOKE EXECUTE ON FUNCTION public.get_restricted_users() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_restricted_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_muted_users()
RETURNS TABLE(id uuid, username text, display_name text, avatar_url text, muted_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.display_name, p.avatar_url, m.created_at
  FROM public.muted_users m
  JOIN public.profiles p ON p.id = m.muted_id
  WHERE m.muter_id = auth.uid()
  ORDER BY m.created_at DESC;
END; $$;
REVOKE EXECUTE ON FUNCTION public.get_muted_users() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_muted_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.restrict_user(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.restricted_users(restrictor_id, restricted_id)
  VALUES(auth.uid(), _target) ON CONFLICT DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.restrict_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.restrict_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.unrestrict_user(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.restricted_users WHERE restrictor_id = auth.uid() AND restricted_id = _target;
END; $$;
REVOKE EXECUTE ON FUNCTION public.unrestrict_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.unrestrict_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.mute_user(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.muted_users(muter_id, muted_id)
  VALUES(auth.uid(), _target) ON CONFLICT DO NOTHING;
END; $$;
REVOKE EXECUTE ON FUNCTION public.mute_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.mute_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.unmute_user(_target uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.muted_users WHERE muter_id = auth.uid() AND muted_id = _target;
END; $$;
REVOKE EXECUTE ON FUNCTION public.unmute_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.unmute_user(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.deactivate_own_account()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.profiles SET deactivated_at = now() WHERE id = auth.uid();
END; $$;
REVOKE EXECUTE ON FUNCTION public.deactivate_own_account() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.deactivate_own_account() TO authenticated;
