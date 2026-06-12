import { useEffect, useRef, useState } from "react";
import { Bell, UserPlus, UserCheck, Heart, MessageCircle, X, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications, useFollowActions, type Notification } from "@/hooks/use-follow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string) { return name?.slice(0, 2).toUpperCase() ?? "?"; }

const NOTIF_ICONS: Record<string, React.ElementType> = {
  new_follower: UserPlus,
  follow_request: UserPlus,
  follow_accept: UserCheck,
  post_like: Heart,
  post_comment: MessageCircle,
  reel_like: Heart,
};

const NOTIF_LABELS: Record<string, string> = {
  new_follower: "started following you",
  follow_request: "requested to follow you",
  follow_accept: "accepted your follow request",
  post_like: "liked your post",
  post_comment: "commented on your post",
  reel_like: "liked your reel",
};

interface Props {
  meId: string;
}

export function NotificationBell({ meId }: Props) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications(meId);
  const { acceptRequest, declineRequest } = useFollowActions(meId);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark all read when panel opens
  useEffect(() => {
    if (open && unreadCount > 0) {
      supabase.rpc("mark_notifications_read").then(() => {
        qc.invalidateQueries({ queryKey: ["notifications", meId] });
      });
    }
  }, [open, unreadCount, meId, qc]);

  // Realtime subscription — safely handles strict-mode double-mount
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const existing = channelRef.current;
    if (existing) {
      channelRef.current = null;
      supabase.removeChannel(existing).catch(() => {});
    }

    let active = true;

    try {
      const ch = supabase.channel(`rt-notifs-${meId}`);
      channelRef.current = ch;

      ch
        .on(
          "postgres_changes" as any,
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${meId}` },
          () => { if (active) qc.invalidateQueries({ queryKey: ["notifications", meId] }); }
        )
        .subscribe((status: string) => {
          if (status === "CHANNEL_ERROR") {
            console.warn("[NotificationBell] Realtime unavailable");
          }
        });
    } catch (err) {
      console.warn("[NotificationBell] Could not subscribe:", err);
    }

    return () => {
      active = false;
      const toRemove = channelRef.current;
      channelRef.current = null;
      if (toRemove) supabase.removeChannel(toRemove).catch(() => {});
    };
  }, [meId, qc]);

  // Calculate fixed position so the panel is never clipped by parent overflow
  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const panelWidth = 320;
      const panelMaxHeight = 440;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 8;

      // Horizontal: try to left-align with button, clamp within viewport
      let left = rect.left;
      if (left + panelWidth > viewportWidth - gap) left = viewportWidth - panelWidth - gap;
      if (left < gap) left = gap;

      // Vertical: open downward if enough room, otherwise open upward
      const spaceBelow = viewportHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const openUpward = spaceBelow < Math.min(panelMaxHeight, 200) && spaceAbove > spaceBelow;

      const top = openUpward
        ? Math.max(gap, rect.top - Math.min(panelMaxHeight, spaceAbove) - gap)
        : rect.bottom + gap;

      const maxHeight = openUpward
        ? Math.min(panelMaxHeight, spaceAbove)
        : Math.min(panelMaxHeight, spaceBelow);

      setPanelPos({ top, left, maxHeight });
    }
    setOpen(true);
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      const target = e.target as Node;
      const clickedButton = buttonRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);
      if (!clickedButton && !clickedPanel) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // Close on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-xl transition-all",
          open
            ? "text-foreground bg-white/10"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-[17px] w-[17px]" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel rendered via portal-like fixed positioning — never clipped */}
      {open && panelPos && (
        <div
          ref={panelRef}
          className="fixed z-[9999] w-80 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            top: panelPos.top,
            left: panelPos.left,
            background: "oklch(0.15 0.015 268 / 0.98)",
            border: "1px solid oklch(0.26 0.018 268)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            maxHeight: panelPos.maxHeight,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "oklch(0.22 0.016 268)" }}
          >
            <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            <button
              onClick={() => setOpen(false)}
              className="h-6 w-6 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
              aria-label="Close notifications"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
            )}
            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
            {notifications.map((n) => (
              <NotifRow
                key={n.id}
                notif={n}
                onAccept={n.type === "follow_request" ? () => { acceptRequest.mutate(n.actor_id); } : undefined}
                onDecline={n.type === "follow_request" ? () => { declineRequest.mutate(n.actor_id); } : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function NotifRow({
  notif,
  onAccept,
  onDecline,
}: {
  notif: Notification;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const Icon = NOTIF_ICONS[notif.type] ?? Bell;
  const label = NOTIF_LABELS[notif.type] ?? notif.type;
  const actor = notif.actor;

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 border-b transition-colors",
        !notif.read && "bg-primary/5"
      )}
      style={{ borderColor: "oklch(0.20 0.016 268)" }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={actor?.avatar_url ?? undefined} />
          <AvatarFallback
            className="text-[10px] font-bold"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            {initials(actor?.username ?? "?")}
          </AvatarFallback>
        </Avatar>
        <div
          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full grid place-items-center"
          style={{
            background: "oklch(0.20 0.018 268)",
            border: "1px solid oklch(0.28 0.018 268)",
          }}
        >
          <Icon className="h-2.5 w-2.5 text-primary" />
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-foreground">
          <span className="font-semibold">@{actor?.username ?? "user"}</span>
          {" "}{label}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(notif.created_at)}</p>

        {/* Accept / Decline for follow requests */}
        {notif.type === "follow_request" && onAccept && onDecline && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={onAccept}
              className="flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Check className="h-3 w-3" /> Accept
            </button>
            <button
              onClick={onDecline}
              className="flex items-center gap-1 h-7 px-3 rounded-lg text-[11px] font-semibold text-muted-foreground border border-white/10 hover:bg-white/5 transition-all"
            >
              <X className="h-3 w-3" /> Decline
            </button>
          </div>
        )}
      </div>

      {/* Unread dot */}
      {!notif.read && (
        <div
          className="h-2 w-2 rounded-full mt-1.5 shrink-0"
          style={{ background: "oklch(0.65 0.22 280)" }}
        />
      )}
    </div>
  );
}
