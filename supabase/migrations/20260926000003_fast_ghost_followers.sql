-- ─── fast_ghost_followers(p_official_id, p_batch_size) ───────────────────────
-- Inserts a batch of ghost followers for @chatfaa_official.
--
-- Ghost accounts: auth.users row + profiles row + follows row.
-- is_seed_user = true.  No posts, no reels.
--
-- Performance design — three bulk statements per call:
--
--   Problem: on_auth_user_created fires once per auth.users INSERT (~16 ms/row).
--   At 5 000 rows that costs ~80 s — guaranteed timeout.
--
--   Solution: patch handle_new_user() to short-circuit for ghost rows
--   (raw_user_meta_data->>'is_ghost' = 'true'). Ghost profiles are created
--   by this function instead. The trigger stays active but becomes a no-op
--   for ghost inserts, so the bulk auth.users INSERT finishes in < 1 s.
--
--   The patch to handle_new_user is included at the bottom of this file.
--   Apply the whole file once in the SQL Editor; after that 5 000-row calls
--   complete in 2–4 s with zero per-row trigger overhead for ghost rows.
--
-- Username: 'gh_' + substr(replace(id::text,'-',''), 1, 17) = exactly 20 chars.
--   Derived from the row's own UUID — guaranteed unique.
--   Satisfies CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$').
--
-- All inserts use ON CONFLICT DO NOTHING / DO UPDATE — idempotent, re-run safe.
--
-- Parameters:
--   p_official_id  UUID  — profile id of @chatfaa_official
--   p_batch_size   INT   — rows per call (5 000 recommended)
--
-- Returns: INT — follow rows actually inserted this call
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fast_ghost_followers(
  p_official_id UUID,
  p_batch_size  INT DEFAULT 5000
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_inserted INT := 0;
BEGIN
  WITH
  -- Step 1: generate p_batch_size UUIDs + random age
  generated AS (
    SELECT
      gen_random_uuid()                    AS uid,
      (floor(random() * 730) + 1)::int     AS cdays
    FROM generate_series(1, p_batch_size)
  ),

  -- Step 2: bulk-insert auth.users
  -- handle_new_user now skips ghost rows (is_ghost=true), so no per-row
  -- profile INSERT fires — this statement completes in < 1 s for 5 000 rows.
  auth_ins AS (
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    )
    SELECT
      g.uid,
      'gh_' || substr(replace(g.uid::text, '-', ''), 1, 17) || '@ghost.chatfaa.internal',
      '',
      now() - (g.cdays || ' days')::interval,
      now() - (g.cdays || ' days')::interval,
      now() - (g.cdays || ' days')::interval,
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('is_seed', true, 'is_ghost', true),
      false,
      'authenticated'
    FROM generated g
    ON CONFLICT DO NOTHING
    RETURNING id, created_at
  ),

  -- Step 3: bulk-insert profiles (trigger skipped these; we create them here)
  profile_ins AS (
    INSERT INTO public.profiles (
      id, username, display_name, bio, avatar_url,
      is_seed_user, is_verified, account_type,
      status, last_seen, created_at
    )
    SELECT
      a.id,
      'gh_' || substr(replace(a.id::text, '-', ''), 1, 17),
      NULL, NULL, NULL,
      true, false, 'personal', 'offline',
      now() - ((floor(random() * 365))::text || ' days')::interval,
      a.created_at
    FROM auth_ins a
    ON CONFLICT (id) DO UPDATE
      SET username     = EXCLUDED.username,
          is_seed_user = true,
          account_type = 'personal',
          status       = 'offline'
    RETURNING id
  ),

  -- Step 4: bulk-insert follows ghost → official
  follow_ins AS (
    INSERT INTO public.follows (
      id, follower_id, following_id, status, created_at
    )
    SELECT
      gen_random_uuid(),
      p.id,
      p_official_id,
      'accepted',
      now() - ((floor(random() * 730) + 1)::text || ' days')::interval
    FROM profile_ins p
    ON CONFLICT DO NOTHING
    RETURNING id
  )

  SELECT count(*)::int INTO v_inserted FROM follow_ins;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fast_ghost_followers(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fast_ghost_followers(UUID, INT) TO service_role;


-- ─── Patch handle_new_user() to skip ghost rows ───────────────────────────────
-- Ghost rows have raw_user_meta_data->>'is_ghost' = 'true'.
-- fast_ghost_followers() inserts profiles directly; the trigger must not
-- also try to create a profile for the same row (that causes the per-row
-- overhead that kills large batches).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uname TEXT;
BEGIN
  -- Ghost rows are seeded directly by fast_ghost_followers(); skip them here
  -- to avoid the per-row profile INSERT overhead during bulk ghost seeding.
  IF (NEW.raw_user_meta_data->>'is_ghost')::boolean IS TRUE THEN
    RETURN NEW;
  END IF;

  uname := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
  INSERT INTO public.profiles (id, username, display_name, email)
  VALUES (
    NEW.id,
    uname,
    COALESCE(NEW.raw_user_meta_data->>'display_name', uname),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  RETURN NEW;
END;
$$;


-- ─── add_official_following(p_official_id, p_count) ───────────────────────────
-- Makes @chatfaa_official follow up to p_count existing seed users it doesn't
-- already follow.
-- Returns: INT — follow rows inserted
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.add_official_following(
  p_official_id UUID,
  p_count       INT DEFAULT 3654
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_inserted INT := 0;
BEGIN
  WITH
  candidates AS (
    SELECT id
    FROM public.profiles
    WHERE is_seed_user = true
      AND id <> p_official_id
      AND NOT EXISTS (
        SELECT 1 FROM public.follows
        WHERE follower_id  = p_official_id
          AND following_id = public.profiles.id
      )
    ORDER BY random()
    LIMIT p_count
  ),
  ins AS (
    INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
    SELECT
      gen_random_uuid(),
      p_official_id,
      c.id,
      'accepted',
      now() - ((floor(random() * 365) + 1)::text || ' days')::interval
    FROM candidates c
    ON CONFLICT DO NOTHING
    RETURNING id
  )
  SELECT count(*)::int INTO v_inserted FROM ins;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_official_following(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_official_following(UUID, INT) TO service_role;
