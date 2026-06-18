import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Users, UserPlus, Sparkles, ArrowLeft, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSuggestedUsers, useFollowActions, type SearchUser } from "@/hooks/use-follow";
import { FollowButton } from "@/components/FollowButton";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { BottomNav } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/people")({
  head: () => ({ meta: [{ title: "Discover People — chatfaa" }] }),
  component: PeoplePage,
});

function initials(name: string) { return name?.slice(0, 2).toUpperCase() ?? "?"; }

function PeoplePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const suggestedQ = useSuggestedUsers();

  const searchQ = useQuery({
    queryKey: ["user-search", debouncedQuery],
    enabled: debouncedQuery.length >= 1,
    retry: false,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("search_users", { _query: debouncedQuery });
        if (error) return [] as SearchUser[];
        return (data ?? []) as SearchUser[];
      } catch { return [] as SearchUser[]; }
    },
  });

  if (!user) return null;

  const showSearch = debouncedQuery.length >= 1;
  const searchResults = searchQ.data ?? [];
  const suggested = suggestedQ.data ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14 border-b safe-top"
        style={{
          background: "oklch(0.13 0.015 268 / 0.95)",
          borderColor: "oklch(0.20 0.016 268)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link to="/feed">
          <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <span className="font-semibold text-sm">Discover People</span>
      </header>

      <div className="max-w-xl mx-auto px-3 sm:px-4 py-5 space-y-6">
        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3"
          style={{ background: "oklch(0.17 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 py-3 text-sm"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground text-xs shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search results */}
        {showSearch && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Results
            </h2>
            {searchQ.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No users found for "{debouncedQuery}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map((u) => (
                  <UserRow
                    key={u.id}
                    id={u.id}
                    username={u.username}
                    displayName={u.display_name}
                    avatarUrl={u.avatar_url}
                    isPrivate={u.is_private}
                    isVerified={u.is_verified}
                    followStatus={u.follow_status}
                    meId={user.id}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Suggested users */}
        {!showSearch && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" style={{ color: "oklch(0.75 0.18 280)" }} />
              <h2 className="text-sm font-semibold">Suggested for you</h2>
            </div>
            {suggestedQ.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : suggested.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <UserPlus className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No suggestions yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Start following people to get suggestions</p>
              </div>
            ) : (
              <div className="space-y-1">
                {suggested.map((u) => (
                  <UserRow
                    key={u.id}
                    id={u.id}
                    username={u.username}
                    displayName={u.display_name}
                    avatarUrl={u.avatar_url}
                    isPrivate={u.is_private}
                    isVerified={u.is_verified}
                    followStatus="none"
                    meId={user.id}
                    mutualCount={u.mutual_count}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav active="/people" />
    </div>
  );
}

function UserRow({
  id, username, displayName, avatarUrl, isPrivate, isVerified, followStatus, meId, mutualCount,
}: {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  isVerified?: boolean;
  followStatus: string;
  meId: string;
  mutualCount?: number;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all hover:bg-white/4 group people-row"
      style={{ background: "oklch(0.16 0.016 268 / 0.5)" }}
    >
      <Link to="/profile" search={{ userId: id } as any} className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback
            className="text-xs font-bold"
            style={{ background: "var(--gradient-primary)", color: "white" }}
          >
            {initials(username)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <Link to="/profile" search={{ userId: id } as any} className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold leading-tight">
            {displayName || username}
          </span>
          {isVerified && <VerifiedBadge size={13} tooltip={false} />}
          {isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="text-xs text-muted-foreground">@{username}</div>
        {mutualCount != null && mutualCount > 0 && (
          <div className="text-[10px] text-muted-foreground/70 mt-0.5">
            {mutualCount} mutual follower{mutualCount !== 1 ? "s" : ""}
          </div>
        )}
      </Link>

      <FollowButton targetId={id} meId={meId} size="sm" />
    </div>
  );
}
