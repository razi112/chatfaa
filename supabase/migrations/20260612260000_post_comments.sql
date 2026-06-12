-- ── Post comments table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  -- FK to public.profiles (not auth.users) so Supabase relational joins work
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_comments_post_idx ON public.post_comments(post_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view post comments"
  ON public.post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert post comments"
  ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own post comments"
  ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
