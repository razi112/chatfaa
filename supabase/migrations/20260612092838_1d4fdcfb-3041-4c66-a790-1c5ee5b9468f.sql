
CREATE OR REPLACE FUNCTION public.create_group(_name text, _description text DEFAULT NULL)
RETURNS public.groups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  g public.groups;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF _name IS NULL OR length(btrim(_name)) = 0 THEN
    RAISE EXCEPTION 'Group name is required';
  END IF;

  INSERT INTO public.groups (name, description, created_by)
  VALUES (btrim(_name), NULLIF(btrim(coalesce(_description, '')), ''), uid)
  RETURNING * INTO g;

  RETURN g;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_group(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_group(text, text) TO authenticated;
