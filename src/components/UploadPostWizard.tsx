// ─── UploadPostWizard.tsx ──────────────────────────────────────
// Multi-step post creation wizard
// Steps: 1 Content Type → 2 Media Edit → 3 Post Details →
//        4 Audience → 5 Advanced → 6 Publish
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  X, Upload, Image as ImageIcon, Video, LayoutGrid, ChevronRight,
  ChevronLeft, Music, Search, Play, Pause, MapPin, Users, UserPlus,
  Globe, Lock, UserCheck, MessageCircle, Share2, Download,
  Eye, EyeOff, Heart, MessageSquareOff, Calendar, Clock, Save,
  Send, Loader2, SlidersHorizontal, Sparkles, Wand2, Tag,
  AlignLeft, Smile, AtSign, Hash, ZoomIn, RotateCw, Sun, Contrast,
  Droplets, Zap, Layers, CheckCircle2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────
export type ContentType = "single_photo" | "carousel_photo" | "single_video" | "multi_video" | "mixed";

type MusicTrack = {
  trackId: number; trackName: string; artistName: string;
  artworkUrl100: string; previewUrl: string;
};
type SelectedMusic = { track: MusicTrack; startSec: number };

type MediaItem = { file: File; preview: string; type: "image" | "video" };

type Adjustments = {
  brightness: number; contrast: number; saturation: number;
  sharpness: number; warmth: number; highlights: number; shadows: number;
};

type AudienceSettings = {
  visibility: "public" | "followers" | "close_friends" | "private";
  comments: "everyone" | "followers" | "nobody";
  allowRepost: boolean; allowStoryShare: boolean; allowDownload: boolean;
};

type AdvancedSettings = {
  hideLikeCount: boolean; hideViewCount: boolean; disableComments: boolean;
  altText: string; aiLabel: boolean;
};

type PublishMode = "now" | "draft" | "schedule";

const STEPS = ["Content", "Edit", "Details", "Audience", "Advanced", "Publish"] as const;

const DEFAULT_ADJ: Adjustments = {
  brightness: 0, contrast: 0, saturation: 0,
  sharpness: 0, warmth: 0, highlights: 0, shadows: 0,
};

const DEFAULT_AUDIENCE: AudienceSettings = {
  visibility: "public", comments: "everyone",
  allowRepost: true, allowStoryShare: true, allowDownload: false,
};

const DEFAULT_ADVANCED: AdvancedSettings = {
  hideLikeCount: false, hideViewCount: false, disableComments: false,
  altText: "", aiLabel: false,
};

// ─── Filter presets ────────────────────────────────────────────
const FILTERS = [
  { name: "Normal", style: "" },
  { name: "Clarendon", style: "contrast(1.2) saturate(1.35) brightness(1.05)" },
  { name: "Juno", style: "sepia(0.15) contrast(1.15) saturate(1.4) brightness(1.05)" },
  { name: "Lark", style: "brightness(1.1) contrast(0.9) saturate(1.2)" },
  { name: "Valencia", style: "sepia(0.15) contrast(1.08) brightness(1.08) saturate(1.3)" },
  { name: "Ludwig", style: "contrast(1.05) brightness(1.05) saturate(0.9)" },
  { name: "Gingham", style: "brightness(1.05) contrast(0.9) saturate(0.85) sepia(0.1)" },
  { name: "Moon", style: "grayscale(1) contrast(1.1) brightness(1.1)" },
  { name: "Fade", style: "contrast(0.85) brightness(1.1) saturate(0.85)" },
  { name: "Crema", style: "sepia(0.2) contrast(0.95) brightness(1.05) saturate(1.1)" },
];

// ─── Aspect ratios ─────────────────────────────────────────────
const CROP_RATIOS = [
  { ratio: "1/1" as const, label: "1:1", icon: "⬛" },
  { ratio: "4/5" as const, label: "4:5", icon: "▬" },
  { ratio: "1080/566" as const, label: "1.91:1", icon: "▭" },
];

// helper
function snapPostRatio(w: number, h: number) {
  const r = w / h;
  if (r < 0.8) return "4/5";
  if (r > 1.6) return "1080/566";
  return "1/1";
}
function formatSec(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function buildFilterStyle(adj: Adjustments, filterStyle: string) {
  const parts: string[] = [];
  if (adj.brightness !== 0) parts.push(`brightness(${1 + adj.brightness / 100})`);
  if (adj.contrast !== 0) parts.push(`contrast(${1 + adj.contrast / 100})`);
  if (adj.saturation !== 0) parts.push(`saturate(${1 + adj.saturation / 100})`);
  if (adj.warmth !== 0) parts.push(`sepia(${Math.abs(adj.warmth) / 200})`);
  const base = parts.join(" ");
  return filterStyle ? (base ? `${filterStyle} ${base}` : filterStyle) : base;
}

// ─── Wizard Props ──────────────────────────────────────────────
export interface UploadPostWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  onUploaded?: () => void;
}

// ─── Main Wizard ───────────────────────────────────────────────
export function UploadPostWizard({ open, onOpenChange, userId, onUploaded }: UploadPostWizardProps) {
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Step 1
  const [contentType, setContentType] = useState<ContentType>("single_photo");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [cropRatio, setCropRatio] = useState<"1/1" | "4/5" | "1080/566">("4/5");
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJ);
  const [selectedFilter, setSelectedFilter] = useState("Normal");
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [bgBlur, setBgBlur] = useState(false);

  // Step 3
  const [caption, setCaption] = useState("");
  const [selectedMusic, setSelectedMusic] = useState<SelectedMusic | null>(null);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [collabInput, setCollabInput] = useState("");

  // Step 4
  const [audience, setAudience] = useState<AudienceSettings>(DEFAULT_AUDIENCE);

  // Step 5
  const [advanced, setAdvanced] = useState<AdvancedSettings>(DEFAULT_ADVANCED);

  // Step 6
  const [publishMode, setPublishMode] = useState<PublishMode>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  function reset() {
    setStep(0); setContentType("single_photo"); setMediaItems([]);
    setActiveItemIdx(0); setCropRatio("4/5"); setAdjustments(DEFAULT_ADJ);
    setSelectedFilter("Normal"); setAutoEnhance(false); setBgBlur(false);
    setCaption(""); setSelectedMusic(null); setMusicPickerOpen(false);
    setTaggedUsers([]); setLocation(""); setCollaborators([]);
    setTagInput(""); setCollabInput("");
    setAudience(DEFAULT_AUDIENCE); setAdvanced(DEFAULT_ADVANCED);
    setPublishMode("now"); setScheduleDate(""); setScheduleTime("");
  }

  function pickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const isVideo = contentType === "single_video" || contentType === "multi_video";
    const items: MediaItem[] = files.map((f) => ({
      file: f, preview: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
    }));
    if (contentType === "single_photo" || contentType === "single_video") {
      setMediaItems([items[0]]);
      if (!isVideo) {
        const img = new window.Image();
        img.onload = () => setCropRatio(snapPostRatio(img.naturalWidth, img.naturalHeight) as typeof cropRatio);
        img.src = items[0].preview;
      }
    } else {
      setMediaItems((prev) => [...prev, ...items].slice(0, 10));
    }
    e.target.value = "";
  }

  function removeMedia(idx: number) {
    setMediaItems((prev) => prev.filter((_, i) => i !== idx));
    if (activeItemIdx >= idx && activeItemIdx > 0) setActiveItemIdx(activeItemIdx - 1);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    const items: MediaItem[] = files.map((f) => ({
      file: f, preview: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
    }));
    setMediaItems(contentType === "single_photo" || contentType === "single_video"
      ? [items[0]] : (prev) => [...prev, ...items].slice(0, 10));
  }

  const filterStyle = FILTERS.find((f) => f.name === selectedFilter)?.style ?? "";
  const cssFilter = buildFilterStyle(
    autoEnhance ? { ...adjustments, brightness: Math.max(adjustments.brightness, 10), contrast: Math.max(adjustments.contrast, 5), saturation: Math.max(adjustments.saturation, 10) } : adjustments,
    filterStyle
  );

  const acceptAttr = contentType === "single_video" || contentType === "multi_video"
    ? "video/*" : contentType === "mixed" ? "image/*,video/*" : "image/*";
  const multipleAttr = contentType !== "single_photo" && contentType !== "single_video";

  const canGoNext =
    step === 0 ? true :
    step === 1 ? mediaItems.length > 0 :
    true;

  async function publish() {
    if (publishMode === "draft") {
      toast.success("Draft saved locally"); reset(); onOpenChange(false); return;
    }
    if (publishMode === "schedule" && (!scheduleDate || !scheduleTime)) {
      toast.error("Pick a date and time to schedule."); return;
    }
    if (mediaItems.length === 0 && !caption.trim()) {
      toast.error("Add media or write a caption."); return;
    }
    setUploading(true);
    try {
      let image_url: string | null = null;
      if (mediaItems.length > 0) {
        const item = mediaItems[0];
        const ext = item.file.name.split(".").pop() ?? "jpg";
        const path = `${userId}/${Date.now()}.${ext}`;
        const bucket = item.type === "video" ? "reels" : "posts";
        const { error: upErr } = await supabase.storage.from(bucket).upload(path, item.file, { upsert: false });
        if (upErr) { toast.error("Upload failed: " + upErr.message); return; }
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
      const { error } = await (supabase as any).from("posts").insert({
        user_id: userId,
        image_url,
        caption: caption.trim() || null,
        music_title: selectedMusic?.track.trackName ?? null,
        music_artist: selectedMusic?.track.artistName ?? null,
        music_artwork_url: selectedMusic?.track.artworkUrl100 ?? null,
        music_preview_url: selectedMusic?.track.previewUrl ?? null,
        music_start_sec: selectedMusic?.startSec ?? null,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Post shared!");
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      qc.invalidateQueries({ queryKey: ["posts", userId] });
      onUploaded?.();
      reset(); onOpenChange(false);
    } finally { setUploading(false); }
  }

  function handleClose() { if (!uploading) { onOpenChange(false); if (!open) reset(); } }
  // Reset on close
  useEffect(() => { if (!open) reset(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Dialog open={open && !musicPickerOpen} onOpenChange={handleClose}>
        <DialogContent className="rounded-3xl max-w-md w-[calc(100vw-1rem)] p-0 gap-0 overflow-hidden max-h-[95dvh] flex flex-col"
          style={{ background: "oklch(0.13 0.015 268)" }}>

          {/* ── Step indicator header ── */}
          <div className="px-5 pt-5 pb-3 shrink-0 border-b" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
            <div className="flex items-center justify-between mb-3">
              <DialogTitle className="text-base font-semibold">New Post</DialogTitle>
              <button onClick={handleClose} className="h-7 w-7 rounded-full grid place-items-center hover:bg-white/10 transition-all">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {/* Pill steps */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={cn(
                      "h-6 rounded-full text-[10px] font-semibold transition-all px-2.5",
                      i === step ? "text-white" : i < step ? "text-white/70 hover:text-white cursor-pointer" : "text-muted-foreground/40 cursor-default"
                    )}
                    style={i === step ? { background: "var(--gradient-primary)" } : i < step ? { background: "oklch(0.65 0.22 280 / 0.30)" } : { background: "oklch(0.20 0.016 268)" }}
                  >
                    {i < step ? <CheckCircle2 className="h-3 w-3 inline" /> : null} {label}
                  </button>
                  {i < STEPS.length - 1 && <div className={cn("h-px flex-1 min-w-[6px]", i < step ? "bg-primary/40" : "bg-white/10")} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Step body ── */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-5 py-4">
              {step === 0 && <Step1ContentType contentType={contentType} setContentType={setContentType} />}
              {step === 1 && (
                <Step2MediaEdit
                  contentType={contentType}
                  mediaItems={mediaItems}
                  activeItemIdx={activeItemIdx}
                  setActiveItemIdx={setActiveItemIdx}
                  inputRef={inputRef}
                  onPickFiles={pickFiles}
                  onDrop={onDrop}
                  onRemove={removeMedia}
                  cropRatio={cropRatio}
                  setCropRatio={setCropRatio}
                  adjustments={adjustments}
                  setAdjustments={setAdjustments}
                  selectedFilter={selectedFilter}
                  setSelectedFilter={setSelectedFilter}
                  autoEnhance={autoEnhance}
                  setAutoEnhance={setAutoEnhance}
                  bgBlur={bgBlur}
                  setBgBlur={setBgBlur}
                  cssFilter={cssFilter}
                  acceptAttr={acceptAttr}
                  multipleAttr={multipleAttr}
                />
              )}
              {step === 2 && (
                <Step3PostDetails
                  caption={caption} setCaption={setCaption}
                  selectedMusic={selectedMusic} setSelectedMusic={setSelectedMusic}
                  onOpenMusicPicker={() => setMusicPickerOpen(true)}
                  taggedUsers={taggedUsers} setTaggedUsers={setTaggedUsers}
                  tagInput={tagInput} setTagInput={setTagInput}
                  location={location} setLocation={setLocation}
                  collaborators={collaborators} setCollaborators={setCollaborators}
                  collabInput={collabInput} setCollabInput={setCollabInput}
                />
              )}
              {step === 3 && <Step4Audience audience={audience} setAudience={setAudience} />}
              {step === 4 && <Step5Advanced advanced={advanced} setAdvanced={setAdvanced} />}
              {step === 5 && (
                <Step6Publish
                  publishMode={publishMode} setPublishMode={setPublishMode}
                  scheduleDate={scheduleDate} setScheduleDate={setScheduleDate}
                  scheduleTime={scheduleTime} setScheduleTime={setScheduleTime}
                  onPublish={publish} uploading={uploading}
                  canPublish={mediaItems.length > 0 || caption.trim().length > 0}
                />
              )}
            </div>
          </ScrollArea>

          {/* ── Footer nav ── */}
          {step < 5 && (
            <div className="px-5 py-4 flex items-center gap-3 border-t shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-2xl h-11 gap-2 border-white/10">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              )}
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext}
                className="flex-1 rounded-2xl h-11 gap-2 font-semibold"
                style={{ background: "var(--gradient-primary)" }}
              >
                {step === 4 ? "Review" : "Next"} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
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

// ─── Step 1: Content Type ──────────────────────────────────────
const CONTENT_TYPES: { type: ContentType; icon: React.ReactNode; label: string; desc: string }[] = [
  { type: "single_photo", icon: <ImageIcon className="h-5 w-5" />, label: "Single Photo", desc: "One image post" },
  { type: "carousel_photo", icon: <LayoutGrid className="h-5 w-5" />, label: "Photo Carousel", desc: "Up to 10 photos" },
  { type: "single_video", icon: <Video className="h-5 w-5" />, label: "Single Video", desc: "One video post" },
  { type: "multi_video", icon: <Layers className="h-5 w-5" />, label: "Multiple Videos", desc: "Up to 10 videos" },
  { type: "mixed", icon: <Sparkles className="h-5 w-5" />, label: "Mixed Carousel", desc: "Photos & videos" },
];

function Step1ContentType({ contentType, setContentType }: {
  contentType: ContentType; setContentType: (t: ContentType) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Choose what you want to share</p>
      {CONTENT_TYPES.map(({ type, icon, label, desc }) => (
        <button
          key={type}
          onClick={() => setContentType(type)}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left",
            contentType === type
              ? "border-primary/60 bg-primary/8"
              : "border-white/8 hover:border-white/15"
          )}
          style={contentType === type ? { background: "oklch(0.65 0.22 280 / 0.08)" } : { background: "oklch(0.16 0.016 268 / 0.6)" }}
        >
          <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0 transition-all",
            contentType === type ? "text-white" : "text-muted-foreground")}
            style={contentType === type ? { background: "var(--gradient-primary)" } : { background: "oklch(0.20 0.016 268)" }}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </div>
          {contentType === type && <CheckCircle2 className="h-5 w-5 text-primary ml-auto shrink-0" />}
        </button>
      ))}
    </div>
  );
}

// ─── Step 2: Media Edit ────────────────────────────────────────
function Step2MediaEdit({
  contentType, mediaItems, activeItemIdx, setActiveItemIdx,
  inputRef, onPickFiles, onDrop, onRemove,
  cropRatio, setCropRatio, adjustments, setAdjustments,
  selectedFilter, setSelectedFilter, autoEnhance, setAutoEnhance,
  bgBlur, setBgBlur, cssFilter, acceptAttr, multipleAttr,
}: {
  contentType: ContentType; mediaItems: MediaItem[]; activeItemIdx: number;
  setActiveItemIdx: (i: number) => void; inputRef: React.RefObject<HTMLInputElement | null>;
  onPickFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void; onRemove: (i: number) => void;
  cropRatio: "1/1" | "4/5" | "1080/566"; setCropRatio: (r: "1/1" | "4/5" | "1080/566") => void;
  adjustments: Adjustments; setAdjustments: (a: Adjustments) => void;
  selectedFilter: string; setSelectedFilter: (f: string) => void;
  autoEnhance: boolean; setAutoEnhance: (v: boolean) => void;
  bgBlur: boolean; setBgBlur: (v: boolean) => void;
  cssFilter: string; acceptAttr: string; multipleAttr: boolean;
}) {
  const activeItem = mediaItems[activeItemIdx] ?? null;

  return (
    <div className="space-y-4">
      {/* Drop zone / preview */}
      {mediaItems.length === 0 ? (
        <div
          onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer py-12 transition-all hover:border-primary/50"
          style={{ borderColor: "oklch(0.28 0.018 268)" }}>
          <div className="h-14 w-14 rounded-2xl grid place-items-center"
            style={{ background: "oklch(0.65 0.22 280 / 0.12)", border: "1px solid oklch(0.65 0.22 280 / 0.25)" }}>
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">
              {contentType === "single_video" || contentType === "multi_video" ? "MP4, MOV · max 100 MB" : "JPEG, PNG, WebP · max 20 MB"}
            </p>
          </div>
          <input ref={inputRef} type="file" accept={acceptAttr} multiple={multipleAttr} className="hidden" onChange={onPickFiles} />
        </div>
      ) : (
        <>
          {/* Main preview */}
          {activeItem?.type === "image" ? (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: cropRatio }}>
              <img src={activeItem.preview} alt="" className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: cssFilter, ...(bgBlur ? { backdropFilter: "blur(4px)" } : {}) }} />
              <button onClick={() => onRemove(activeItemIdx)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 z-10 transition-all">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video">
              <video src={activeItem?.preview} className="w-full h-full object-cover" controls />
              <button onClick={() => onRemove(activeItemIdx)}
                className="absolute top-2 right-2 h-7 w-7 rounded-full grid place-items-center bg-black/60 hover:bg-black/80 z-10 transition-all">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          {/* Thumbnail strip for carousel */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mediaItems.map((item, i) => (
                <button key={i} onClick={() => setActiveItemIdx(i)}
                  className={cn("relative h-14 w-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                    i === activeItemIdx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100")}>
                  {item.type === "image"
                    ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                    : <video src={item.preview} className="w-full h-full object-cover" />}
                  <button onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/70 grid place-items-center">
                    <X className="h-2.5 w-2.5 text-white" />
                  </button>
                </button>
              ))}
              {mediaItems.length < 10 && (
                <button onClick={() => inputRef.current?.click()}
                  className="h-14 w-14 rounded-xl border-2 border-dashed grid place-items-center shrink-0 hover:border-primary/50 transition-all"
                  style={{ borderColor: "oklch(0.28 0.018 268)" }}>
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <input ref={inputRef} type="file" accept={acceptAttr} multiple className="hidden" onChange={onPickFiles} />
            </div>
          )}
          {mediaItems.length === 1 && (
            <div className="flex justify-end">
              <button onClick={() => inputRef.current?.click()}
                className="text-xs text-primary/80 hover:text-primary flex items-center gap-1 transition-all">
                <Upload className="h-3 w-3" /> Add more
              </button>
              <input ref={inputRef} type="file" accept={acceptAttr} multiple={multipleAttr} className="hidden" onChange={onPickFiles} />
            </div>
          )}
        </>
      )}

      {/* Only show editing controls when image is loaded */}
      {activeItem?.type === "image" && mediaItems.length > 0 && (
        <>
          {/* Crop ratios */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ZoomIn className="h-3.5 w-3.5" /> Crop
            </p>
            <div className="flex gap-2">
              {CROP_RATIOS.map(({ ratio, label, icon }) => (
                <button key={ratio} onClick={() => setCropRatio(ratio)}
                  className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border flex-1 justify-center",
                    cropRatio === ratio ? "border-primary/60 text-foreground bg-primary/10" : "border-border text-muted-foreground hover:border-primary/30"
                  )}>
                  <span className="text-[11px]">{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Filters
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(({ name, style }) => (
                <button key={name} onClick={() => setSelectedFilter(name)}
                  className={cn("flex flex-col items-center gap-1.5 shrink-0 transition-all", selectedFilter === name ? "opacity-100" : "opacity-60 hover:opacity-90")}>
                  <div className={cn("h-14 w-14 rounded-xl overflow-hidden border-2 transition-all",
                    selectedFilter === name ? "border-primary" : "border-transparent")}>
                    {activeItem && <img src={activeItem.preview} alt={name} className="w-full h-full object-cover"
                      style={{ filter: style || "none" }} />}
                  </div>
                  <span className="text-[10px] font-medium">{name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Adjustments */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Adjustments
            </p>
            <div className="space-y-3.5">
              {([
                { key: "brightness" as const, label: "Brightness", icon: <Sun className="h-3.5 w-3.5" /> },
                { key: "contrast" as const, label: "Contrast", icon: <Contrast className="h-3.5 w-3.5" /> },
                { key: "saturation" as const, label: "Saturation", icon: <Droplets className="h-3.5 w-3.5" /> },
                { key: "sharpness" as const, label: "Sharpness", icon: <Zap className="h-3.5 w-3.5" /> },
                { key: "warmth" as const, label: "Warmth", icon: <Sun className="h-3.5 w-3.5" style={{ color: "oklch(0.75 0.18 60)" }} /> },
                { key: "highlights" as const, label: "Highlights", icon: <Sun className="h-3.5 w-3.5" style={{ color: "oklch(0.85 0.10 90)" }} /> },
                { key: "shadows" as const, label: "Shadows", icon: <Sun className="h-3.5 w-3.5 opacity-50" /> },
              ] as const).map(({ key, label, icon }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{adjustments[key] > 0 ? `+${adjustments[key]}` : adjustments[key]}</span>
                  </div>
                  <Slider min={-100} max={100} step={1} value={[adjustments[key]]}
                    onValueChange={([v]) => setAdjustments({ ...adjustments, [key]: v })}
                    className="w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Enhancements */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5" /> AI Enhancements
            </p>
            <div className="space-y-2.5">
              {[
                { key: "autoEnhance" as const, label: "Auto Enhance", desc: "Automatically optimize brightness, contrast & colors", val: autoEnhance, set: setAutoEnhance },
                { key: "bgBlur" as const, label: "Background Blur", desc: "Blur background to focus on subject", val: bgBlur, set: setBgBlur },
              ].map(({ key, label, desc, val, set }) => (
                <div key={key} className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl"
                  style={{ background: "oklch(0.16 0.016 268)" }}>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch checked={val} onCheckedChange={set} />
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl opacity-50"
                style={{ background: "oklch(0.16 0.016 268)" }}>
                <div>
                  <p className="text-sm font-medium">Sky Enhancement</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enhance sky colors and details</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0">Soon</Badge>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 3: Post Details ──────────────────────────────────────
function Step3PostDetails({
  caption, setCaption, selectedMusic, setSelectedMusic, onOpenMusicPicker,
  taggedUsers, setTaggedUsers, tagInput, setTagInput,
  location, setLocation, collaborators, setCollaborators,
  collabInput, setCollabInput,
}: {
  caption: string; setCaption: (v: string) => void;
  selectedMusic: SelectedMusic | null; setSelectedMusic: (v: SelectedMusic | null) => void;
  onOpenMusicPicker: () => void;
  taggedUsers: string[]; setTaggedUsers: (v: string[]) => void;
  tagInput: string; setTagInput: (v: string) => void;
  location: string; setLocation: (v: string) => void;
  collaborators: string[]; setCollaborators: (v: string[]) => void;
  collabInput: string; setCollabInput: (v: string) => void;
}) {
  const remaining = 2200 - caption.length;
  return (
    <div className="space-y-4">
      {/* Caption */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft className="h-3.5 w-3.5" /> Caption
          </Label>
          <span className={cn("text-[11px] tabular-nums", remaining < 100 ? "text-orange-400" : "text-muted-foreground/50")}>
            {remaining}
          </span>
        </div>
        <Textarea
          value={caption} onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption… Use # for hashtags, @ for mentions"
          maxLength={2200} rows={4} className="rounded-xl resize-none text-sm"
        />
        <div className="flex gap-3 mt-2">
          {[{ icon: <Smile className="h-4 w-4" />, label: "Emoji" },
            { icon: <Hash className="h-4 w-4" />, label: "Hashtag" },
            { icon: <AtSign className="h-4 w-4" />, label: "Mention" }].map(({ icon, label }) => (
            <button key={label}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Music */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Music className="h-3.5 w-3.5" /> Add Music
        </Label>
        <button type="button" onClick={onOpenMusicPicker}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm",
            selectedMusic ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 bg-card")}>
          {selectedMusic ? (
            <>
              <img src={selectedMusic.track.artworkUrl100} alt="" className="h-9 w-9 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium truncate text-xs leading-tight">{selectedMusic.track.trackName}</p>
                <p className="text-muted-foreground truncate text-[11px]">{selectedMusic.track.artistName}
                  <span className="ml-2 text-primary/70">· from {formatSec(selectedMusic.startSec)}</span></p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedMusic(null); }}
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
              <span className="flex-1 text-left text-muted-foreground text-sm">Search songs, browse trending…</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            </>
          )}
        </button>
      </div>

      {/* Tag people */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Tag className="h-3.5 w-3.5" /> Tag People
        </Label>
        <div className="flex gap-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            placeholder="@username" className="rounded-xl text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                const u = tagInput.trim().replace(/^@/, "");
                if (!taggedUsers.includes(u)) setTaggedUsers([...taggedUsers, u]);
                setTagInput("");
              }
            }} />
          <Button variant="outline" size="sm" className="rounded-xl shrink-0 border-white/10"
            onClick={() => {
              const u = tagInput.trim().replace(/^@/, "");
              if (u && !taggedUsers.includes(u)) setTaggedUsers([...taggedUsers, u]);
              setTagInput("");
            }}>Add</Button>
        </div>
        {taggedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {taggedUsers.map((u) => (
              <Badge key={u} variant="secondary" className="gap-1 text-xs pr-1">
                @{u}
                <button onClick={() => setTaggedUsers(taggedUsers.filter((t) => t !== u))}
                  className="rounded-full hover:bg-white/10 transition-all p-0.5"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <MapPin className="h-3.5 w-3.5" /> Add Location
        </Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="Search location or nearby places…" className="rounded-xl text-sm" />
      </div>

      {/* Collaborators */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <UserPlus className="h-3.5 w-3.5" /> Add Collaborators
        </Label>
        <div className="flex gap-2">
          <Input value={collabInput} onChange={(e) => setCollabInput(e.target.value)}
            placeholder="Invite @username to co-author…" className="rounded-xl text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && collabInput.trim()) {
                const u = collabInput.trim().replace(/^@/, "");
                if (!collaborators.includes(u)) setCollaborators([...collaborators, u]);
                setCollabInput("");
              }
            }} />
          <Button variant="outline" size="sm" className="rounded-xl shrink-0 border-white/10"
            onClick={() => {
              const u = collabInput.trim().replace(/^@/, "");
              if (u && !collaborators.includes(u)) setCollaborators([...collaborators, u]);
              setCollabInput("");
            }}>Invite</Button>
        </div>
        {collaborators.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {collaborators.map((u) => (
              <Badge key={u} variant="secondary" className="gap-1 text-xs pr-1">
                <UserCheck className="h-3 w-3" /> @{u}
                <button onClick={() => setCollaborators(collaborators.filter((c) => c !== u))}
                  className="rounded-full hover:bg-white/10 transition-all p-0.5"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
        {collaborators.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-1.5">Collaborators will share engagement metrics for this post.</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Audience ──────────────────────────────────────────
function Step4Audience({ audience, setAudience }: { audience: AudienceSettings; setAudience: (a: AudienceSettings) => void }) {
  return (
    <div className="space-y-5">
      {/* Visibility */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Globe className="h-3.5 w-3.5" /> Post Visibility
        </Label>
        <div className="space-y-2">
          {([
            { val: "public" as const, label: "Public", desc: "Anyone can see this post", icon: <Globe className="h-4 w-4" /> },
            { val: "followers" as const, label: "Followers", desc: "Only your followers", icon: <Users className="h-4 w-4" /> },
            { val: "close_friends" as const, label: "Close Friends", desc: "Your close friends list", icon: <UserCheck className="h-4 w-4" /> },
            { val: "private" as const, label: "Only Me", desc: "Only visible to you", icon: <Lock className="h-4 w-4" /> },
          ]).map(({ val, label, desc, icon }) => (
            <button key={val} onClick={() => setAudience({ ...audience, visibility: val })}
              className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                audience.visibility === val ? "border-primary/60 bg-primary/8" : "border-white/8 hover:border-white/15")}
              style={audience.visibility === val ? { background: "oklch(0.65 0.22 280 / 0.08)" } : { background: "oklch(0.16 0.016 268 / 0.6)" }}>
              <div className={cn("shrink-0 transition-colors", audience.visibility === val ? "text-primary" : "text-muted-foreground")}>{icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {audience.visibility === val && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <MessageCircle className="h-3.5 w-3.5" /> Who Can Comment
        </Label>
        <div className="space-y-2">
          {([
            { val: "everyone" as const, label: "Everyone" },
            { val: "followers" as const, label: "Followers Only" },
            { val: "nobody" as const, label: "Nobody" },
          ]).map(({ val, label }) => (
            <button key={val} onClick={() => setAudience({ ...audience, comments: val })}
              className={cn("w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                audience.comments === val ? "border-primary/60 bg-primary/8" : "border-white/8 hover:border-white/15")}
              style={audience.comments === val ? { background: "oklch(0.65 0.22 280 / 0.08)" } : { background: "oklch(0.16 0.016 268 / 0.6)" }}>
              <span className="text-sm font-medium">{label}</span>
              {audience.comments === val && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing toggles */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Share2 className="h-3.5 w-3.5" /> Sharing Options
        </Label>
        <div className="space-y-2">
          {([
            { key: "allowRepost" as const, label: "Allow Repost", icon: <Share2 className="h-4 w-4" /> },
            { key: "allowStoryShare" as const, label: "Allow Story Sharing", icon: <Layers className="h-4 w-4" /> },
            { key: "allowDownload" as const, label: "Allow Download", icon: <Download className="h-4 w-4" /> },
          ] as const).map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: "oklch(0.16 0.016 268)" }}>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Switch checked={audience[key]} onCheckedChange={(v) => setAudience({ ...audience, [key]: v })} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Advanced ─────────────────────────────────────────
function Step5Advanced({ advanced, setAdvanced }: { advanced: AdvancedSettings; setAdvanced: (a: AdvancedSettings) => void }) {
  return (
    <div className="space-y-5">
      {/* Engagement controls */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Eye className="h-3.5 w-3.5" /> Engagement Controls
        </Label>
        <div className="space-y-2">
          {([
            { key: "hideLikeCount" as const, label: "Hide Like Count", desc: "Others won't see how many likes this post has", icon: <Heart className="h-4 w-4" /> },
            { key: "hideViewCount" as const, label: "Hide View Count", desc: "Others won't see view numbers", icon: <EyeOff className="h-4 w-4" /> },
            { key: "disableComments" as const, label: "Disable Comments", desc: "Turn off comments for this post", icon: <MessageSquareOff className="h-4 w-4" /> },
          ] as const).map(({ key, label, desc, icon }) => (
            <div key={key} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
              style={{ background: "oklch(0.16 0.016 268)" }}>
              <div className="flex items-center gap-3 flex-1">
                <span className="text-muted-foreground shrink-0">{icon}</span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch checked={advanced[key] as boolean}
                onCheckedChange={(v) => setAdvanced({ ...advanced, [key]: v })} />
            </div>
          ))}
        </div>
      </div>

      {/* Accessibility */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <AlignLeft className="h-3.5 w-3.5" /> Accessibility
        </Label>
        <div className="space-y-2">
          <div className="px-4 py-3 rounded-xl space-y-2" style={{ background: "oklch(0.16 0.016 268)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto Alt Text</p>
                <p className="text-xs text-muted-foreground">AI-generated description for screen readers</p>
              </div>
              <Badge variant="secondary" className="text-[10px] shrink-0">Auto</Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Custom Alt Text</Label>
            <Textarea value={advanced.altText} onChange={(e) => setAdvanced({ ...advanced, altText: e.target.value })}
              placeholder="Describe your image for screen reader users…" rows={2}
              maxLength={500} className="rounded-xl resize-none text-sm" />
          </div>
        </div>
      </div>

      {/* AI label */}
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Wand2 className="h-3.5 w-3.5" /> AI Disclosure
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
            style={{ background: "oklch(0.16 0.016 268)" }}>
            <div>
              <p className="text-sm font-medium">Label as AI Content</p>
              <p className="text-xs text-muted-foreground">Add an AI-generated content label to this post</p>
            </div>
            <Switch checked={advanced.aiLabel} onCheckedChange={(v) => setAdvanced({ ...advanced, aiLabel: v })} />
          </div>
          {advanced.aiLabel && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-primary/80"
              style={{ background: "oklch(0.65 0.22 280 / 0.08)", border: "1px solid oklch(0.65 0.22 280 / 0.20)" }}>
              <Wand2 className="h-3.5 w-3.5 shrink-0" />
              This post will be labeled as AI-generated content.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 6: Publish ──────────────────────────────────────────
function Step6Publish({
  publishMode, setPublishMode, scheduleDate, setScheduleDate,
  scheduleTime, setScheduleTime, onPublish, uploading, canPublish,
}: {
  publishMode: PublishMode; setPublishMode: (m: PublishMode) => void;
  scheduleDate: string; setScheduleDate: (v: string) => void;
  scheduleTime: string; setScheduleTime: (v: string) => void;
  onPublish: () => void; uploading: boolean; canPublish: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5" /> Publish Options
        </Label>
        <div className="space-y-2">
          {([
            { val: "now" as const, label: "Publish Now", desc: "Share immediately", icon: <Send className="h-4 w-4" /> },
            { val: "draft" as const, label: "Save as Draft", desc: "Save and publish later", icon: <Save className="h-4 w-4" /> },
            { val: "schedule" as const, label: "Schedule Post", desc: "Pick a future date & time", icon: <Calendar className="h-4 w-4" /> },
          ]).map(({ val, label, desc, icon }) => (
            <button key={val} onClick={() => setPublishMode(val)}
              className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                publishMode === val ? "border-primary/60 bg-primary/8" : "border-white/8 hover:border-white/15")}
              style={publishMode === val ? { background: "oklch(0.65 0.22 280 / 0.08)" } : { background: "oklch(0.16 0.016 268 / 0.6)" }}>
              <div className={cn("shrink-0 transition-colors", publishMode === val ? "text-primary" : "text-muted-foreground")}>{icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {publishMode === val && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule options */}
      {publishMode === "schedule" && (
        <div className="space-y-3 px-4 py-4 rounded-xl" style={{ background: "oklch(0.16 0.016 268)" }}>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Schedule Time
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="rounded-xl text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Time</Label>
              <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                className="rounded-xl text-sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </div>
      )}

      {/* Publish button */}
      <Button onClick={onPublish} disabled={uploading || !canPublish}
        className="w-full h-12 rounded-2xl font-semibold text-sm gap-2"
        style={{ background: "var(--gradient-primary)" }}>
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
        ) : publishMode === "now" ? (
          <><Send className="h-4 w-4" /> Share Post</>
        ) : publishMode === "draft" ? (
          <><Save className="h-4 w-4" /> Save Draft</>
        ) : (
          <><Calendar className="h-4 w-4" /> Schedule Post</>
        )}
      </Button>

      {!canPublish && (
        <p className="text-xs text-center text-muted-foreground">Add media or a caption before publishing.</p>
      )}
    </div>
  );
}

// ─── Music Picker Dialog ───────────────────────────────────────
const CLIP_DUR = 15;
const PREV_DUR = 30;

function MusicPickerDialog({ open, onOpenChange, onSelect }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  onSelect: (music: SelectedMusic) => void;
}) {
  const [step, setStep] = useState<"search" | "trim">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicTrack[]>([]);
  const [searching, setSearching] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<MusicTrack | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (previewId === track.trackId) { audioRef.current?.pause(); setPreviewId(null); }
    else {
      audioRef.current?.pause();
      const a = new Audio(track.previewUrl);
      a.play().catch(() => {}); a.onended = () => setPreviewId(null);
      audioRef.current = a; setPreviewId(track.trackId);
    }
  }

  function goToTrim(track: MusicTrack) {
    audioRef.current?.pause(); setPreviewId(null);
    setPendingTrack(track); setStep("trim");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-sm w-[calc(100vw-1.5rem)] flex flex-col max-h-[92dvh] p-0 overflow-hidden"
        style={{ background: "oklch(0.13 0.015 268)" }}>
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
                <Input value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search songs, artists…" className="pl-9 rounded-xl" autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 min-h-0">
              {searching && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
              {!searching && query && results.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No songs found</p>}
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
                      {isPlaying && <div className="absolute inset-0 rounded-lg bg-black/40 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white animate-spin" style={{ animationDuration: "1.2s" }} />
                      </div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.trackName}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); togglePreview(track); }}
                      className={cn("h-8 w-8 rounded-full shrink-0 grid place-items-center transition-all",
                        isPlaying ? "bg-primary text-white" : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50")}>
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {step === "trim" && pendingTrack && (
          <MusicTrimStep track={pendingTrack}
            onBack={() => { setStep("search"); setPendingTrack(null); }}
            onConfirm={(startSec) => onSelect({ track: pendingTrack, startSec })} />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Music Trim Step ───────────────────────────────────────────
function MusicTrimStep({ track, onBack, onConfirm }: {
  track: MusicTrack; onBack: () => void; onConfirm: (startSec: number) => void;
}) {
  const CLIP = CLIP_DUR; const TOTAL = PREV_DUR; const MAX_START = TOTAL - CLIP;
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
    a.currentTime = 0;
    a.ontimeupdate = () => {
      setCurrentTime(a.currentTime);
      if (a.currentTime >= startSecRef.current + CLIP) a.currentTime = startSecRef.current;
    };
    a.play().catch(() => {}); audioRef.current = a; setPlaying(true);
    return () => { a.pause(); a.src = ""; };
  }, [track.previewUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  function seekTo(sec: number) {
    const clamped = Math.max(0, Math.min(sec, MAX_START));
    startSecRef.current = clamped; setStartSec(clamped);
    if (audioRef.current) audioRef.current.currentTime = clamped;
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
    const trackW = trackRef.current?.getBoundingClientRect().width ?? 1;
    seekTo(dragStartSec.current + (e.clientX - dragStartX.current) * (TOTAL / trackW));
  }
  function onPointerUp(e: React.PointerEvent) {
    e.currentTarget.releasePointerCapture(e.pointerId); isDragging.current = false;
  }
  function onTrackClick(e: React.MouseEvent) {
    if (isDragging.current) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    seekTo((e.clientX - rect.left) / rect.width * TOTAL - CLIP / 2);
  }
  const playheadRatio = Math.min(currentTime / TOTAL, 1);
  const selLeft = (startSec / TOTAL) * 100;
  const selWidth = (CLIP / TOTAL) * 100;

  return (
    <div className="flex flex-col h-full p-5 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-8 w-8 rounded-xl grid place-items-center hover:bg-white/10 transition-all shrink-0">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <img src={track.artworkUrl100} alt="" className="h-11 w-11 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{track.trackName}</p>
          <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
        </div>
        <button onClick={togglePlay}
          className="h-9 w-9 rounded-full grid place-items-center shrink-0 transition-all text-white"
          style={{ background: "var(--gradient-primary)" }}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">Drag to select a {CLIP}s clip</p>
        <div ref={trackRef} className="relative h-14 rounded-xl overflow-hidden cursor-pointer select-none"
          style={{ background: "oklch(0.18 0.016 268)" }} onClick={onTrackClick}>
          <div className="absolute inset-y-0 rounded-xl border-2 border-primary/80 cursor-grab active:cursor-grabbing"
            style={{ left: `${selLeft}%`, width: `${selWidth}%`, background: "oklch(0.65 0.22 280 / 0.25)", touchAction: "none" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
            <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between">
              <ChevronLeft className="h-3.5 w-3.5 text-primary/70" />
              <ChevronRight className="h-3.5 w-3.5 text-primary/70" />
            </div>
          </div>
          <div className="absolute inset-y-0 w-0.5 bg-white/80 pointer-events-none"
            style={{ left: `${playheadRatio * 100}%` }} />
          <div className="absolute inset-0 flex items-end justify-between px-2 pb-1 pointer-events-none">
            <span className="text-[9px] text-muted-foreground/60">0:00</span>
            <span className="text-[9px] text-muted-foreground/60">0:30</span>
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          From {formatSec(startSec)} → {formatSec(startSec + CLIP)}
        </p>
      </div>

      <Button onClick={() => onConfirm(startSec)} className="w-full h-11 rounded-2xl font-semibold gap-2"
        style={{ background: "var(--gradient-primary)" }}>
        <CheckCircle2 className="h-4 w-4" /> Use This Clip
      </Button>
    </div>
  );
}
