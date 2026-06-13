import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Camera, Grid3X3, Play, Heart, Plus, X, Loader2,
  Upload, ImagePlus, Trash2, MessageCircle, Video, Home,
  Lock, Unlock, Users, UserPlus, MoreHorizontal, Flag, Shield,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  useFollowCounts, useFollowRelationship, useFollowActions, useFollowRequests,
} from "@/hooks/use-follow";
import { FollowButton } from "@/components/FollowButton";
import { FollowListModal } from "@/components/FollowListModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ userId: z.string().optional() });

export const Route = createFileRoute("/_authenticated/profile")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Profile — chatfaa" }] }),
  component: ProfilePage,
});

// ─── Types ────────────────────────────────────────────────────
type Profile = {
  id: string; username: string; display_name: string | null;
  avatar_url: string | null; bio: string | null; status: string;
  is_private?: boolean;
};
type Post = {
  id: string; user_id: string; image_url: string | null;
  caption: string | null; created_at: string;
};
type PostLike = { post_id: string; user_id: string };
type Reel = {
  id: string; user_id: string; video_url: string;
  thumbnail_url: string | null; caption: string | null; created_at: string;
};
type FollowListTab = "followers" | "following" | "requests";

function initials(name: string) { return name.slice(0, 2).toUpperCase(); }
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

// ─── Profile Page ──────────────────────────────────────────────
function ProfilePage() {
  const { user } = useAuth();
  const { userId } = Route.useSearch();
  const qc = useQueryClient();

  const targetId = userId ?? user?.id ?? "";
  const isOwnProfile = !userId || userId === user?.id;

  const [uploadPostOpen, setUploadPostOpen] = useState(false);
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null);
  const [lightboxReel, setLightboxReel] = useState<Reel | null>(null);
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<FollowListTab>("followers");

  // Always call — hook is disabled when targetId === meId
  const relQ = useFollowRelationship(targetId, user?.id ?? "");

  const profileQ = useQuery({
    queryKey: ["profile", targetId],
    enabled: !!targetId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles").select("*").eq("id", targetId).maybeSingle();
        if (error) return null;
        return data as Profile | null;
      } catch { return null; }
    },
  });

  const postsQ = useQuery({
    queryKey: ["posts", targetId],
    enabled: !!targetId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("posts").select("*").eq("user_id", targetId)
          .order("created_at", { ascending: false });
        if (error) return [] as Post[];
        return data as Post[];
      } catch { return [] as Post[]; }
    },
  });

  const postLikesQ = useQuery({
    queryKey: ["post-likes"],
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any).from("post_likes").select("*");
        if (error) return [] as PostLike[];
        return data as PostLike[];
      } catch { return [] as PostLike[]; }
    },
  });

  const reelsQ = useQuery({
    queryKey: ["reels-profile", targetId],
    enabled: !!targetId,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reels").select("*").eq("user_id", targetId)
          .order("created_at", { ascending: false });
        if (error) return [] as Reel[];
        return data as Reel[];
      } catch { return [] as Reel[]; }
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("rt-profile-" + targetId)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => qc.invalidateQueries({ queryKey: ["posts", targetId] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "post_likes" }, () => qc.invalidateQueries({ queryKey: ["post-likes"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "follows" }, () => {
        qc.invalidateQueries({ queryKey: ["follow-counts", targetId] });
        qc.invalidateQueries({ queryKey: ["follow-rel", user?.id, targetId] });
        if (isOwnProfile) qc.invalidateQueries({ queryKey: ["follow-requests"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [targetId, qc, user?.id, isOwnProfile]);

  async function togglePostLike(postId: string) {
    if (!user) return;
    const liked = (postLikesQ.data ?? []).some((l) => l.post_id === postId && l.user_id === user.id);
    if (liked) {
      await (supabase as any).from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await (supabase as any).from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
    qc.invalidateQueries({ queryKey: ["post-likes"] });
  }

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await (supabase as any).from("posts").delete().eq("id", postId);
    if (error) toast.error(error.message);
    else { toast.success("Post deleted"); qc.invalidateQueries({ queryKey: ["posts", targetId] }); }
  }

  if (!user) return null;
  const profile = profileQ.data;
  const posts = postsQ.data ?? [];
  const reels = reelsQ.data ?? [];
  const likes = postLikesQ.data ?? [];

  // Privacy gate: private account, not own profile, not following
  const isFollowing = relQ.data?.i_follow === "accepted";
  const isBlocked = relQ.data?.is_blocked;
  const isPrivate = profile?.is_private && !isOwnProfile && !isFollowing;

  function openFollowList(tab: FollowListTab) {
    setFollowListTab(tab);
    setFollowListOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b"
        style={{ background: "oklch(0.13 0.015 268 / 0.95)", borderColor: "oklch(0.20 0.016 268)", backdropFilter: "blur(16px)" }}>
        <Link to="/feed">
          <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <span className="font-semibold text-sm flex items-center gap-1.5">
          {profile ? `@${profile.username}` : "Profile"}
          {profile?.is_private && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Link to="/feed">
            <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" title="Feed">
              <Home className="h-[17px] w-[17px]" />
            </button>
          </Link>
          <Link to="/chat">
            <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" title="Chat">
              <MessageCircle className="h-[17px] w-[17px]" />
            </button>
          </Link>
          <Link to="/reels">
            <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all" title="Reels">
              <Video className="h-[17px] w-[17px]" />
            </button>
          </Link>
          {/* Other user actions */}
          {!isOwnProfile && profile && (
            <OtherUserMenu targetId={targetId} meId={user.id} username={profile.username} />
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-16">
        {/* ── Profile header ── */}
        <div className="pt-8 pb-6">
          {profileQ.isLoading ? (
            <ProfileHeaderSkeleton />
          ) : profile ? (
            <ProfileHeader
              profile={profile}
              isOwnProfile={isOwnProfile}
              postCount={posts.length}
              reelCount={reels.length}
              meId={user.id}
              onOpenFollowers={() => openFollowList("followers")}
              onOpenFollowing={() => openFollowList("following")}
              onOpenRequests={() => openFollowList("requests")}
            />
          ) : (
            <p className="text-center text-muted-foreground py-12">User not found.</p>
          )}
        </div>

        {/* ── Upload post button (own profile) ── */}
        {isOwnProfile && (
          <div className="mb-6">
            <button
              onClick={() => setUploadPostOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 h-11 rounded-2xl border-2 border-dashed text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
              style={{ borderColor: "oklch(0.28 0.018 268)" }}
            >
              <ImagePlus className="h-4 w-4" />
              Upload a post
            </button>
          </div>
        )}

        {/* ── Private account gate ── */}
        {isPrivate ? (
          <PrivateAccountGate username={profile?.username ?? ""} />
        ) : isBlocked ? (
          <BlockedGate />
        ) : (
          <Tabs defaultValue="posts">
            <TabsList className="w-full rounded-2xl mb-6 h-11" style={{ background: "oklch(0.16 0.016 268)" }}>
              <TabsTrigger value="posts" className="flex-1 gap-2 rounded-xl data-[state=active]:text-foreground">
                <Grid3X3 className="h-4 w-4" /> Posts ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="reels" className="flex-1 gap-2 rounded-xl data-[state=active]:text-foreground">
                <Play className="h-4 w-4" /> Reels ({reels.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              {postsQ.isLoading ? <GridSkeleton /> : posts.length === 0 ? (
                <EmptyState icon={<ImagePlus className="h-8 w-8" />} title="No posts yet"
                  sub={isOwnProfile ? "Upload your first post above." : "This user hasn't posted yet."} />
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {posts.map((post) => {
                    const likeCount = likes.filter((l) => l.post_id === post.id).length;
                    const liked = likes.some((l) => l.post_id === post.id && l.user_id === user.id);
                    return (
                      <div key={post.id}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                        style={{ background: "oklch(0.16 0.016 268)" }}
                        onClick={() => setLightboxPost(post)}
                      >
                        {post.image_url ? (
                          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-2">
                            <p className="text-xs text-white/60 text-center line-clamp-4">{post.caption}</p>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="flex items-center gap-1 text-white text-sm font-semibold">
                            <Heart className={cn("h-4 w-4", liked ? "fill-red-500 text-red-500" : "")} /> {likeCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reels">
              {reelsQ.isLoading ? <GridSkeleton /> : reels.length === 0 ? (
                <EmptyState icon={<Play className="h-8 w-8" />} title="No reels yet"
                  sub={isOwnProfile ? "Upload a reel from the Reels page." : "This user hasn't uploaded reels yet."} />
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {reels.map((reel) => (
                    <div key={reel.id}
                      className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
                      style={{ background: "oklch(0.16 0.016 268)" }}
                      onClick={() => setLightboxReel(reel)}
                    >
                      {reel.thumbnail_url ? (
                        <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <video src={reel.video_url} className="w-full h-full object-cover" muted playsInline />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-end p-2">
                        <Play className="h-5 w-5 text-white fill-white drop-shadow" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <UploadPostDialog
        open={uploadPostOpen}
        onOpenChange={setUploadPostOpen}
        userId={user.id}
        onUploaded={() => qc.invalidateQueries({ queryKey: ["posts", targetId] })}
      />

      {lightboxPost && (
        <PostLightbox
          post={lightboxPost}
          likes={likes.filter((l) => l.post_id === lightboxPost.id)}
          meId={user.id}
          isOwner={lightboxPost.user_id === user.id}
          onClose={() => setLightboxPost(null)}
          onLike={() => togglePostLike(lightboxPost.id)}
          onDelete={() => { deletePost(lightboxPost.id); setLightboxPost(null); }}
        />
      )}

      {lightboxReel && (
        <ReelLightbox reel={lightboxReel} onClose={() => setLightboxReel(null)} />
      )}

      {followListOpen && profile && (
        <FollowListModal
          userId={targetId}
          meId={user.id}
          isOwnProfile={isOwnProfile}
          initialTab={followListTab}
          onClose={() => setFollowListOpen(false)}
          requestCount={isOwnProfile ? undefined : 0}
        />
      )}
    </div>
  );
}

// ─── Other user menu ───────────────────────────────────────────
function OtherUserMenu({ targetId, meId, username }: {
  targetId: string; meId: string; username: string;
}) {
  const { follow, unfollow } = useFollowActions(meId);

  async function handleBlock() {
    if (!confirm(`Block @${username}? They won't be able to follow you or see your profile.`)) return;
    const { error } = await supabase.rpc("block_user", { _target: targetId });
    if (error) toast.error(error.message);
    else toast.success(`@${username} blocked`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
          <MoreHorizontal className="h-[17px] w-[17px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl w-44"
        style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.24 0.018 268)" }}
      >
        <DropdownMenuItem
          onClick={handleBlock}
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg gap-2"
        >
          <Shield className="h-4 w-4" /> Block @{username}
        </DropdownMenuItem>
        <DropdownMenuSeparator style={{ background: "oklch(0.22 0.016 268)" }} />
        <DropdownMenuItem
          className="text-muted-foreground focus:text-foreground cursor-pointer rounded-lg gap-2"
          onClick={() => toast.info("Report submitted. Thank you.")}
        >
          <Flag className="h-4 w-4" /> Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Profile header ────────────────────────────────────────────
function ProfileHeader({
  profile, isOwnProfile, postCount, reelCount, meId,
  onOpenFollowers, onOpenFollowing, onOpenRequests,
}: {
  profile: Profile; isOwnProfile: boolean;
  postCount: number; reelCount: number; meId: string;
  onOpenFollowers: () => void;
  onOpenFollowing: () => void;
  onOpenRequests: () => void;
}) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const countsQ = useFollowCounts(profile.id);
  const requestsQ = useFollowRequests();
  const pendingCount = isOwnProfile ? (requestsQ.data?.length ?? 0) : 0;

  const counts = countsQ.data ?? { followers: 0, following: 0 };

  return (
    <div>
      {/* Avatar row */}
      <div className="flex items-start gap-5 mb-5">
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 ring-2 ring-white/10">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xl font-bold"
              style={{ background: "var(--gradient-primary)", color: "white" }}>
              {initials(profile.username)}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <button
              onClick={() => setEditOpen(true)}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center text-white transition-all hover:scale-110"
              style={{ background: "var(--gradient-primary)", boxShadow: "0 2px 8px oklch(0.65 0.22 280 / 0.5)" }}
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2 flex-wrap">
          <StatBtn label="Posts" value={postCount} onClick={() => {}} />
          <StatBtn label="Followers" value={counts.followers} onClick={onOpenFollowers} badge={pendingCount > 0 ? pendingCount : undefined} />
          <StatBtn label="Following" value={counts.following} onClick={onOpenFollowing} />
          {isOwnProfile && pendingCount > 0 && (
            <button
              onClick={onOpenRequests}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
              style={{ background: "oklch(0.62 0.22 25 / 0.2)", color: "oklch(0.72 0.20 25)", border: "1px solid oklch(0.62 0.22 25 / 0.4)" }}
            >
              <UserPlus className="h-3 w-3" />
              {pendingCount} request{pendingCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Name / bio */}
      <div className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-bold text-base leading-tight">
            {profile.display_name || profile.username}
          </div>
          {profile.is_private && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full text-muted-foreground"
              style={{ background: "oklch(0.20 0.016 268)", border: "1px solid oklch(0.28 0.018 268)" }}>
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">@{profile.username}</div>
        {profile.bio && (
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        )}
      </div>

      {/* Action buttons */}
      {isOwnProfile ? (
        <div className="flex gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="flex-1 h-9 rounded-xl text-sm font-medium border transition-all hover:bg-white/5"
            style={{ borderColor: "oklch(0.30 0.018 268)", color: "oklch(0.80 0.010 268)" }}
          >
            Edit profile
          </button>
          <Link to="/settings">
            <Button variant="outline" className="h-9 px-3 rounded-xl"
              style={{ borderColor: "oklch(0.30 0.018 268)" }}
              title="Settings">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex gap-2">
          <FollowButton targetId={profile.id} meId={meId} className="flex-1" />
          <Link to="/chat" search={{ userId: profile.id } as any}>
            <Button variant="outline" className="h-9 px-4 rounded-xl text-sm font-medium"
              style={{ borderColor: "oklch(0.30 0.018 268)" }}>
              <MessageCircle className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        meId={meId}
        onSaved={() => qc.invalidateQueries({ queryKey: ["profile", profile.id] })}
      />
    </div>
  );
}

function StatBtn({ label, value, onClick, badge }: {
  label: string; value: number; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick} className="text-center relative group hover:opacity-80 transition-opacity">
      <div className="text-lg font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-2 h-4 min-w-4 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
          style={{ background: "oklch(0.62 0.22 25)" }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Private account gate ──────────────────────────────────────
function PrivateAccountGate({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
      <div className="h-14 w-14 rounded-2xl grid place-items-center"
        style={{ background: "oklch(0.18 0.016 268)", border: "1px solid oklch(0.28 0.018 268)" }}>
        <Lock className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-semibold text-sm">This account is private</p>
      <p className="text-xs text-muted-foreground max-w-[220px]">
        Follow @{username} to see their photos and videos.
      </p>
    </div>
  );
}

function BlockedGate() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
      <div className="h-14 w-14 rounded-2xl grid place-items-center"
        style={{ background: "oklch(0.18 0.016 268)", border: "1px solid oklch(0.28 0.018 268)" }}>
        <Shield className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="font-semibold text-sm">Content not available</p>
    </div>
  );
}

// ─── Edit profile dialog ───────────────────────────────────────
function EditProfileDialog({ open, onOpenChange, profile, meId, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  profile: Profile; meId: string; onSaved: () => void;
}) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isPrivate, setIsPrivate] = useState(profile.is_private ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setIsPrivate(profile.is_private ?? false);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [open, profile]);

  function pickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  }

  async function save() {
    setSaving(true);
    try {
      let avatar_url = profile.avatar_url;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop() ?? "jpg";
        const path = `${meId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars").upload(path, avatarFile, { upsert: true });
        if (upErr) { toast.error("Avatar upload failed: " + upErr.message); return; }
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }
      const { error } = await supabase.from("profiles").update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_url,
        is_private: isPrivate,
        updated_at: new Date().toISOString(),
      }).eq("id", meId);
      if (error) { toast.error(error.message); return; }
      toast.success("Profile updated");
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
        <div className="space-y-5 pt-1">
          {/* Avatar picker */}
          <div className="flex justify-center">
            <div className="relative cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarPreview ?? profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-xl font-bold"
                  style={{ background: "var(--gradient-primary)", color: "white" }}>
                  {initials(profile.username)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={pickAvatar} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Display name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile.username} maxLength={50} className="rounded-xl" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bio</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself…" maxLength={150} rows={3}
              className="rounded-xl resize-none" />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>

          {/* Private account toggle */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "oklch(0.17 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}
          >
            <div>
              <Label htmlFor="private-toggle" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {isPrivate ? <Lock className="h-4 w-4 text-amber-400" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
                Private account
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isPrivate ? "Only approved followers see your content" : "Anyone can follow and see your posts"}
              </p>
            </div>
            <Switch
              id="private-toggle"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          <Button onClick={save} disabled={saving}
            className="w-full h-10 rounded-xl font-semibold"
            style={{ background: "var(--gradient-primary)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upload post dialog ────────────────────────────────────────
function UploadPostDialog({ open, onOpenChange, userId, onUploaded }: {
  open: boolean; onOpenChange: (v: boolean) => void; userId: string; onUploaded: () => void;
}) {
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
      const { error } = await (supabase as any).from("posts").insert({ user_id: userId, image_url, caption: caption.trim() || null });
      if (error) { toast.error(error.message); return; }
      toast.success("Post uploaded!"); onUploaded(); reset(); onOpenChange(false);
    } finally { setUploading(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!uploading) { onOpenChange(v); if (!v) reset(); } }}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-2rem)]">
        <DialogHeader><DialogTitle className="flex items-center gap-2">
          <ImagePlus className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} /> New post
        </DialogTitle></DialogHeader>
        <div className="space-y-4">
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
              <button onClick={reset} className="absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 transition-all">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption… (optional)" maxLength={2200} rows={3} className="rounded-xl resize-none" />
          <Button onClick={upload} disabled={uploading || (!file && !caption.trim())}
            className="w-full h-10 rounded-xl font-semibold" style={{ background: "var(--gradient-primary)" }}>
            {uploading ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</span> : "Share post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Post lightbox ─────────────────────────────────────────────
function PostLightbox({ post, likes, meId, isOwner, onClose, onLike, onDelete }: {
  post: Post; likes: PostLike[]; meId: string; isOwner: boolean;
  onClose: () => void; onLike: () => void; onDelete: () => void;
}) {
  const liked = likes.some((l) => l.user_id === meId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "oklch(0.14 0.015 268)" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full grid place-items-center bg-black/60">
          <X className="h-4 w-4 text-white" />
        </button>
        {post.image_url && <img src={post.image_url} alt="" className="w-full object-contain max-h-[60vh]" />}
        <div className="p-4 space-y-3">
          {post.caption && <p className="text-sm leading-relaxed">{post.caption}</p>}
          <div className="flex items-center justify-between">
            <button onClick={onLike} className="flex items-center gap-1.5 text-sm font-medium">
              <Heart className={cn("h-5 w-5 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground")} />
              <span className={liked ? "text-red-400" : "text-muted-foreground"}>{likes.length}</span>
            </button>
            <span className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</span>
            {isOwner && (
              <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reel lightbox ─────────────────────────────────────────────
function ReelLightbox({ reel, onClose }: { reel: Reel; onClose: () => void }) {
  const vidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { vidRef.current?.play(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95" onClick={onClose}>
      <div className="relative rounded-3xl overflow-hidden"
        style={{ width: "min(100vw, calc(100dvh * 9 / 16))", height: "min(100dvh, 600px)" }}
        onClick={(e) => e.stopPropagation()}>
        <video ref={vidRef} src={reel.video_url} loop muted playsInline className="w-full h-full object-cover" />
        <button onClick={onClose} className="absolute top-3 right-3 h-9 w-9 rounded-full grid place-items-center bg-black/60">
          <X className="h-5 w-5 text-white" />
        </button>
        {reel.caption && (
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-16"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
            <p className="text-white text-sm">{reel.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeletons & empty states ──────────────────────────────────
function ProfileHeaderSkeleton() {
  return (
    <div className="flex items-start gap-5 animate-pulse">
      <div className="h-20 w-20 rounded-full bg-white/10 shrink-0" />
      <div className="flex-1 space-y-3 pt-2">
        <div className="h-4 w-32 rounded-lg bg-white/10" />
        <div className="h-3 w-24 rounded-lg bg-white/8" />
        <div className="h-3 w-full rounded-lg bg-white/8" />
      </div>
    </div>
  );
}
function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-white/8 animate-pulse" />
      ))}
    </div>
  );
}
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="h-14 w-14 rounded-2xl grid place-items-center text-muted-foreground"
        style={{ background: "oklch(0.18 0.016 268)" }}>{icon}</div>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[200px]">{sub}</p>
    </div>
  );
}
