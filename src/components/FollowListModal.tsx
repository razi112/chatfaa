import { useState } from "react";
import { X, Lock, Check, UserMinus, Loader2 } from "lucide-react";
import {
  useFollowers, useFollowing, useFollowRequests, useFollowActions,
  type FollowUser,
} from "@/hooks/use-follow";
import { FollowButton } from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Tab = "followers" | "following" | "requests";

interface FollowListModalProps {
  userId: string;
  meId: string;
  isOwnProfile: boolean;
  initialTab?: Tab;
  onClose: () => void;
  requestCount?: number;
}

function initials(name: string) { return name?.slice(0, 2).toUpperCase() ?? "?"; }

export function FollowListModal({
  userId,
  meId,
  isOwnProfile,
  initialTab = "followers",
  onClose,
  requestCount = 0,
}: FollowListModalProps) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          maxHeight: "75dvh",
          background: "oklch(0.14 0.015 268 / 0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid oklch(0.26 0.018 268)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-5 py-3 border-b shrink-0"
          style={{ borderColor: "oklch(0.22 0.016 268)" }}
        >
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {(["followers", "following", ...(isOwnProfile ? ["requests"] : [])] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize relative whitespace-nowrap shrink-0",
                  tab === t
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={tab === t ? { background: "var(--gradient-primary)" } : {}}
              >
                {t}
                {t === "requests" && requestCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: "oklch(0.62 0.22 25)" }}
                  >
                    {requestCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="shrink-0 ml-2">
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === "followers" && (
            <FollowersList userId={userId} meId={meId} isOwnProfile={isOwnProfile} onClose={onClose} />
          )}
          {tab === "following" && (
            <FollowingList userId={userId} meId={meId} onClose={onClose} />
          )}
          {tab === "requests" && isOwnProfile && (
            <RequestsList meId={meId} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Followers list ───────────────────────────────────────────
function FollowersList({
  userId, meId, isOwnProfile, onClose,
}: {
  userId: string; meId: string; isOwnProfile: boolean; onClose: () => void;
}) {
  const { data: followers = [], isLoading } = useFollowers(userId);
  const { removeFollower } = useFollowActions(meId);

  if (isLoading) return <ListLoader />;
  if (followers.length === 0) return <ListEmpty label="No followers yet" />;

  return (
    <div className="divide-y" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
      {followers.map((u) => (
        <UserListRow
          key={u.id}
          user={u}
          meId={meId}
          onClose={onClose}
          rightSlot={
            isOwnProfile ? (
              <button
                onClick={() => removeFollower.mutate(u.id)}
                disabled={removeFollower.isPending}
                className="h-8 px-3 rounded-xl text-xs font-medium border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all"
                style={{ borderColor: "oklch(0.28 0.018 268)" }}
              >
                {removeFollower.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Remove"
                )}
              </button>
            ) : (
              <FollowButton targetId={u.id} meId={meId} size="sm" />
            )
          }
        />
      ))}
    </div>
  );
}

// ─── Following list ───────────────────────────────────────────
function FollowingList({
  userId, meId, onClose,
}: {
  userId: string; meId: string; onClose: () => void;
}) {
  const { data: following = [], isLoading } = useFollowing(userId);

  if (isLoading) return <ListLoader />;
  if (following.length === 0) return <ListEmpty label="Not following anyone yet" />;

  return (
    <div className="divide-y" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
      {following.map((u) => (
        <UserListRow
          key={u.id}
          user={u}
          meId={meId}
          onClose={onClose}
          rightSlot={<FollowButton targetId={u.id} meId={meId} size="sm" />}
        />
      ))}
    </div>
  );
}

// ─── Follow requests list ─────────────────────────────────────
function RequestsList({ meId, onClose }: { meId: string; onClose: () => void }) {
  const { data: requests = [], isLoading } = useFollowRequests();
  const { acceptRequest, declineRequest } = useFollowActions(meId);

  if (isLoading) return <ListLoader />;
  if (requests.length === 0) return <ListEmpty label="No pending requests" />;

  return (
    <div className="divide-y" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
      {requests.map((u) => (
        <UserListRow
          key={u.id}
          user={u}
          meId={meId}
          onClose={onClose}
          rightSlot={
            <div className="flex gap-1.5">
              <button
                onClick={() => acceptRequest.mutate(u.id)}
                disabled={acceptRequest.isPending}
                className="h-8 w-8 rounded-xl grid place-items-center text-white transition-all hover:opacity-90"
                style={{ background: "var(--gradient-primary)" }}
              >
                {acceptRequest.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => declineRequest.mutate(u.id)}
                disabled={declineRequest.isPending}
                className="h-8 w-8 rounded-xl grid place-items-center text-muted-foreground border hover:text-destructive hover:border-destructive/40 transition-all"
                style={{ borderColor: "oklch(0.28 0.018 268)" }}
              >
                {declineRequest.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <X className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}

// ─── Shared row ───────────────────────────────────────────────
function UserListRow({
  user, meId, onClose, rightSlot,
}: {
  user: FollowUser;
  meId: string;
  onClose: () => void;
  rightSlot: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Link to="/profile" search={{ userId: user.id } as any} onClick={onClose} className="shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar_url ?? undefined} />
          <AvatarFallback
            className="text-[10px] font-bold"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            {initials(user.username)}
          </AvatarFallback>
        </Avatar>
      </Link>
      <Link
        to="/profile"
        search={{ userId: user.id } as any}
        onClick={onClose}
        className="flex-1 min-w-0"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold leading-tight truncate">
            {user.display_name || user.username}
          </span>
          {user.is_mutual && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
              style={{
                background: "oklch(0.76 0.19 152 / 0.2)",
                color: "oklch(0.76 0.19 152)",
                border: "1px solid oklch(0.76 0.19 152 / 0.3)",
              }}
            >
              Mutual
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">@{user.username}</div>
      </Link>
      {user.id !== meId && rightSlot}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
function ListLoader() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

function ListEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center px-6">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
