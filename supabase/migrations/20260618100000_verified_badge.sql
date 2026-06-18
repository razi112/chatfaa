-- ──────────────────────────────────────────────────────────────
-- Verified badge system
-- Awarded automatically when a user has:
--   ≥ 5 posts  AND  ≥ 5 reels  AND  ≥ 5 stories
-- ──────────────────────────────────────────────────────────────

-- 1. Add is_verified column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- 2. Helper function: check & update badge for a given user
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
BEGIN
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

REVOKE EXECUTE ON FUNCTION public.refresh_verified_badge(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.refresh_verified_badge(uuid) TO authenticated;

-- 3. Trigger function: called after any INSERT/DELETE on posts, reels, stories
CREATE OR REPLACE FUNCTION public._trg_refresh_verified_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected_user uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    affected_user := OLD.user_id;
  ELSE
    affected_user := NEW.user_id;
  END IF;

  PERFORM public.refresh_verified_badge(affected_user);
  RETURN NULL; -- AFTER trigger, return value is ignored
END;
$$;

-- 4. Attach triggers (safe: drop-then-create pattern)

-- posts
DROP TRIGGER IF EXISTS trg_badge_posts ON public.posts;
CREATE TRIGGER trg_badge_posts
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public._trg_refresh_verified_badge();

-- reels
DROP TRIGGER IF EXISTS trg_badge_reels ON public.reels;
CREATE TRIGGER trg_badge_reels
  AFTER INSERT OR DELETE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public._trg_refresh_verified_badge();

-- stories
DROP TRIGGER IF EXISTS trg_badge_stories ON public.stories;
CREATE TRIGGER trg_badge_stories
  AFTER INSERT OR DELETE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public._trg_refresh_verified_badge();

-- 5. Back-fill existing users
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM public.profiles LOOP
    PERFORM public.refresh_verified_badge(rec.id);
  END LOOP;
END $$;

-- 6. Update search_users RPC to include is_verified
DROP FUNCTION IF EXISTS public.search_users(text, int);
CREATE OR REPLACE FUNCTION public.search_users(_query text, _limit int DEFAULT 20)
RETURNS TABLE(
  id            uuid,
  username      text,
  display_name  text,
  avatar_url    text,
  is_private    boolean,
  is_verified   boolean,
  follow_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.is_private,
    p.is_verified,
    COALESCE((
      SELECT f.status::text
      FROM public.follows f
      WHERE f.follower_id = me AND f.following_id = p.id
    ), 'none') AS follow_status
  FROM public.profiles p
  WHERE p.id <> me
    AND (
      p.username    ILIKE '%' || _query || '%'
      OR p.display_name ILIKE '%' || _query || '%'
    )
  ORDER BY
    CASE WHEN lower(p.username) = lower(_query) THEN 0 ELSE 1 END,
    p.username
  LIMIT _limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.search_users(text, int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.search_users(text, int) TO authenticated;

-- 7. Update get_suggested_users RPC to include is_verified
DROP FUNCTION IF EXISTS public.get_suggested_users(int);
CREATE OR REPLACE FUNCTION public.get_suggested_users(_limit int DEFAULT 20)
RETURNS TABLE(
  id           uuid,
  username     text,
  display_name text,
  avatar_url   text,
  is_private   boolean,
  is_verified  boolean,
  mutual_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.is_private,
    p.is_verified,
    COUNT(DISTINCT mf.follower_id)::bigint AS mutual_count
  FROM public.profiles p
  -- users the current user is NOT already following
  LEFT JOIN public.follows my_follow
    ON my_follow.follower_id = me AND my_follow.following_id = p.id
  -- followers of people the current user follows (mutual signals)
  LEFT JOIN public.follows they_follow
    ON they_follow.following_id = p.id
  LEFT JOIN public.follows mf
    ON mf.following_id = they_follow.follower_id AND mf.follower_id = me
  WHERE p.id <> me
    AND my_follow.id IS NULL  -- not already following
  GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.is_private, p.is_verified
  ORDER BY mutual_count DESC, p.created_at DESC
  LIMIT _limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_suggested_users(int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_suggested_users(int) TO authenticated;
