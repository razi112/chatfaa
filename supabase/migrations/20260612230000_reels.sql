-- ── Reels table ───────────────────────────────────────────────
CREATE TABLE public.reels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url   TEXT NOT NULL,
  thumbnail_url TEXT,
  caption     TEXT CHECK (char_length(caption) <= 2200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reels_user_id_idx ON public.reels(user_id);
CREATE INDEX reels_created_at_idx ON public.reels(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reels TO authenticated;
GRANT ALL ON public.reels TO service_role;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reels"
  ON public.reels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reels"
  ON public.reels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reels"
  ON public.reels FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reels"
  ON public.reels FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Reel likes ────────────────────────────────────────────────
CREATE TABLE public.reel_likes (
  reel_id    UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (reel_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.reel_likes TO authenticated;
GRANT ALL ON public.reel_likes TO service_role;
ALTER TABLE public.reel_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.reel_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like"        ON public.reel_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike"      ON public.reel_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Reel comments ─────────────────────────────────────────────
CREATE TABLE public.reel_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id    UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX reel_comments_reel_idx ON public.reel_comments(reel_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.reel_comments TO authenticated;
GRANT ALL ON public.reel_comments TO service_role;
ALTER TABLE public.reel_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"    ON public.reel_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can comment"           ON public.reel_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comment" ON public.reel_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Storage bucket for reel videos ───────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reels', 'reels', true, 104857600, ARRAY['video/mp4','video/webm','video/quicktime'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Reel upload"       ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reel update"       ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reel delete"       ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reels' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reel public read"  ON storage.objects FOR SELECT TO public USING (bucket_id = 'reels');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reel_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reel_comments;
