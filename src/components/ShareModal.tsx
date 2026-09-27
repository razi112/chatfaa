/**
 * ShareModal — Instagram-style share sheet for posts and reels.
 *
 * Features:
 *  - Search Chatfaa users (friends + search_users RPC)
 *  - Select one or multiple recipients (checkbox-style avatars)
 *  - Optional message field
 *  - Send the post/reel to Chatfaa DMs as a JSON preview card
 *  - Copy the post/reel link
 *  - Trigger the device's native share sheet (Web Share API)
 *
 * The shared content is stored as a JSON string in the `messages.content`
 * column.  The JSON envelope starts with the sentinel prefix
 * `__share__:` so MessageBubble can detect and render it as a card.
 *
 * Envelope:
 * ```
 * __share__:{"type":"post"|"reel","id":"<uuid>","caption":"…",
 *             "thumbnailUrl":"…","authorUsername":"…","url":"…",
 *             "message":"<optional note>"}
 * ```
 */

import { useState, useEffect, useRef } from "react";
import { Search, X, Send, Link2, Share2, Check, Loader2, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/VerifiedBadge";

// ─── Public types ─────────────────────────────────────────────────────────────

export type SharePayload = {
  type: "post" | "reel";
  id: string;
  caption: string | null;
  /** Thumbnail or first-frame image URL */
  thumbnailUrl: string | null;
  authorUsername: string;
  /** Deep-link URL inside the app */
  url: string;
};

export const SHARE_PREFIX = "__share__:";

export function encodeShareMessage(payload: SharePayload, message: string): string {
  return `${SHARE_PREFIX}${JSON.stringify({ ...payload, message: message.trim() || undefined })}`;
}

export function decodeShareMessage(content: string): (SharePayload & { message?: string }) | null {
  if (!content.startsWith(SHARE_PREFIX)) return null;
  try {
    return JSON.parse(content.slice(SHARE_PREFIX.length));
  } catch {
    return null;
  }
}

// ─── Internal types ───────────────────────────────────────────────────────────

type SearchUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_private: boolean;
  follow_status: string;
};

function initials(name: string) {
  return (name ?? "?").slice(0, 2).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ShareModalProps {
  meId: string;
  payload: SharePayload;
  onClose: () => void;
}

export function ShareModal({ meId, payload, onClose }: ShareModalProps) {
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[]>([]); // ids already sent this session
  const inputRef = useRef<HTMLInputElement>(null);

  // 300 ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // ── Friends (accepted friendships) ─────────────────────────────────────────
  const friendsQ = useQuery({
    queryKey: ["share-friends", meId],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friendships")
        .select("sender_id, receiver_id")
        .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
        .eq("status", "accepted");
      if (error) return [] as SearchUser[];

      const friendIds: string[] = (data ?? []).map((f: { sender_id: string; receiver_id: string }) =>
        f.sender_id === meId ? f.receiver_id : f.sender_id
      );
      if (friendIds.length === 0) return [] as SearchUser[];

      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, is_verified, is_private")
        .in("id", friendIds);
      if (pErr) return [] as SearchUser[];

      return ((profiles ?? []) as SearchUser[]).map((p) => ({
        ...p,
        follow_status: "following",
      }));
    },
  });

  // ── User search ────────────────────────────────────────────────────────────
  const searchQ = useQuery({
    queryKey: ["share-search", debouncedQuery],
    enabled: debouncedQuery.length >= 1,
    staleTime: 10_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_users", { _query: debouncedQuery });
      if (error) return [] as SearchUser[];
      return ((data ?? []) as SearchUser[]).filter((u) => u.id !== meId);
    },
  });

  const friends = friendsQ.data ?? [];
  const displayList: SearchUser[] =
    debouncedQuery.length >= 1
      ? (searchQ.data ?? [])
      : friends;

  // ── Selection helpers ──────────────────────────────────────────────────────
  function toggle(user: SearchUser) {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  }
  const isSelected = (id: string) => selected.some((u) => u.id === id);

  // ── Send to DMs ────────────────────────────────────────────────────────────
  async function sendToDMs() {
    if (selected.length === 0 || sending) return;
    setSending(true);
    const content = encodeShareMessage(payload, message);

    const results = await Promise.allSettled(
      selected.map((u) =>
        supabase.from("messages").insert({
          sender_id: meId,
          receiver_id: u.id,
          content,
        })
      )
    );

    setSending(false);
    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.filter((r) => r.status === "fulfilled").length;

    if (succeeded > 0) {
      setSent((prev) => [...prev, ...selected.map((u) => u.id)]);
      // Invalidate chat queries so the DM reflects immediately if open
      selected.forEach((u) => {
        qc.invalidateQueries({ queryKey: ["messages", meId, u.id] });
        qc.invalidateQueries({ queryKey: ["messages", u.id, meId] });
      });
      toast.success(
        succeeded === 1
          ? `Sent to @${selected[0].username}`
          : `Sent to ${succeeded} people`
      );
      setSelected([]);
      setMessage("");
    }
    if (failed > 0) {
      toast.error(`Failed to send to ${failed} recipient${failed > 1 ? "s" : ""}`);
    }
  }

  // ── Copy link ──────────────────────────────────────────────────────────────
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(payload.url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  }

  // ── Native share ───────────────────────────────────────────────────────────
  async function nativeShare() {
    if (!navigator.share) {
      copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `${payload.type === "reel" ? "Reel" : "Post"} by @${payload.authorUsername} on chatfaa`,
        text: payload.caption ?? payload.url,
        url: payload.url,
      });
    } catch {
      /* user cancelled — noop */
    }
  }

  // ── Keyboard: Escape closes ────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Focus search on open ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const isLoading =
    debouncedQuery.length >= 1 ? searchQ.isLoading : friendsQ.isLoading;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
      style={{ padding: "0 0 env(safe-area-inset-bottom) 0" }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="flex flex-col w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          maxHeight: "88dvh",
          background: "oklch(0.14 0.015 268 / 0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid oklch(0.26 0.018 268)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
          style={{ borderColor: "oklch(0.22 0.016 268)" }}
        >
          <span className="font-semibold text-sm">Share</span>
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/6 transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div
            className="flex items-center gap-2 rounded-2xl px-3"
            style={{
              background: "oklch(0.17 0.016 268)",
              border: "1px solid oklch(0.26 0.018 268)",
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 py-2.5 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground text-xs shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Selected chips */}
        {selected.length > 0 && (
          <div
            className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0"
          >
            {selected.map((u) => (
              <button
                key={u.id}
                onClick={() => toggle(u)}
                className="flex flex-col items-center gap-1 shrink-0 group"
              >
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 transition-all" style={{ ringColor: "oklch(0.65 0.22 280)" }}>
                    <AvatarImage src={u.avatar_url ?? undefined} />
                    <AvatarFallback
                      className="text-xs font-bold"
                      style={{ background: "var(--gradient-primary)", color: "white" }}
                    >
                      {initials(u.username)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Remove badge */}
                  <div
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full grid place-items-center"
                    style={{ background: "oklch(0.62 0.22 25)", border: "2px solid oklch(0.14 0.015 268)" }}
                  >
                    <X className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground max-w-[48px] truncate">
                  {u.display_name || u.username}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* User list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <p className="text-sm text-muted-foreground">
                {debouncedQuery.length >= 1
                  ? `No users found for "${debouncedQuery}"`
                  : "Add friends to share with them"}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {!debouncedQuery && friends.length > 0 && (
                <p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Friends
                </p>
              )}
              {displayList.map((u) => {
                const alreadySent = sent.includes(u.id);
                const sel = isSelected(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggle(u)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 transition-colors text-left"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatar_url ?? undefined} />
                        <AvatarFallback
                          className="text-xs font-bold"
                          style={{ background: "var(--gradient-primary)", color: "white" }}
                        >
                          {initials(u.username)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">
                          {u.display_name || u.username}
                        </span>
                        {u.is_verified && <VerifiedBadge size={12} tooltip={false} />}
                      </div>
                      <div className="text-xs text-muted-foreground">@{u.username}</div>
                    </div>

                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full grid place-items-center shrink-0 transition-all",
                        sel
                          ? "text-white"
                          : "border-2 border-muted-foreground/40"
                      )}
                      style={sel ? { background: "var(--gradient-primary)" } : {}}
                    >
                      {sel && <Check className="h-3.5 w-3.5" />}
                      {alreadySent && !sel && (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message + Send */}
        {selected.length > 0 && (
          <div
            className="px-4 py-3 shrink-0 border-t space-y-2"
            style={{ borderColor: "oklch(0.22 0.016 268)" }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-3"
              style={{
                background: "oklch(0.17 0.016 268)",
                border: "1px solid oklch(0.26 0.018 268)",
              }}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message… (optional)"
                maxLength={500}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 py-2.5 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendToDMs();
                  }
                }}
              />
            </div>
            <button
              onClick={sendToDMs}
              disabled={sending}
              className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: "var(--gradient-primary)", boxShadow: "0 4px 20px -4px oklch(0.65 0.22 280 / 0.5)" }}
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send{selected.length > 1 ? ` to ${selected.length} people` : ""}
                </>
              )}
            </button>
          </div>
        )}

        {/* Bottom actions: Copy link + Native share */}
        <div
          className="px-4 py-3 shrink-0 border-t flex items-center gap-3"
          style={{ borderColor: "oklch(0.22 0.016 268)", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={copyLink}
            className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98]"
            style={{
              background: "oklch(0.17 0.016 268)",
              border: "1px solid oklch(0.28 0.018 268)",
            }}
          >
            <Link2 className="h-4 w-4 text-muted-foreground" />
            Copy link
          </button>

          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={nativeShare}
              className="flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98]"
              style={{
                background: "oklch(0.17 0.016 268)",
                border: "1px solid oklch(0.28 0.018 268)",
              }}
            >
              <Share2 className="h-4 w-4 text-muted-foreground" />
              More options
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
