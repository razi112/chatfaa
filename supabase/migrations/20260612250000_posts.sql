-- ── Posts table (images / text posts on user profiles) ───────
CREATE TABLE public.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url    TEXT,
  caption      TEXT CHECK (char_length(caption) <= 2200),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX posts_user_id_idx    ON public.posts(user_id);
CREATE INDEX posts_created_at_idx ON public.posts(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view posts"
  ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Post likes ────────────────────────────────────────────────
CREATE TABLE public.post_likes (
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post likes"
  ON public.post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ── Storage bucket for post images ───────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('posts', 'posts', true, 20971520, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Post image upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Post image update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Post image delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Post image public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'posts');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
