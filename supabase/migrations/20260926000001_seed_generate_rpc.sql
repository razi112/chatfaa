-- ─── generate_seed_data() ─────────────────────────────────────────────────────
-- Server-side seed generation that runs entirely inside the DB.
-- Inserts auth.users rows first (satisfying the FK), then profiles + content.
-- Called by the CLI script and the admin UI.
--
-- Parameters:
--   target_users  INT  — number of synthetic profiles to create (default 2000)
--
-- Returns: JSONB summary of inserted row counts.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_seed_data(target_users INT DEFAULT 2000)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- counters
  v_profiles_inserted   INT := 0;
  v_follows_inserted    INT := 0;
  v_posts_inserted      INT := 0;
  v_post_likes          INT := 0;
  v_post_comments       INT := 0;
  v_reels_inserted      INT := 0;
  v_reel_likes          INT := 0;
  v_reel_comments       INT := 0;

  -- @chatfaa_official
  v_official_id   UUID;
  v_existing_id   UUID;

  -- loop vars
  i                INT;
  j                INT;
  v_uid            UUID;
  v_username       TEXT;
  v_display        TEXT;
  v_bio            TEXT;
  v_post_id        UUID;
  v_reel_id        UUID;

  -- data pools
  first_names TEXT[] := ARRAY[
    'Alex','Jordan','Riley','Taylor','Morgan','Casey','Quinn','Avery','Jamie','Drew',
    'Blake','Cameron','Hayden','Reese','Skylar','Peyton','Logan','Parker','Emerson','Dakota',
    'Sage','River','Rowan','Finley','Harper','Elliot','Kendall','Sloane','Aria','Mia',
    'Liam','Noah','Emma','Olivia','Lucas','Mason','Chloe','Isabella','Ethan','Aiden',
    'Amara','Zara','Priya','Anaya','Kenji','Yuki','Fatima','Omar','Khalid','Aisha',
    'Caden','Nora','Stella','Felix','Oscar','Luna','Iris','Theo','Leo','Nia',
    'Kofi','Yusuf','Layla','Rania','Tariq','Amani','Soren','Ingrid','Henrik','Astrid',
    'Lars','Freya','Magnus','Mei','Jin','Hana','Suki','Takeshi','Hiroshi','Yuna'
  ];
  last_names TEXT[] := ARRAY[
    'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Anderson',
    'Martinez','Taylor','Thomas','Moore','Jackson','Martin','Lee','Perez','White','Harris',
    'Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright',
    'Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall',
    'Ahmed','Khan','Patel','Singh','Kumar','Sharma','Gupta','Rao','Nair','Pillai',
    'Kimura','Tanaka','Watanabe','Sato','Suzuki','Ito','Kobayashi','Yamamoto','Nakamura','Abe',
    'Okafor','Mensah','Diallo','Traore','Coulibaly','Toure','Camara','Bah','Sy','Fall',
    'Andersen','Jensen','Nielsen','Hansen','Pedersen','Christensen','Larsen','Sorensen','Rasmussen','Jorgensen'
  ];
  bios TEXT[] := ARRAY[
    'just a soul wandering through pixels 🌊',
    'coffee first, everything else second ☕',
    'creating things that don''t exist yet 🛠️',
    'life is short. eat the cake 🍰',
    'between adventures 🏔️',
    'making memories, not excuses ✨',
    'photographer by day, dreamer by night 📷',
    'chasing sunsets and good vibes 🌅',
    'fitness enthusiast | food lover | world traveler 🌍',
    'turning ideas into reality 💡',
    'plant mom 🌿 | book nerd 📚 | cat person 🐱',
    'building stuff that matters ⚡',
    'born to explore, forced to work 😄',
    'living my best pixel life 🎨',
    'music is life 🎵 everything else is details',
    'not all who wander are lost ✈️',
    'making the world a slightly better place 🌱',
    'here for the vibes and the snacks 🍕',
    'probably overthinking this bio 🤔',
    'design is how it works 🎯',
    'good food, good friends, good life 🥂',
    'storyteller. observer. human. 📝',
    'less talking, more doing 🚀',
    'finding beauty in the ordinary 🌸',
    'living one adventure at a time 🎒'
  ];
  interests TEXT[] := ARRAY[
    'photography','travel','cooking','fitness','music','art','tech','gaming',
    'fashion','reading','hiking','yoga','coffee','design','writing','movies',
    'dancing','cycling','swimming','climbing','sustainability','mindfulness',
    'DIY','astronomy','botany','poetry','theater','animation','podcasting'
  ];
  captions TEXT[] := ARRAY[
    'Golden hour never disappoints ✨',
    'This view though 🌅',
    'Good vibes only 🌊',
    'Found my happy place 🌿',
    'Making every moment count 💫',
    'The adventure continues 🏔️',
    'Sunday mood 🌸',
    'Life is too short for bad coffee ☕',
    'Catching feels and sunsets 🌄',
    'Not all classrooms have four walls 🌍',
    'Just breathe 🍃',
    'Working on something special 🛠️',
    'Details make the difference 🎯',
    'Every day is a new beginning 🌱',
    'The world is your canvas 🎨',
    'Grateful for this view 🙏',
    'No filter needed today 📸',
    'Living for moments like this 🤍',
    'Sometimes you just need to step outside 🌲',
    'Creating > consuming 💡'
  ];
  reel_caps TEXT[] := ARRAY[
    'POV: you finally got outside today 🌿',
    'this is your sign to take the trip ✈️',
    'day in my life ☀️',
    'things that just make sense 🧠',
    'small moments, big memories 💛',
    'not all heroes wear capes 🦸',
    'we love a good transformation 🔄',
    'when it all clicks 🎯',
    'vibes only from here on out 🌊',
    'the process is part of the art 🎨'
  ];
  comment_pool TEXT[] := ARRAY[
    'this is so good 🔥','absolutely stunning ✨','goals 🙌','love this so much 💕',
    'okay but wow 😍','need this in my life','incredible work 👏','this made my day 😊',
    'pure art 🎨','obsessed with this','the vibes are immaculate 🌊','you are so talented',
    'can''t stop looking at this','this is everything','sending you love 💛','wow just wow',
    '10/10 no notes','I feel this deeply 🙏','literally my aesthetic','this hits different'
  ];

  -- temp storage
  v_seed_ids        UUID[];
  v_post_ids        UUID[];
  v_reel_ids        UUID[];
  v_fn              TEXT;
  v_ln              TEXT;
  v_num_posts       INT;
  v_num_follows     INT;
  v_follow_target   UUID;
  v_liker           UUID;
  v_commenter       UUID;
  v_account_type    TEXT;
  v_is_verified     BOOLEAN;
  v_created_ago     INTERVAL;
  v_reel_url        TEXT := 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

BEGIN
  -- ── 1. @chatfaa_official ────────────────────────────────────────────────────
  SELECT id INTO v_existing_id FROM public.profiles WHERE username = 'chatfaa_official';

  IF v_existing_id IS NOT NULL THEN
    v_official_id := v_existing_id;
    UPDATE public.profiles
      SET is_verified = true, is_manually_verified = true
      WHERE id = v_official_id;
  ELSE
    v_official_id := gen_random_uuid();

    -- Create auth.users row first (required by FK)
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    ) VALUES (
      v_official_id,
      'chatfaa_official@seed.chatfaa.internal',
      '', -- no real password — cannot log in
      now(),
      now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"is_seed":true}'::jsonb,
      false,
      'authenticated'
    );

    INSERT INTO public.profiles (
      id, username, display_name, bio, avatar_url,
      is_verified, is_manually_verified, is_seed_user,
      account_type, status, last_seen, created_at
    ) VALUES (
      v_official_id,
      'chatfaa_official',
      'Chatfaa',
      'The official Chatfaa account 🚀 Connect, share, and express yourself.',
      'https://picsum.photos/seed/chatfaa_official/150/150',
      true, true, false,  -- not flagged as seed — it's the official account
      'business', 'online', now(), now()
    );
  END IF;

  -- ── 2. Seed profiles ────────────────────────────────────────────────────────
  v_seed_ids := ARRAY[]::UUID[];

  FOR i IN 1..target_users LOOP
    v_uid   := gen_random_uuid();
    v_fn    := first_names[1 + floor(random() * array_length(first_names,1))::int];
    v_ln    := last_names [1 + floor(random() * array_length(last_names ,1))::int];

    -- Build a unique username: firstname + lastname + random suffix
    v_username := lower(v_fn) || lower(v_ln) || (100 + floor(random()*8900)::int)::text;
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
      v_username := lower(v_fn) || lower(v_ln) || (1000 + floor(random()*89000)::int)::text;
    END LOOP;

    v_display      := v_fn || ' ' || v_ln;
    v_bio          := bios[1 + floor(random() * array_length(bios,1))::int]
                      || ' | '
                      || interests[1 + floor(random() * array_length(interests,1))::int]
                      || ' • '
                      || interests[1 + floor(random() * array_length(interests,1))::int];
    v_created_ago  := ((floor(random()*180)+1)::text || ' days')::interval;
    v_is_verified  := random() < 0.03;
    v_account_type := CASE
      WHEN random() < 0.15 THEN 'creator'
      WHEN random() < 0.05 THEN 'business'
      ELSE 'personal'
    END;

    -- auth.users row (no real password, cannot log in)
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role
    ) VALUES (
      v_uid,
      v_username || '@seed.chatfaa.internal',
      '',
      now() - v_created_ago,
      now() - v_created_ago,
      now() - v_created_ago,
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"is_seed":true}'::jsonb,
      false,
      'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;

    -- profile row — skip silently on any conflict
    BEGIN
      INSERT INTO public.profiles (
        id, username, display_name, bio, avatar_url,
        is_seed_user, is_verified, account_type,
        status, last_seen, created_at
      ) VALUES (
        v_uid,
        v_username,
        v_display,
        left(v_bio, 150),
        'https://picsum.photos/seed/user' || i || '/150/150',
        true,
        v_is_verified,
        v_account_type,
        'offline',
        now() - ((floor(random()*30))::text || ' days')::interval,
        now() - v_created_ago
      );
      v_seed_ids := array_append(v_seed_ids, v_uid);
      v_profiles_inserted := v_profiles_inserted + 1;
    EXCEPTION WHEN unique_violation THEN
      -- skip this user if id or username collides
      NULL;
    END;

    v_seed_ids := array_append(v_seed_ids, v_uid);
    v_profiles_inserted := v_profiles_inserted + 1;
  END LOOP;

  -- ── 3. All seed users follow @chatfaa_official ───────────────────────────────
  FOREACH v_uid IN ARRAY v_seed_ids LOOP
    INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
    VALUES (
      gen_random_uuid(), v_uid, v_official_id, 'accepted',
      now() - ((floor(random()*120)+1)::text || ' days')::interval
    )
    ON CONFLICT DO NOTHING;
    v_follows_inserted := v_follows_inserted + 1;
  END LOOP;

  -- ── 4. Cross-follows (each user follows ~10–40 others) ─────────────────────
  FOREACH v_uid IN ARRAY v_seed_ids LOOP
    v_num_follows := 10 + floor(random()*30)::int;
    FOR j IN 1..v_num_follows LOOP
      v_follow_target := v_seed_ids[1 + floor(random() * array_length(v_seed_ids,1))::int];
      IF v_follow_target <> v_uid THEN
        INSERT INTO public.follows (id, follower_id, following_id, status, created_at)
        VALUES (
          gen_random_uuid(), v_uid, v_follow_target, 'accepted',
          now() - ((floor(random()*90)+1)::text || ' days')::interval
        )
        ON CONFLICT DO NOTHING;
        v_follows_inserted := v_follows_inserted + 1;
      END IF;
    END LOOP;
  END LOOP;

  -- ── 5. Posts (1–4 per user) ──────────────────────────────────────────────────
  v_post_ids := ARRAY[]::UUID[];
  FOR i IN 1..array_length(v_seed_ids,1) LOOP
    v_uid       := v_seed_ids[i];
    v_num_posts := 1 + floor(random()*3)::int;
    FOR j IN 1..v_num_posts LOOP
      v_post_id := gen_random_uuid();
      INSERT INTO public.posts (id, user_id, image_url, caption, created_at)
      VALUES (
        v_post_id,
        v_uid,
        CASE WHEN random() < 0.85
          THEN 'https://picsum.photos/seed/post' || (i*10+j) || '/800/1000'
          ELSE NULL
        END,
        captions[1 + floor(random() * array_length(captions,1))::int],
        now() - ((floor(random()*90))::text || ' days')::interval
      );
      v_post_ids   := array_append(v_post_ids, v_post_id);
      v_posts_inserted := v_posts_inserted + 1;
    END LOOP;
  END LOOP;

  -- ── 6. Post likes (sample ~3000 posts, 2–20 likers each) ─────────────────────
  FOR i IN 1..LEAST(array_length(v_post_ids,1), 3000) LOOP
    v_post_id := v_post_ids[1 + floor(random() * array_length(v_post_ids,1))::int];
    FOR j IN 1..(2 + floor(random()*18)::int) LOOP
      v_liker := v_seed_ids[1 + floor(random() * array_length(v_seed_ids,1))::int];
      INSERT INTO public.post_likes (post_id, user_id, created_at)
      VALUES (
        v_post_id, v_liker,
        now() - ((floor(random()*60))::text || ' days')::interval
      )
      ON CONFLICT DO NOTHING;
      v_post_likes := v_post_likes + 1;
    END LOOP;
  END LOOP;

  -- ── 7. Post comments (sample ~1500 posts, 1–5 comments each) ─────────────────
  FOR i IN 1..LEAST(array_length(v_post_ids,1), 1500) LOOP
    v_post_id := v_post_ids[1 + floor(random() * array_length(v_post_ids,1))::int];
    FOR j IN 1..(1 + floor(random()*4)::int) LOOP
      v_commenter := v_seed_ids[1 + floor(random() * array_length(v_seed_ids,1))::int];
      INSERT INTO public.post_comments (id, post_id, user_id, content, created_at)
      VALUES (
        gen_random_uuid(),
        v_post_id,
        v_commenter,
        comment_pool[1 + floor(random() * array_length(comment_pool,1))::int],
        now() - ((floor(random()*45))::text || ' days')::interval
      );
      v_post_comments := v_post_comments + 1;
    END LOOP;
  END LOOP;

  -- ── 8. Reels (~40% of users, 1–2 each) ───────────────────────────────────────
  v_reel_ids := ARRAY[]::UUID[];
  FOR i IN 1..array_length(v_seed_ids,1) LOOP
    IF random() < 0.4 THEN
      v_uid := v_seed_ids[i];
      FOR j IN 1..(1 + floor(random()*1)::int) LOOP
        v_reel_id := gen_random_uuid();
        INSERT INTO public.reels (id, user_id, video_url, thumbnail_url, caption, created_at)
        VALUES (
          v_reel_id, v_uid, v_reel_url,
          'https://picsum.photos/seed/reel' || (i*5+j) || '/800/1400',
          reel_caps[1 + floor(random() * array_length(reel_caps,1))::int],
          now() - ((floor(random()*60))::text || ' days')::interval
        );
        v_reel_ids       := array_append(v_reel_ids, v_reel_id);
        v_reels_inserted := v_reels_inserted + 1;
      END LOOP;
    END IF;
  END LOOP;

  -- ── 9. Reel likes ─────────────────────────────────────────────────────────────
  IF array_length(v_reel_ids,1) IS NOT NULL THEN
    FOR i IN 1..LEAST(array_length(v_reel_ids,1), 800) LOOP
      v_reel_id := v_reel_ids[1 + floor(random() * array_length(v_reel_ids,1))::int];
      FOR j IN 1..(3 + floor(random()*30)::int) LOOP
        v_liker := v_seed_ids[1 + floor(random() * array_length(v_seed_ids,1))::int];
        INSERT INTO public.reel_likes (reel_id, user_id, created_at)
        VALUES (
          v_reel_id, v_liker,
          now() - ((floor(random()*45))::text || ' days')::interval
        )
        ON CONFLICT DO NOTHING;
        v_reel_likes := v_reel_likes + 1;
      END LOOP;
    END LOOP;
  END IF;

  -- ── 10. Reel comments ─────────────────────────────────────────────────────────
  IF array_length(v_reel_ids,1) IS NOT NULL THEN
    FOR i IN 1..LEAST(array_length(v_reel_ids,1), 400) LOOP
      v_reel_id := v_reel_ids[1 + floor(random() * array_length(v_reel_ids,1))::int];
      FOR j IN 1..(1 + floor(random()*3)::int) LOOP
        v_commenter := v_seed_ids[1 + floor(random() * array_length(v_seed_ids,1))::int];
        INSERT INTO public.reel_comments (id, reel_id, user_id, content, created_at)
        VALUES (
          gen_random_uuid(),
          v_reel_id,
          v_commenter,
          comment_pool[1 + floor(random() * array_length(comment_pool,1))::int],
          now() - ((floor(random()*30))::text || ' days')::interval
        );
        v_reel_comments := v_reel_comments + 1;
      END LOOP;
    END LOOP;
  END IF;

  -- ── Return summary ────────────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'profiles',      v_profiles_inserted,
    'follows',       v_follows_inserted,
    'posts',         v_posts_inserted,
    'post_likes',    v_post_likes,
    'post_comments', v_post_comments,
    'reels',         v_reels_inserted,
    'reel_likes',    v_reel_likes,
    'reel_comments', v_reel_comments
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_seed_data(INT) TO authenticated;

-- ── Also update remove_seed_data to clean up auth.users rows ─────────────────
CREATE OR REPLACE FUNCTION public.remove_seed_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seed_ids UUID[];
BEGIN
  SELECT array_agg(id) INTO v_seed_ids
    FROM public.profiles WHERE is_seed_user = true;

  IF v_seed_ids IS NULL OR array_length(v_seed_ids,1) = 0 THEN
    RETURN;
  END IF;

  -- Child rows cascade automatically via FK ON DELETE CASCADE
  DELETE FROM public.profiles WHERE is_seed_user = true;

  -- Clean up auth.users rows for seed accounts
  DELETE FROM auth.users
    WHERE id = ANY(v_seed_ids)
      AND raw_user_meta_data->>'is_seed' = 'true';
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_seed_data() TO authenticated;
