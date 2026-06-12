-- Returns the email for a given username so the client can sign in with email+password
-- SECURITY DEFINER so it can read auth.users without exposing the table directly
CREATE OR REPLACE FUNCTION public.get_email_by_username(_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT au.email INTO _email
  FROM public.profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE lower(p.username) = lower(trim(_username))
  LIMIT 1;

  RETURN _email;  -- returns NULL if not found
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_email_by_username(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated;
