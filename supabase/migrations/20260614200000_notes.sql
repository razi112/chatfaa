-- ── Notes table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text            TEXT        NOT NULL CHECK (char_length(text) <= 60),
  emoji           TEXT,
  audience        TEXT        NOT NULL DEFAULT 'followers_back'
                              CHECK (audience IN ('followers_back', 'close_friends')),
  -- music fields (mirrors posts/stories)
  music_title       TEXT,
  music_artist      TEXT,
  music_artwork_url TEXT,
  music_preview_url TEXT,
  music_start_sec   REAL NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX notes_user_id_idx ON public.notes(user_id);
CREATE INDEX notes_expires_at_idx ON public.notes(expires_at DESC);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read non-expired notes
CREATE POLICY "Read active notes"
  ON public.notes FOR SELECT TO authenticated
  USING (expires_at > now());

-- Users can only insert their own notes
CREATE POLICY "Insert own note"
  ON public.notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "Update own note"
  ON public.notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "Delete own note"
  ON public.notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO authenticated;
GRANT ALL ON public.notes TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
