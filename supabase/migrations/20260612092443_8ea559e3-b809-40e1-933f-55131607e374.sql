
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

-- 2) Realtime channel access is controlled by Supabase internally.
-- The realtime.messages table is owned by Supabase and cannot have
-- user-defined RLS policies applied to it (results in 42501).
-- Per-row access to realtime events is already enforced by the RLS
-- policies on the underlying public.* tables (posts, messages, etc.).
