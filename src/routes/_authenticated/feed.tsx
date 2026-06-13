import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Heart, MessageCircle, Send, Plus, X, Play, Pause, Upload, Loader2,
  ImagePlus, Home, Users, Settings, Music, Search, ChevronRight, ChevronLeft,
  MoreHorizontal, Trash2, Camera, Volume2, VolumeX as VolumeXIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";
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
  music_title: string | null; music_artist: string | null;
  music_artwork_url: string | null; music_preview_url: string | null;
  music_start_sec: number | null;
};
type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
};
type PostLike = { post_id: string; user_id: string };
type PostComment = {
  id: string; post_id: string; user_id: string; content: string; created_at: string;
};
type MusicTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
};

type SelectedMusic = {
  track: MusicTrack;
  startSec: number; // 0–15 (clip within 30s preview)
};

type Story = {
  id: string;
  user_id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  duration_sec: number;
  created_at: string;
  expires_at: string;
};

type StoryGroup = {
  userId: string;
  profile: Profile;
  stories: Story[];
  hasUnseen: boolean;
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
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("posts").select("*").order("created_at", { ascending: false }).limit(60);
        if (error) return [] as Post[];
        return data as Post[];
      } catch { return [] as Post[]; }
    },
  });

  const ownerIds = [...new Set((postsQ.data ?? []).map((p) => p.user_id))];
  const profilesQ = useQuery({
    queryKey: ["feed-profiles", ownerIds],
    enabled: ownerIds.length > 0,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("*").in("id", ownerIds);
        if (error) return {} as Record<string, Profile>;
        const map: Record<string, Profile> = {};
        (data as Profile[]).forEach((p) => { map[p.id] = p; });
        return map;
      } catch { return {} as Record<string, Profile>; }
    },
  });

  const likesQ = useQuery({
    queryKey: ["feed-likes"],
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any).from("post_likes").select("*");
        if (error) return [] as PostLike[];
        return data as PostLike[];
      } catch { return [] as PostLike[]; }
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
      .on("postgres_changes", { event: "*", schema: "public", table: "stories" }, () => {
        qc.invalidateQueries({ queryKey: ["stories"] });
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
        <NavItem to="/people" icon={Users} label="People" />
        <NavItem to="/profile" icon={AvatarIcon} label="Profile" />
        <NavItem to="/settings" icon={Settings} label="Settings" />

        {/* Upload button + notification bell */}
        <div className="mt-auto px-2 pb-2 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <NotificationBell meId={user.id} />
            <span className="hidden xl:block text-xs text-muted-foreground">Notifications</span>
          </div>
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
          <div className="flex items-center gap-1">
            <Link to="/people" className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              <Users className="h-5 w-5" />
            </Link>
            <NotificationBell meId={user.id} />
            <Link to="/settings" className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" title="Settings">
              <Settings className="h-5 w-5" />
            </Link>
            <button onClick={() => setUploadOpen(true)}
              className="h-9 w-9 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Stories row */}
        <StoriesRow meId={user.id} meProfile={profiles[user.id] ?? null} />

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
          { to: "/people", icon: Users, label: "People", active: false },
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

// ─── Stories Row ──────────────────────────────────────────────
function StoriesRow({ meId, meProfile }: { meId: string; meProfile: Profile | null }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [viewingGroup, setViewingGroup] = useState<StoryGroup | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch all active stories
  const storiesQ = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [] as Story[];
      return (data ?? []) as Story[];
    },
  });

  // Fetch profiles of story owners
  const ownerIds = [...new Set((storiesQ.data ?? []).map((s: Story) => s.user_id))];
  const profilesQ = useQuery({
    queryKey: ["story-profiles", ownerIds],
    enabled: ownerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").in("id", ownerIds);
      const map: Record<string, Profile> = {};
      (data ?? []).forEach((p: Profile) => { map[p.id] = p; });
      return map;
    },
  });

  // Fetch which story IDs the current user has seen
  const viewsQ = useQuery({
    queryKey: ["story-views", meId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("story_views").select("story_id").eq("viewer_id", meId);
      return new Set<string>((data ?? []).map((v: { story_id: string }) => v.story_id));
    },
  });

  const seenIds = viewsQ.data ?? new Set<string>();
  const profiles = profilesQ.data ?? {};
  const stories = storiesQ.data ?? [];

  // Group stories by user, my stories first
  const groups = useMemo(() => {
    const map = new Map<string, Story[]>();
    stories.forEach((s: Story) => {
      if (!map.has(s.user_id)) map.set(s.user_id, []);
      map.get(s.user_id)!.push(s);
    });
    // Sort each group by created_at asc
    map.forEach((arr) => arr.sort((a, b) => a.created_at.localeCompare(b.created_at)));

    const result: StoryGroup[] = [];
    // My own group first (even if empty — shows "Add story")
    if (map.has(meId)) {
      const myStories = map.get(meId)!;
      const hasUnseen = myStories.some(s => !seenIds.has(s.id));
      result.push({ userId: meId, profile: profiles[meId] ?? (meProfile as Profile), stories: myStories, hasUnseen });
    }
    // Others
    map.forEach((storyArr, uid) => {
      if (uid === meId) return;
      const p = profiles[uid];
      if (!p) return;
      const hasUnseen = storyArr.some(s => !seenIds.has(s.id));
      result.push({ userId: uid, profile: p, stories: storyArr, hasUnseen });
    });
    return result;
  }, [stories, profiles, seenIds, meId, meProfile]);

  async function addStory(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { toast.error("File must be under 50 MB"); return; }
    const isVideo = f.type.startsWith("video/");
    setUploading(true);
    try {
      const ext = f.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
      const path = `${meId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("stories").upload(path, f, { upsert: false });
      if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
      const { data: urlData } = supabase.storage.from("stories").getPublicUrl(path);
      const { error } = await (supabase as any).from("stories").insert({
        user_id: meId,
        media_url: urlData.publicUrl,
        media_type: isVideo ? "video" : "image",
        duration_sec: isVideo ? 15 : 5,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Story posted!");
      qc.invalidateQueries({ queryKey: ["stories"] });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function openGroup(group: StoryGroup) {
    // Find first unseen index
    const firstUnseen = group.stories.findIndex(s => !seenIds.has(s.id));
    setViewingIndex(firstUnseen >= 0 ? firstUnseen : 0);
    setViewingGroup(group);
  }

  // My own avatar — show "+" button if no stories or at the end
  const myGroup = groups.find(g => g.userId === meId);
  const hasMyStory = (myGroup?.stories.length ?? 0) > 0;

  return (
    <>
      <div className="w-full max-w-[470px]">
        <div className="flex gap-3 overflow-x-auto px-4 pt-4 pb-3 scrollbar-none"
          style={{ scrollbarWidth: "none" }}>

          {/* My story bubble */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="relative">
              <button
                onClick={() => hasMyStory && myGroup ? openGroup(myGroup) : fileRef.current?.click()}
                className={cn(
                  "h-[62px] w-[62px] rounded-full transition-all",
                  hasMyStory
                    ? "ring-[2.5px] ring-offset-2 ring-offset-background ring-primary"
                    : "ring-[2px] ring-offset-2 ring-offset-background ring-border"
                )}
              >
                <Avatar className="h-full w-full">
                  <AvatarImage src={meProfile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-sm font-bold"
                    style={{ background: "var(--gradient-primary)", color: "white" }}>
                    {initials(meProfile?.username ?? "?")}
                  </AvatarFallback>
                </Avatar>
              </button>
              {/* Add story "+" badge */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center text-white shadow-md transition-all"
                style={{ background: "var(--gradient-primary)" }}
              >
                {uploading
                  ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  : <Plus className="h-3 w-3" />
                }
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-[62px] text-center">
              {hasMyStory ? "Your story" : "Add story"}
            </span>
          </div>

          {/* Other users' stories */}
          {groups.filter(g => g.userId !== meId).map((group) => (
            <button
              key={group.userId}
              onClick={() => openGroup(group)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className={cn(
                "h-[62px] w-[62px] rounded-full p-[2.5px] transition-all",
                group.hasUnseen
                  ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                  : "bg-border"
              )}>
                <div className="h-full w-full rounded-full ring-2 ring-background overflow-hidden">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={group.profile?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-sm font-bold"
                      style={{ background: "var(--gradient-primary)", color: "white" }}>
                      {initials(group.profile?.username ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-[62px] text-center">
                {group.profile?.display_name || group.profile?.username}
              </span>
            </button>
          ))}

          {/* Empty state hint */}
          {groups.filter(g => g.userId !== meId).length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 px-4 text-center">
              <p className="text-[11px] text-muted-foreground/60">Follow people to see their stories</p>
            </div>
          )}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={addStory} />

      {/* Story viewer */}
      {viewingGroup && (
        <StoryViewer
          group={viewingGroup}
          initialIndex={viewingIndex}
          meId={meId}
          allGroups={groups}
          onClose={() => setViewingGroup(null)}
          onNavigateGroup={(g) => { setViewingGroup(g); setViewingIndex(0); }}
          onMarkSeen={(_storyId) => {
            qc.invalidateQueries({ queryKey: ["story-views", meId] });
          }}
        />
      )}
    </>
  );
}

// ─── Story Viewer ──────────────────────────────────────────────
function StoryViewer({ group, initialIndex, meId, allGroups, onClose, onNavigateGroup, onMarkSeen }: {
  group: StoryGroup;
  initialIndex: number;
  meId: string;
  allGroups: StoryGroup[];
  onClose: () => void;
  onNavigateGroup: (g: StoryGroup) => void;
  onMarkSeen: (storyId: string) => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const story = group.stories[idx];
  const TICK = 50; // ms

  // Mark as seen
  useEffect(() => {
    if (!story) return;
    (supabase as any).from("story_views")
      .insert({ story_id: story.id, viewer_id: meId })
      .then(() => onMarkSeen(story.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  // Progress timer
  useEffect(() => {
    if (!story) return;
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (paused) return;
    const dur = (story.duration_sec ?? 5) * 1000;
    const step = (TICK / dur) * 100;
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev + step >= 100) {
          clearInterval(intervalRef.current!);
          goNext();
          return 100;
        }
        return prev + step;
      });
    }, TICK);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, paused, story?.id]);

  function goNext() {
    if (idx < group.stories.length - 1) {
      setIdx(idx + 1);
    } else {
      // Next group
      const gIdx = allGroups.findIndex(g => g.userId === group.userId);
      if (gIdx >= 0 && gIdx < allGroups.length - 1) {
        onNavigateGroup(allGroups[gIdx + 1]);
      } else {
        onClose();
      }
    }
  }

  function goPrev() {
    if (idx > 0) {
      setIdx(idx - 1);
    } else {
      // Prev group
      const gIdx = allGroups.findIndex(g => g.userId === group.userId);
      if (gIdx > 0) {
        const prevGroup = allGroups[gIdx - 1];
        onNavigateGroup(prevGroup);
      }
    }
  }

  async function deleteStory() {
    if (!story) return;
    await (supabase as any).from("stories").delete().eq("id", story.id);
    toast.success("Story deleted");
    goNext();
  }

  if (!story) { onClose(); return null; }

  const isVideo = story.media_type === "video";
  const isMyStory = group.userId === meId;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Story media */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
        {/* Media */}
        {isVideo ? (
          <video
            ref={videoRef}
            src={story.media_url}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted={muted} loop={false} playsInline
            onEnded={goNext}
          />
        ) : (
          <img
            src={story.media_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }} />

        {/* Progress bars */}
        <div className="absolute top-0 inset-x-0 flex gap-1 px-2 pt-2 z-10">
          {group.stories.map((_, i) => (
            <div key={i} className="flex-1 h-[2.5px] rounded-full overflow-hidden bg-white/30">
              <div
                className="h-full bg-white rounded-full transition-none"
                style={{
                  width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-5 inset-x-0 px-3 z-10 flex items-center gap-2.5 mt-3">
          <Avatar className="h-9 w-9 ring-2 ring-white/50 shrink-0">
            <AvatarImage src={group.profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-bold"
              style={{ background: "var(--gradient-primary)", color: "white" }}>
              {initials(group.profile?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight drop-shadow">
              {group.profile?.display_name || group.profile?.username}
            </p>
            <p className="text-white/70 text-[11px]">{timeAgo(story.created_at)}</p>
          </div>
          <div className="flex items-center gap-1">
            {isVideo && (
              <button
                onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white"
              >
                {muted ? <VolumeXIcon className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            {isMyStory && (
              <button onClick={deleteStory}
                className="h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose}
              className="h-8 w-8 rounded-full grid place-items-center bg-black/30 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-8 inset-x-4 z-10 text-center">
            <p className="text-white text-sm font-medium drop-shadow-lg">{story.caption}</p>
          </div>
        )}

        {/* Tap zones — left/right nav */}
        <div className="absolute inset-0 flex z-10">
          <button
            className="w-1/3 h-full"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
            onClick={goPrev}
          />
          <div className="flex-1" />
          <button
            className="w-1/3 h-full"
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
            onPointerLeave={() => setPaused(false)}
            onClick={goNext}
          />
        </div>
      </div>
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

      {/* Image with embedded music (Instagram-style) */}
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
          {/* Instagram-style music overlay — always on image */}
          {post.music_preview_url && (
            <PostMusicOverlay
              title={post.music_title!}
              artist={post.music_artist!}
              artworkUrl={post.music_artwork_url}
              previewUrl={post.music_preview_url}
              startSec={post.music_start_sec ?? 0}
            />
          )}
        </div>
      )}

      {/* Text-only post with music (no image) */}
      {!post.image_url && post.music_preview_url && (
        <PostMusicOverlay
          title={post.music_title!}
          artist={post.music_artist!}
          artworkUrl={post.music_artwork_url}
          previewUrl={post.music_preview_url}
          startSec={post.music_start_sec ?? 0}
          standalone
        />
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

// ─── Instagram-style music overlay ───────────────────────────
// Auto-plays muted on mount. Mute/unmute button only — no play button.
function PostMusicOverlay({ title, artist, artworkUrl, previewUrl, startSec = 0, standalone }: {
  title: string; artist: string;
  artworkUrl: string | null; previewUrl: string;
  startSec?: number; standalone?: boolean;
}) {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play muted, starting from the selected segment
  useEffect(() => {
    const audio = new Audio(previewUrl);
    audio.loop = false;
    audio.muted = true;
    audio.volume = 0.7;
    audio.currentTime = startSec;
    audio.play().catch(() => {});
    // Loop within the 15s clip
    audio.ontimeupdate = () => {
      if (audio.currentTime >= startSec + CLIP_DURATION) {
        audio.currentTime = startSec;
      }
    };
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, [previewUrl, startSec]);

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    setMuted(next);
  }

  // Standalone (text post, no image) — render as a dark banner
  if (standalone) {
    return (
      <div className="relative mx-0 flex items-center gap-3 px-4 py-3 overflow-hidden"
        style={{ background: "oklch(0.13 0.014 268)" }}>
        {/* Scrolling title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {artworkUrl && (
            <img src={artworkUrl} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Music className="h-3 w-3 text-primary shrink-0" />
              <p className="text-xs font-semibold text-foreground truncate">{title}</p>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{artist}</p>
          </div>
        </div>
        {/* Mute toggle */}
        <button
          onClick={toggleMute}
          className="h-8 w-8 rounded-full grid place-items-center shrink-0 transition-all"
          style={{ background: "oklch(0.22 0.016 268)" }}
        >
          {muted ? <MuteIcon /> : <UnmuteIcon />}
        </button>
      </div>
    );
  }

  // Overlay on image — bottom strip
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-2.5 px-3 py-2.5"
      style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.0) 100%)",
        backdropFilter: "blur(0px)",
      }}>

      {/* Rotating artwork disc */}
      <div className="relative shrink-0">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover border-2 border-white/30 animate-spin-slow"
          />
        ) : (
          <div className="h-8 w-8 rounded-full border-2 border-white/30 grid place-items-center animate-spin-slow"
            style={{ background: "oklch(0.65 0.22 280 / 0.6)" }}>
            <Music className="h-3.5 w-3.5 text-white" />
          </div>
        )}
        {/* Center hole of vinyl */}
        <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-black/60 pointer-events-none" />
      </div>

      {/* Scrolling track name */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="whitespace-nowrap overflow-hidden">
          <span className="text-white text-[11px] font-semibold inline-block animate-marquee">
            {title} · {artist}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Music className="h-2.5 w-2.5 text-white/60" />
          <span className="text-white/60 text-[10px]">Original audio</span>
        </div>
      </div>

      {/* Mute / Unmute button */}
      <button
        onClick={toggleMute}
        className="h-8 w-8 rounded-full grid place-items-center shrink-0 transition-all active:scale-90"
        style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.2)" }}
      >
        {muted ? <MuteIcon /> : <UnmuteIcon />}
      </button>
    </div>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>
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
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null); setPreview(null); setCaption("");
    setSelectedMusic(null); setMusicPickerOpen(false);
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error("Image must be under 20 MB"); return; }
    setFile(f); setPreview(URL.createObjectURL(f));
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
        user_id: userId,
        image_url,
        caption: caption.trim() || null,
        music_title: selectedMusic?.track.trackName ?? null,
        music_artist: selectedMusic?.track.artistName ?? null,
        music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
        music_preview_url: selectedMusic?.track.previewUrl ?? null,
        music_start_sec: selectedMusic?.startSec ?? 0,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Post shared!");
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      qc.invalidateQueries({ queryKey: ["posts", userId] });
      reset(); onOpenChange(false);
    } finally { setUploading(false); }
  }

  return (
    <>
      <Dialog open={open && !musicPickerOpen} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); if (!v) reset(); } }}>
        <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
              New post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Image picker */}
            {!preview ? (
              <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
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

            {/* Caption */}
            <Textarea value={caption} onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption… (optional)" maxLength={2200} rows={3}
              className="rounded-xl resize-none" />

            {/* Music selector */}
            <button type="button" onClick={() => setMusicPickerOpen(true)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm",
                selectedMusic ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 bg-card"
              )}>
              {selectedMusic ? (
                <>
                  <img src={selectedMusic.track.artworkUrl100} alt=""
                    className="h-9 w-9 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate text-xs leading-tight">{selectedMusic.track.trackName}</p>
                    <p className="text-muted-foreground truncate text-[11px]">
                      {selectedMusic.track.artistName}
                      <span className="ml-2 text-primary/70">· from {formatSec(selectedMusic.startSec)}</span>
                    </p>
                  </div>
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedMusic(null); }}
                    className="shrink-0 h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 transition-all">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                    style={{ background: "oklch(0.65 0.22 280 / 0.12)", border: "1px solid oklch(0.65 0.22 280 / 0.20)" }}>
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <span className="flex-1 text-left text-muted-foreground">Add music</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                </>
              )}
            </button>

            <Button onClick={upload} disabled={uploading || (!file && !caption.trim())}
              className="w-full h-10 rounded-xl font-semibold"
              style={{ background: "var(--gradient-primary)" }}>
              {uploading
                ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</span>
                : "Share post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MusicPickerDialog
        open={musicPickerOpen}
        onOpenChange={setMusicPickerOpen}
        onSelect={(music) => { setSelectedMusic(music); setMusicPickerOpen(false); }}
      />
    </>
  );
}

// ── helpers ────────────────────────────────────────────────────
const CLIP_DURATION = 15; // seconds of clip window
const PREVIEW_DURATION = 30; // iTunes preview is always 30s

function formatSec(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Music picker dialog (search + segment trim) ───────────────
function MusicPickerDialog({ open, onOpenChange, onSelect }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (music: SelectedMusic) => void;
}) {
  // step: "search" | "trim"
  const [step, setStep] = useState<"search" | "trim">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<MusicTrack | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      setPreviewId(null); setQuery(""); setResults([]);
      setStep("search"); setPendingTrack(null);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`
        );
        const json = await res.json();
        setResults((json.results ?? []).filter((t: MusicTrack) => t.previewUrl));
      } catch { toast.error("Music search failed"); }
      finally { setSearching(false); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function togglePreview(track: MusicTrack) {
    if (previewId === track.trackId) {
      audioRef.current?.pause(); setPreviewId(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const a = new Audio(track.previewUrl);
      a.play().catch(() => {}); a.onended = () => setPreviewId(null);
      audioRef.current = a; setPreviewId(track.trackId);
    }
  }

  function goToTrim(track: MusicTrack) {
    audioRef.current?.pause(); setPreviewId(null);
    setPendingTrack(track); setStep("trim");
  }

  function confirmTrim(startSec: number) {
    if (!pendingTrack) return;
    onSelect({ track: pendingTrack, startSec });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)] flex flex-col max-h-[88dvh] p-0 overflow-hidden">

        {/* ── Step 1: search ── */}
        {step === "search" && (
          <>
            <div className="px-5 pt-5 pb-3 shrink-0">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 mb-3">
                  <Music className="h-5 w-5 text-primary" /> Add Music
                </DialogTitle>
              </DialogHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search songs, artists…" className="pl-9 rounded-xl" autoFocus />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 min-h-0">
              {searching && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
              {!searching && query && results.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No songs found</p>
              )}
              {!searching && !query && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="h-12 w-12 rounded-2xl grid place-items-center"
                    style={{ background: "oklch(0.65 0.22 280 / 0.10)", border: "1px solid oklch(0.65 0.22 280 / 0.20)" }}>
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Search for a song to add</p>
                </div>
              )}
              {results.map((track) => {
                const isPlaying = previewId === track.trackId;
                return (
                  <div key={track.trackId}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl transition-all hover:bg-white/5 cursor-pointer"
                    onClick={() => goToTrim(track)}>
                    <div className="relative shrink-0">
                      <img src={track.artworkUrl100} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      {isPlaying && (
                        <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-white animate-spin" style={{ animationDuration: "1.2s" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.trackName}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); togglePreview(track); }}
                      className={cn("h-8 w-8 rounded-full shrink-0 grid place-items-center transition-all",
                        isPlaying ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      )}>
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Step 2: trim segment ── */}
        {step === "trim" && pendingTrack && (
          <MusicTrimStep
            track={pendingTrack}
            onBack={() => { setStep("search"); setPendingTrack(null); }}
            onConfirm={confirmTrim}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Music trim step ───────────────────────────────────────────
function MusicTrimStep({ track, onBack, onConfirm }: {
  track: MusicTrack;
  onBack: () => void;
  onConfirm: (startSec: number) => void;
}) {
  const CLIP = CLIP_DURATION;     // 15s window
  const TOTAL = PREVIEW_DURATION; // 30s total
  const MAX_START = TOTAL - CLIP; // 15s max start

  // startSecRef is the single source of truth — avoids stale closure bugs
  const startSecRef = useRef(0);
  const [startSec, setStartSec] = useState(0); // mirror for rendering
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Drag state — all in refs to avoid closure issues
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartSec = useRef(0);

  // Mount audio once
  useEffect(() => {
    const a = new Audio(track.previewUrl);
    a.currentTime = 0;
    a.ontimeupdate = () => {
      setCurrentTime(a.currentTime);
      // Loop within clip using ref (always fresh value)
      if (a.currentTime >= startSecRef.current + CLIP) {
        a.currentTime = startSecRef.current;
      }
    };
    a.play().catch(() => {});
    audioRef.current = a;
    setPlaying(true);
    return () => { a.pause(); a.src = ""; };
  // Only re-run if track URL changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.previewUrl]);

  function seekTo(sec: number) {
    const clamped = Math.max(0, Math.min(sec, MAX_START));
    startSecRef.current = clamped;
    setStartSec(clamped);
    if (audioRef.current) audioRef.current.currentTime = clamped;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  }

  // ── Pointer-based drag (works for both mouse and touch) ──────
  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartSec.current = startSecRef.current;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return;
    const trackW = trackRef.current?.getBoundingClientRect().width ?? 1;
    const dx = e.clientX - dragStartX.current;
    const secPerPx = TOTAL / trackW;
    seekTo(dragStartSec.current + dx * secPerPx);
  }

  function onPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    isDragging.current = false;
  }

  // Also allow clicking anywhere on the track bar to jump
  function onTrackClick(e: React.MouseEvent) {
    if (isDragging.current) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    // Center the window on the clicked position
    seekTo(ratio * TOTAL - CLIP / 2);
  }

  const playheadRatio = Math.min(currentTime / TOTAL, 1);
  const selLeft = (startSec / TOTAL) * 100;
  const selWidth = (CLIP / TOTAL) * 100;

  // Deterministic waveform heights (no Math.random so they don't re-render)
  const bars = Array.from({ length: 52 }, (_, i) => {
    const v = Math.sin(i * 0.6) * 0.3 + Math.sin(i * 1.3 + 1) * 0.25 + Math.sin(i * 0.3 + 2) * 0.2;
    return 0.25 + (v + 0.75) * 0.4;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4 shrink-0 border-b"
        style={{ borderColor: "oklch(0.22 0.016 268)" }}>
        <button onClick={onBack}
          className="h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <img src={track.artworkUrl100} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{track.trackName}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
        </div>
        <button onClick={togglePlay}
          className="h-9 w-9 rounded-full shrink-0 grid place-items-center transition-all bg-primary text-white">
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      </div>

      {/* Trim UI */}
      <div className="flex-1 flex flex-col justify-center px-5 py-6 gap-5">
        <div className="text-center">
          <p className="text-sm font-semibold">Select a {CLIP}s clip</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag the highlighted window · or tap anywhere to jump
          </p>
        </div>

        {/* Waveform track */}
        <div
          ref={trackRef}
          className="relative select-none touch-none"
          style={{ userSelect: "none" }}
          onClick={onTrackClick}
        >
          {/* Waveform bars */}
          <div className="flex items-center gap-[2px] h-16 rounded-xl overflow-hidden px-0.5">
            {bars.map((h, i) => {
              const barRatio = i / bars.length;
              const inSel = barRatio * 100 >= selLeft && barRatio * 100 < selLeft + selWidth;
              return (
                <div key={i}
                  className="flex-1 rounded-sm transition-colors duration-75"
                  style={{
                    height: `${h * 100}%`,
                    background: inSel ? "oklch(0.65 0.22 280)" : "oklch(0.30 0.018 268)",
                  }}
                />
              );
            })}
          </div>

          {/* Draggable selection window */}
          <div
            className="absolute top-0 bottom-0 rounded-xl touch-none"
            style={{
              left: `${selLeft}%`,
              width: `${selWidth}%`,
              background: "oklch(0.65 0.22 280 / 0.18)",
              border: "2px solid oklch(0.65 0.22 280)",
              cursor: isDragging.current ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={(e) => e.stopPropagation()} // don't trigger track click
          >
            {/* Left handle */}
            <div className="absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center">
              <div className="h-8 w-[3px] rounded-full bg-primary" />
            </div>
            {/* Right handle */}
            <div className="absolute right-0 top-0 bottom-0 w-5 flex items-center justify-center">
              <div className="h-8 w-[3px] rounded-full bg-primary" />
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none"
            style={{
              left: `${playheadRatio * 100}%`,
              background: "white",
              opacity: 0.85,
              transition: "left 0.08s linear",
            }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-[11px] -mt-2 px-0.5">
          <span className="text-muted-foreground">0:00</span>
          <span className="text-primary font-semibold tabular-nums">
            {formatSec(startSec)} – {formatSec(Math.min(startSec + CLIP, TOTAL))}
          </span>
          <span className="text-muted-foreground">{formatSec(TOTAL)}</span>
        </div>

        {/* Confirm */}
        <Button
          onClick={() => onConfirm(startSec)}
          className="w-full h-11 rounded-xl font-semibold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          Use this clip
        </Button>
      </div>
    </div>
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
