
-- 1) Friendships: split the over-broad UPDATE policy.
DROP POLICY IF EXISTS "Update friendship as receiver or sender" ON public.friendships;

-- Only the receiver may change the status (accept/reject) of a pending request,
-- and they cannot reassign sender_id/receiver_id.
CREATE POLICY "Receiver can respond to friend request"
ON public.friendships
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (
  auth.uid() = receiver_id
  AND sender_id = (SELECT f.sender_id FROM public.friendships f WHERE f.id = friendships.id)
  AND receiver_id = (SELECT f.receiver_id FROM public.friendships f WHERE f.id = friendships.id)
);

-- 2) Realtime: require authentication to subscribe to any channel.
-- Postgres change events still flow through table RLS, so per-row access is
-- already enforced. This closes the unauthenticated subscribe gap.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read realtime" ON realtime.messages;
CREATE POLICY "Authenticated can read realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated can write realtime" ON realtime.messages;
CREATE POLICY "Authenticated can write realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
