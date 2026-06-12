-- ══════════════════════════════════════════════════════════════
-- FOLLOWING SYSTEM
-- ══════════════════════════════════════════════════════════════

-- ── 1. Add is_private column to profiles ─────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT false;

-- ── 2. follows table ─────────────────────────────────────────
-- status: 'pending' (requested, waiting approval) | 'accepted' (following)
CREATE TYPE public.follow_status AS ENUM ('pending', 'accepted');

CREATE TABLE public.follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status      public.follow_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id),
  CONSTRAINT unique_follow   UNIQUE (follower_id, following_id)
);

CREATE INDEX follows_follower_idx  ON public.follows(follower_id);
CREATE INDEX follows_following_idx ON public.follows(following_id);
CREATE INDEX follows_status_idx    ON public.follows(status);

CREATE TRIGGER follows_updated
  BEFORE UPDATE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View follows involving self"
  ON public.follows FOR SELECT TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Insert own follow"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Update follow as target (accept/decline)"
  ON public.follows FOR UPDATE TO authenticated
  USING (auth.uid() = following_id OR auth.uid() = follower_id);

CREATE POLICY "Delete own follow or remove follower"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER TABLE public.follows REPLICA IDENTITY FULL;

-- ── 3. notifications table ────────────────────────────────────
CREATE TYPE public.notif_type AS ENUM (
  'follow_request',
  'follow_accept',
  'new_follower',
  'post_like',
  'post_comment',
  'reel_like'
);

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- recipient
  actor_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- who triggered it
  type       public.notif_type NOT NULL,
  entity_id  UUID,       -- post_id / follow_id / reel_id etc. (nullable)
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_notif CHECK (user_id <> actor_id)
);

CREATE INDEX notifications_user_idx ON public.notifications(user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Service role & authenticated insert (notifications created via RPCs below)
CREATE POLICY "Authenticated can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- ── 4. follow_user RPC ────────────────────────────────────────
-- Returns: 'accepted' (public account, now following)
--          'pending'  (private account, request sent)
--          'blocked'  (blocked, action denied)
CREATE OR REPLACE FUNCTION public.follow_user(_target uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid        uuid := auth.uid();
  is_priv    boolean;
  new_status public.follow_status;
  follow_id  uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF uid = _target THEN RAISE EXCEPTION 'Cannot follow yourself'; END IF;

  -- Block check (either direction)
  IF EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = uid AND blocked_id = _target)
       OR (blocker_id = _target AND blocked_id = uid)
  ) THEN
    RETURN 'blocked';
  END IF;

  -- Rate limit: max 150 follows per hour
  IF (
    SELECT COUNT(*) FROM public.follows
    WHERE follower_id = uid AND created_at > now() - INTERVAL '1 hour'
  ) >= 150 THEN
    RAISE EXCEPTION 'Rate limit: too many follow actions. Try again later.';
  END IF;

  -- Determine if target account is private
  SELECT is_private INTO is_priv FROM public.profiles WHERE id = _target;
  new_status := CASE WHEN is_priv THEN 'pending'::public.follow_status ELSE 'accepted'::public.follow_status END;

  -- Upsert follow row
  INSERT INTO public.follows (follower_id, following_id, status)
  VALUES (uid, _target, new_status)
  ON CONFLICT (follower_id, following_id) DO UPDATE SET status = new_status, updated_at = now()
  RETURNING id INTO follow_id;

  -- Notification
  IF new_status = 'accepted' THEN
    INSERT INTO public.notifications (user_id, actor_id, type, entity_id)
    VALUES (_target, uid, 'new_follower', follow_id)
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.notifications (user_id, actor_id, type, entity_id)
    VALUES (_target, uid, 'follow_request', follow_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN new_status::text;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.follow_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.follow_user(uuid) TO authenticated;

-- ── 5. unfollow_user RPC ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.unfollow_user(_target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.follows WHERE follower_id = uid AND following_id = _target;
  -- Clean up follow notifications
  DELETE FROM public.notifications
  WHERE user_id = _target AND actor_id = uid
    AND type IN ('new_follower', 'follow_request');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.unfollow_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.unfollow_user(uuid) TO authenticated;

-- ── 6. accept_follow_request RPC ─────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_follow_request(_follower uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid       uuid := auth.uid();
  follow_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.follows SET status = 'accepted', updated_at = now()
  WHERE follower_id = _follower AND following_id = uid AND status = 'pending'
  RETURNING id INTO follow_id;

  IF follow_id IS NOT NULL THEN
    -- Notify follower their request was accepted
    INSERT INTO public.notifications (user_id, actor_id, type, entity_id)
    VALUES (_follower, uid, 'follow_accept', follow_id)
    ON CONFLICT DO NOTHING;
    -- Remove the pending follow_request notification
    DELETE FROM public.notifications
    WHERE user_id = uid AND actor_id = _follower AND type = 'follow_request';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_follow_request(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.accept_follow_request(uuid) TO authenticated;

-- ── 7. decline_follow_request RPC ────────────────────────────
CREATE OR REPLACE FUNCTION public.decline_follow_request(_follower uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.follows
  WHERE follower_id = _follower AND following_id = uid AND status = 'pending';
  DELETE FROM public.notifications
  WHERE user_id = uid AND actor_id = _follower AND type = 'follow_request';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decline_follow_request(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.decline_follow_request(uuid) TO authenticated;

-- ── 8. remove_follower RPC ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.remove_follower(_follower uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.follows
  WHERE follower_id = _follower AND following_id = uid;
  DELETE FROM public.notifications
  WHERE user_id = uid AND actor_id = _follower AND type = 'new_follower';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.remove_follower(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.remove_follower(uuid) TO authenticated;

-- ── 9. get_follow_counts RPC ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_follow_counts(_user_id uuid)
RETURNS TABLE(followers bigint, following bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.follows WHERE following_id = _user_id AND status = 'accepted'),
    (SELECT COUNT(*) FROM public.follows WHERE follower_id  = _user_id AND status = 'accepted');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_follow_counts(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_follow_counts(uuid) TO authenticated;

-- ── 10. get_follow_relationship RPC ──────────────────────────
-- Returns the follow status of current user → target, and target → current user
CREATE OR REPLACE FUNCTION public.get_follow_relationship(_target uuid)
RETURNS TABLE(
  i_follow text,           -- 'accepted' | 'pending' | 'none'
  they_follow text,        -- 'accepted' | 'pending' | 'none'
  is_mutual boolean,
  is_blocked boolean       -- either direction
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN QUERY
  SELECT
    COALESCE((SELECT status::text FROM public.follows WHERE follower_id = uid AND following_id = _target), 'none'),
    COALESCE((SELECT status::text FROM public.follows WHERE follower_id = _target AND following_id = uid), 'none'),
    EXISTS (
      SELECT 1 FROM public.follows a
      JOIN public.follows b ON a.follower_id = b.following_id AND a.following_id = b.follower_id
      WHERE a.follower_id = uid AND a.following_id = _target
        AND a.status = 'accepted' AND b.status = 'accepted'
    ),
    EXISTS (
      SELECT 1 FROM public.blocked_users
      WHERE (blocker_id = uid AND blocked_id = _target)
         OR (blocker_id = _target AND blocked_id = uid)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_follow_relationship(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_follow_relationship(uuid) TO authenticated;

-- ── 11. get_followers RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_followers(_user_id uuid, _limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS TABLE(
  id uuid, username text, display_name text, avatar_url text,
  is_mutual boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.username, p.display_name, p.avatar_url,
    EXISTS (
      SELECT 1 FROM public.follows back
      WHERE back.follower_id = _user_id AND back.following_id = f.follower_id AND back.status = 'accepted'
    ) AS is_mutual
  FROM public.follows f
  JOIN public.profiles p ON p.id = f.follower_id
  WHERE f.following_id = _user_id AND f.status = 'accepted'
  ORDER BY f.created_at DESC
  LIMIT _limit OFFSET _offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_followers(uuid, int, int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_followers(uuid, int, int) TO authenticated;

-- ── 12. get_following RPC ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_following(_user_id uuid, _limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS TABLE(
  id uuid, username text, display_name text, avatar_url text,
  is_mutual boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.username, p.display_name, p.avatar_url,
    EXISTS (
      SELECT 1 FROM public.follows back
      WHERE back.follower_id = p.id AND back.following_id = _user_id AND back.status = 'accepted'
    ) AS is_mutual
  FROM public.follows f
  JOIN public.profiles p ON p.id = f.following_id
  WHERE f.follower_id = _user_id AND f.status = 'accepted'
  ORDER BY f.created_at DESC
  LIMIT _limit OFFSET _offset;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_following(uuid, int, int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_following(uuid, int, int) TO authenticated;

-- ── 13. get_follow_requests RPC ───────────────────────────────
CREATE OR REPLACE FUNCTION public.get_follow_requests()
RETURNS TABLE(id uuid, username text, display_name text, avatar_url text, requested_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.display_name, p.avatar_url, f.created_at
  FROM public.follows f
  JOIN public.profiles p ON p.id = f.follower_id
  WHERE f.following_id = uid AND f.status = 'pending'
  ORDER BY f.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_follow_requests() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_follow_requests() TO authenticated;

-- ── 14. search_users RPC ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.search_users(_query text, _limit int DEFAULT 20)
RETURNS TABLE(
  id uuid, username text, display_name text, avatar_url text,
  is_private boolean, follow_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.username, p.display_name, p.avatar_url, p.is_private,
    COALESCE((SELECT f.status::text FROM public.follows f WHERE f.follower_id = uid AND f.following_id = p.id), 'none')
  FROM public.profiles p
  WHERE p.id <> uid
    AND (
      p.username ILIKE '%' || _query || '%'
      OR p.display_name ILIKE '%' || _query || '%'
    )
    -- Exclude blocked users (either direction)
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_id = uid AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = uid)
    )
  ORDER BY
    CASE WHEN lower(p.username) = lower(_query) THEN 0 ELSE 1 END,
    p.username
  LIMIT _limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.search_users(text, int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.search_users(text, int) TO authenticated;

-- ── 15. get_suggested_users RPC ───────────────────────────────
-- Returns users NOT yet followed, ordered by mutual follower overlap
CREATE OR REPLACE FUNCTION public.get_suggested_users(_limit int DEFAULT 10)
RETURNS TABLE(
  id uuid, username text, display_name text, avatar_url text,
  is_private boolean, mutual_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  RETURN QUERY
  SELECT
    p.id, p.username, p.display_name, p.avatar_url, p.is_private,
    -- Count how many people I follow also follow this person
    (
      SELECT COUNT(*) FROM public.follows m
      WHERE m.following_id = p.id AND m.status = 'accepted'
        AND EXISTS (
          SELECT 1 FROM public.follows me
          WHERE me.follower_id = uid AND me.following_id = m.follower_id AND me.status = 'accepted'
        )
    ) AS mutual_count
  FROM public.profiles p
  WHERE p.id <> uid
    -- Not already following or requested
    AND NOT EXISTS (
      SELECT 1 FROM public.follows f WHERE f.follower_id = uid AND f.following_id = p.id
    )
    -- Not blocked
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_id = uid AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = uid)
    )
  ORDER BY mutual_count DESC, p.created_at DESC
  LIMIT _limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_suggested_users(int) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_suggested_users(int) TO authenticated;

-- ── 16. mark_notifications_read RPC ──────────────────────────
CREATE OR REPLACE FUNCTION public.mark_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications SET read = true WHERE user_id = auth.uid() AND read = false;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_notifications_read() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.mark_notifications_read() TO authenticated;
