
CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count int;
  target_group uuid;
  was_admin boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_group := OLD.group_id;
    was_admin := OLD.role = 'admin';
  ELSIF TG_OP = 'UPDATE' THEN
    target_group := OLD.group_id;
    was_admin := OLD.role = 'admin' AND NEW.role <> 'admin';
  END IF;

  IF was_admin THEN
    SELECT COUNT(*) INTO admin_count
      FROM public.group_members
      WHERE group_id = target_group AND role = 'admin';
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove or demote the last admin of the group';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS group_members_protect_last_admin ON public.group_members;
CREATE TRIGGER group_members_protect_last_admin
BEFORE UPDATE OR DELETE ON public.group_members
FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();
