// ─── ProfileHighlights.tsx ─────────────────────────────────────
// Instagram-style story highlights for the profile page.
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus, X, Pencil, Trash2, Loader2, ChevronRight, MoreHorizontal,
  Play, Pause, Volume2, VolumeX, Check, Eye, Users, Lock, Globe,
  Link2, Share2, BookmarkPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────
export type Highlight = {
  id: string;
  user_id: string;
  title: string;
  cover_url: string | null;
  story_ids: string[];
  visibility: "public" | "followers" | "close_friends";
  sort_order: number;
  created_at: string;
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
  music_title: string | null;
  music_artist: string | null;
  music_artwork_url: string | null;
  music_preview_url: string | null;
  music_start_sec: number | null;
};

type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
  is_verified?: boolean;
};

function initials(n: string) { return (n ?? "?").slice(0, 2).toUpperCase(); }

const CATEGORY_EMOJIS = [
  { emoji: "📸", label: "Travel" }, { emoji: "⚽", label: "Sports" },
  { emoji: "🎵", label: "Music" }, { emoji: "🍔", label: "Food" },
  { emoji: "🎓", label: "Education" }, { emoji: "💼", label: "Business" },
  { emoji: "❤️", label: "Personal" }, { emoji: "🎮", label: "Gaming" },
  { emoji: "🌿", label: "Nature" }, { emoji: "🎨", label: "Art" },
];

// ─── Main exported component ───────────────────────────────────
export function ProfileHighlights({
  userId, meId, isOwnProfile,
}: {
  userId: string; meId: string; isOwnProfile: boolean;
}) {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewHighlight, setViewHighlight] = useState<Highlight | null>(null);
  const [editHighlight, setEditHighlight] = useState<Highlight | null>(null);

  const highlightsQ = useQuery({
    queryKey: ["highlights", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("highlights")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });
      if (error) return [] as Highlight[];
      return (data ?? []) as Highlight[];
    },
  });

  // Fetch ALL stories for this user (archive — includes expired)
  const archiveQ = useQuery({
    queryKey: ["stories-archive", userId],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("stories").select("*").eq("user_id", userId)
        .order("created_at", { ascending: false });
      return (data ?? []) as Story[];
    },
  });

  const highlights = highlightsQ.data ?? [];
  const archive = archiveQ.data ?? [];

  function refresh() {
    qc.invalidateQueries({ queryKey: ["highlights", userId] });
  }

  async function deleteHighlight(id: string) {
    if (!confirm("Delete this highlight?")) return;
    await (supabase as any).from("highlights").delete().eq("id", id);
    refresh();
    toast.success("Highlight deleted");
  }

  async function moveHighlight(id: string, dir: -1 | 1) {
    const list = [...highlights];
    const idx = list.findIndex(h => h.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= list.length) return;
    // Swap sort_order values
    const a = list[idx]; const b = list[newIdx];
    await Promise.all([
      (supabase as any).from("highlights").update({ sort_order: b.sort_order }).eq("id", a.id),
      (supabase as any).from("highlights").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  if (highlights.length === 0 && !isOwnProfile) return null;

  return (
    <div className="mb-1">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1 touch-pan-x">
        {/* "New" button — own profile only */}
        {isOwnProfile && (
          <button
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="h-16 w-16 rounded-full border-2 border-dashed grid place-items-center transition-all group-hover:border-primary/60"
              style={{ borderColor: "oklch(0.30 0.018 268)", background: "oklch(0.16 0.016 268)" }}>
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[11px] text-muted-foreground max-w-[64px] truncate">New</span>
          </button>
        )}

        {/* Highlight bubbles */}
        {highlights.map((hl) => (
          <HighlightBubble
            key={hl.id}
            highlight={hl}
            isOwnProfile={isOwnProfile}
            onView={() => setViewHighlight(hl)}
            onEdit={() => setEditHighlight(hl)}
            onDelete={() => deleteHighlight(hl.id)}
            onMoveLeft={() => moveHighlight(hl.id, -1)}
            onMoveRight={() => moveHighlight(hl.id, 1)}
          />
        ))}
      </div>

      {/* Create highlight dialog */}
      {createOpen && (
        <CreateHighlightDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          userId={userId}
          archive={archive}
          onCreated={refresh}
        />
      )}

      {/* View highlight (story player) */}
      {viewHighlight && (
        <HighlightViewer
          highlight={viewHighlight}
          archive={archive}
          meId={meId}
          isOwner={isOwnProfile}
          onClose={() => setViewHighlight(null)}
          onEdit={() => { setViewHighlight(null); setEditHighlight(viewHighlight); }}
        />
      )}

      {/* Edit highlight dialog */}
      {editHighlight && (
        <EditHighlightDialog
          open={!!editHighlight}
          onOpenChange={(v) => { if (!v) setEditHighlight(null); }}
          highlight={editHighlight}
          archive={archive}
          onSaved={refresh}
        />
      )}
    </div>
  );
}

// ─── Highlight bubble (circle on profile) ─────────────────────
function HighlightBubble({ highlight, isOwnProfile, onView, onEdit, onDelete, onMoveLeft, onMoveRight }: {
  highlight: Highlight; isOwnProfile: boolean;
  onView: () => void; onEdit: () => void; onDelete: () => void;
  onMoveLeft: () => void; onMoveRight: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0 relative group">
      <button
        onClick={onView}
        className="h-16 w-16 rounded-full p-[2.5px] transition-all hover:scale-105"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="h-full w-full rounded-full overflow-hidden"
          style={{ border: "2px solid var(--background)" }}>
          {highlight.cover_url ? (
            <img src={highlight.cover_url} alt={highlight.title}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center"
              style={{ background: "oklch(0.20 0.016 268)" }}>
              <BookmarkPlus className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
      </button>
      <span className="text-[11px] max-w-[64px] truncate text-center leading-tight">
        {highlight.title}
      </span>

      {/* Three-dot context menu (own profile only) */}
      {isOwnProfile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute -top-1 -right-1 h-5 w-5 rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "oklch(0.22 0.016 268)", border: "1px solid oklch(0.30 0.018 268)" }}>
              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl w-44"
            style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.24 0.018 268)" }}>
            <DropdownMenuItem onClick={onView} className="gap-2 rounded-lg cursor-pointer text-sm">
              <Play className="h-3.5 w-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-lg cursor-pointer text-sm">
              <Pencil className="h-3.5 w-3.5" /> Edit highlight
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "oklch(0.22 0.016 268)" }} />
            <DropdownMenuItem onClick={onMoveLeft} className="gap-2 rounded-lg cursor-pointer text-sm text-muted-foreground">
              ← Move left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveRight} className="gap-2 rounded-lg cursor-pointer text-sm text-muted-foreground">
              → Move right
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "oklch(0.22 0.016 268)" }} />
            <DropdownMenuItem onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}
              className="gap-2 rounded-lg cursor-pointer text-sm text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: "oklch(0.22 0.016 268)" }} />
            <DropdownMenuItem onClick={onDelete} className="gap-2 rounded-lg cursor-pointer text-sm text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

// ─── Create Highlight Dialog ───────────────────────────────────
function CreateHighlightDialog({ open, onOpenChange, userId, archive, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  userId: string; archive: Story[]; onCreated: () => void;
}) {
  const [step, setStep] = useState<"stories" | "details">("stories");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [visibility, setVisibility] = useState<"public" | "followers" | "close_friends">("followers");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("stories"); setSelectedIds([]); setTitle(""); setEmoji("");
    setVisibility("followers"); setCoverUrl(null); setSaving(false);
  }

  function toggleStory(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function uploadCover(file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stories").upload(path, file, { upsert: true });
    if (error) { toast.error("Cover upload failed"); return null; }
    return supabase.storage.from("stories").getPublicUrl(path).data.publicUrl;
  }

  async function create() {
    if (!title.trim()) { toast.error("Enter a title"); return; }
    if (selectedIds.length === 0) { toast.error("Select at least one story"); return; }
    setSaving(true);
    try {
      // Auto cover = first selected story's media
      let cover = coverUrl;
      if (!cover && selectedIds.length > 0) {
        const first = archive.find(s => s.id === selectedIds[0]);
        if (first && first.media_type === "image") cover = first.media_url;
      }
      const { error } = await (supabase as any).from("highlights").insert({
        user_id: userId,
        title: (emoji ? emoji + " " : "") + title.trim(),
        cover_url: cover,
        story_ids: selectedIds,
        visibility,
        sort_order: Date.now(),
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Highlight created!");
      onCreated();
      reset();
      onOpenChange(false);
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-1rem)] p-0 overflow-hidden max-h-[90dvh] flex flex-col"
        style={{ background: "oklch(0.13 0.015 268)" }}>
        <DialogHeader className="px-4 sm:px-5 pt-5 pb-3 shrink-0 border-b" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">
              {step === "stories" ? "Choose stories" : "New highlight"}
            </DialogTitle>
            {step === "details" && (
              <button onClick={() => setStep("stories")} className="text-xs text-primary">← Back</button>
            )}
          </div>
        </DialogHeader>

        {step === "stories" ? (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">
              {archive.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center px-6">
                  <BookmarkPlus className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No archived stories yet. Post a story first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 p-3">
                  {archive.map(story => {
                    const sel = selectedIds.includes(story.id);
                    return (
                      <button key={story.id} onClick={() => toggleStory(story.id)}
                        className={cn("relative aspect-[9/16] rounded-xl overflow-hidden transition-all",
                          sel ? "ring-2 ring-primary ring-offset-1 ring-offset-black" : "opacity-70 hover:opacity-100")}>
                        {story.media_type === "video"
                          ? <video src={story.media_url} className="w-full h-full object-cover" muted playsInline />
                          : <img src={story.media_url} alt="" className="w-full h-full object-cover" />}
                        {sel && (
                          <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full grid place-items-center"
                            style={{ background: "var(--gradient-primary)" }}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-4 pb-4 pt-3 shrink-0 border-t" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
              <Button onClick={() => { if (selectedIds.length === 0) { toast.error("Select at least one story"); return; } setStep("details"); }}
                className="w-full h-10 rounded-xl font-semibold"
                style={{ background: "var(--gradient-primary)" }}>
                Next ({selectedIds.length} selected)
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-4 space-y-4">
            {/* Cover selector */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground self-start font-medium">Cover</p>
              <button onClick={() => coverInputRef.current?.click()}
                className="h-20 w-20 rounded-full overflow-hidden border-2 border-dashed hover:border-primary/60 transition-all"
                style={{ borderColor: "oklch(0.30 0.018 268)", background: "oklch(0.18 0.016 268)" }}>
                {coverUrl
                  ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-muted-foreground text-xs text-center px-2">
                      Tap to<br />set cover
                    </div>}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  const url = await uploadCover(f); if (url) setCoverUrl(url);
                }} />
              <p className="text-[10px] text-muted-foreground">Or auto-set from first story</p>
            </div>

            {/* Emoji category */}
            <div>
              <p className="text-xs font-medium mb-2">Category (optional)</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_EMOJIS.map(c => (
                  <button key={c.emoji} onClick={() => setEmoji(emoji === c.emoji ? "" : c.emoji)}
                    className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs border transition-all",
                      emoji === c.emoji ? "border-primary/60 bg-primary/10" : "border-border hover:border-primary/30"
                    )}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Title</p>
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={30}
                placeholder="e.g. Summer 2026" className="rounded-xl" autoFocus />
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium">Audience</p>
              <div className="flex flex-col gap-1.5">
                {([
                  { val: "public", icon: <Globe className="h-4 w-4" />, label: "Public", desc: "Anyone can see" },
                  { val: "followers", icon: <Users className="h-4 w-4" />, label: "Followers only", desc: "People who follow you" },
                  { val: "close_friends", icon: <Lock className="h-4 w-4" />, label: "Close friends", desc: "Your close friends list" },
                ] as const).map(({ val, icon, label, desc }) => (
                  <button key={val} onClick={() => setVisibility(val)}
                    className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                      visibility === val ? "border-primary/50 bg-primary/8" : "border-border hover:border-primary/30"
                    )}>
                    <span className="text-primary shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    {visibility === val && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={create} disabled={saving}
              className="w-full h-10 rounded-xl font-semibold"
              style={{ background: "var(--gradient-primary)" }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create highlight"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Highlight Dialog ─────────────────────────────────────
function EditHighlightDialog({ open, onOpenChange, highlight, archive, onSaved }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  highlight: Highlight; archive: Story[]; onSaved: () => void;
}) {
  const [title, setTitle] = useState(highlight.title);
  const [storyIds, setStoryIds] = useState<string[]>(highlight.story_ids ?? []);
  const [coverUrl, setCoverUrl] = useState<string | null>(highlight.cover_url);
  const [visibility, setVisibility] = useState<"public" | "followers" | "close_friends">(highlight.visibility);
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(highlight.title);
      setStoryIds(highlight.story_ids ?? []);
      setCoverUrl(highlight.cover_url);
      setVisibility(highlight.visibility);
    }
  }, [open, highlight]);

  function toggleStory(id: string) {
    setStoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function uploadCover(file: File) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${highlight.user_id}/covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("stories").upload(path, file, { upsert: true });
    if (error) { toast.error("Cover upload failed"); return null; }
    return supabase.storage.from("stories").getPublicUrl(path).data.publicUrl;
  }

  async function save() {
    if (!title.trim()) { toast.error("Enter a title"); return; }
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("highlights").update({
        title: title.trim(),
        story_ids: storyIds,
        cover_url: coverUrl,
        visibility,
      }).eq("id", highlight.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Highlight updated");
      onSaved(); onOpenChange(false);
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-1rem)] p-0 overflow-hidden max-h-[90dvh] flex flex-col"
        style={{ background: "oklch(0.13 0.015 268)" }}>
        <DialogHeader className="px-4 sm:px-5 pt-5 pb-3 shrink-0 border-b" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
          <DialogTitle>Edit highlight</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-5 py-4 space-y-5">
          {/* Cover */}
          <div className="flex items-center gap-4">
            <button onClick={() => coverInputRef.current?.click()}
              className="h-16 w-16 rounded-full overflow-hidden border-2 border-dashed hover:border-primary/60 transition-all shrink-0"
              style={{ borderColor: "oklch(0.30 0.018 268)", background: "oklch(0.18 0.016 268)" }}>
              {coverUrl ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full grid place-items-center text-muted-foreground text-[10px] text-center">Cover</div>}
            </button>
            <div className="flex-1">
              <p className="text-xs font-medium mb-1.5">Title</p>
              <Input value={title} onChange={e => setTitle(e.target.value)} maxLength={30} className="rounded-xl" />
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden"
              onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const url = await uploadCover(f); if (url) setCoverUrl(url); }} />
          </div>

          {/* Visibility */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium">Audience</p>
            <div className="flex gap-2">
              {(["public", "followers", "close_friends"] as const).map(val => (
                <button key={val} onClick={() => setVisibility(val)}
                  className={cn("flex-1 py-2 rounded-xl text-xs font-medium border transition-all capitalize",
                    visibility === val ? "border-primary/60 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                  )}>
                  {val === "close_friends" ? "Close friends" : val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stories grid — toggle included */}
          <div>
            <p className="text-xs font-medium mb-2">Stories ({storyIds.length} selected)</p>
            <div className="grid grid-cols-3 gap-1">
              {archive.map(story => {
                const sel = storyIds.includes(story.id);
                return (
                  <button key={story.id} onClick={() => toggleStory(story.id)}
                    className={cn("relative aspect-[9/16] rounded-xl overflow-hidden transition-all",
                      sel ? "ring-2 ring-primary ring-offset-1 ring-offset-black" : "opacity-60 hover:opacity-100")}>
                    {story.media_type === "video"
                      ? <video src={story.media_url} className="w-full h-full object-cover" muted playsInline />
                      : <img src={story.media_url} alt="" className="w-full h-full object-cover" />}
                    {sel && (
                      <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full grid place-items-center"
                        style={{ background: "var(--gradient-primary)" }}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={save} disabled={saving} className="w-full h-10 rounded-xl font-semibold"
            style={{ background: "var(--gradient-primary)" }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Highlight Viewer (story player) ──────────────────────────
const TICK = 50;

function HighlightViewer({ highlight, archive, meId, isOwner, onClose, onEdit }: {
  highlight: Highlight; archive: Story[]; meId: string;
  isOwner: boolean; onClose: () => void; onEdit: () => void;
}) {
  const stories = useMemo(() => {
    const ids = highlight.story_ids ?? [];
    return ids.map(id => archive.find(s => s.id === id)).filter(Boolean) as Story[];
  }, [highlight, archive]);

  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qc = useQueryClient();

  const story = stories[idx];

  // Progress bar timer
  useEffect(() => {
    if (!story) return;
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (paused) return;
    const dur = (story.duration_sec ?? 5) * 1000;
    const step = (TICK / dur) * 100;
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        if (p + step >= 100) {
          clearInterval(intervalRef.current!);
          // Advance to next story
          if (idx < stories.length - 1) setIdx(i => i + 1);
          else onClose();
          return 100;
        }
        return p + step;
      });
    }, TICK);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [idx, paused, story]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync video with pause state
  useEffect(() => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.pause();
    else videoRef.current.play().catch(() => {});
  }, [paused]);

  // Record view
  useEffect(() => {
    if (!story || !meId) return;
    (supabase as any).from("story_views").upsert({ story_id: story.id, viewer_id: meId }, { onConflict: "story_id,viewer_id" });
  }, [story, meId]);

  if (!story) { onClose(); return null; }
  const isVideo = story.media_type === "video";

  function prev() { if (idx > 0) { setIdx(i => i - 1); setProgress(0); } }
  function next() { if (idx < stories.length - 1) { setIdx(i => i + 1); setProgress(0); } else onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}>

      {/* Story media — full bleed on phones, constrained on desktop */}
      <div className="relative w-full sm:max-w-sm mx-auto h-[100dvh] overflow-hidden">
        {isVideo ? (
          <video ref={videoRef} src={story.media_url} className="absolute inset-0 w-full h-full object-cover"
            muted={muted} autoPlay playsInline loop />
        ) : (
          <img src={story.media_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.6) 100%)" }} />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 px-2 pt-3 z-20">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-[2.5px] rounded-full overflow-hidden bg-white/30">
              <div className="h-full bg-white rounded-full transition-none"
                style={{ width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-0 right-0 z-20 flex items-center gap-2.5 px-3 pt-2">
          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0"
            style={{ border: "1.5px solid white" }}>
            {highlight.cover_url
              ? <img src={highlight.cover_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full grid place-items-center bg-primary/40">
                  <BookmarkPlus className="h-4 w-4 text-white" />
                </div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{highlight.title}</p>
            <p className="text-white/60 text-[10px]">{idx + 1} / {stories.length}</p>
          </div>
          {/* Mute / owner edit */}
          <div className="flex items-center gap-1">
            {isVideo && (
              <button onClick={(e) => { e.stopPropagation(); setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="h-8 w-8 rounded-full grid place-items-center bg-black/40">
                {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
              </button>
            )}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button onClick={e => e.stopPropagation()}
                    className="h-8 w-8 rounded-full grid place-items-center bg-black/40">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl w-40"
                  style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.24 0.018 268)" }}>
                  <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-lg cursor-pointer text-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit highlight
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="h-8 w-8 rounded-full grid place-items-center bg-black/40">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tap zones: left = prev, right = next */}
        <div className="absolute inset-0 flex pointer-events-none z-10">
          <div className="w-1/3 h-full pointer-events-auto" onClick={(e) => { e.stopPropagation(); prev(); }} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full pointer-events-auto" onClick={(e) => { e.stopPropagation(); next(); }} />
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-16 left-0 right-0 px-4 z-20">
            <p className="text-white text-sm leading-relaxed drop-shadow">{story.caption}</p>
          </div>
        )}

        {/* Story number bottom */}
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-3 z-20 pointer-events-none">
          <span className="text-white/50 text-[11px]">
            {new Date(story.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
