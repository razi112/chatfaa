-- ─── Fix: get_follow_counts visible to unauthenticated users ─────────────────
--
-- Problem:
--   get_follow_counts was REVOKE'd from anon, so the published app shows 0
--   followers when the profile page loads before the auth session hydrates.
--   The React Query cache locks in that 0 and never re-fetches once logged in
--   because the query key didn't include the auth state.
--
-- Fix (DB side):
--   Grant EXECUTE to anon.  The function is SECURITY DEFINER — it runs as its
--   owner (postgres) and only returns two aggregate counts.  No private data
--   is exposed.  Follower/following counts are public on every social platform.
--
-- The companion fix (JS side) is in src/hooks/use-follow.tsx:
--   Add the auth user-id to the query key so the query re-runs once the
--   session resolves, and remove the `retry: false` cap so a transient
--   auth-timing failure retries automatically.
-- ─────────────────────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.get_follow_counts(uuid) TO anon;

-- Same treatment for get_follow_relationship — it already requires auth.uid()
-- internally so anon callers will just get a safe empty result, but granting
-- prevents a noisy 42501 error in the client console.
-- (It raises "Not authenticated" instead of permission denied, which the hook
--  already handles gracefully.)
GRANT EXECUTE ON FUNCTION public.get_follow_relationship(uuid) TO anon;
