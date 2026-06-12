-- ──────────────────────────────────────────────────────────────
-- blocked_users table
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT no_self_block CHECK (blocker_id <> blocked_id)
);

CREATE INDEX blocked_users_blocker_idx ON public.blocked_users(blocker_id);
CREATE INDEX blocked_users_blocked_idx ON public.blocked_users(blocked_id);

GRANT SELECT, INSERT, DELETE ON public.blocked_users TO authenticated;
GRANT ALL ON public.blocked_users TO service_role;

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own block list"
  ON public.blocked_users FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON public.blocked_users FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_users;

-- ──────────────────────────────────────────────────────────────
-- clear_dm_chat: deletes all messages in a DM thread for the caller only
-- (soft clear from their perspective — deletes messages where they are sender or receiver)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.clear_dm_chat(_other_user uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  -- Delete all messages in the thread (both directions)
  DELETE FROM public.messages
  WHERE (sender_id = uid AND receiver_id = _other_user)
     OR (sender_id = _other_user AND receiver_id = uid);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.clear_dm_chat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_dm_chat(uuid) TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- block_and_unfriend: blocks a user and removes the friendship
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.block_user(_target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  -- Insert block (ignore if already blocked)
  INSERT INTO public.blocked_users (blocker_id, blocked_id)
  VALUES (uid, _target)
  ON CONFLICT DO NOTHING;
  -- Remove any friendship in either direction
  DELETE FROM public.friendships
  WHERE (sender_id = uid AND receiver_id = _target)
     OR (sender_id = _target AND receiver_id = uid);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.block_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_user(uuid) TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- unblock_user
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.unblock_user(_target uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM public.blocked_users WHERE blocker_id = uid AND blocked_id = _target;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.unblock_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unblock_user(uuid) TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- clear_group_chat: admins can clear all group messages
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.clear_group_chat(_group_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_group_admin(_group_id, uid) THEN
    RAISE EXCEPTION 'Only admins can clear group chat';
  END IF;
  DELETE FROM public.group_messages WHERE group_id = _group_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.clear_group_chat(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.clear_group_chat(uuid) TO authenticated;
