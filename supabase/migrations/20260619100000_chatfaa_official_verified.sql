-- ──────────────────────────────────────────────────────────────
-- Permanently verify chatfaa_official (and any future official accounts)
-- ──────────────────────────────────────────────────────────────
-- Strategy:
--   1. Add is_manually_verified column — a permanent admin-set override.
--   2. Update refresh_verified_badge so it NEVER removes the badge from
--      a manually-verified account.
--   3. Set both flags for the chatfaa_official account.
-- ──────────────────────────────────────────────────────────────

-- 1. Add permanent override column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_manually_verified BOOLEAN NOT NULL DEFAULT false;

-- 2. Patch refresh_verified_badge: skip update if manually verified
CREATE OR REPLACE FUNCTION public.refresh_verified_badge(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_count  int;
  reel_count  int;
  story_count int;
  qualified   boolean;
  is_manual   boolean;
BEGIN
  -- Never strip the badge from manually-verified (official) accounts
  SELECT is_manually_verified INTO is_manual
  FROM public.profiles WHERE id = _user_id;

  IF is_manual THEN
    -- Ensure is_verified is always true for these accounts
    UPDATE public.profiles
      SET is_verified = true
    WHERE id = _user_id AND is_verified = false;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO post_count  FROM public.posts   WHERE user_id = _user_id;
  SELECT COUNT(*) INTO reel_count  FROM public.reels   WHERE user_id = _user_id;
  SELECT COUNT(*) INTO story_count FROM public.stories WHERE user_id = _user_id;

  qualified := (post_count >= 5 AND reel_count >= 5 AND story_count >= 5);

  UPDATE public.profiles
    SET is_verified = qualified
  WHERE id = _user_id
    AND is_verified IS DISTINCT FROM qualified;
END;
$$;

-- 3. Permanently verify the chatfaa_official account
UPDATE public.profiles
  SET is_verified          = true,
      is_manually_verified = true
WHERE username = 'chatfaa_official';
