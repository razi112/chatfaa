-- ─── Seed-data system ────────────────────────────────────────────────────────
-- Adds `is_seed_user` flag to profiles so synthetic demo users are always
-- distinguishable from real users. Also creates helper RPCs used by the
-- admin seed panel and the Node.js seed script.

-- 1. Add the flag column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_seed_user BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_seed_user IS
  'TRUE for synthetic demo/seed users generated for development & demo purposes. '
  'Never presented to end-users as real accounts.';

-- Index so queries that filter seed vs real users are fast
CREATE INDEX IF NOT EXISTS profiles_is_seed_user_idx
  ON public.profiles (is_seed_user);

-- ─── 2. RPC: count_seed_users ─────────────────────────────────────────────
-- Returns a summary of how many seed records exist per table.
CREATE OR REPLACE FUNCTION public.count_seed_stats()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT jsonb_build_object(
    'profiles',      (SELECT count(*) FROM public.profiles       WHERE is_seed_user = true),
    'posts',         (SELECT count(*) FROM public.posts          WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'reels',         (SELECT count(*) FROM public.reels          WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'follows',       (SELECT count(*) FROM public.follows        WHERE follower_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)
                                                                    OR following_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'post_likes',    (SELECT count(*) FROM public.post_likes     WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'post_comments', (SELECT count(*) FROM public.post_comments  WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'reel_likes',    (SELECT count(*) FROM public.reel_likes     WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)),
    'reel_comments', (SELECT count(*) FROM public.reel_comments  WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true))
  );
$$;

GRANT EXECUTE ON FUNCTION public.count_seed_stats() TO authenticated;

-- ─── 3. RPC: remove_seed_data ─────────────────────────────────────────────
-- Hard-deletes every record that belongs to a seed user.
-- Safe because FK ON DELETE CASCADE will clean up child rows automatically.
CREATE OR REPLACE FUNCTION public.remove_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete posts first (comments/likes cascade)
  DELETE FROM public.posts
    WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true);

  -- Delete reels (likes/comments cascade)
  DELETE FROM public.reels
    WHERE user_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true);

  -- Remove follows involving seed users
  DELETE FROM public.follows
    WHERE follower_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true)
       OR following_id IN (SELECT id FROM public.profiles WHERE is_seed_user = true);

  -- Remove seed profiles (auth rows are NOT deleted — seed users don't have auth rows)
  DELETE FROM public.profiles WHERE is_seed_user = true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_seed_data() TO authenticated;
