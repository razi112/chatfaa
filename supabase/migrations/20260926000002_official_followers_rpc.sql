-- ─── generate_official_followers(target, following_count) ────────────────────
-- Creates ghost follower accounts for @chatfaa_official entirely inside the DB.
-- Ghost accounts: auth.users row + profiles row + follows row.
-- No posts, no reels. is_seed_user = true, raw_user_meta_data->is_ghost = true.
--
-- Parameters:
--   target          INT  — total follower target (default 1,000,000)
--   following_count INT  — how many accounts official should follow (default 3654)
--
-- Returns: JSONB with final follower/following counts and rows inserted.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_official_followers(
  target          INT DEFAULT 1000000,
  following_count INT DEFAULT 3654
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_official_id     UUID;
  v_current_followers BIGINT;
  v_current_following BIGINT;
  v_need_followers  BIGINT;
  v_need_following  BIGINT;
  v_uid             UUID;
  v_username        TEXT;
  v_fn              TEXT;
  v_ln              TEXT;
  v_fn_part         TEXT;
  v_ln_part         TEXT;
  i                 BIGINT;
  v_follows_inserted BIGINT := 0;
  v_profiles_inserted BIGINT := 0;
  v_following_inserted BIGINT := 0;

  first_names TEXT[] := ARRAY[
    'Alex','Jordan','Riley','Taylor','Morgan','Casey','Quinn','Avery','Jamie','Drew',
    'Blake','Sage','River','Harper','Nora','Felix','Luna','Leo','Nia','Kofi',
    'Layla','Tariq','Soren','Ingrid','Mei','Jin','Hana','Yuna','Priya','Omar',
    'Zara','Kenji','Mia','Chloe','Liam','Emma','Noah','Olivia','Aiden','Sofia',
    'Ethan','Ava','Lucas','Isabella','Mason','Amelia','Logan','Charlotte','Elijah','Mia',
    'Oliver','Harper','Jacob','Evelyn','William','Abigail','James','Emily','Benjamin','Elizabeth'
  ];
  last_names TEXT[] := ARRAY[
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Anderson',
    'Lee','Kim','Patel','Singh','Kumar','Nguyen','Okafor','Mensah','Andersen','Jensen',
    'Tanaka','Sato','Ito','Ahmed','Khan','Diallo','Hill','Green','Adams','Nelson',
    'Baker','Hall','Rivera','Mitchell','Carter','Roberts','Turner','Phillips','Campbell','Parker',
    'Evans','Edwards','Collins','Stewart','Morris','Rogers','Reed','Cook','Morgan','Bell'
  ];

  -- Pool of existing seed user IDs for the "following" selection
  v_seed_ids UUID[];
  v_follow_target UUID;
  v_already_following UUID[];

BEGIN
  -- ── Resolve @chatfaa_official ──────────────────────────────────────────────
  SELECT id INTO v_official_id FROM public.profiles WHERE username = 'chatfaa_official';
  IF v_official_id IS NULL THEN
    RAISE EXCEPTION '@chatfaa_official not found — run generate_seed_data() first';
  END IF;

  -- ── Current counts ─────────────────────────────────────────────────────────
  SELECT count(*) INTO v_current_followers
    FROM public.follows WHERE following_id = v_official_id;

  SELECT count(*) INTO v_current_following
    FROM public.follows WHERE follower_id = v_official_id;

  v_need_followers := GREATEST(0, target - v_current_followers);
  v_need_following := GREATEST(0, following_count - v_current_following);

  -- ── 1. Create ghost follower accounts ─────────────────────────────────────
  FOR i IN 1..v_need_followers LOOP
    v_uid     := gen_random_uuid();
    v_fn      := first_names[1 + floor(random() * array_length(first_names,1))::int];
    v_ln      := last_names [1 + floor(random() * array_length(last_names ,1))::int];
    v_fn_part := left(lower(regexp_replace(v_fn,'[^a-z0-9]','')),5);
    v_ln_part := left(lower(regexp_replace(v_ln,'[^a-z0-9]','')),5);
    v_username := v_fn_part || '_' || v_ln_part || (10000 + floor(random()*89999)::int)::text;

    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
      v_username := v_fn_part || '_' || v_ln_part || (100000 + floor(random()*899999)::int)::text;
    END LOOP;

    -- auth.users row
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    ) VALUES (
      v_uid,
      v_username || '@ghost.chatfaa.internal',
      '',
      now() - ((floor(random()*730)+1)::text||' days')::interval,
      now() - ((floor(random()*730)+1)::text||' days')::interval,
      now() - ((floor(random()*730)+1)::text||' days')::interval,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"is_seed":true,"is_ghost":true}'::jsonb,
      false, 'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    -- profile row (upsert over trigger-created stub)
    BEGIN
      INSERT INTO public.profiles (
        id, username, display_name, bio, avatar_url,
        is_seed_user, is_verified, account_type,
        status, last_seen, created_at
      ) VALUES (
        v_uid,
        v_username,
        v_fn || ' ' || v_ln,
        NULL,
        'https://picsum.photos/seed/ghost' || i || '/150/150',
        true, false, 'personal',
        'offline',
        now() - ((floor(random()*365))::text||' days')::interval,
        now() - ((floor(random()*730)+1)::text||' days')::interval
      )
      ON CONFLICT (id) DO UPDATE
        SET username     = EXCLUDED.username,
            display_name = EXCLUDED.display_name,
            is_seed_user = true;

      v_profiles_inserted := v_profiles_inserted + 1;
    EXCEPTION WHEN unique_violation THEN
      NULL; -- skip on username collision
    END;

    -- follow row: ghost → official
    INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
    VALUES (
      gen_random_uuid(), v_uid, v_official_id, 'accepted',
      now() - ((floor(random()*730)+1)::text||' days')::interval
    )
    ON CONFLICT DO NOTHING;

    v_follows_inserted := v_follows_inserted + 1;
  END LOOP;

  -- ── 2. official → following v_need_following accounts ─────────────────────
  IF v_need_following > 0 THEN
    -- Collect existing seed user IDs (non-ghost, non-official)
    SELECT array_agg(id) INTO v_seed_ids
      FROM (
        SELECT id FROM public.profiles
        WHERE is_seed_user = true
          AND id <> v_official_id
        ORDER BY random()
        LIMIT GREATEST(v_need_following * 2, 500)
      ) sub;

    -- IDs official already follows
    SELECT array_agg(following_id) INTO v_already_following
      FROM public.follows WHERE follower_id = v_official_id;

    FOR i IN 1..LEAST(v_need_following, array_length(v_seed_ids,1)) LOOP
      v_follow_target := v_seed_ids[i];
      IF v_follow_target IS NOT NULL
         AND (v_already_following IS NULL OR NOT (v_follow_target = ANY(v_already_following)))
         AND v_follow_target <> v_official_id
      THEN
        INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
        VALUES (
          gen_random_uuid(), v_official_id, v_follow_target, 'accepted',
          now() - ((floor(random()*365)+1)::text||' days')::interval
        )
        ON CONFLICT DO NOTHING;
        v_following_inserted := v_following_inserted + 1;
      END IF;
    END LOOP;
  END IF;

  -- ── Final counts ───────────────────────────────────────────────────────────
  SELECT count(*) INTO v_current_followers FROM public.follows WHERE following_id = v_official_id;
  SELECT count(*) INTO v_current_following FROM public.follows WHERE follower_id  = v_official_id;

  RETURN jsonb_build_object(
    'profiles_created',  v_profiles_inserted,
    'follows_created',   v_follows_inserted,
    'following_created', v_following_inserted,
    'total_followers',   v_current_followers,
    'total_following',   v_current_following
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_official_followers(INT, INT) TO authenticated;
