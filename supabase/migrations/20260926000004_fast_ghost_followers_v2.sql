-- fast_ghost_followers v2
-- Fix: insert ghost username into raw_user_meta_data so the trigger uses it
-- directly. Row-by-row inserts (100 per sub-batch) give each trigger its own
-- statement snapshot, eliminating the within-CTE CHECK-constraint race.

-- 1. Patch handle_new_user to be idempotent and use the passed username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uname TEXT;
BEGIN
  uname := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
  );
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    uname,
    COALESCE(NEW.raw_user_meta_data->>'display_name', uname),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE
    SET email        = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name);
  RETURN NEW;
END;
$$;

-- 2. Replace fast_ghost_followers with a row-by-row version
-- Username: 'g' + 15 hex chars = 16 chars, satisfies ^[a-zA-Z0-9_]{3,20}$
CREATE OR REPLACE FUNCTION public.fast_ghost_followers(
  p_official_id UUID,
  p_batch_size  INT DEFAULT 1000
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_inserted INT := 0;
  v_uid      UUID;
  v_uname    TEXT;
  v_days     INT;
  v_i        INT;
BEGIN
  FOR v_i IN 1 .. p_batch_size LOOP
    v_uid   := gen_random_uuid();
    v_uname := 'g' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 15);
    v_days  := (floor(random() * 730) + 1)::int;

    -- Insert auth row; trigger creates profile with v_uname via raw_user_meta_data
    INSERT INTO auth.users (
      id, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    ) VALUES (
      v_uid,
      v_uname || '@ghost.chatfaa.internal',
      '',
      now() - (v_days || ' days')::interval,
      now() - (v_days || ' days')::interval,
      now() - (v_days || ' days')::interval,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('is_seed', true, 'is_ghost', true, 'username', v_uname),
      false,
      'authenticated'
    )
    ON CONFLICT DO NOTHING;

    -- Insert follow only if profile landed
    INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
    SELECT gen_random_uuid(), v_uid, p_official_id, 'accepted',
           now() - (v_days || ' days')::interval
    WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid)
    ON CONFLICT DO NOTHING;

    IF FOUND THEN v_inserted := v_inserted + 1; END IF;
  END LOOP;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fast_ghost_followers(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fast_ghost_followers(UUID, INT) TO service_role;
