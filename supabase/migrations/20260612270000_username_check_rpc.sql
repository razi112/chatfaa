-- ──────────────────────────────────────────────────────────────
-- RPC: check_username_exists(_username text) → boolean
-- Used by the live username-availability badge on the auth page.
-- SECURITY DEFINER so anon can check without RLS getting in the way.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_username_exists(_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE lower(username) = lower(trim(_username))
    LIMIT 1
  );
END;
$$;

-- Grant access to both anon (pre-login check) and authenticated users
REVOKE EXECUTE ON FUNCTION public.check_username_exists(text) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.check_username_exists(text) TO anon, authenticated;
