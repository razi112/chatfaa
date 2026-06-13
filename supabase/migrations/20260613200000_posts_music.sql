-- Add music metadata columns to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS music_title       TEXT,
  ADD COLUMN IF NOT EXISTS music_artist      TEXT,
  ADD COLUMN IF NOT EXISTS music_artwork_url TEXT,
  ADD COLUMN IF NOT EXISTS music_preview_url TEXT,
  ADD COLUMN IF NOT EXISTS music_start_sec   REAL NOT NULL DEFAULT 0;
