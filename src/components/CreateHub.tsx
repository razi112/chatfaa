// ─── CreateHub.tsx ─────────────────────────────────────────────
// Professional desktop creation workspace for Chatfaa.
// Opens as a centred full-screen overlay; switches between:
//   Hub picker → Post / Reel / Story / Text / Live / Drafts editors
// Keyboard shortcuts: Esc=close, Ctrl+Enter=publish, Ctrl+S=draft,
//                     ←→/Arrow keys=navigate hub, Enter=select

import {
  useCallback, useEffect, useRef, useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X, Image as ImageIcon, Video, BookOpen, FileText, Radio,
  Upload, Music, Search, Play, Pause, MapPin, Users,
  Globe, Lock, UserCheck, MessageSquareOff, Share2, Download,
  Eye, EyeOff, Heart, Save, Send, Loader2, Sparkles, Tag,
  AlignLeft, AlignCenter, AlignRight, Smile, Bold, Italic,
  Type, Layers, Plus, Minus, Trash2, Clock, ChevronDown,
  Mic, StickyNote, Sticker, AtSign, Hash, ZoomIn,
  PenTool, Wand2, SlidersHorizontal, Sun, Contrast,
  Droplets, CheckCircle2, LayoutGrid, MoreHorizontal,
  Film, Scissors, Palette, ChevronLeft, ChevronRight,
  RotateCw,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type HubMode =
  | "hub" | "post" | "reel" | "story" | "text" | "live" | "drafts";

export interface CreateHubProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  /** Called after a successful publish so parent can invalidate queries */
  onPublished?: () => void;
  /** Open straight to a specific editor */
  initialMode?: HubMode;
}

type Draft = {
  id: string;
  type: HubMode;
  title: string;
  preview: string | null;
  savedAt: string;
};

type MusicTrack = {
  trackId: number; trackName: string; artistName: string;
  artworkUrl100: string; previewUrl: string;
};

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const GLASS_PANEL =
  "rgba(255,255,255,0.038)";
const GLASS_BORDER =
  "rgba(168,85,247,0.18)";
const GLASS_ACTIVE =
  "rgba(168,85,247,0.16)";
const GLASS_ACTIVE_BORDER =
  "rgba(168,85,247,0.40)";

const AUDIENCE_OPTIONS = [
  { value: "public",         icon: Globe,     label: "Everyone",       desc: "Visible to all users" },
  { value: "followers",      icon: UserCheck, label: "Followers only", desc: "People who follow you" },
  { value: "close_friends",  icon: Heart,     label: "Close friends",  desc: "Your close friends list" },
  { value: "private",        icon: Lock,      label: "Only me",        desc: "Completely private" },
] as const;

const COMMENT_OPTIONS = [
  { value: "everyone",  label: "Everyone" },
  { value: "followers", label: "Followers only" },
  { value: "nobody",    label: "No one" },
] as const;

const FILTERS = [
  { name: "Normal",    style: "" },
  { name: "Clarendon", style: "contrast(1.2) saturate(1.35) brightness(1.05)" },
  { name: "Juno",      style: "sepia(0.15) contrast(1.15) saturate(1.4) brightness(1.05)" },
  { name: "Lark",      style: "brightness(1.1) contrast(0.9) saturate(1.2)" },
  { name: "Valencia",  style: "sepia(0.15) contrast(1.08) brightness(1.08) saturate(1.3)" },
  { name: "Moon",      style: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Fade",      style: "contrast(0.85) brightness(1.1) saturate(0.85)" },
  { name: "Crema",     style: "sepia(0.2) contrast(0.95) brightness(1.05) saturate(1.1)" },
];

// ─────────────────────────────────────────────────────────────
// Hub type cards
// ─────────────────────────────────────────────────────────────
type TypeCard = {
  mode:     HubMode;
  icon:     React.ReactNode;
  emoji:    string;
  label:    string;
  sub:      string;
  color:    string;
  glow:     string;
  kbd:      string;
  span?:    boolean; // full-width
};

const TYPE_CARDS: TypeCard[] = [
  {
    mode: "post",  emoji: "📸", icon: <ImageIcon className="h-6 w-6" />,
    label: "Post",  sub: "Photos & videos",
    color: "#a78bfa", glow: "rgba(167,139,250,0.18)", kbd: "P",
  },
  {
    mode: "reel",  emoji: "🎬", icon: <Film className="h-6 w-6" />,
    label: "Reel",  sub: "Short video",
    color: "#f472b6", glow: "rgba(244,114,182,0.18)", kbd: "R",
  },
  {
    mode: "story", emoji: "📖", icon: <BookOpen className="h-6 w-6" />,
    label: "Story", sub: "24 hours",
    color: "#34d399", glow: "rgba(52,211,153,0.18)", kbd: "S",
  },
  {
    mode: "text",  emoji: "📝", icon: <FileText className="h-6 w-6" />,
    label: "Text",  sub: "Your thoughts",
    color: "#60a5fa", glow: "rgba(96,165,250,0.18)", kbd: "T",
  },
  {
    mode: "live",  emoji: "🔴", icon: <Radio className="h-6 w-6" />,
    label: "Live",  sub: "Start a live session",
    color: "#f43f5e", glow: "rgba(244,63,94,0.18)", kbd: "L",
    span: true,
  },
];

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function GlassDivider() {
  return (
    <div className="h-px w-full" style={{ background: GLASS_BORDER }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </p>
  );
}

function KbdHint({ keys }: { keys: string }) {
  return (
    <span
      className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      {keys}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export function CreateHub({
  open, onOpenChange, userId, onPublished, initialMode = "hub",
}: CreateHubProps) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<HubMode>(initialMode);
  const [focusedCard, setFocusedCard] = useState(0);

  // ── Draft store (localStorage) ──────────────────────────────
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatfaa-drafts") ?? "[]");
    } catch { return []; }
  });

  function saveDraft(type: HubMode, title: string, preview: string | null) {
    const d: Draft = {
      id: Date.now().toString(), type, title, preview,
      savedAt: new Date().toISOString(),
    };
    const updated = [d, ...drafts].slice(0, 20);
    setDrafts(updated);
    localStorage.setItem("chatfaa-drafts", JSON.stringify(updated));
    toast.success("Draft saved");
  }

  function deleteDraft(id: string) {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem("chatfaa-drafts", JSON.stringify(updated));
  }

  // ── Reset on close ──────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setMode(initialMode);
      setFocusedCard(0);
    }
  }, [open, initialMode]);

  // ── Keyboard shortcuts ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      // Ignore if typing in an input / textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        // Ctrl/Cmd+Enter → publish even from inputs
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          document.getElementById("ch-publish-btn")?.click();
        }
        // Ctrl/Cmd+S → save draft
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          document.getElementById("ch-draft-btn")?.click();
        }
        return;
      }

      // Esc handled by Dialog natively, but also go back to hub
      if (e.key === "Escape" && mode !== "hub") {
        e.preventDefault();
        setMode("hub");
        return;
      }

      // Hub navigation with arrow keys
      if (mode === "hub") {
        const count = TYPE_CARDS.length;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedCard((i) => (i + 1) % count);
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedCard((i) => (i - 1 + count) % count);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          setMode(TYPE_CARDS[focusedCard].mode);
          return;
        }
        // Letter shortcuts in hub only
        if (e.key === "p" || e.key === "P") { setMode("post");   return; }
        if (e.key === "r" || e.key === "R") { setMode("reel");   return; }
        if (e.key === "s" || e.key === "S") { setMode("story");  return; }
        if (e.key === "t" || e.key === "T") { setMode("text");   return; }
        if (e.key === "l" || e.key === "L") { setMode("live");   return; }
        if (e.key === "d" || e.key === "D") { setMode("drafts"); return; }
      }

      // Ctrl/Cmd+Enter → publish
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        document.getElementById("ch-publish-btn")?.click();
      }
      // Ctrl/Cmd+S → save draft
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("ch-draft-btn")?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, mode, focusedCard]);

  // ── Header ──────────────────────────────────────────────────
  const editorTitle: Record<HubMode, string> = {
    hub:    "Create something new",
    post:   "New Post",
    reel:   "New Reel",
    story:  "New Story",
    text:   "Text Post",
    live:   "Go Live",
    drafts: "Drafts",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Bypass the global 480px max-width override with inline style */}
      <DialogContent
        className="p-0 gap-0 overflow-hidden rounded-3xl flex flex-col"
        style={{
          maxWidth: "min(96vw, 1060px)",
          width: "min(96vw, 1060px)",
          maxHeight: "92dvh",
          height: "92dvh",
          background: "rgba(8,6,20,0.92)",
          backdropFilter: "blur(48px) saturate(200%)",
          WebkitBackdropFilter: "blur(48px) saturate(200%)",
          border: "1px solid rgba(168,85,247,0.22)",
          boxShadow:
            "0 0 0 1px rgba(168,85,247,0.08)," +
            "0 32px 80px -16px rgba(0,0,0,0.85)," +
            "inset 0 1px 0 rgba(255,255,255,0.09)," +
            "inset 0 -1px 0 rgba(168,85,247,0.06)",
        }}
      >
        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
        >
          <div className="flex items-center gap-3">
            {mode !== "hub" && (
              <button
                onClick={() => setMode("hub")}
                className="h-8 w-8 rounded-xl grid place-items-center transition-all hover:bg-white/8 text-muted-foreground hover:text-foreground"
                aria-label="Back to hub"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold leading-tight">
                {editorTitle[mode]}
              </h2>
              {mode === "hub" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose what you want to share on Chatfaa.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode breadcrumb pills */}
            {mode !== "hub" && (
              <div className="hidden sm:flex items-center gap-1">
                {TYPE_CARDS.filter((c) => c.mode === mode).map((c) => (
                  <span
                    key={c.mode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${c.glow}`,
                      border: `1px solid ${c.color}40`,
                      color: c.color,
                    }}
                  >
                    {c.emoji} {c.label}
                  </span>
                ))}
              </div>
            )}
            {/* Drafts toggle */}
            <button
              onClick={() => setMode(mode === "drafts" ? "hub" : "drafts")}
              className={cn(
                "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
                mode === "drafts"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/6"
              )}
              style={mode === "drafts" ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}` } : {}}
            >
              <Save className="h-3.5 w-3.5" />
              Drafts
              {drafts.length > 0 && (
                <span
                  className="text-[10px] font-bold h-4 px-1 rounded-full grid place-items-center"
                  style={{ background: "var(--gradient-primary)", color: "white" }}
                >
                  {drafts.length}
                </span>
              )}
            </button>
            {/* Keyboard hint */}
            <div className="hidden xl:flex items-center gap-1 text-muted-foreground text-[11px]">
              <KbdHint keys="Esc" /> back &nbsp;
              <KbdHint keys="⌘↵" /> publish
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {mode === "hub"    && (
            <HubPicker
              cards={TYPE_CARDS}
              focusedCard={focusedCard}
              setFocusedCard={setFocusedCard}
              onSelect={setMode}
              drafts={drafts}
            />
          )}
          {mode === "post"   && (
            <PostEditor
              userId={userId}
              onPublished={() => { qc.invalidateQueries({ queryKey: ["feed-posts"] }); onPublished?.(); onOpenChange(false); }}
              onSaveDraft={(t, p) => saveDraft("post", t, p)}
            />
          )}
          {mode === "reel"   && (
            <ReelEditor
              userId={userId}
              onPublished={() => { qc.invalidateQueries({ queryKey: ["reels"] }); qc.invalidateQueries({ queryKey: ["feed-posts"] }); onPublished?.(); onOpenChange(false); }}
              onSaveDraft={(t, p) => saveDraft("reel", t, p)}
            />
          )}
          {mode === "story"  && (
            <StoryEditor
              userId={userId}
              onPublished={() => { qc.invalidateQueries({ queryKey: ["stories"] }); onPublished?.(); onOpenChange(false); }}
              onSaveDraft={(t, p) => saveDraft("story", t, p)}
            />
          )}
          {mode === "text"   && (
            <TextEditor
              userId={userId}
              onPublished={() => { qc.invalidateQueries({ queryKey: ["feed-posts"] }); onPublished?.(); onOpenChange(false); }}
              onSaveDraft={(t, p) => saveDraft("text", t, p)}
            />
          )}
          {mode === "live"   && <LivePanel />}
          {mode === "drafts" && (
            <DraftsPanel
              drafts={drafts}
              onResume={(d) => setMode(d.type)}
              onDelete={deleteDraft}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Hub Picker
// ─────────────────────────────────────────────────────────────
function HubPicker({
  cards, focusedCard, setFocusedCard, onSelect, drafts,
}: {
  cards: TypeCard[];
  focusedCard: number;
  setFocusedCard: (i: number) => void;
  onSelect: (m: HubMode) => void;
  drafts: Draft[];
}) {
  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Grid of type cards */}
          <div className="grid grid-cols-2 gap-4">
            {cards.map((card, i) => (
              <button
                key={card.mode}
                tabIndex={0}
                onClick={() => onSelect(card.mode)}
                onFocus={() => setFocusedCard(i)}
                onMouseEnter={() => setFocusedCard(i)}
                className={cn(
                  "group relative flex flex-col items-start gap-4 p-6 rounded-2xl text-left transition-all duration-200",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  card.span && "col-span-2"
                )}
                style={{
                  background: focusedCard === i ? `${card.glow}` : GLASS_PANEL,
                  backdropFilter: "blur(20px) saturate(160%)",
                  WebkitBackdropFilter: "blur(20px) saturate(160%)",
                  border: `1px solid ${focusedCard === i ? card.color + "50" : GLASS_BORDER}`,
                  boxShadow: focusedCard === i
                    ? `0 0 0 1px ${card.color}30, 0 8px 32px -8px ${card.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  transform: focusedCard === i ? "translateY(-2px)" : "none",
                }}
              >
                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at top left, ${card.glow} 0%, transparent 65%)` }}
                />

                {/* Icon */}
                <div
                  className="relative z-10 h-14 w-14 rounded-2xl grid place-items-center transition-all duration-200"
                  style={{
                    background: focusedCard === i
                      ? `linear-gradient(135deg, ${card.color}30 0%, ${card.color}18 100%)`
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${focusedCard === i ? card.color + "45" : "rgba(255,255,255,0.08)"}`,
                    color: card.color,
                    boxShadow: focusedCard === i ? `0 0 20px -4px ${card.color}50` : "none",
                    transform: focusedCard === i ? "scale(1.06)" : "none",
                  }}
                >
                  {card.icon}
                </div>

                {/* Text */}
                <div className="relative z-10 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base">{card.label}</span>
                    <KbdHint keys={card.kbd} />
                  </div>
                  <p className="text-sm text-muted-foreground">{card.sub}</p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="relative z-10 h-4 w-4 transition-all duration-200 self-end"
                  style={{
                    color: focusedCard === i ? card.color : "rgba(255,255,255,0.25)",
                    opacity: focusedCard === i ? 1 : 0.5,
                    transform: focusedCard === i ? "translateX(2px)" : "none",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Recent drafts preview */}
          {drafts.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: GLASS_PANEL,
                backdropFilter: "blur(20px)",
                border: `1px solid ${GLASS_BORDER}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Recent Drafts</SectionLabel>
                <span className="text-xs text-muted-foreground">{drafts.length} saved</span>
              </div>
              <div className="space-y-2">
                {drafts.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-3 text-sm">
                    <div
                      className="h-8 w-8 rounded-lg grid place-items-center shrink-0 text-xs font-bold"
                      style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}
                    >
                      {d.type.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{d.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.savedAt).toLocaleDateString()} · {d.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Media Drop Zone
// ─────────────────────────────────────────────────────────────
function DropZone({
  accept, label, hint, onFile,
}: {
  accept: string; label: string; hint: string;
  onFile: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }
  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => ref.current?.click()}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 h-full min-h-[320px]"
      style={{ borderColor: "rgba(168,85,247,0.28)", background: "rgba(168,85,247,0.04)" }}
    >
      <div
        className="h-16 w-16 rounded-2xl grid place-items-center"
        style={{
          background: "rgba(168,85,247,0.12)",
          border: "1px solid rgba(168,85,247,0.28)",
          boxShadow: "0 0 24px -4px rgba(168,85,247,0.35)",
        }}
      >
        <Upload className="h-7 w-7 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      </div>
      <p className="text-xs text-muted-foreground/60">
        Drag & drop or <span className="text-primary underline">browse files</span>
      </p>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Music Picker
// ─────────────────────────────────────────────────────────────
type SelectedMusic = { track: MusicTrack; startSec: number; endSec: number };

function MusicRow({
  selected, onOpenPicker, onClear,
}: {
  selected: SelectedMusic | null;
  onOpenPicker: () => void;
  onClear: () => void;
}) {
  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }
  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all text-left"
      )}
      style={selected
        ? { background: "rgba(168,85,247,0.10)", border: `1px solid rgba(168,85,247,0.35)` }
        : { background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }
      }
    >
      {selected ? (
        <>
          <img src={selected.track.artworkUrl100} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-xs">{selected.track.trackName}</p>
            <p className="text-muted-foreground text-[11px] truncate flex items-center gap-1">
              {selected.track.artistName}
              <span className="text-primary/70 font-mono shrink-0 ml-1">
                {fmt(selected.startSec)} – {fmt(selected.endSec)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="h-6 w-6 rounded-full grid place-items-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <>
          <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
            style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.22)" }}>
            <Music className="h-4 w-4 text-primary" />
          </div>
          <span className="flex-1 text-muted-foreground">Add music</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Waveform Range Picker
// ─────────────────────────────────────────────────────────────
// Waveform Range Picker
// ─────────────────────────────────────────────────────────────

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function WaveformRangePicker({
  track,
  maxDuration,
  initialStart,
  initialEnd,
  onApply,
  onBack,
}: {
  track: MusicTrack;
  maxDuration: number;
  initialStart: number;
  initialEnd: number;
  onApply: (start: number, end: number) => void;
  onBack: () => void;
}) {
  // Real audio duration — discovered once metadata loads (iTunes previews are ~30 s)
  const [totalDur, setTotalDur] = useState(30);
  const [durLoading, setDurLoading] = useState(true);

  const [startSec, setStartSec] = useState(initialStart);
  const [endSec, setEndSec]     = useState(initialEnd);
  const [playhead, setPlayhead] = useState(initialStart);
  const [playing, setPlaying]   = useState(false);
  const [zoom, setZoom]         = useState(1);
  const [viewStart, setViewStart] = useState(0);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const probeRef     = useRef<HTMLAudioElement | null>(null);
  const rafRef       = useRef<number>(0);
  const dragRef      = useRef<null | "start" | "end" | "range" | "playhead">(null);
  const dragOrigin   = useRef({ x: 0, startAtDrag: 0, endAtDrag: 0 });
  const barsRef      = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

  // ── Probe real audio duration on mount ──────────────────
  useEffect(() => {
    const probe = new Audio();
    probe.preload = "metadata";
    probeRef.current = probe;

    probe.addEventListener("loadedmetadata", () => {
      const dur = isFinite(probe.duration) && probe.duration > 0 ? probe.duration : 30;
      setTotalDur(dur);
      // clamp selection to real duration
      const maxSel = Math.min(maxDuration, dur);
      setStartSec((s) => clamp(s, 0, dur - 0.1));
      setEndSec((e) => clamp(e, 0.1, Math.min(initialStart + maxSel, dur)));
      setPlayhead((p) => clamp(p, 0, dur));
      setDurLoading(false);
    });
    probe.addEventListener("error", () => {
      setDurLoading(false); // fall back to 30 s
    });
    probe.src = track.previewUrl;
    probe.load();

    return () => {
      probe.src = "";
      probeRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.previewUrl]);

  // ── Generate deterministic waveform bars ─────────────────
  useEffect(() => {
    const seed = track.trackId;
    const bars: number[] = [];
    for (let i = 0; i < 200; i++) {
      const x = Math.sin(seed * 9301 + i * 49297 + 233) * 0.5 + 0.5;
      const envelope = Math.sin((i / 200) * Math.PI);
      bars.push(0.1 + x * envelope * 0.9);
    }
    barsRef.current = bars;
  }, [track.trackId]);

  // Visible window in seconds
  const visibleDur = totalDur / zoom;
  const viewEnd    = Math.min(viewStart + visibleDur, totalDur);

  useEffect(() => {
    setViewStart((v) => clamp(v, 0, Math.max(0, totalDur - visibleDur)));
  }, [zoom, visibleDur, totalDur]);

  // ── Draw canvas ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const bars    = barsRef.current;
    const barCount = bars.length;

    function secToX(s: number) {
      return ((s - viewStart) / visibleDur) * W;
    }

    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(0, 0, W, H);

    const barW = W / barCount;
    for (let i = 0; i < barCount; i++) {
      const barTimeSec = (i / barCount) * totalDur;
      if (barTimeSec < viewStart || barTimeSec > viewEnd) continue;
      const x  = secToX(barTimeSec);
      const h  = bars[i] * H * 0.75;
      const inSel = barTimeSec >= startSec && barTimeSec <= endSec;
      ctx.fillStyle = inSel
        ? `rgba(168,85,247,${0.55 + bars[i] * 0.4})`
        : `rgba(255,255,255,${0.12 + bars[i] * 0.14})`;
      const bw = Math.max(1.5, barW - 0.8);
      ctx.beginPath();
      ctx.roundRect(x, (H - h) / 2, bw, h, 2);
      ctx.fill();
    }

    // Selection overlay
    const sx = secToX(Math.max(startSec, viewStart));
    const ex = secToX(Math.min(endSec,   viewEnd));
    if (ex > sx) {
      ctx.fillStyle = "rgba(168,85,247,0.10)";
      ctx.fillRect(sx, 0, ex - sx, H);
      ctx.fillStyle = "rgba(168,85,247,0.55)";
      ctx.fillRect(sx, 0, ex - sx, 2);
      ctx.fillRect(sx, H - 2, ex - sx, 2);
    }

    // Start handle
    if (startSec >= viewStart && startSec <= viewEnd) {
      const x = secToX(startSec);
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(x - 2, 0, 4, H);
      ctx.beginPath();
      ctx.roundRect(x - 10, H / 2 - 12, 20, 24, 6);
      ctx.fillStyle = "#a855f7";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("◂", x, H / 2);
    }

    // End handle
    if (endSec >= viewStart && endSec <= viewEnd) {
      const x = secToX(endSec);
      ctx.fillStyle = "#a855f7";
      ctx.fillRect(x - 2, 0, 4, H);
      ctx.beginPath();
      ctx.roundRect(x - 10, H / 2 - 12, 20, 24, 6);
      ctx.fillStyle = "#a855f7";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("▸", x, H / 2);
    }

    // Playhead
    if (playhead >= viewStart && playhead <= viewEnd) {
      const px = secToX(playhead);
      ctx.strokeStyle = "#f0abfc";
      ctx.lineWidth   = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(px, 0); ctx.lineTo(px, H);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#f0abfc";
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px - 5, 8);
      ctx.lineTo(px + 5, 8);
      ctx.closePath();
      ctx.fill();
    }

    // Time ticks
    ctx.font = "10px sans-serif";
    ctx.textBaseline = "bottom";
    const tickInterval = visibleDur <= 5 ? 1 : visibleDur <= 10 ? 2 : visibleDur <= 20 ? 5 : 10;
    for (let t = 0; t <= totalDur; t += tickInterval) {
      if (t < viewStart - 0.1 || t > viewEnd + 0.1) continue;
      const x = secToX(t);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(x, H - 14, 1, 8);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.textAlign = t === 0 ? "left" : t === totalDur ? "right" : "center";
      ctx.fillText(fmtTime(t), x, H);
    }
  }, [startSec, endSec, playhead, viewStart, zoom, visibleDur, viewEnd, totalDur]);

  // ── HiDPI canvas resize ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext("2d");
      ctx?.scale(window.devicePixelRatio, window.devicePixelRatio);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── Audio playback ────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause();
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const audio = new Audio(track.previewUrl);
    audio.currentTime = startSec;
    audio.play().catch(() => setPlaying(false));
    audioRef.current = audio;

    function tick() {
      if (!audioRef.current) return;
      const t = audioRef.current.currentTime;
      setPlayhead(t);
      if (t >= endSec) {
        audioRef.current.pause();
        setPlayhead(startSec);
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { audio.pause(); cancelAnimationFrame(rafRef.current); };
  }, [playing, startSec, endSec, track.previewUrl]);

  // ── Pointer ↔ seconds ────────────────────────────────────
  function xToSec(clientX: number): number {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect  = canvas.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clamp(viewStart + ratio * visibleDur, 0, totalDur);
  }

  function hitTest(clientX: number): "start" | "end" | "range" | "playhead" | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    function secToXLocal(s: number) { return ((s - viewStart) / visibleDur) * W + rect.left; }
    const sx = secToXLocal(startSec);
    const ex = secToXLocal(endSec);
    const px = secToXLocal(playhead);
    const HIT = 16;
    if (Math.abs(clientX - px) < HIT) return "playhead";
    if (Math.abs(clientX - sx) < HIT) return "start";
    if (Math.abs(clientX - ex) < HIT) return "end";
    if (clientX > sx && clientX < ex)  return "range";
    return null;
  }

  function onPointerDown(clientX: number) {
    const hit = hitTest(clientX);
    if (!hit) {
      setPlayhead(clamp(xToSec(clientX), startSec, endSec));
      return;
    }
    dragRef.current    = hit;
    dragOrigin.current = { x: clientX, startAtDrag: startSec, endAtDrag: endSec };
    if (playing) { audioRef.current?.pause(); setPlaying(false); }
  }

  function onPointerMove(clientX: number) {
    if (!dragRef.current) return;
    const delta      = xToSec(clientX) - xToSec(dragOrigin.current.x);
    const { startAtDrag, endAtDrag } = dragOrigin.current;
    const dur        = endAtDrag - startAtDrag;
    const maxSel     = Math.min(maxDuration, totalDur);

    if (dragRef.current === "start") {
      const ns = clamp(startAtDrag + delta, 0, endAtDrag - 0.5);
      const ne = clamp(ns + maxSel, ns + 0.5, totalDur);
      setStartSec(ns); setEndSec(ne); setPlayhead(ns);
    } else if (dragRef.current === "end") {
      const ne = clamp(endAtDrag + delta, startAtDrag + 0.5, totalDur);
      const ns = clamp(ne - maxSel, 0, ne - 0.5);
      setEndSec(ne); setStartSec(ns); setPlayhead(ns);
    } else if (dragRef.current === "range") {
      const ns = clamp(startAtDrag + delta, 0, totalDur - dur);
      setStartSec(ns); setEndSec(ns + dur); setPlayhead(ns);
    } else if (dragRef.current === "playhead") {
      setPlayhead(clamp(startAtDrag + delta, startSec, endSec));
    }
  }

  function onPointerUp() { dragRef.current = null; }

  const onMouseDown  = (e: React.MouseEvent)  => { e.preventDefault(); onPointerDown(e.clientX); };
  const onMouseMove  = (e: React.MouseEvent)  => { onPointerMove(e.clientX); };
  const onMouseUp    = ()                     => { onPointerUp(); };
  const onTouchStart = (e: React.TouchEvent)  => { onPointerDown(e.touches[0].clientX); };
  const onTouchMove  = (e: React.TouchEvent)  => { e.preventDefault(); onPointerMove(e.touches[0].clientX); };
  const onTouchEnd   = ()                     => { onPointerUp(); };

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom((z) => clamp(z * (e.deltaY > 0 ? 0.8 : 1.25), 1, 8));
    } else {
      const panSec = (e.deltaX / (containerRef.current?.clientWidth ?? 300)) * visibleDur;
      setViewStart((v) => clamp(v + panSec, 0, totalDur - visibleDur));
    }
  }

  // "Select all" — use full available duration
  function selectAll() {
    const maxSel = Math.min(maxDuration, totalDur);
    setStartSec(0);
    setEndSec(maxSel);
    setPlayhead(0);
    setViewStart(0);
    setZoom(1);
  }

  const selDuration = endSec - startSec;

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* ── Track info header ── */}
      <div className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
        <button onClick={onBack}
          className="h-8 w-8 rounded-xl grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <img src={track.artworkUrl100} alt=""
          className="h-11 w-11 rounded-xl object-cover shrink-0"
          style={{ boxShadow: "0 0 16px -2px rgba(168,85,247,0.5)" }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{track.trackName}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
        </div>
        {/* song total duration badge */}
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--muted-foreground)" }}>
            {durLoading ? "…" : fmtTime(totalDur)} total
          </div>
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold"
            style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.35)", color: "#c084fc" }}>
            max {fmtTime(Math.min(maxDuration, totalDur))}
          </div>
        </div>
      </div>

      {/* ── "Use full song" quick-action strip ── */}
      <div className="px-5 pt-3 pb-1 shrink-0 flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground font-medium">Quick select:</span>
        <button
          onClick={selectAll}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all"
          style={{ background: "rgba(168,85,247,0.14)", border: "1px solid rgba(168,85,247,0.32)", color: "#c084fc" }}
        >
          <Music className="h-3 w-3" />
          Full song
        </button>
        {/* Preset durations */}
        {[15, 30, 60].filter((s) => s < Math.min(maxDuration, totalDur)).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStartSec(0);
              setEndSec(Math.min(s, totalDur));
              setPlayhead(0);
              setZoom(1);
              setViewStart(0);
            }}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "var(--muted-foreground)" }}
          >
            {s}s
          </button>
        ))}
      </div>

      {/* ── Waveform canvas ── */}
      <div className="px-4 pt-2 pb-2 shrink-0">
        {durLoading ? (
          <div className="rounded-2xl flex items-center justify-center"
            style={{ height: 96, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.25)" }}>
            <Loader2 className="h-5 w-5 animate-spin text-primary/50" />
          </div>
        ) : (
          <div
            className="relative rounded-2xl overflow-hidden cursor-crosshair select-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(168,85,247,0.25)",
              boxShadow: "0 0 32px -8px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              height: 96,
            }}
            onWheel={onWheel}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              style={{ touchAction: "none" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: "inset 0 0 20px rgba(168,85,247,0.08)" }} />
          </div>
        )}
      </div>

      {/* ── Time labels + duration pill ── */}
      <div className="flex items-center justify-between px-5 py-1 shrink-0">
        <span className="text-xs font-mono text-muted-foreground">{fmtTime(startSec)}</span>
        <span
          className="px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.35)", color: "#e9d5ff" }}
        >
          {fmtTime(startSec)} – {fmtTime(endSec)}
          <span className="ml-1.5 opacity-60">({fmtTime(selDuration)})</span>
        </span>
        <span className="text-xs font-mono text-muted-foreground">{fmtTime(endSec)}</span>
      </div>

      {/* ── Zoom + pan controls ── */}
      <div className="flex items-center justify-center gap-2 px-5 pt-1 pb-2 shrink-0">
        <button
          onClick={() => setZoom((z) => clamp(z / 1.5, 1, 8))}
          className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GLASS_BORDER}` }}
          title="Zoom out"
        >
          <Minus className="h-3 w-3" />
        </button>
        <div
          className="flex-1 h-1.5 rounded-full relative cursor-pointer"
          style={{ background: "rgba(255,255,255,0.08)", maxWidth: 180 }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setViewStart(clamp(ratio * totalDur, 0, totalDur - visibleDur));
          }}
        >
          <div
            className="absolute top-0 h-full rounded-full"
            style={{
              background: "rgba(168,85,247,0.55)",
              left: `${(viewStart / totalDur) * 100}%`,
              width: `${(visibleDur / totalDur) * 100}%`,
            }}
          />
        </div>
        <button
          onClick={() => setZoom((z) => clamp(z * 1.5, 1, 8))}
          className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${GLASS_BORDER}` }}
          title="Zoom in"
        >
          <Plus className="h-3 w-3" />
        </button>
        <span className="text-[10px] text-muted-foreground/60 font-mono ml-1">{zoom.toFixed(1)}×</span>
      </div>

      {/* ── Instructions ── */}
      <div className="px-5 pb-2 shrink-0">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Drag <span className="text-primary/70">◂▸ handles</span> to trim · drag selection to move · scroll to pan · Ctrl+scroll to zoom
        </p>
      </div>

      {/* ── Play preview + Apply ── */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-5 shrink-0 mt-auto"
        style={{ borderTop: `1px solid ${GLASS_BORDER}` }}>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
          style={playing
            ? { background: "rgba(168,85,247,0.20)", border: "1px solid rgba(168,85,247,0.50)", color: "#e9d5ff" }
            : { background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}`, color: "var(--muted-foreground)" }
          }
        >
          {playing
            ? <><Pause className="h-4 w-4" /> Stop</>
            : <><Play  className="h-4 w-4" /> Preview</>
          }
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => { audioRef.current?.pause(); onApply(startSec, endSec); }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
        >
          <CheckCircle2 className="h-4 w-4" />
          Apply
        </button>
      </div>
    </div>
  );
}

function MusicPickerOverlay({
  onSelect, onClose, maxDuration,
}: {
  onSelect: (m: SelectedMusic) => void;
  onClose: () => void;
  maxDuration: number;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [latestTracks, setLatestTracks] = useState<MusicTrack[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [step, setStep] = useState<"browse" | "trim">("browse");
  const [pendingTrack, setPendingTrack] = useState<MusicTrack | null>(null);
  const [pendingStart, setPendingStart] = useState(0);
  const [pendingEnd, setPendingEnd]   = useState(maxDuration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch Kerala / Malayalam latest songs on mount
  useEffect(() => {
    const keralaQueries = [
      "KALYANI Malayalam 2025",
      "Thudarum Malayalam Jakes Bejoy",
      "Paathirathri Malayalam",
      "Identity Malayalam Tovino 2025",
      "Lokah Chandra Malayalam 2025",
      "Vilayath Buddha Malayalam",
      "Narivetta Malayalam",
      "Manjummel Boys soundtrack Malayalam",
    ];
    (async () => {
      try {
        const seen = new Set<number>();
        const all: MusicTrack[] = [];
        const fetches = keralaQueries.slice(0, 4).map((q) =>
          fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=10&country=IN`
          ).then((r) => r.json()).catch(() => ({ results: [] }))
        );
        const jsons = await Promise.all(fetches);
        for (const json of jsons) {
          for (const t of (json.results ?? []) as MusicTrack[]) {
            if (t.previewUrl && !seen.has(t.trackId)) {
              seen.add(t.trackId);
              all.push(t);
            }
          }
        }
        if (all.length < 5) {
          const fallback = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent("Malayalam hits 2025")}&media=music&entity=song&limit=25&country=IN`
          ).then((r) => r.json()).catch(() => ({ results: [] }));
          for (const t of (fallback.results ?? []) as MusicTrack[]) {
            if (t.previewUrl && !seen.has(t.trackId)) {
              seen.add(t.trackId);
              all.push(t);
            }
          }
        }
        setLatestTracks(all);
      } catch { /* silent */ }
      finally { setLoadingLatest(false); }
    })();
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20&country=IN`
        );
        const json = await res.json();
        setResults((json.results ?? []).filter((t: MusicTrack) => t.previewUrl));
      } catch { toast.error("Music search failed"); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  function togglePreview(track: MusicTrack) {
    if (previewId === track.trackId) {
      audioRef.current?.pause(); setPreviewId(null);
    } else {
      audioRef.current?.pause();
      const a = new Audio(track.previewUrl); a.loop = true; a.play().catch(() => {});
      audioRef.current = a; setPreviewId(track.trackId);
    }
  }

  function selectTrack(track: MusicTrack) {
    audioRef.current?.pause();
    setPendingTrack(track);
    setPendingStart(0);
    setPendingEnd(maxDuration);
    setStep("trim");
  }

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col rounded-3xl overflow-hidden"
      style={{
        background: "rgba(8,6,20,0.97)",
        backdropFilter: "blur(40px)",
        border: `1px solid ${GLASS_BORDER}`,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0"
        style={{ borderBottom: step === "browse" ? `1px solid ${GLASS_BORDER}` : "none" }}>
        {step === "browse" ? (
          <>
            <h3 className="font-semibold flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" /> Add Music
            </h3>
            <button onClick={onClose}
              className="h-8 w-8 rounded-xl grid place-items-center hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <h3 className="font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Select Section
            </h3>
            <button onClick={onClose}
              className="h-8 w-8 rounded-xl grid place-items-center hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all">
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Step: Browse ── */}
      {step === "browse" && (
        <>
          <div className="px-5 py-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, artists…" className="pl-9 rounded-xl" autoFocus />
            </div>
          </div>
          <ScrollArea className="flex-1 min-h-0 px-3 pb-3">
            {searching && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!searching && query && results.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">No songs found</p>
            )}
            {!searching && !query && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2 pb-2 pt-1">
                  🎵 Kerala Latest Songs
                </p>
                {loadingLatest ? (
                  <div className="space-y-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl">
                        <div className="h-11 w-11 rounded-lg shrink-0 animate-pulse"
                          style={{ background: "rgba(168,85,247,0.10)" }} />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-2/3 rounded-full animate-pulse"
                            style={{ background: "rgba(255,255,255,0.08)" }} />
                          <div className="h-2.5 w-1/2 rounded-full animate-pulse"
                            style={{ background: "rgba(255,255,255,0.05)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestTracks.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="h-12 w-12 rounded-2xl grid place-items-center"
                      style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.22)" }}>
                      <Music className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">Search for a song to add</p>
                  </div>
                ) : null}
              </>
            )}
            <div className="space-y-1">
              {(query ? results : latestTracks).map((track) => {
                const playing = previewId === track.trackId;
                return (
                  <div key={track.trackId}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
                    onClick={() => selectTrack(track)}>
                    <div className="relative shrink-0">
                      <img src={track.artworkUrl100} alt="" className="h-11 w-11 rounded-lg object-cover" />
                      {playing && (
                        <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-white" style={{ animation: "spin 1.2s linear infinite" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.trackName}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    {/* preview play button */}
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); togglePreview(track); }}
                      className={cn(
                        "h-8 w-8 rounded-full shrink-0 grid place-items-center transition-all border",
                        playing
                          ? "text-white border-primary"
                          : "text-muted-foreground border-white/15 hover:border-primary/50 hover:text-foreground"
                      )}
                      style={playing ? { background: "var(--gradient-primary)" } : {}}
                    >
                      {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                    {/* select chevron */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* ── Step: Trim / Waveform ── */}
      {step === "trim" && pendingTrack && (
        <WaveformRangePicker
          track={pendingTrack}
          maxDuration={maxDuration}
          initialStart={pendingStart}
          initialEnd={pendingEnd}
          onApply={(start, end) => {
            onSelect({ track: pendingTrack, startSec: start, endSec: end });
          }}
          onBack={() => setStep("browse")}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Audience Row
// ─────────────────────────────────────────────────────────────
function AudienceSelect({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const opt = AUDIENCE_OPTIONS.find((o) => o.value === value) ?? AUDIENCE_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <div className="space-y-2">
      <SectionLabel>Audience</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {AUDIENCE_OPTIONS.map((o) => {
          const Ic = o.icon;
          const active = value === o.value;
          return (
            <button key={o.value} onClick={() => onChange(o.value)}
              className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-all border")}
              style={active
                ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}` }
                : { background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}` }
              }
            >
              <Ic className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                  {o.label}
                </p>
              </div>
              {active && <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Toggle row
// ─────────────────────────────────────────────────────────────
function ToggleRow({
  icon: Icon, label, desc, checked, onChecked,
}: {
  icon: React.ElementType; label: string; desc?: string;
  checked: boolean; onChecked: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChecked} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared: Publish footer
// ─────────────────────────────────────────────────────────────
function PublishBar({
  onPublish, onDraft, disabled, publishing,
}: {
  onPublish: () => void; onDraft: () => void;
  disabled?: boolean; publishing?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
      style={{ borderTop: `1px solid ${GLASS_BORDER}` }}
    >
      <button
        id="ch-draft-btn"
        onClick={onDraft}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
        style={{ background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}` }}
      >
        <Save className="h-4 w-4" /> Save draft
        <KbdHint keys="⌘S" />
      </button>
      <button
        id="ch-publish-btn"
        onClick={onPublish}
        disabled={disabled || publishing}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
      >
        {publishing
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
          : <><Send className="h-4 w-4" /> Publish <KbdHint keys="⌘↵" /></>
        }
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// POST EDITOR  ── two-panel desktop layout
// ─────────────────────────────────────────────────────────────
function PostEditor({
  userId, onPublished, onSaveDraft,
}: {
  userId: string;
  onPublished: () => void;
  onSaveDraft: (title: string, preview: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ratio, setRatio] = useState("4/5");
  const [autoRatio, setAutoRatio] = useState<string | null>(null);
  const [isAutoRatio, setIsAutoRatio] = useState(false);
  const [filter, setFilter] = useState("Normal");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowShare, setAllowShare] = useState(true);
  const [hideLikes, setHideLikes] = useState(false);
  const [altText, setAltText] = useState("");
  const [music, setMusic] = useState<SelectedMusic | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "advanced">("details");

  function onPickFile(f: File) {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    setAutoRatio(null);
    setIsAutoRatio(false);
    if (!f.type.startsWith("video/")) {
      const img = new window.Image();
      img.onload = () => {
        const r = img.naturalWidth / img.naturalHeight;
        const detected = r > 1.4 ? "16/9" : r > 0.95 ? "1/1" : "4/5";
        setAutoRatio(detected);
        setRatio(detected);
        setIsAutoRatio(true);
      };
      img.src = url;
    }
  }

  async function publish() {
    if (!file && !caption.trim()) { toast.error("Add media or a caption."); return; }
    setPublishing(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const bucket = file.type.startsWith("video/") ? "reels" : "posts";
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
        if (upErr) { toast.error(upErr.message); return; }
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        image_url = data.publicUrl;
      }
      const { error } = await (supabase as any).from("posts").insert({
        user_id: userId, image_url,
        caption: caption.trim() || null,
        music_title: music?.track.trackName ?? null,
        music_artist: music?.track.artistName ?? null,
        music_artwork_url: music?.track.artworkUrl100 ?? null,
        music_preview_url: music?.track.previewUrl ?? null,
        music_start_sec: music?.startSec ?? 0,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Post shared!");
      onPublished();
    } finally { setPublishing(false); }
  }

  const filterStyle = FILTERS.find((f) => f.name === filter)?.style ?? "";

  const RATIOS = [
    { value: "9/16",  label: "9:16",  px: "1080×1920" },
    { value: "4/5",   label: "4:5",   px: "1080×1350" },
    { value: "1/1",   label: "1:1",   px: "1080×1080" },
    { value: "16/9",  label: "16:9",  px: "1080×608"  },
  ] as const;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── Left: media preview ── */}
        <div
          className="w-[44%] min-w-[280px] flex-shrink-0 flex flex-col p-5 gap-4"
          style={{ borderRight: `1px solid ${GLASS_BORDER}` }}
        >
          {!preview ? (
            <DropZone
              accept="image/*,video/*"
              label="Drop your media here"
              hint="JPEG, PNG, MP4 · max 50 MB"
              onFile={onPickFile}
            />
          ) : (
            <>
              {/* Preview */}
              <div
                className="relative rounded-2xl overflow-hidden bg-black flex-shrink-0"
                style={{ aspectRatio: ratio, maxHeight: "56vh" }}
              >
                {file?.type.startsWith("video/") ? (
                  <video src={preview} className="absolute inset-0 w-full h-full object-cover" controls />
                ) : (
                  <img
                    src={preview} alt="preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: filterStyle || undefined }}
                  />
                )}
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center z-10 transition-all"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Ratio pills */}
              <div className="flex gap-2">
                {/* Auto button */}
                {autoRatio && (
                  <button
                    onClick={() => { setRatio(autoRatio); setIsAutoRatio(true); }}
                    className={cn("px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1")}
                    style={isAutoRatio
                      ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}`, color: "#c084fc" }
                      : { background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}`, color: "var(--muted-foreground)" }
                    }
                    title={`Auto-fit: ${RATIOS.find(r => r.value === autoRatio)?.label ?? autoRatio} · ${RATIOS.find(r => r.value === autoRatio)?.px ?? ""}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Auto
                  </button>
                )}
                {RATIOS.map(({ value, label, px }) => (
                  <button key={value} onClick={() => { setRatio(value); setIsAutoRatio(false); }}
                    className={cn("flex-1 py-1.5 px-1 rounded-lg text-xs font-semibold transition-all border flex flex-col items-center gap-0.5")}
                    style={ratio === value && !isAutoRatio
                      ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}`, color: "#c084fc" }
                      : { background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}`, color: "var(--muted-foreground)" }
                    }
                  >
                    <span>{label}</span>
                    <span className="text-[9px] font-normal opacity-60">{px}</span>
                  </button>
                ))}
              </div>

              {/* Filter strip */}
              <div>
                <SectionLabel>Filter</SectionLabel>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {FILTERS.map(({ name, style }) => (
                    <button key={name} onClick={() => setFilter(name)}
                      className={cn("flex flex-col items-center gap-1.5 shrink-0 transition-all",
                        filter === name ? "opacity-100" : "opacity-50 hover:opacity-80")}
                    >
                      <div className={cn("h-12 w-12 rounded-xl overflow-hidden border-2 transition-all",
                        filter === name ? "border-primary" : "border-transparent")}>
                        <img src={preview} alt={name} className="w-full h-full object-cover"
                          style={{ filter: style || undefined }} />
                      </div>
                      <span className="text-[10px] font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right: settings ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex px-5 pt-4 gap-1 shrink-0"
            style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
            {(["details", "advanced"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all capitalize",
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={activeTab === tab
                  ? { background: GLASS_ACTIVE, borderBottom: "2px solid #a855f7" }
                  : {}
                }
              >
                {tab}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-5">
              {activeTab === "details" && (
                <>
                  {/* Caption */}
                  <div>
                    <SectionLabel>Caption</SectionLabel>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write a caption… #hashtags @mentions"
                      rows={4}
                      maxLength={2200}
                      className="rounded-xl resize-none text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground/60">{caption.length}/2200</span>
                      <button className="text-xs text-primary hover:underline" onClick={() => setCaption((c) => c + " 😊")}>
                        <Smile className="h-3.5 w-3.5 inline mr-1" />Emoji
                      </button>
                    </div>
                  </div>

                  <GlassDivider />

                  {/* Music */}
                  <div>
                    <SectionLabel>Music</SectionLabel>
                    <MusicRow selected={music} onOpenPicker={() => setMusicOpen(true)} onClear={() => setMusic(null)} />
                  </div>

                  <GlassDivider />

                  {/* Location */}
                  <div>
                    <SectionLabel>Location</SectionLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Add location"
                        className="pl-9 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
                      />
                    </div>
                  </div>

                  <GlassDivider />
                  <AudienceSelect value={audience} onChange={setAudience} />

                  <GlassDivider />
                  <div>
                    <SectionLabel>Interactions</SectionLabel>
                    <ToggleRow icon={MessageSquareOff} label="Allow comments" checked={allowComments} onChecked={setAllowComments} />
                    <ToggleRow icon={Share2} label="Allow sharing" checked={allowShare} onChecked={setAllowShare} />
                    <ToggleRow icon={EyeOff} label="Hide like count" checked={hideLikes} onChecked={setHideLikes} />
                  </div>
                </>
              )}

              {activeTab === "advanced" && (
                <>
                  <div>
                    <SectionLabel>Accessibility</SectionLabel>
                    <Textarea
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Write alt text for screen readers…"
                      rows={3}
                      maxLength={500}
                      className="rounded-xl resize-none text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
                    />
                  </div>

                  <GlassDivider />

                  <div>
                    <SectionLabel>Sharing</SectionLabel>
                    <ToggleRow icon={Download} label="Allow downloads" desc="Others can save your media"
                      checked={false} onChecked={() => {}} />
                    <ToggleRow icon={Eye} label="Show in Explore" desc="Reach people beyond your followers"
                      checked={true} onChecked={() => {}} />
                  </div>

                  <GlassDivider />

                  <div>
                    <SectionLabel>Content labels</SectionLabel>
                    <ToggleRow icon={Sparkles} label="AI-generated content"
                      desc="Disclose if this content was made with AI"
                      checked={false} onChecked={() => {}} />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Publish bar */}
      <PublishBar
        onPublish={publish}
        onDraft={() => onSaveDraft(caption.slice(0, 40) || "Post draft", preview)}
        disabled={!file && !caption.trim()}
        publishing={publishing}
      />

      {/* Music overlay */}
      {musicOpen && (
        <MusicPickerOverlay
          onSelect={(m) => { setMusic(m); setMusicOpen(false); }}
          onClose={() => setMusicOpen(false)}
          maxDuration={60}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REEL EDITOR  ── 9:16 preview + right controls
// ─────────────────────────────────────────────────────────────
function ReelEditor({
  userId, onPublished, onSaveDraft,
}: {
  userId: string;
  onPublished: () => void;
  onSaveDraft: (title: string, preview: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("public");
  const [music, setMusic] = useState<SelectedMusic | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "details">("edit");

  function onPickFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function publish() {
    if (!file) { toast.error("Add a video first."); return; }
    setPublishing(true);
    try {
      const ext = file.name.split(".").pop() ?? "mp4";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("reels").upload(path, file, { upsert: false });
      if (upErr) { toast.error(upErr.message); return; }
      const { data } = supabase.storage.from("reels").getPublicUrl(path);
      const { error } = await (supabase as any).from("reels").insert({
        user_id: userId,
        video_url: data.publicUrl,
        caption: caption.trim() || null,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Reel shared!");
      onPublished();
    } finally { setPublishing(false); }
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── Left: 9:16 preview ── */}
        <div
          className="w-[36%] min-w-[220px] flex-shrink-0 flex items-center justify-center p-5"
          style={{ borderRight: `1px solid ${GLASS_BORDER}`, background: "rgba(0,0,0,0.25)" }}
        >
          {!preview ? (
            <div className="w-full" style={{ aspectRatio: "9/16", maxHeight: "72vh" }}>
              <DropZone
                accept="video/*"
                label="Drop your video"
                hint="MP4, MOV · max 100 MB · up to 90s"
                onFile={onPickFile}
              />
            </div>
          ) : (
            <div
              className="relative rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: "9/16", maxHeight: "72vh", width: "auto" }}
            >
              <video
                src={preview}
                className="h-full w-full object-cover"
                controls
                loop
                playsInline
              />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center z-10 transition-all"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: editing controls ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex px-5 pt-4 gap-1 shrink-0"
            style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}>
            {(["edit", "details"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all capitalize",
                  activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                style={activeTab === tab
                  ? { background: GLASS_ACTIVE, borderBottom: "2px solid #a855f7" }
                  : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-5">
              {activeTab === "edit" && (
                <>
                  {/* Trim placeholder */}
                  <div>
                    <SectionLabel>Trim</SectionLabel>
                    <div
                      className="rounded-xl p-4 flex items-center gap-3"
                      style={{ background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}` }}
                    >
                      <Scissors className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Trim video</p>
                        <p className="text-xs text-muted-foreground">Set start & end points</p>
                      </div>
                      <span className="text-xs text-muted-foreground/60">Coming soon</span>
                    </div>
                  </div>

                  <GlassDivider />

                  {/* Music */}
                  <div>
                    <SectionLabel>Music</SectionLabel>
                    <MusicRow selected={music} onOpenPicker={() => setMusicOpen(true)} onClear={() => setMusic(null)} />
                  </div>

                  <GlassDivider />

                  {/* Effects / Text / Cover placeholders */}
                  {[
                    { icon: Sparkles, label: "Effects", desc: "Add visual effects & transitions" },
                    { icon: Type, label: "Text overlay", desc: "Add text captions to your reel" },
                    { icon: ImageIcon, label: "Cover image", desc: "Choose a cover frame" },
                  ].map(({ icon: Ic, label, desc }) => (
                    <div key={label}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}` }}
                    >
                      <Ic className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/60">Soon</span>
                    </div>
                  ))}
                </>
              )}

              {activeTab === "details" && (
                <>
                  <div>
                    <SectionLabel>Caption</SectionLabel>
                    <Textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe your reel… #hashtags @mentions"
                      rows={4}
                      maxLength={2200}
                      className="rounded-xl resize-none text-sm"
                      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
                    />
                  </div>

                  <GlassDivider />
                  <AudienceSelect value={audience} onChange={setAudience} />

                  <GlassDivider />
                  <div>
                    <SectionLabel>Interactions</SectionLabel>
                    <ToggleRow icon={MessageSquareOff} label="Allow comments" checked={allowComments} onChecked={setAllowComments} />
                    <ToggleRow icon={Users} label="Allow duet/remix" checked={allowDuet} onChecked={setAllowDuet} />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <PublishBar
        onPublish={publish}
        onDraft={() => onSaveDraft(caption.slice(0, 40) || "Reel draft", preview)}
        disabled={!file}
        publishing={publishing}
      />

      {musicOpen && (
        <MusicPickerOverlay
          onSelect={(m) => { setMusic(m); setMusicOpen(false); }}
          onClose={() => setMusicOpen(false)}
          maxDuration={90}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STORY EDITOR  ── centered 9:16 canvas + side toolbar
// ─────────────────────────────────────────────────────────────
function StoryEditor({
  userId, onPublished, onSaveDraft,
}: {
  userId: string;
  onPublished: () => void;
  onSaveDraft: (title: string, preview: string | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [music, setMusic] = useState<SelectedMusic | null>(null);
  const [musicOpen, setMusicOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  function onPickFile(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  async function publish() {
    if (!file) { toast.error("Add a photo or video first."); return; }
    setPublishing(true);
    try {
      const isVideo = file.type.startsWith("video/");
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("stories").upload(path, file, { upsert: false });
      if (upErr) { toast.error(upErr.message); return; }
      const { data } = supabase.storage.from("stories").getPublicUrl(path);
      const { error } = await (supabase as any).from("stories").insert({
        user_id: userId,
        media_url: data.publicUrl,
        media_type: isVideo ? "video" : "image",
        caption: caption.trim() || null,
        duration_sec: isVideo ? 15 : 7,
        music_title: music?.track.trackName ?? null,
        music_artist: music?.track.artistName ?? null,
        music_artwork_url: music?.track.artworkUrl100 ?? null,
        music_preview_url: music?.track.previewUrl ?? null,
        music_start_sec: music?.startSec ?? 0,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Story shared!");
      onPublished();
    } finally { setPublishing(false); }
  }

  const TOOLS = [
    { id: "text",     icon: Type,       label: "Text" },
    { id: "sticker",  icon: Sticker,    label: "Sticker" },
    { id: "music",    icon: Music,      label: "Music" },
    { id: "mention",  icon: AtSign,     label: "Mention" },
    { id: "location", icon: MapPin,     label: "Location" },
    { id: "draw",     icon: PenTool,    label: "Draw" },
  ] as const;

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── Left tools ── */}
        <div
          className="w-16 flex-shrink-0 flex flex-col items-center py-4 gap-1"
          style={{ borderRight: `1px solid ${GLASS_BORDER}` }}
        >
          {TOOLS.map(({ id, icon: Ic, label }) => (
            <button
              key={id}
              onClick={() => {
                if (id === "music") { setMusicOpen(true); return; }
                setActiveTool(activeTool === id ? null : id);
              }}
              title={label}
              className={cn(
                "w-10 h-10 rounded-xl grid place-items-center transition-all",
                activeTool === id || (id === "music" && music)
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={activeTool === id || (id === "music" && music)
                ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}` }
                : { background: "transparent" }
              }
            >
              <Ic className="h-4 w-4" />
            </button>
          ))}
        </div>

        {/* ── Centre: 9:16 canvas ── */}
        <div className="flex-1 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.30)" }}>
          {!preview ? (
            <div className="w-full max-w-[240px]" style={{ aspectRatio: "9/16" }}>
              <DropZone
                accept="image/*,video/*"
                label="Drop media here"
                hint="Photo or video · max 50 MB"
                onFile={onPickFile}
              />
            </div>
          ) : (
            <div
              className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
              style={{ aspectRatio: "9/16", maxHeight: "70vh", width: "auto" }}
            >
              {file?.type.startsWith("video/") ? (
                <video src={preview} className="h-full w-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={preview} alt="story" className="h-full w-full object-cover" />
              )}

              {/* Caption overlay preview */}
              {caption && (
                <div className="absolute bottom-12 inset-x-4 text-center">
                  <p className="text-white text-sm font-semibold drop-shadow-lg
                    px-3 py-1.5 rounded-xl inline-block"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
                  >
                    {caption}
                  </p>
                </div>
              )}

              {/* Music pill overlay */}
              {music && (
                <div className="absolute bottom-4 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(8px)" }}>
                  <img src={music.track.artworkUrl100} alt="" className="h-7 w-7 rounded-lg object-cover" />
                  <p className="text-white text-xs font-semibold truncate flex-1">
                    {music.track.trackName} · {music.track.artistName}
                  </p>
                </div>
              )}

              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 grid place-items-center z-10 transition-all"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: caption + preview info ── */}
        <div
          className="w-64 flex-shrink-0 flex flex-col p-5 gap-4 overflow-y-auto"
          style={{ borderLeft: `1px solid ${GLASS_BORDER}` }}
        >
          <div>
            <SectionLabel>Caption</SectionLabel>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              rows={3}
              maxLength={200}
              className="rounded-xl resize-none text-sm"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${GLASS_BORDER}` }}
            />
          </div>

          {music && (
            <>
              <GlassDivider />
              <div>
                <SectionLabel>Music</SectionLabel>
                <MusicRow selected={music} onOpenPicker={() => setMusicOpen(true)} onClear={() => setMusic(null)} />
              </div>
            </>
          )}

          <GlassDivider />
          <div
            className="rounded-xl p-3 text-xs space-y-2"
            style={{ background: "rgba(168,85,247,0.07)", border: "1px solid rgba(168,85,247,0.18)" }}
          >
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Story info
            </p>
            <p className="text-muted-foreground">📷 Photos show for <strong>7 seconds</strong></p>
            <p className="text-muted-foreground">🎥 Videos play up to <strong>60 seconds</strong></p>
            <p className="text-muted-foreground">⏰ Disappears after <strong>24 hours</strong></p>
          </div>
        </div>
      </div>

      <PublishBar
        onPublish={publish}
        onDraft={() => onSaveDraft(caption.slice(0, 40) || "Story draft", preview)}
        disabled={!file}
        publishing={publishing}
      />

      {musicOpen && (
        <MusicPickerOverlay
          onSelect={(m) => { setMusic(m); setMusicOpen(false); }}
          onClose={() => setMusicOpen(false)}
          maxDuration={15}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEXT EDITOR  ── large writing canvas + live preview
// ─────────────────────────────────────────────────────────────
const TEXT_BACKGROUNDS = [
  { label: "Dark",    bg: "#0a0a14",                        text: "#f0f0ff" },
  { label: "Purple",  bg: "linear-gradient(135deg,#4c1d95,#7c3aed)", text: "#fff" },
  { label: "Pink",    bg: "linear-gradient(135deg,#831843,#ec4899)", text: "#fff" },
  { label: "Ocean",   bg: "linear-gradient(135deg,#0c4a6e,#0ea5e9)", text: "#fff" },
  { label: "Sunset",  bg: "linear-gradient(135deg,#7c2d12,#f97316)", text: "#fff" },
  { label: "Forest",  bg: "linear-gradient(135deg,#14532d,#22c55e)", text: "#fff" },
  { label: "Light",   bg: "#f8fafc",                        text: "#0f172a" },
  { label: "Cream",   bg: "#fef9ef",                        text: "#1c1917" },
] as const;

const FONT_SIZES = [14, 18, 24, 32, 42, 56] as const;

function TextEditor({
  userId, onPublished, onSaveDraft,
}: {
  userId: string;
  onPublished: () => void;
  onSaveDraft: (title: string, preview: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const [fontSizeIdx, setFontSizeIdx] = useState(1);
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [audience, setAudience] = useState("public");
  const [publishing, setPublishing] = useState(false);

  const bg = TEXT_BACKGROUNDS[bgIndex];
  const fontSize = FONT_SIZES[fontSizeIdx];

  async function publish() {
    if (!text.trim()) { toast.error("Write something first."); return; }
    setPublishing(true);
    try {
      const { error } = await (supabase as any).from("posts").insert({
        user_id: userId,
        image_url: null,
        caption: text.trim(),
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Text post shared!");
      onPublished();
    } finally { setPublishing(false); }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* ── Left: canvas ── */}
        <div
          className="flex-1 min-w-0 flex flex-col"
          style={{ borderRight: `1px solid ${GLASS_BORDER}` }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-4 py-3 flex-wrap shrink-0"
            style={{ borderBottom: `1px solid ${GLASS_BORDER}` }}
          >
            {/* Font size */}
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSizeIdx((i) => Math.max(0, i - 1))}
                className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-mono w-6 text-center text-muted-foreground">{fontSize}</span>
              <button onClick={() => setFontSizeIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-4 w-px" style={{ background: GLASS_BORDER }} />

            {/* Bold / italic */}
            {([
              { icon: Bold,   active: bold,   toggle: () => setBold((v) => !v),   label: "Bold"   },
              { icon: Italic, active: italic, toggle: () => setItalic((v) => !v), label: "Italic" },
            ] as const).map(({ icon: Ic, active, toggle, label }) => (
              <button key={label} onClick={toggle} title={label}
                className="h-7 w-7 rounded-lg grid place-items-center transition-all"
                style={active
                  ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}`, color: "#c084fc" }
                  : { color: "var(--muted-foreground)" }
                }
              >
                <Ic className="h-3.5 w-3.5" />
              </button>
            ))}

            <div className="h-4 w-px" style={{ background: GLASS_BORDER }} />

            {/* Alignment */}
            {([
              { icon: AlignLeft,   value: "left"   as const },
              { icon: AlignCenter, value: "center" as const },
              { icon: AlignRight,  value: "right"  as const },
            ] as const).map(({ icon: Ic, value }) => (
              <button key={value} onClick={() => setAlign(value)}
                className="h-7 w-7 rounded-lg grid place-items-center transition-all"
                style={align === value
                  ? { background: GLASS_ACTIVE, border: `1px solid ${GLASS_ACTIVE_BORDER}`, color: "#c084fc" }
                  : { color: "var(--muted-foreground)" }
                }
              >
                <Ic className="h-3.5 w-3.5" />
              </button>
            ))}

            <div className="h-4 w-px" style={{ background: GLASS_BORDER }} />

            {/* Background swatches */}
            <div className="flex items-center gap-1.5">
              {TEXT_BACKGROUNDS.map((b, i) => (
                <button key={b.label} onClick={() => setBgIndex(i)}
                  className={cn("h-5 w-5 rounded-full border-2 transition-all")}
                  style={{
                    background: b.bg,
                    borderColor: bgIndex === i ? "#c084fc" : "transparent",
                    boxShadow: bgIndex === i ? "0 0 0 1px rgba(168,85,247,0.6)" : "none",
                  }}
                  title={b.label}
                />
              ))}
            </div>

            <div className="h-4 w-px" style={{ background: GLASS_BORDER }} />
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-all"
              onClick={() => setText((t) => t + " 😊")}
            >
              <Smile className="h-3.5 w-3.5" /> Emoji
            </button>
            <span className="ml-auto text-xs text-muted-foreground/60 font-mono">{text.length}/500</span>
          </div>

          {/* Writing area */}
          <div
            className="flex-1 flex items-center justify-center p-8"
            style={{ background: typeof bg.bg === "string" ? bg.bg : undefined,
                     ...(bg.bg.includes("gradient") ? { backgroundImage: bg.bg } : {}) }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder="What's on your mind?"
              autoFocus
              className="w-full max-w-2xl bg-transparent border-0 outline-none resize-none text-center placeholder:opacity-40 transition-all"
              style={{
                color: bg.text,
                fontSize: `${fontSize}px`,
                fontWeight: bold ? "700" : "400",
                fontStyle: italic ? "italic" : "normal",
                textAlign: align,
                lineHeight: 1.4,
              }}
              rows={6}
            />
          </div>
        </div>

        {/* ── Right: settings ── */}
        <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-5">
              <AudienceSelect value={audience} onChange={setAudience} />
              <GlassDivider />
              <div>
                <SectionLabel>Interactions</SectionLabel>
                <ToggleRow icon={MessageSquareOff} label="Allow comments" checked={true} onChecked={() => {}} />
                <ToggleRow icon={Share2} label="Allow sharing" checked={true} onChecked={() => {}} />
              </div>
              <GlassDivider />
              <div
                className="rounded-xl p-3 text-xs"
                style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.18)" }}
              >
                <p className="font-semibold mb-1.5" style={{ color: "#60a5fa" }}>💡 Tips</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Keep it under 280 chars for best reach</li>
                  <li>Use #hashtags to reach more people</li>
                  <li>@mention friends to tag them</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      <PublishBar
        onPublish={publish}
        onDraft={() => onSaveDraft(text.slice(0, 40) || "Text draft", null)}
        disabled={!text.trim()}
        publishing={publishing}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIVE PANEL  ── placeholder / coming soon
// ─────────────────────────────────────────────────────────────
function LivePanel() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-sm space-y-5 p-8">
        <div
          className="mx-auto h-20 w-20 rounded-3xl grid place-items-center"
          style={{
            background: "linear-gradient(135deg, rgba(244,63,94,0.20) 0%, rgba(244,63,94,0.08) 100%)",
            border: "1px solid rgba(244,63,94,0.35)",
            boxShadow: "0 0 32px -8px rgba(244,63,94,0.40)",
          }}
        >
          <Radio className="h-9 w-9" style={{ color: "#f43f5e" }} />
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">Live is coming</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Live sessions, real-time Q&A, and audience interaction tools are in development.
            You'll be able to go live directly from the Create Hub when it's ready.
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: "rgba(244,63,94,0.10)",
            border: "1px solid rgba(244,63,94,0.28)",
            color: "#f43f5e",
          }}
        >
          <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#f43f5e" }} />
          Coming soon
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DRAFTS PANEL
// ─────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  post: "#a78bfa", reel: "#f472b6", story: "#34d399",
  text: "#60a5fa", live: "#f43f5e",
};

function DraftsPanel({
  drafts, onResume, onDelete,
}: {
  drafts: Draft[];
  onResume: (d: Draft) => void;
  onDelete: (id: string) => void;
}) {
  if (drafts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3 p-8">
          <div
            className="mx-auto h-16 w-16 rounded-2xl grid place-items-center"
            style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.22)" }}
          >
            <Save className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold">No drafts saved</h3>
          <p className="text-sm text-muted-foreground">Press <KbdHint keys="⌘S" /> while editing to save a draft.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Table header */}
          <div
            className="grid grid-cols-[1fr_80px_140px_auto] gap-4 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            style={{ background: GLASS_PANEL, border: `1px solid ${GLASS_BORDER}` }}
          >
            <span>Draft</span>
            <span>Type</span>
            <span>Saved</span>
            <span>Actions</span>
          </div>

          {drafts.map((d) => (
            <div
              key={d.id}
              className="grid grid-cols-[1fr_80px_140px_auto] gap-4 items-center px-4 py-3 rounded-xl transition-all group"
              style={{
                background: GLASS_PANEL,
                border: `1px solid ${GLASS_BORDER}`,
              }}
            >
              {/* Thumbnail + title */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="h-10 w-10 rounded-xl overflow-hidden shrink-0 grid place-items-center"
                  style={{ background: `${TYPE_COLOR[d.type] ?? "#a78bfa"}20` }}
                >
                  {d.preview ? (
                    <img src={d.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg">{
                      d.type === "post" ? "📸" :
                      d.type === "reel" ? "🎬" :
                      d.type === "story" ? "📖" :
                      d.type === "text" ? "📝" : "🔴"
                    }</span>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{d.title || "Untitled"}</p>
              </div>

              {/* Type badge */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize w-fit"
                style={{
                  background: `${TYPE_COLOR[d.type] ?? "#a78bfa"}18`,
                  color: TYPE_COLOR[d.type] ?? "#a78bfa",
                  border: `1px solid ${TYPE_COLOR[d.type] ?? "#a78bfa"}35`,
                }}
              >
                {d.type}
              </span>

              {/* Date */}
              <span className="text-xs text-muted-foreground">
                {new Date(d.savedAt).toLocaleDateString(undefined, {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onResume(d)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
                >
                  <RotateCw className="h-3 w-3" /> Continue
                </button>
                <button
                  onClick={() => onDelete(d.id)}
                  className="h-7 w-7 rounded-lg grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
