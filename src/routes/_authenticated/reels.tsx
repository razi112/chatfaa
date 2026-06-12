import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart, MessageCircle, Send, Plus, X, Play, Pause,
  Volume2, VolumeX, Upload, Loader2, Trash2, ChevronUp, ChevronDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/reels")({
  head: () => ({ meta: [{ title: "Reels — chatfaa" }] }),
  component: ReelsPage,
});

// ─── Types ────────────────────────────────────────────────────
type Reel = {
  id: string; user_id: string; video_url: string;
  thumbnail_url: string | null; caption: string | null;
  created_at: string; updated_at: string;
};
type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
};
type ReelLike = { reel_id: string; user_id: string; created_at: string };
type ReelComment = {
  id: string; reel_id: string; user_id: string; content: string; created_at: string;
};

function initials(name: string) { return name.slice(0, 2).toUpperCase(); }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

// ─── Main page ────────────────────────────────────────────────
function ReelsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const reelsQ = useQuery({
    queryKey: ["reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reels").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as Reel[];
    },
  });

  const ownerIds = [...new Set((reelsQ.data ?? []).map((r) => r.user_id))];
  const profilesQ = useQuery({
    queryKey: ["reel-profiles", ownerIds],
    enabled: ownerIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", ownerIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      (data as Profile[]).forEach((p) => { map[p.id] = p; });
      return map;
    },
  });

  const likesQ = useQuery({
    queryKey: ["reel-likes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reel_likes").select("*");
      if (error) throw error;
      return data as ReelLike[];
    },
  });

  useEffect(() => {
    const ch = supabase.channel("rt-reels")
      .on("postgres_changes", { event: "*", schema: "public", table: "reels" }, () => qc.invalidateQueries({ queryKey: ["reels"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_likes" }, () => qc.invalidateQueries({ queryKey: ["reel-likes"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_comments" }, () => qc.invalidateQueries({ queryKey: ["reel-comments"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => {
          const max = (reelsQ.data?.length ?? 1) - 1;
          return e.key === "ArrowDown" ? Math.min(i + 1, max) : Math.max(i - 1, 0);
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reelsQ.data]);

  if (!user) return null;
  const reels = reelsQ.data ?? [];
  const profiles = profilesQ.data ?? {};
  const likes = likesQ.data ?? [];

  return (
    /*
     * Outer shell: full viewport, black bg.
     * On desktop the 9:16 reel is centred with black bars on both sides.
     * On mobile (<= 768 px) it fills the full screen edge-to-edge.
     */
    <div className="h-[100dvh] w-full bg-black flex items-center justify-center overflow-hidden relative">

      {/* ── Upload button (top-right, always visible) ── */}
      <div className="absolute top-4 right-4 z-30">
        <Button
          onClick={() => setUploadOpen(true)}
          size="sm"
          className="gap-2 rounded-xl shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> New reel
        </Button>
      </div>

      {/* ── Empty state ── */}
      {reels.length === 0 && !reelsQ.isLoading && (
        <div className="text-center px-6 z-10">
          <div className="mx-auto h-16 w-16 rounded-3xl grid place-items-center mb-5"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No reels yet</h2>
          <p className="text-sm text-white/50 mb-6">Be the first to share a reel.</p>
          <Button onClick={() => setUploadOpen(true)} className="gap-2" style={{ background: "var(--gradient-primary)" }}>
            <Plus className="h-4 w-4" /> Upload reel
          </Button>
        </div>
      )}

      {/* ── Feed: 9:16 container, centred ── */}
      {reels.length > 0 && (
        <>
          {/*
           * Width is clamped so the 9:16 frame never exceeds the viewport height.
           * calc(100dvh * 9/16) = the exact width for a full-height 9:16 video.
           * On mobile (portrait) this naturally fills the full width.
           */}
          <div
            ref={containerRef}
            className="relative overflow-y-scroll snap-y snap-mandatory"
            style={{
              /* 9:16 ratio: width = height × (9/16) */
              width: "min(100vw, calc(100dvh * 9 / 16))",
              height: "100dvh",
              scrollbarWidth: "none",
            }}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollTop / el.clientHeight);
              setActiveIndex(idx);
            }}
          >
            {reels.map((reel, i) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                profile={profiles[reel.user_id]}
                likes={likes.filter((l) => l.reel_id === reel.id)}
                meId={user.id}
                isActive={i === activeIndex}
              />
            ))}
          </div>

          {/* Up / down nav — sits just outside the reel frame on desktop */}
          {reels.length > 1 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2
                            sm:right-[calc(50%-min(50vw,calc(100dvh*9/32))-44px)]">
              <button
                onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
                disabled={activeIndex === 0}
                className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-all"
              >
                <ChevronUp className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => setActiveIndex((i) => Math.min(i + 1, reels.length - 1))}
                disabled={activeIndex === reels.length - 1}
                className="h-9 w-9 rounded-full grid place-items-center bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-all"
              >
                <ChevronDown className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </>
      )}

      <ScrollToActive containerRef={containerRef} index={activeIndex} />
      <UploadReelDialog open={uploadOpen} onOpenChange={setUploadOpen} userId={user.id} />
    </div>
  );
}

// ─── Scroll helper ─────────────────────────────────────────────
function ScrollToActive({ containerRef, index }: { containerRef: React.RefObject<HTMLDivElement | null>; index: number }) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: index * el.clientHeight, behavior: "smooth" });
  }, [index, containerRef]);
  return null;
}

// ─── Single reel card ─────────────────────────────────────────
function ReelCard({ reel, profile, likes, meId, isActive }: {
  reel: Reel; profile: Profile | undefined;
  likes: ReelLike[]; meId: string; isActive: boolean;
}) {
  const qc = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const liked = likes.some((l) => l.user_id === meId);
  const likeCount = likes.length;

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (isActive) {
      vid.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      vid.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  function togglePlay() {
    const vid = videoRef.current;
    if (!vid) return;
    if (playing) { vid.pause(); setPlaying(false); }
    else { vid.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  async function toggleLike() {
    if (liked) {
      await supabase.from("reel_likes").delete().eq("reel_id", reel.id).eq("user_id", meId);
    } else {
      await supabase.from("reel_likes").insert({ reel_id: reel.id, user_id: meId });
    }
    qc.invalidateQueries({ queryKey: ["reel-likes"] });
  }

  async function deleteReel() {
    if (!confirm("Delete this reel?")) return;
    const { error } = await supabase.from("reels").delete().eq("id", reel.id);
    if (error) toast.error(error.message);
    else { toast.success("Reel deleted"); qc.invalidateQueries({ queryKey: ["reels"] }); }
  }

  return (
    /*
     * Each slide is exactly 100dvh tall and fills the scroll container width
     * (which is already clamped to 9:16). snap-start keeps scroll snapping crisp.
     */
    <div
      className="relative snap-start snap-always flex-shrink-0 overflow-hidden bg-black"
      style={{ width: "100%", height: "100dvh" }}
    >
      {/* Video — fills the full 9:16 frame */}
      <video
        ref={videoRef}
        src={reel.video_url}
        loop
        muted={muted}
        playsInline
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: "cover", objectPosition: "center" }}
        onClick={togglePlay}
        onTimeUpdate={(e) => {
          const vid = e.currentTarget;
          if (vid.duration) setProgress((vid.currentTime / vid.duration) * 100);
        }}
      />

      {/* Dark gradient — bottom-heavy like Instagram */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* Progress bar — thin line at very top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-10">
        <div
          className="h-full transition-all duration-100"
          style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
        />
      </div>

      {/* Play/pause overlay — only shows briefly */}
      {!playing && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none z-10">
          <div className="h-16 w-16 rounded-full grid place-items-center bg-black/50 backdrop-blur-sm">
            <Play className="h-8 w-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Bottom info bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-6 pt-16"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
        {/* User info */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="h-9 w-9 ring-2 ring-white/40 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-bold bg-primary/30 text-white">
              {initials(profile?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-white font-semibold text-sm leading-tight drop-shadow">
              {profile?.display_name || profile?.username || "Unknown"}
            </div>
            <div className="text-white/60 text-xs">@{profile?.username} · {timeAgo(reel.created_at)}</div>
          </div>
        </div>
        {/* Caption */}
        {reel.caption && (
          <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow">{reel.caption}</p>
        )}
      </div>

      {/* ── Right action rail ── */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
        {/* Like */}
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
          <div className={cn(
            "h-11 w-11 rounded-full grid place-items-center transition-all active:scale-90",
            liked ? "bg-red-500/20" : "bg-black/40 hover:bg-black/60"
          )}>
            <Heart className={cn("h-6 w-6 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-white")} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{likeCount}</span>
        </button>

        {/* Comments */}
        <button onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-1">
          <div className="h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-black/60 transition-all">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">
            <CommentCount reelId={reel.id} />
          </span>
        </button>

        {/* Mute */}
        <button
          onClick={() => setMuted((v) => !v)}
          className="h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-black/60 transition-all"
        >
          {muted
            ? <VolumeX className="h-6 w-6 text-white" />
            : <Volume2 className="h-6 w-6 text-white" />
          }
        </button>

        {/* Delete (own reel) */}
        {reel.user_id === meId && (
          <button
            onClick={deleteReel}
            className="h-11 w-11 rounded-full grid place-items-center bg-black/40 hover:bg-red-500/30 transition-all"
          >
            <Trash2 className="h-5 w-5 text-white/70 hover:text-red-400" />
          </button>
        )}
      </div>

      {/* Comments sheet */}
      <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} reel={reel} meId={meId} />
    </div>
  );
}

// ─── Comment count (live) ─────────────────────────────────────
function CommentCount({ reelId }: { reelId: string }) {
  const { data } = useQuery({
    queryKey: ["reel-comment-count", reelId],
    queryFn: async () => {
      const { count, error } = await supabase.from("reel_comments").select("id", { count: "exact", head: true }).eq("reel_id", reelId);
      if (error) return 0;
      return count ?? 0;
    },
  });
  return <>{data ?? 0}</>;
}

// ─── Comments sheet ───────────────────────────────────────────
function CommentsSheet({ open, onClose, reel, meId }: {
  open: boolean; onClose: () => void; reel: Reel; meId: string;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const commentsQ = useQuery({
    queryKey: ["reel-comments", reel.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reel_comments").select("*").eq("reel_id", reel.id).order("created_at", { ascending: true });
      if (error) throw error;
      return data as ReelComment[];
    },
  });

  const commentorIds = [...new Set((commentsQ.data ?? []).map((c) => c.user_id))];
  const profilesQ = useQuery({
    queryKey: ["reel-comment-profiles", commentorIds],
    enabled: commentorIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", commentorIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      (data as Profile[]).forEach((p) => { map[p.id] = p; });
      return map;
    },
  });

  async function post() {
    if (!text.trim() || posting) return;
    setPosting(true);
    const { error } = await supabase.from("reel_comments").insert({ reel_id: reel.id, user_id: meId, content: text.trim() });
    setPosting(false);
    if (error) toast.error(error.message);
    else {
      setText("");
      qc.invalidateQueries({ queryKey: ["reel-comments", reel.id] });
      qc.invalidateQueries({ queryKey: ["reel-comment-count", reel.id] });
    }
  }

  async function deleteComment(id: string) {
    await supabase.from("reel_comments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["reel-comments", reel.id] });
    qc.invalidateQueries({ queryKey: ["reel-comment-count", reel.id] });
  }

  if (!open) return null;

  const comments = commentsQ.data ?? [];
  const profiles = profilesQ.data ?? {};

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" onClick={onClose}>
      <div
        className="flex flex-col rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: "70dvh",
          background: "oklch(0.14 0.015 268 / 0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid oklch(0.28 0.018 268)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b" style={{ borderColor: "oklch(0.24 0.016 268)" }}>
          <h3 className="font-semibold text-white text-sm">Comments</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-white/50" /></button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {commentsQ.isLoading && (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          )}
          {!commentsQ.isLoading && comments.length === 0 && (
            <p className="text-center text-white/30 text-sm py-8">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => {
            const p = profiles[c.user_id];
            return (
              <div key={c.id} className="flex items-start gap-3 group">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={p?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[10px] font-bold" style={{ background: "oklch(0.65 0.22 280 / 0.3)", color: "oklch(0.80 0.15 280)" }}>
                    {initials(p?.username ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-white/80">@{p?.username ?? "user"}</span>
                    <span className="text-[10px] text-white/30">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-white/90 mt-0.5 leading-relaxed">{c.content}</p>
                </div>
                {c.user_id === meId && (
                  <button onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <X className="h-4 w-4 text-white/30 hover:text-red-400" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: "oklch(0.24 0.016 268)" }}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }}
            placeholder="Add a comment…"
            maxLength={500}
            className="flex-1 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-white/20"
          />
          <Button type="button" size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
            style={{ background: "var(--gradient-primary)" }}
            disabled={posting || !text.trim()}
            onClick={post}>
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload dialog ─────────────────────────────────────────────
function UploadReelDialog({ open, onOpenChange, userId }: {
  open: boolean; onOpenChange: (v: boolean) => void; userId: string;
}) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (f.size > 100 * 1024 * 1024) { toast.error("Video must be under 100 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) handleFile(f);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(10);

    const ext = file.name.split(".").pop() ?? "mp4";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage.from("reels").upload(path, file, { upsert: false });
    if (upErr) { toast.error("Upload failed: " + upErr.message); setUploading(false); return; }
    setProgress(70);

    const { data: urlData } = supabase.storage.from("reels").getPublicUrl(path);
    const videoUrl = urlData.publicUrl;

    const { error: dbErr } = await supabase.from("reels").insert({
      user_id: userId, video_url: videoUrl, caption: caption.trim() || null,
    });
    setProgress(100);
    setUploading(false);

    if (dbErr) { toast.error(dbErr.message); return; }
    toast.success("Reel uploaded!");
    qc.invalidateQueries({ queryKey: ["reels"] });
    setFile(null); setPreview(null); setCaption(""); setProgress(0);
    onOpenChange(false);
  }

  function reset() { setFile(null); setPreview(null); setCaption(""); setProgress(0); }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
            Upload reel
          </DialogTitle>
        </DialogHeader>

        {!file ? (
          <div
            onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-12 transition-colors hover:border-primary/50"
            style={{ borderColor: "oklch(0.28 0.018 268)" }}>
            <div className="h-12 w-12 rounded-2xl grid place-items-center" style={{ background: "oklch(0.65 0.22 280 / 0.15)" }}>
              <Upload className="h-6 w-6" style={{ color: "oklch(0.75 0.18 280)" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop video here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV · Max 100 MB</p>
            </div>
            <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview — true 9:16 */}
            <div className="relative rounded-2xl overflow-hidden mx-auto bg-black"
              style={{ aspectRatio: "9/16", maxHeight: "55dvh", width: "auto" }}>
              <video src={preview ?? undefined} className="w-full h-full object-cover" controls muted />
              <button onClick={reset}
                className="absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-colors">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* Caption */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Caption</label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption…" maxLength={2200} rows={3}
                className="rounded-xl resize-none text-sm" />
              <p className="text-[11px] text-muted-foreground text-right">{caption.length}/2200</p>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "oklch(0.20 0.016 268)" }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
                </div>
                <p className="text-xs text-muted-foreground text-center">Uploading… {progress}%</p>
              </div>
            )}

            <Button onClick={upload} disabled={uploading}
              className="w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}>
              {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</> : <><Upload className="h-4 w-4" /> Post reel</>}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
