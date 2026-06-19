import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Music, Search, X, Play, Pause, Smile, Users, Star,
  Pencil, Trash2, Loader2, ChevronLeft, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VerifiedBadge";

// ─── Types ────────────────────────────────────────────────────
export type Note = {
  id: string;
  user_id: string;
  text: string;
  emoji: string | null;
  audience: "followers_back" | "close_friends";
  music_title: string | null;
  music_artist: string | null;
  music_artwork_url: string | null;
  music_preview_url: string | null;
  music_start_sec: number;
  created_at: string;
  expires_at: string;
};

type Profile = {
  id: string; username: string; display_name: string | null; avatar_url: string | null;
  is_verified?: boolean;
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
  startSec: number;
};

function initials(n: string) { return (n ?? "?").slice(0, 2).toUpperCase(); }
const CLIP = 15;
const PREVIEW_TOTAL = 30;

function timeLeft(exp: string) {
  const ms = new Date(exp).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3600000);
  if (h >= 1) return `${h}h`;
  const m = Math.floor(ms / 60000);
  return m < 1 ? "just now" : `${m}m`;
}

// ─── NotesTray: scrollable row above DMs ──────────────────────
export function NotesTray({ meId, meProfile, friendIds }: {
  meId: string;
  meProfile: Profile | null;
  friendIds: string[];
}) {
  const qc = useQueryClient();
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<{ note: Note; profile: Profile } | null>(null);
  const [replyNote, setReplyNote] = useState<Note | null>(null);

  // Fetch all active notes from me + friends
  const allIds = [meId, ...friendIds];
  const notesQ = useQuery({
    queryKey: ["notes", allIds.join(",")],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("notes").select("*")
        .in("user_id", allIds)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) return [] as Note[];
      return (data ?? []) as Note[];
    },
  });

  const noteOwnerIds = [...new Set((notesQ.data ?? []).map((n: Note) => n.user_id))];
  const profilesQ = useQuery({
    queryKey: ["note-profiles", noteOwnerIds],
    enabled: noteOwnerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").in("id", noteOwnerIds);
      const map: Record<string, Profile> = {};
      (data ?? []).forEach((p: Profile) => { map[p.id] = p; });
      return map;
    },
  });

  // Realtime
  useEffect(() => {
    const ch = supabase.channel("rt-notes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        qc.invalidateQueries({ queryKey: ["notes"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const notes = notesQ.data ?? [];
  const profiles = profilesQ.data ?? {};
  const myNote = notes.find((n: Note) => n.user_id === meId) ?? null;

  return (
    <>
      <div className="px-3 pt-3 pb-2">
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1" style={{ scrollbarWidth: "none" }}>
          {/* My note bubble */}
          <MyNoteBubble
            meId={meId}
            meProfile={meProfile}
            myNote={myNote}
            onOpen={() => setComposerOpen(true)}
          />
          {/* Friends' notes */}
          {notes.filter((n: Note) => n.user_id !== meId).map((note: Note) => {
            const p = profiles[note.user_id];
            if (!p) return null;
            return (
              <FriendNoteBubble
                key={note.id}
                note={note}
                profile={p}
                onTap={() => setViewingNote({ note, profile: p })}
              />
            );
          })}
        </div>
      </div>

      {composerOpen && (
        <NoteComposer
          meId={meId}
          existingNote={myNote}
          onClose={() => setComposerOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["notes"] }); setComposerOpen(false); }}
        />
      )}

      {viewingNote && (
        <NoteViewer
          note={viewingNote.note}
          profile={viewingNote.profile}
          meId={meId}
          onClose={() => setViewingNote(null)}
          onReply={(note) => { setViewingNote(null); setReplyNote(note); }}
        />
      )}

      {replyNote && (
        <NoteReplySheet
          note={replyNote}
          profile={profiles[replyNote.user_id] ?? null}
          meId={meId}
          onClose={() => setReplyNote(null)}
        />
      )}
    </>
  );
}

// ─── My note bubble ───────────────────────────────────────────
function MyNoteBubble({ meId, meProfile, myNote, onOpen }: {
  meId: string; meProfile: Profile | null;
  myNote: Note | null; onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="flex flex-col items-center gap-1.5 shrink-0 w-[62px]"
    >
      <div className="relative">
        {/* Note speech bubble above avatar */}
        {myNote && (
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-xl text-[10px] font-medium whitespace-nowrap max-w-[80px] truncate text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          >
            {myNote.emoji ? myNote.emoji + " " : ""}{myNote.text}
          </div>
        )}
        <div className={cn(
          "h-[54px] w-[54px] rounded-full ring-[2px] ring-offset-2 ring-offset-background",
          myNote ? "ring-primary" : "ring-border"
        )}>
          <Avatar className="h-full w-full">
            <AvatarImage src={meProfile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-bold" style={{ background: "var(--gradient-primary)", color: "white" }}>
              {initials(meProfile?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* "+" or pencil badge */}
        <div
          className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center text-white shadow"
          style={{ background: "var(--gradient-primary)" }}
        >
          {myNote ? <Pencil className="h-2.5 w-2.5" /> : <span className="text-[11px] font-bold leading-none">+</span>}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
        {myNote ? "Your note" : "Add note"}
      </span>
    </button>
  );
}

// ─── Friend note bubble ───────────────────────────────────────
function FriendNoteBubble({ note, profile, onTap }: {
  note: Note; profile: Profile; onTap: () => void;
}) {
  return (
    <button onClick={onTap} className="flex flex-col items-center gap-1.5 shrink-0 w-[62px]">
      <div className="relative">
        {/* Speech bubble */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 px-2 py-0.5 rounded-xl text-[10px] font-medium whitespace-nowrap max-w-[80px] truncate text-center"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
        >
          {note.emoji ? note.emoji + " " : ""}{note.text}
        </div>
        <div className="h-[54px] w-[54px] rounded-full p-[2px]"
          style={{ background: "var(--gradient-primary)" }}>
          <div className="h-full w-full rounded-full ring-2 ring-background overflow-hidden">
            <Avatar className="h-full w-full">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs font-bold" style={{ background: "var(--gradient-primary)", color: "white" }}>
                {initials(profile.username)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        {note.music_preview_url && (
          <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full grid place-items-center bg-card border border-border">
            <Music className="h-2.5 w-2.5 text-primary" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground truncate w-full text-center flex items-center justify-center gap-0.5">
        <span className="truncate">{profile.display_name || profile.username}</span>
        {profile.is_verified && <VerifiedBadge size={10} tooltip={false} />}
      </span>
    </button>
  );
}

// ─── Note Viewer (tap to expand) ─────────────────────────────
function NoteViewer({ note, profile, meId, onClose, onReply }: {
  note: Note; profile: Profile; meId: string;
  onClose: () => void; onReply: (n: Note) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!note.music_preview_url) return;
    const a = new Audio(note.music_preview_url);
    a.currentTime = note.music_start_sec ?? 0;
    a.muted = true;
    a.ontimeupdate = () => {
      if (a.currentTime >= (note.music_start_sec ?? 0) + CLIP) a.currentTime = note.music_start_sec ?? 0;
    };
    a.onended = () => setPlaying(false);
    audioRef.current = a;
    return () => { a.pause(); a.src = ""; };
  }, [note.music_preview_url, note.music_start_sec]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.muted = muted; a.play().catch(() => {}); setPlaying(true); }
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !muted;
    setMuted(m => !m);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden pb-safe"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-2 pb-4">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-bold" style={{ background: "var(--gradient-primary)", color: "white" }}>
              {initials(profile.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold flex items-center gap-1">{profile.display_name || profile.username}{profile.is_verified && <VerifiedBadge size={13} tooltip={false} />}</p>
            <p className="text-xs text-muted-foreground">{timeLeft(note.expires_at)} left</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition-all">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Note bubble */}
        <div className="mx-5 mb-4 px-4 py-3 rounded-2xl text-center" style={{ background: "var(--accent)" }}>
          <p className="text-base font-semibold leading-snug">
            {note.emoji && <span className="mr-1">{note.emoji}</span>}{note.text}
          </p>
        </div>

        {/* Music player */}
        {note.music_preview_url && (
          <div className="mx-5 mb-5 flex items-center gap-3 px-3 py-2.5 rounded-2xl" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
            {note.music_artwork_url
              ? <img src={note.music_artwork_url} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
              : <div className="h-10 w-10 rounded-xl grid place-items-center shrink-0" style={{ background: "var(--card)" }}><Music className="h-4 w-4 text-primary" /></div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{note.music_title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{note.music_artist}</p>
              <p className="text-[10px] text-muted-foreground/60">{CLIP}s preview</p>
            </div>
            <button onClick={togglePlay}
              className="h-9 w-9 rounded-full grid place-items-center shrink-0 transition-all"
              style={{ background: "var(--gradient-primary)" }}>
              {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white ml-0.5" />}
            </button>
          </div>
        )}

        {/* Reply button */}
        {note.user_id !== meId && (
          <div className="px-5 pb-5">
            <button
              onClick={() => onReply(note)}
              className="w-full h-11 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Send className="h-4 w-4" /> Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Note Reply Sheet → sends a DM ───────────────────────────
function NoteReplySheet({ note, profile, meId, onClose }: {
  note: Note; profile: Profile | null; meId: string; onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    const { error } = await (supabase as any).from("messages").insert({
      sender_id: meId,
      receiver_id: note.user_id,
      content: `↩ Note: "${note.text}" — ${text.trim()}`,
    });
    setSending(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Reply sent!");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden pb-safe"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--border)" }} />
        </div>
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs text-muted-foreground mb-1">Replying to note</p>
          <p className="text-sm font-medium">
            {note.emoji && <span className="mr-1">{note.emoji}</span>}{note.text}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-4">
          <Input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Reply to ${profile?.username ?? "note"}…`}
            className="flex-1 rounded-2xl"
            autoFocus
            maxLength={500}
          />
          <Button
            onClick={send}
            disabled={sending || !text.trim()}
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0 text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Note Composer (create / edit / delete) ───────────────────
function NoteComposer({ meId, existingNote, onClose, onSaved }: {
  meId: string;
  existingNote: Note | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [text, setText] = useState(existingNote?.text ?? "");
  const [emoji, setEmoji] = useState(existingNote?.emoji ?? "");
  const [audience, setAudience] = useState<"followers_back" | "close_friends">(existingNote?.audience ?? "followers_back");
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(
    existingNote?.music_preview_url
      ? { track: { trackId: 0, trackName: existingNote.music_title!, artistName: existingNote.music_artist!, artworkUrl100: existingNote.music_artwork_url!, previewUrl: existingNote.music_preview_url }, startSec: existingNote.music_start_sec }
      : null
  );
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const QUICK_EMOJIS = ["😊","😂","❤️","🔥","🎵","⚽","🎮","📚","☕","🌙","✨","🥳","😎","🤔","💪","🙏","🎉","🌸","🍕","🎸"];

  async function save() {
    if (!text.trim()) { toast.error("Write something first!"); return; }
    setSaving(true);
    try {
      if (existingNote) {
        const { error } = await (supabase as any).from("notes").update({
          text: text.trim(), emoji: emoji || null, audience,
          music_title: selectedMusic?.track.trackName ?? null,
          music_artist: selectedMusic?.track.artistName ?? null,
          music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
          music_preview_url: selectedMusic?.track.previewUrl ?? null,
          music_start_sec: selectedMusic?.startSec ?? 0,
          expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        }).eq("id", existingNote.id);
        if (error) { toast.error(error.message); return; }
        toast.success("Note updated!");
      } else {
        const { error } = await (supabase as any).from("notes").insert({
          user_id: meId, text: text.trim(), emoji: emoji || null, audience,
          music_title: selectedMusic?.track.trackName ?? null,
          music_artist: selectedMusic?.track.artistName ?? null,
          music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
          music_preview_url: selectedMusic?.track.previewUrl ?? null,
          music_start_sec: selectedMusic?.startSec ?? 0,
        });
        if (error) { toast.error(error.message); return; }
        toast.success("Note shared!");
      }
      onSaved();
    } finally { setSaving(false); }
  }

  async function deleteNote() {
    if (!existingNote) return;
    setDeleting(true);
    const { error } = await (supabase as any).from("notes").delete().eq("id", existingNote.id);
    setDeleting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Note deleted");
    onSaved();
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60" onClick={onClose}>
        <div
          className="w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full" style={{ background: "var(--border)" }} />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <h3 className="font-semibold text-sm">{existingNote ? "Edit note" : "New note"}</h3>
            <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>

          <div className="px-5 space-y-4 pb-5">
            {/* Text input */}
            <div className="relative rounded-2xl px-4 py-4 text-center" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {emoji && <span className="text-lg">{emoji}</span>}
                <input
                  className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground text-center"
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 60))}
                  placeholder="What's on your mind?"
                  maxLength={60}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => setShowEmoji(v => !v)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Smile className="h-3.5 w-3.5" /> Emoji
                </button>
                <span className="text-[11px] text-muted-foreground">{text.length}/60</span>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setEmoji(""); setShowEmoji(false); }}
                  className="text-xs text-muted-foreground px-2 py-1 rounded-lg" style={{ background: "var(--accent)" }}>
                  None
                </button>
                {QUICK_EMOJIS.map(e => (
                  <button key={e} onClick={() => { setEmoji(e); setShowEmoji(false); }}
                    className={cn("h-8 w-8 rounded-xl text-base grid place-items-center transition-all", emoji === e ? "ring-2 ring-primary" : "")}
                    style={{ background: "var(--accent)" }}>
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Music selector */}
            <button onClick={() => setMusicPickerOpen(true)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all text-sm",
                selectedMusic ? "border-primary/50" : "border-border"
              )}
              style={{ background: "var(--accent)" }}>
              {selectedMusic ? (
                <>
                  <img src={selectedMusic.track.artworkUrl100} alt="" className="h-9 w-9 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium truncate text-xs">{selectedMusic.track.trackName}</p>
                    <p className="text-muted-foreground text-[11px] truncate">{selectedMusic.track.artistName}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedMusic(null); }}
                    className="h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 shrink-0">
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0" style={{ background: "var(--card)" }}>
                    <Music className="h-4 w-4 text-primary" />
                  </div>
                  <span className="flex-1 text-left text-muted-foreground text-sm">Add music</span>
                </>
              )}
            </button>

            {/* Audience */}
            <div className="flex gap-2">
              {([
                { value: "followers_back", label: "Followers", icon: Users },
                { value: "close_friends", label: "Close Friends", icon: Star },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setAudience(value)}
                  className={cn("flex-1 flex items-center justify-center gap-2 h-9 rounded-2xl text-xs font-medium border transition-all",
                    audience === value ? "border-primary/60 text-foreground" : "border-border text-muted-foreground"
                  )}
                  style={{ background: audience === value ? "var(--card)" : "var(--accent)" }}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <Button onClick={save} disabled={saving || !text.trim()}
              className="w-full h-11 rounded-2xl font-semibold text-white"
              style={{ background: "var(--gradient-primary)" }}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : existingNote ? "Update note" : "Share note"}
            </Button>

            {existingNote && (
              <button onClick={deleteNote} disabled={deleting}
                className="w-full h-10 rounded-2xl text-sm font-medium text-destructive flex items-center justify-center gap-2 border border-destructive/30 hover:bg-destructive/5 transition-all">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /> Delete note</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {musicPickerOpen && (
        <NotesMusicPicker
          open={musicPickerOpen}
          onOpenChange={setMusicPickerOpen}
          onSelect={(m) => { setSelectedMusic(m); setMusicPickerOpen(false); }}
        />
      )}
    </>
  );
}

// ─── Notes Music Picker (search + 15s trim) ───────────────────
function NotesMusicPicker({ open, onOpenChange, onSelect }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (m: SelectedMusic) => void;
}) {
  const [step, setStep] = useState<"search" | "trim">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<MusicTrack | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TRENDING_QUERIES = ["Taylor Swift","Ed Sheeran","The Weeknd","Sabrina Carpenter","Drake"];

  useEffect(() => {
    if (!open) { audioRef.current?.pause(); setPreviewId(null); setQuery(""); setResults([]); setStep("search"); setPendingTrack(null); }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`);
        const json = await res.json();
        setResults((json.results ?? []).filter((t: MusicTrack) => t.previewUrl));
      } catch { toast.error("Music search failed"); }
      finally { setSearching(false); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  function togglePreview(track: MusicTrack) {
    if (previewId === track.trackId) { audioRef.current?.pause(); setPreviewId(null); return; }
    audioRef.current?.pause();
    const a = new Audio(track.previewUrl);
    a.play().catch(() => {}); a.onended = () => setPreviewId(null);
    audioRef.current = a; setPreviewId(track.trackId);
  }

  function goTrim(track: MusicTrack) {
    audioRef.current?.pause(); setPreviewId(null);
    setPendingTrack(track); setStep("trim");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70" onClick={() => onOpenChange(false)}>
      <div
        className="w-full max-w-sm mx-auto rounded-t-3xl overflow-hidden flex flex-col"
        style={{ maxHeight: "88dvh", background: "var(--card)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--border)" }} />
        </div>

        {step === "search" ? (
          <>
            <div className="px-5 pt-2 pb-3 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Add music</h3>
                <button onClick={() => onOpenChange(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-2 rounded-2xl px-3" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search songs, artists…"
                  className="flex-1 py-2.5 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
              {!query && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">TRENDING</p>
                  <div className="flex flex-wrap gap-2 px-2">
                    {TRENDING_QUERIES.map(q => (
                      <button key={q} onClick={() => setQuery(q)}
                        className="px-3 py-1.5 rounded-2xl text-xs font-medium border transition-all hover:border-primary/50"
                        style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searching && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
              {!searching && query && results.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No songs found</p>}
              {results.map(track => {
                const isPlaying = previewId === track.trackId;
                return (
                  <div key={track.trackId}
                    className="flex items-center gap-3 px-2 py-2 rounded-2xl transition-all hover:bg-accent cursor-pointer"
                    onClick={() => goTrim(track)}>
                    <img src={track.artworkUrl100} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.trackName}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); togglePreview(track); }}
                      className={cn("h-8 w-8 rounded-full grid place-items-center shrink-0 border transition-all",
                        isPlaying ? "text-white border-transparent" : "text-muted-foreground border-border"
                      )}
                      style={isPlaying ? { background: "var(--gradient-primary)" } : {}}>
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : pendingTrack ? (
          <NotesMusicTrim
            track={pendingTrack}
            onBack={() => { setStep("search"); setPendingTrack(null); }}
            onConfirm={startSec => onSelect({ track: pendingTrack, startSec })}
          />
        ) : null}
      </div>
    </div>
  );
}

// ─── Notes Music Trim step ────────────────────────────────────
function NotesMusicTrim({ track, onBack, onConfirm }: {
  track: MusicTrack;
  onBack: () => void;
  onConfirm: (startSec: number) => void;
}) {
  const MAX_START = PREVIEW_TOTAL - CLIP;
  const startSecRef = useRef(0);
  const [startSec, setStartSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartSec = useRef(0);

  useEffect(() => {
    const a = new Audio(track.previewUrl);
    a.ontimeupdate = () => {
      setCurrentTime(a.currentTime);
      if (a.currentTime >= startSecRef.current + CLIP) a.currentTime = startSecRef.current;
    };
    a.play().catch(() => {}); audioRef.current = a; setPlaying(true);
    return () => { a.pause(); a.src = ""; };
  }, [track.previewUrl]);

  function seekTo(sec: number) {
    const c = Math.max(0, Math.min(sec, MAX_START));
    startSecRef.current = c; setStartSec(c);
    if (audioRef.current) audioRef.current.currentTime = c;
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true; dragStartX.current = e.clientX; dragStartSec.current = startSecRef.current;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!isDragging.current) return;
    const w = trackRef.current?.getBoundingClientRect().width ?? 1;
    seekTo(dragStartSec.current + (e.clientX - dragStartX.current) * (PREVIEW_TOTAL / w));
  }
  function onPointerUp(e: React.PointerEvent) { e.currentTarget.releasePointerCapture(e.pointerId); isDragging.current = false; }
  function onTrackClick(e: React.MouseEvent) {
    if (isDragging.current) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    seekTo((e.clientX - rect.left) / rect.width * PREVIEW_TOTAL - CLIP / 2);
  }

  const bars = Array.from({ length: 40 }, (_, i) => 0.25 + (Math.sin(i * 0.6) * 0.3 + Math.sin(i * 1.3 + 1) * 0.25 + 0.75) * 0.4);
  const selLeft = (startSec / PREVIEW_TOTAL) * 100;
  const selWidth = (CLIP / PREVIEW_TOTAL) * 100;
  const playheadRatio = Math.min(currentTime / PREVIEW_TOTAL, 1);

  function fmt(s: number) { const m = Math.floor(s / 60); return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`; }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <button onClick={onBack} className="h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <img src={track.artworkUrl100} alt="" className="h-10 w-10 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{track.trackName}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
        </div>
        <button onClick={togglePlay} className="h-9 w-9 rounded-full shrink-0 grid place-items-center text-white"
          style={{ background: "var(--gradient-primary)" }}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      </div>

      {/* Waveform trim */}
      <div className="flex-1 flex flex-col justify-center px-5 py-5 gap-4">
        <div className="text-center">
          <p className="text-sm font-semibold">Select a {CLIP}s clip</p>
          <p className="text-xs text-muted-foreground mt-0.5">Drag to choose your snippet</p>
        </div>
        <div ref={trackRef} className="relative select-none touch-none" onClick={onTrackClick}>
          <div className="flex items-center gap-[2px] h-14 rounded-2xl overflow-hidden px-0.5">
            {bars.map((h, i) => {
              const inSel = (i / bars.length) * 100 >= selLeft && (i / bars.length) * 100 < selLeft + selWidth;
              return <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 100}%`, background: inSel ? "var(--primary)" : "var(--border)" }} />;
            })}
          </div>
          <div className="absolute top-0 bottom-0 rounded-2xl touch-none"
            style={{ left: `${selLeft}%`, width: `${selWidth}%`, background: "rgba(225,48,108,0.15)", border: "2px solid var(--primary)", cursor: isDragging.current ? "grabbing" : "grab", touchAction: "none" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            onClick={e => e.stopPropagation()}>
            <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center"><div className="h-7 w-[3px] rounded-full bg-primary" /></div>
            <div className="absolute right-0 top-0 bottom-0 w-4 flex items-center justify-center"><div className="h-7 w-[3px] rounded-full bg-primary" /></div>
          </div>
          <div className="absolute top-0 bottom-0 w-[2px] rounded-full pointer-events-none bg-white/70"
            style={{ left: `${playheadRatio * 100}%`, transition: "left 0.08s linear" }} />
        </div>
        <div className="flex justify-between text-[11px] -mt-1 px-0.5">
          <span className="text-muted-foreground">0:00</span>
          <span className="font-semibold" style={{ color: "var(--primary)" }}>{fmt(startSec)} – {fmt(Math.min(startSec + CLIP, PREVIEW_TOTAL))}</span>
          <span className="text-muted-foreground">{fmt(PREVIEW_TOTAL)}</span>
        </div>
        <Button onClick={() => onConfirm(startSec)} className="w-full h-11 rounded-2xl font-semibold text-white" style={{ background: "var(--gradient-primary)" }}>
          Use this clip
        </Button>
      </div>
    </div>
  );
}
