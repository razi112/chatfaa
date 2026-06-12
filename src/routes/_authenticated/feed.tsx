import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart, MessageCircle, Send, Plus, X, Play, Upload, Loader2,
  ImagePlus, Home, Video,
  MoreHorizontal, Trash2,
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Feed — chatfaa" }] }),
  component: FeedPage,
});

// ─── Types ────────────────────────────────────────────────────
type Post = {
  id: string; user_id: string; image_url: string | null;
  caption: string | null; created_at: string;
};
type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
};
type PostLike = { post_id: string; user_id: string };
type PostComment = {
  id: string; post_id: string; user_id: string; content: string; created_at: string;
};

function initials(name: string) { return name.slice(0, 2).toUpperCase(); }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ─── Main feed page ───────────────────────────────────────────
function FeedPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);

  const postsQ = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("posts").select("*").order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      return data as Post[];
    },
  });

  const ownerIds = [...new Set((postsQ.data ?? []).map((p) => p.user_id))];
  const profilesQ = useQuery({
    queryKey: ["feed-profiles", ownerIds],
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
    queryKey: ["feed-likes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("post_likes").select("*");
      if (error) throw error;
      return data as PostLike[];
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("rt-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        qc.invalidateQueries({ queryKey: ["feed-posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => {
        qc.invalidateQueries({ queryKey: ["feed-likes"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "post_comments" }, () => {
        qc.invalidateQueries({ queryKey: ["post-comments"] });
        qc.invalidateQueries({ queryKey: ["post-comment-count"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  if (!user) return null;

  const posts = postsQ.data ?? [];
  const profiles = profilesQ.data ?? {};
  const likes = likesQ.data ?? [];

  return (
    <div className="min-h-[100dvh] w-full flex bg-background text-foreground">

      {/* ── Left nav rail (desktop) ── */}
      <aside className="hidden md:flex w-[60px] xl:w-[200px] shrink-0 flex-col py-4 gap-1 border-r sticky top-0 h-[100dvh]"
        style={{ background: "var(--color-sidebar)", borderColor: "oklch(0.18 0.016 268)" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]"
            style={{ background: "var(--gradient-primary)" }}>
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="hidden xl:block font-bold text-sm tracking-tight">chatfaa</span>
        </div>

        <NavItem to="/feed" icon={Home} label="Feed" active />
        <NavItem to="/chat" icon={MessageCircle} label="Chat" />
        <NavItem to="/reels" icon={Play} label="Reels" />
        <NavItem to="/profile" icon={AvatarIcon} label="Profile" />

        {/* Upload button */}
        <div className="mt-auto px-2 pb-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            aria-label="New post"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl grid place-items-center border-2 border-dashed"
              style={{ borderColor: "oklch(0.35 0.018 268)" }}>
              <Plus className="h-4 w-4" />
            </div>
            <span className="hidden xl:block">New post</span>
          </button>
        </div>
      </aside>

      {/* ── Feed column ── */}
      <main className="flex-1 min-w-0 flex flex-col items-center pb-20 md:pb-8">
        {/* Top bar (mobile) */}
        <header className="md:hidden sticky top-0 z-30 w-full flex items-center justify-between px-4 h-14 border-b"
          style={{ background: "oklch(0.11 0.015 270 / 0.95)", borderColor: "oklch(0.20 0.016 268)", backdropFilter: "blur(16px)" }}>
          <span className="font-bold text-base tracking-tight">chatfaa</span>
          <button onClick={() => setUploadOpen(true)}
            className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <Plus className="h-5 w-5" />
          </button>
        </header>

        {/* Stories / post button row */}
        <div className="w-full max-w-[470px] px-4 pt-5 pb-2">
          <div className="flex items-center gap-3">
            {/* New post shortcut */}
            <button onClick={() => setUploadOpen(true)}
              className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="h-14 w-14 rounded-full grid place-items-center border-2 border-dashed transition-all hover:border-primary/60"
                style={{ borderColor: "oklch(0.30 0.018 268)", background: "oklch(0.16 0.016 268)" }}>
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">New post</span>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-[470px] px-4 mb-2">
          <div className="h-px" style={{ background: "oklch(0.22 0.016 268)" }} />
        </div>

        {/* Posts feed */}
        {postsQ.isLoading ? (
          <div className="w-full max-w-[470px] px-4 space-y-6 mt-4">
            {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <FeedEmpty onUpload={() => setUploadOpen(true)} />
        ) : (
          <div className="w-full max-w-[470px] space-y-0">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                profile={profiles[post.user_id]}
                likes={likes.filter((l) => l.post_id === post.id)}
                meId={user.id}
              />
            ))}
            <div className="py-10 text-center">
              <p className="text-xs text-muted-foreground">You've seen all posts ✨</p>
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t z-40"
        style={{ background: "var(--color-sidebar)", borderColor: "oklch(0.22 0.016 268)" }}>
        {[
          { to: "/feed", icon: Home, label: "Feed", active: true },
          { to: "/chat", icon: MessageCircle, label: "Chat", active: false },
          { to: "/reels", icon: Play, label: "Reels", active: false },
          { to: "/profile", icon: AvatarIconMobile, label: "Profile", active: false },
        ].map(({ to, icon: Icon, label, active }) => (
          <Link key={to} to={to as any}
            className={cn("flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors",
              active ? "text-white" : "text-muted-foreground hover:text-white"
            )}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <UploadPostDialog open={uploadOpen} onOpenChange={setUploadOpen} userId={user.id} />
    </div>
  );
}

// ─── Nav item (desktop rail) ──────────────────────────────────
function NavItem({ to, icon: Icon, label, active }: {
  to: string; icon: React.ElementType; label: string; active?: boolean;
}) {
  return (
    <Link to={to as any}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all",
        active
          ? "text-white"
          : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
      )}
      style={active ? { background: "var(--gradient-primary)", boxShadow: "0 4px 16px -4px oklch(0.65 0.22 280/0.5)" } : {}}>
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="hidden xl:block">{label}</span>
    </Link>
  );
}

function AvatarIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
  </svg>;
}
function AvatarIconMobile({ className }: { className?: string }) {
  return <AvatarIcon className={cn("h-5 w-5", className)} />;
}

// ─── Single post card ─────────────────────────────────────────
function PostCard({ post, profile, likes, meId }: {
  post: Post; profile: Profile | undefined;
  likes: PostLike[]; meId: string;
}) {
  const qc = useQueryClient();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Double-tap like
  const lastTapRef = useRef<number>(0);
  const [heartBurst, setHeartBurst] = useState<{ x: number; y: number; id: number } | null>(null);

  const liked = likes.some((l) => l.user_id === meId);
  const likeCount = likes.length;

  async function toggleLike() {
    if (liked) {
      await (supabase as any).from("post_likes").delete().eq("post_id", post.id).eq("user_id", meId);
    } else {
      await (supabase as any).from("post_likes").insert({ post_id: post.id, user_id: meId });
    }
    qc.invalidateQueries({ queryKey: ["feed-likes"] });
    qc.invalidateQueries({ queryKey: ["post-likes"] }); // keep profile page in sync
  }

  async function deletePost() {
    const { error } = await (supabase as any).from("posts").delete().eq("id", post.id);
    if (error) toast.error(error.message);
    else { toast.success("Post deleted"); qc.invalidateQueries({ queryKey: ["feed-posts"] }); }
  }

  function handleImageTap(e: React.MouseEvent<HTMLDivElement>) {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    if (delta < 300 && delta > 0) {
      // double tap
      if (!liked) {
        (supabase as any).from("post_likes").insert({ post_id: post.id, user_id: meId })
          .then(() => {
            qc.invalidateQueries({ queryKey: ["feed-likes"] });
            qc.invalidateQueries({ queryKey: ["post-likes"] });
          });
      }
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      setHeartBurst({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: now });
      setTimeout(() => setHeartBurst(null), 900);
    }
    lastTapRef.current = now;
  }

  const name = profile?.display_name || profile?.username || "Unknown";

  return (
    <article className="border-b" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to="/profile" search={{ userId: post.user_id } as any}>
          <Avatar className="h-9 w-9 ring-2 ring-transparent hover:ring-primary/40 transition-all cursor-pointer">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-bold"
              style={{ background: "var(--gradient-primary)", color: "white" }}>
              {initials(profile?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to="/profile" search={{ userId: post.user_id } as any}>
            <div className="text-sm font-semibold leading-tight hover:underline cursor-pointer">{name}</div>
          </Link>
          <div className="text-[11px] text-muted-foreground">@{profile?.username} · {timeAgo(post.created_at)}</div>
        </div>
        {post.user_id === meId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl" style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.24 0.018 268)" }}>
              <DropdownMenuItem onClick={deletePost}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2">
                <Trash2 className="h-4 w-4" /> Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Image */}
      {post.image_url && (
        <div
          className="relative w-full cursor-pointer select-none overflow-hidden"
          style={{ background: "oklch(0.14 0.015 268)", aspectRatio: imgLoaded ? undefined : "1/1" }}
          onClick={handleImageTap}
        >
          <img
            src={post.image_url}
            alt={post.caption ?? "post"}
            className="w-full h-auto block"
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />
          {/* Heart burst on double tap */}
          {heartBurst && (
            <div key={heartBurst.id} className="absolute pointer-events-none z-20"
              style={{ left: heartBurst.x, top: heartBurst.y, transform: "translate(-50%,-50%)" }}>
              <Heart className="h-20 w-20 animate-heart-burst" style={{ color: "#e6337e", fill: "#e6337e" }} />
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-3">
        {/* Like */}
        <button onClick={toggleLike} className="group flex items-center gap-1.5 -ml-1">
          <div className={cn("h-10 w-10 grid place-items-center rounded-xl transition-all active:scale-90",
            liked ? "text-red-500" : "text-muted-foreground hover:text-foreground")}>
            <Heart className={cn("h-6 w-6 transition-all", liked && "fill-red-500 scale-110")} />
          </div>
          <span className={cn("text-sm font-medium", liked ? "text-red-400" : "text-muted-foreground")}>{likeCount > 0 ? likeCount : ""}</span>
        </button>

        {/* Comment */}
        <button onClick={() => setCommentsOpen(true)} className="flex items-center gap-1.5">
          <div className="h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground transition-all">
            <MessageCircle className="h-6 w-6" />
          </div>
          <PostCommentCount postId={post.id} />
        </button>

        {/* Share (visual only for now) */}
        <button className="flex items-center gap-1.5 ml-auto">
          <div className="h-10 w-10 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground transition-all">
            <Send className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* Likes summary */}
      {likeCount > 0 && (
        <div className="px-4 pb-1">
          <span className="text-sm font-semibold">{likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}</span>
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-2">
          <span className="text-sm font-semibold mr-2">{name}</span>
          <span className="text-sm">{post.caption}</span>
        </div>
      )}

      {/* View comments link */}
      <PostCommentPreview postId={post.id} onViewAll={() => setCommentsOpen(true)} />

      {/* Inline quick comment */}
      <QuickComment postId={post.id} meId={meId} />

      {/* Comments drawer */}
      {commentsOpen && (
        <CommentsDrawer post={post} meId={meId} onClose={() => setCommentsOpen(false)} />
      )}
    </article>
  );
}

// ─── Comment count ────────────────────────────────────────────
function PostCommentCount({ postId }: { postId: string }) {
  const { data } = useQuery({
    queryKey: ["post-comment-count", postId],
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", postId);
      return count ?? 0;
    },
  });
  return <span className="text-sm font-medium text-muted-foreground">{data ? data : ""}</span>;
}

// ─── Comment preview (up to 2 comments inline) ───────────────
function PostCommentPreview({ postId, onViewAll }: { postId: string; onViewAll: () => void }) {
  const { data: comments } = useQuery({
    queryKey: ["post-comment-preview", postId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("post_comments").select("id, content, user_id")
        .eq("post_id", postId).order("created_at", { ascending: true }).limit(2);
      return (data ?? []) as Array<{ id: string; content: string; user_id: string }>;
    },
  });

  // Fetch usernames for preview comments
  const previewUserIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  const { data: previewProfiles } = useQuery({
    queryKey: ["post-comment-preview-profiles", previewUserIds],
    enabled: previewUserIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, username").in("id", previewUserIds);
      const map: Record<string, string> = {};
      (data ?? []).forEach((p: { id: string; username: string }) => { map[p.id] = p.username; });
      return map;
    },
  });

  const { data: count } = useQuery({
    queryKey: ["post-comment-count", postId],
    queryFn: async () => {
      const { count } = await (supabase as any)
        .from("post_comments").select("id", { count: "exact", head: true }).eq("post_id", postId);
      return count ?? 0;
    },
  });

  if (!comments || comments.length === 0) return null;
  const profiles = previewProfiles ?? {};

  return (
    <div className="px-4 pb-1 space-y-0.5">
      {count > 2 && (
        <button onClick={onViewAll} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View all {count} comments
        </button>
      )}
      {comments.map((c) => (
        <div key={c.id} className="text-sm">
          <span className="font-semibold mr-1.5">{profiles[c.user_id] ?? "user"}</span>
          <span className="text-foreground/80">{c.content}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Quick comment input ──────────────────────────────────────
function QuickComment({ postId, meId }: { postId: string; meId: string }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function post() {
    if (!text.trim() || posting) return;
    setPosting(true);
    await (supabase as any).from("post_comments").insert({ post_id: postId, user_id: meId, content: text.trim() });
    setPosting(false);
    setText("");
    qc.invalidateQueries({ queryKey: ["post-comment-preview", postId] });
    qc.invalidateQueries({ queryKey: ["post-comment-count", postId] });
    qc.invalidateQueries({ queryKey: ["post-comments", postId] });
  }

  return (
    <div className="flex items-center gap-2 px-4 pb-3 pt-1">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); post(); } }}
        placeholder="Add a comment…"
        maxLength={500}
        className="flex-1 h-9 rounded-xl bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
      />
      {text.trim() && (
        <button onClick={post} disabled={posting}
          className="text-sm font-semibold transition-colors"
          style={{ color: "oklch(0.75 0.18 280)" }}>
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
        </button>
      )}
    </div>
  );
}

// ─── Full comments drawer (modal) ────────────────────────────
function CommentsDrawer({ post, meId, onClose }: {
  post: Post; meId: string; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const commentsQ = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("post_comments").select("*")
        .eq("post_id", post.id).order("created_at", { ascending: true });
      return (data ?? []) as PostComment[];
    },
  });

  // Fetch profiles for comment authors
  const commentorIds = [...new Set((commentsQ.data ?? []).map((c) => c.user_id))];
  const profilesQ = useQuery({
    queryKey: ["post-comment-profiles", commentorIds],
    enabled: commentorIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").in("id", commentorIds);
      const map: Record<string, Profile> = {};
      (data as Profile[]).forEach((p) => { map[p.id] = p; });
      return map;
    },
  });

  async function postComment() {
    if (!text.trim() || posting) return;
    setPosting(true);
    const { error } = await (supabase as any).from("post_comments")
      .insert({ post_id: post.id, user_id: meId, content: text.trim() });
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setText("");
    qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
    qc.invalidateQueries({ queryKey: ["post-comment-count", post.id] });
    qc.invalidateQueries({ queryKey: ["post-comment-preview", post.id] });
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  async function deleteComment(id: string) {
    await (supabase as any).from("post_comments").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
    qc.invalidateQueries({ queryKey: ["post-comment-count", post.id] });
    qc.invalidateQueries({ queryKey: ["post-comment-preview", post.id] });
  }

  const comments = commentsQ.data ?? [];
  const profiles = profilesQ.data ?? {};

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70" onClick={onClose}>
      <div
        className="flex flex-col rounded-t-3xl overflow-hidden w-full max-w-lg mx-auto"
        style={{
          maxHeight: "80dvh",
          background: "oklch(0.14 0.015 268 / 0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid oklch(0.26 0.018 268)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3 border-b shrink-0"
          style={{ borderColor: "oklch(0.24 0.016 268)" }}>
          <h3 className="font-semibold text-sm">Comments</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {commentsQ.isLoading && (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          )}
          {!commentsQ.isLoading && comments.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No comments yet. Be the first!</p>
          )}
          {comments.map((c) => {
            const p = profiles[c.user_id];
            return (
              <div key={c.id} className="flex items-start gap-3 group">
                <Link to="/profile" search={{ userId: c.user_id } as any}>
                  <Avatar className="h-8 w-8 shrink-0 cursor-pointer">
                    <AvatarImage src={p?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[10px] font-bold"
                      style={{ background: "var(--gradient-primary)", color: "white" }}>
                      {initials(p?.username ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-semibold">{p?.display_name || p?.username || "user"}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm mt-0.5 leading-relaxed">{c.content}</p>
                </div>
                {c.user_id === meId && (
                  <button onClick={() => deleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t flex items-center gap-2 shrink-0"
          style={{ borderColor: "oklch(0.24 0.016 268)" }}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
            placeholder="Add a comment…"
            maxLength={500}
            className="flex-1 rounded-xl bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-ring/50"
          />
          <Button type="button" size="icon"
            className="h-10 w-10 rounded-xl shrink-0"
            style={{ background: "var(--gradient-primary)" }}
            disabled={posting || !text.trim()}
            onClick={postComment}>
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload post dialog ────────────────────────────────────────
function UploadPostDialog({ open, onOpenChange, userId }: {
  open: boolean; onOpenChange: (v: boolean) => void; userId: string;
}) {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() { setFile(null); setPreview(null); setCaption(""); }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error("Image must be under 20 MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) { setFile(f); setPreview(URL.createObjectURL(f)); }
  }

  async function upload() {
    setUploading(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("posts").upload(path, file, { upsert: false });
        if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
        const { data: urlData } = supabase.storage.from("posts").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      if (!image_url && !caption.trim()) { toast.error("Add an image or write a caption."); return; }
      const { error } = await (supabase as any).from("posts").insert({
        user_id: userId, image_url, caption: caption.trim() || null,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Post shared!");
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      qc.invalidateQueries({ queryKey: ["posts", userId] });
      reset();
      onOpenChange(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
            New post
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!preview ? (
            <div
              onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-10 transition-all hover:border-primary/50"
              style={{ borderColor: "oklch(0.28 0.018 268)" }}>
              <div className="h-12 w-12 rounded-2xl grid place-items-center"
                style={{ background: "oklch(0.65 0.22 280 / 0.12)", border: "1px solid oklch(0.65 0.22 280 / 0.25)" }}>
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP · max 20 MB</p>
              </div>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button onClick={reset}
                className="absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-all">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption… (optional)"
            maxLength={2200} rows={3}
            className="rounded-xl resize-none"
          />
          <Button onClick={upload} disabled={uploading || (!file && !caption.trim())}
            className="w-full h-10 rounded-xl font-semibold"
            style={{ background: "var(--gradient-primary)" }}>
            {uploading
              ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</span>
              : "Share post"
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeletons ────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="border-b pb-4" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-9 w-9 rounded-full shimmer" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 rounded shimmer" />
          <div className="h-2.5 w-16 rounded shimmer" />
        </div>
      </div>
      <div className="aspect-square shimmer" />
      <div className="px-4 pt-3 space-y-2">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="h-3 w-48 rounded shimmer" />
      </div>
    </div>
  );
}

function FeedEmpty({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="h-16 w-16 rounded-3xl grid place-items-center mb-5"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
        <ImagePlus className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-xl font-bold mb-2">No posts yet</h2>
      <p className="text-sm text-muted-foreground mb-6">Be the first to share something.</p>
      <Button onClick={onUpload} className="gap-2" style={{ background: "var(--gradient-primary)" }}>
        <Plus className="h-4 w-4" /> Upload a post
      </Button>
    </div>
  );
}
