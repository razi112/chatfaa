import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Search, Users, LogOut, Send, UserPlus, Check, X, Inbox, Loader2,
  Plus, UsersRound, Settings2, LogOut as LeaveIcon, Trash2, Pencil, Shield, ShieldOff,
  Hash, Smile, Eraser, Ban, MoreVertical, Trash, ArrowLeft, Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "chatfaa" }] }),
  component: ChatApp,
});

// ─── Types ────────────────────────────────────────────────────
type Profile = {
  id: string; username: string; display_name: string | null;
  avatar_url: string | null; status: string; bio: string | null;
};
type Friendship = {
  id: string; sender_id: string; receiver_id: string;
  status: "pending" | "accepted" | "rejected"; created_at: string;
};
type Message = {
  id: string; sender_id: string; receiver_id: string;
  content: string; created_at: string; read_at: string | null;
};
type Group = {
  id: string; name: string; description: string | null;
  avatar_url: string | null; created_by: string; created_at: string;
};
type GroupMember = {
  group_id: string; user_id: string; role: "admin" | "member"; joined_at: string;
};
type GroupMessage = {
  id: string; group_id: string; sender_id: string; content: string; created_at: string;
};
type BlockedUser = { blocker_id: string; blocked_id: string; created_at: string };

type Tab = "chats" | "friends" | "search";
type Active = { type: "dm"; id: string } | { type: "group"; id: string } | null;

// ─── Stickers ─────────────────────────────────────────────────
const STICKER_CATEGORIES = [
  { label: "Faces",      stickers: ["😀","😂","🥹","😍","🤩","😎","🥺","😭","😤","🤯","🥳","😴","🤔","🫠","😇","🤗","😈","👻","💀","🤡"] },
  { label: "Gestures",   stickers: ["👍","👎","🙌","👏","🤝","🫶","❤️","🔥","✨","💯","🎉","🎊","💪","🤞","✌️","🤙","👌","🫡","🤟","🤘"] },
  { label: "Animals",    stickers: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦄","🐉"] },
  { label: "Food",       stickers: ["🍕","🍔","🌮","🍜","🍣","🍩","🍪","🎂","🍦","🧋","🍷","🥂","☕","🧃","🍿","🧁","🍫","🍓","🥑","🍉"] },
  { label: "Activities", stickers: ["⚽","🏀","🎮","🎵","🎸","🎤","🎨","📚","💻","🚀","🌍","⛺","🏖️","🎭","🎬","🎯","🏆","🥇","🎲","🎰"] },
];

function initials(name: string) { return name.slice(0, 2).toUpperCase(); }

// ─── Shared atoms ─────────────────────────────────────────────
function UserAvatar({ src, name, size = "md", className }: {
  src?: string | null; name: string; size?: "sm" | "md" | "lg"; className?: string;
}) {
  const s = size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <Avatar className={cn(s, className)}>
      <AvatarImage src={src ?? undefined} />
      <AvatarFallback className="font-semibold" style={{
        background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.3), oklch(0.70 0.18 310 / 0.3))",
        color: "oklch(0.80 0.15 280)", border: "1px solid oklch(0.65 0.22 280 / 0.2)",
      }}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function OnlineDot({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span className={cn("absolute rounded-full border-2 online-pulse",
      size === "sm" ? "-bottom-0.5 -right-0.5 h-2.5 w-2.5" : "-bottom-0.5 -right-0.5 h-3 w-3"
    )} style={{ background: "var(--color-online)", borderColor: "var(--color-background)" }} />
  );
}

// ─── Main App ─────────────────────────────────────────────────
function ChatApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isMobile = useIsMobile();

  const [tab, setTab] = useState<Tab>("chats");
  const [active, setActive] = useState<Active>(null);
  const [presence, setPresence] = useState<Set<string>>(new Set());
  // Mobile: controls whether the sidebar sheet is open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── queries ──────────────────────────────────────────────────
  const profileQ = useQuery({
    queryKey: ["me", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error; return data as Profile | null;
    },
  });
  const friendshipsQ = useQuery({
    queryKey: ["friendships", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("friendships").select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error; return data as Friendship[];
    },
  });
  const groupsQ = useQuery({
    queryKey: ["groups", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*").order("created_at", { ascending: false });
      if (error) throw error; return data as Group[];
    },
  });
  const blockedQ = useQuery({
    queryKey: ["blocked", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("blocked_users").select("*").eq("blocker_id", user!.id);
      if (error) throw error; return data as BlockedUser[];
    },
  });
  const groupIds = useMemo(() => (groupsQ.data ?? []).map((g) => g.id), [groupsQ.data]);
  const allMembersQ = useQuery({
    queryKey: ["group-members", groupIds], enabled: groupIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("group_members").select("*").in("group_id", groupIds);
      if (error) throw error; return data as GroupMember[];
    },
  });
  const involvedIds = useMemo(() => {
    const ids = new Set<string>();
    (friendshipsQ.data ?? []).forEach((f) => { ids.add(f.sender_id); ids.add(f.receiver_id); });
    (allMembersQ.data ?? []).forEach((m) => { ids.add(m.user_id); });
    if (user) ids.delete(user.id);
    return Array.from(ids);
  }, [friendshipsQ.data, allMembersQ.data, user]);
  const profilesQ = useQuery({
    queryKey: ["profiles", involvedIds], enabled: involvedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", involvedIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      (data as Profile[]).forEach((p) => { map[p.id] = p; });
      return map;
    },
  });

  const blockedIds = useMemo(() => new Set((blockedQ.data ?? []).map((b) => b.blocked_id)), [blockedQ.data]);
  const acceptedFriends = useMemo(() => {
    const list = friendshipsQ.data ?? []; const map = profilesQ.data ?? {};
    return list.filter((f) => f.status === "accepted")
      .map((f) => { const otherId = f.sender_id === user?.id ? f.receiver_id : f.sender_id; return map[otherId]; })
      .filter(Boolean) as Profile[];
  }, [friendshipsQ.data, profilesQ.data, user]);
  const pendingIncoming = useMemo(() => {
    const list = friendshipsQ.data ?? []; const map = profilesQ.data ?? {};
    return list.filter((f) => f.status === "pending" && f.receiver_id === user?.id)
      .map((f) => ({ friendship: f, profile: map[f.sender_id] })).filter((x) => x.profile);
  }, [friendshipsQ.data, profilesQ.data, user]);
  const pendingOutgoing = useMemo(() => {
    const list = friendshipsQ.data ?? []; const map = profilesQ.data ?? {};
    return list.filter((f) => f.status === "pending" && f.sender_id === user?.id)
      .map((f) => ({ friendship: f, profile: map[f.receiver_id] })).filter((x) => x.profile);
  }, [friendshipsQ.data, profilesQ.data, user]);

  // ── realtime ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const msgCh = supabase.channel("rt-messages-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` }, () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .subscribe();
    const friendCh = supabase.channel("rt-friendships-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => qc.invalidateQueries({ queryKey: ["friendships"] }))
      .subscribe();
    const groupCh = supabase.channel("rt-groups-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, () => qc.invalidateQueries({ queryKey: ["groups"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, () => { qc.invalidateQueries({ queryKey: ["group-members"] }); qc.invalidateQueries({ queryKey: ["groups"] }); })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_messages" }, () => qc.invalidateQueries({ queryKey: ["group-messages"] }))
      .subscribe();
    const blockedCh = supabase.channel("rt-blocked-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_users", filter: `blocker_id=eq.${user.id}` }, () => qc.invalidateQueries({ queryKey: ["blocked"] }))
      .subscribe();
    const presenceCh = supabase.channel("online-users", { config: { presence: { key: user.id } } });
    presenceCh.on("presence", { event: "sync" }, () => setPresence(new Set(Object.keys(presenceCh.presenceState()))))
      .subscribe(async (s) => { if (s === "SUBSCRIBED") await presenceCh.track({ online_at: new Date().toISOString() }); });
    return () => {
      supabase.removeChannel(msgCh); supabase.removeChannel(friendCh);
      supabase.removeChannel(groupCh); supabase.removeChannel(blockedCh);
      supabase.removeChannel(presenceCh);
    };
  }, [user, qc]);

  async function handleSignOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (!user) return null;
  const me = profileQ.data;
  const profiles = profilesQ.data ?? {};
  const groups = groupsQ.data ?? [];
  const allMembers = allMembersQ.data ?? [];
  const activeFriend = active?.type === "dm" ? (profiles[active.id] ?? null) : null;
  const activeGroup = active?.type === "group" ? (groups.find((g) => g.id === active.id) ?? null) : null;

  // On mobile: selecting a chat closes the sidebar
  function handleSelect(a: Active) {
    setActive(a);
    if (isMobile) setSidebarOpen(false);
  }

  // ── Sidebar content (shared between desktop and mobile sheet) ─
  const sidebarContent = (
    <div className="flex flex-col h-full" style={{ background: "oklch(0.13 0.015 268)" }}>
      <header className="px-4 h-14 flex items-center justify-between border-b shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
        <h2 className="font-semibold text-sm tracking-wide text-muted-foreground uppercase">
          {tab === "chats" ? "Conversations" : tab === "friends" ? "Friends" : "Find people"}
        </h2>
        {tab === "chats" && (
          <CreateGroupDialog friends={acceptedFriends} meId={user.id} onCreated={(id) => handleSelect({ type: "group", id })} />
        )}
      </header>

      {/* Tab bar */}
      <div className="flex border-b shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
        {(["chats", "friends", "search"] as Tab[]).map((t) => {
          const icons = { chats: MessageCircle, friends: Users, search: Search };
          const Icon = icons[t];
          return (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors relative",
                tab === t ? "text-white" : "text-muted-foreground hover:text-foreground"
              )}>
              <Icon className="h-4 w-4" />
              {t}
              {t === "friends" && pendingIncoming.length > 0 && (
                <span className="absolute top-1.5 right-1/4 h-4 w-4 text-[9px] font-bold grid place-items-center rounded-full text-white"
                  style={{ background: "oklch(0.62 0.22 25)" }}>
                  {pendingIncoming.length}
                </span>
              )}
              {tab === t && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />
              )}
            </button>
          );
        })}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {tab === "chats" && <ChatsList friends={acceptedFriends} groups={groups} active={active} onSelect={handleSelect} presence={presence} blockedIds={blockedIds} />}
        {tab === "friends" && <FriendsList accepted={acceptedFriends} incoming={pendingIncoming} outgoing={pendingOutgoing} presence={presence} onMessage={(id) => { handleSelect({ type: "dm", id }); setTab("chats"); }} />}
        {tab === "search" && <SearchUsers meId={user.id} />}
      </ScrollArea>

      {me && (
        <div className="border-t px-4 py-3 flex items-center gap-3 shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
          <div className="relative shrink-0">
            <UserAvatar src={me.avatar_url} name={me.username} size="sm" />
            {presence.has(user.id) && <OnlineDot size="sm" />}
          </div>
          <span className="text-xs text-muted-foreground flex-1 truncate min-w-0">
            <span className="font-semibold" style={{ color: "oklch(0.80 0.15 280)" }}>@{me.username}</span>
          </span>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] w-full flex bg-background text-foreground overflow-hidden">

      {/* ── Desktop: rail + sidebar ── */}
      {!isMobile && (
        <>
          {/* Narrow icon rail */}
          <aside className="w-[60px] shrink-0 flex flex-col items-center py-4 gap-2 border-r"
            style={{ background: "var(--color-sidebar)", borderColor: "oklch(0.18 0.016 268)" }}>
            <div className="grid h-9 w-9 place-items-center rounded-2xl mb-2 shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]"
              style={{ background: "var(--gradient-primary)" }}>
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <RailButton icon={MessageCircle} active={tab === "chats"} onClick={() => setTab("chats")} label="Chats" />
              <RailButton icon={Users} active={tab === "friends"} onClick={() => setTab("friends")} label="Friends" badge={pendingIncoming.length || undefined} />
              <RailButton icon={Search} active={tab === "search"} onClick={() => setTab("search")} label="Find people" />
            </div>
            <div className="flex flex-col items-center gap-2 pt-2 border-t w-full" style={{ borderColor: "oklch(0.18 0.016 268)" }}>
              <div className="relative">
                <UserAvatar src={me?.avatar_url} name={me?.username ?? "?"} size="sm" />
                {presence.has(user.id) && <OnlineDot size="sm" />}
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </aside>

          {/* Wide sidebar panel */}
          <section className="w-[260px] xl:w-[300px] shrink-0 flex flex-col border-r overflow-hidden"
            style={{ background: "oklch(0.13 0.015 268)", borderColor: "oklch(0.20 0.016 268)" }}>
            <header className="px-4 h-14 flex items-center justify-between border-b shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
              <h2 className="font-semibold text-sm tracking-wide text-muted-foreground uppercase">
                {tab === "chats" ? "Conversations" : tab === "friends" ? "Friends" : "Find people"}
              </h2>
              {tab === "chats" && <CreateGroupDialog friends={acceptedFriends} meId={user.id} onCreated={(id) => setActive({ type: "group", id })} />}
            </header>
            <ScrollArea className="flex-1 min-h-0">
              {tab === "chats" && <ChatsList friends={acceptedFriends} groups={groups} active={active} onSelect={setActive} presence={presence} blockedIds={blockedIds} />}
              {tab === "friends" && <FriendsList accepted={acceptedFriends} incoming={pendingIncoming} outgoing={pendingOutgoing} presence={presence} onMessage={(id) => { setActive({ type: "dm", id }); setTab("chats"); }} />}
              {tab === "search" && <SearchUsers meId={user.id} />}
            </ScrollArea>
            {me && (
              <div className="border-t px-4 py-3 text-xs text-muted-foreground shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
                Signed in as <span className="font-semibold" style={{ color: "oklch(0.80 0.15 280)" }}>@{me.username}</span>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── Mobile: slide-over sheet ── */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[85vw] max-w-[340px] border-r" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col" style={{ background: "oklch(0.12 0.014 268)" }}>
        {activeFriend ? (
          <ChatWindow
            friend={activeFriend} meId={user.id} online={presence.has(activeFriend.id)}
            isBlocked={blockedIds.has(activeFriend.id)} onChatClosed={() => setActive(null)}
            onBack={isMobile ? () => setSidebarOpen(true) : undefined}
          />
        ) : activeGroup ? (
          <GroupChatWindow
            group={activeGroup} meId={user.id}
            members={allMembers.filter((m) => m.group_id === activeGroup.id)}
            profiles={profiles} friends={acceptedFriends} presence={presence}
            onLeft={() => setActive(null)}
            onBack={isMobile ? () => setSidebarOpen(true) : undefined}
          />
        ) : (
          <EmptyState onAdd={() => { setTab("search"); if (isMobile) setSidebarOpen(true); }} isMobile={isMobile} onOpenSidebar={() => setSidebarOpen(true)} />
        )}
      </main>

      {/* ── Mobile bottom nav (when no chat open) ── */}
      {isMobile && !active && (
        <nav className="fixed bottom-0 left-0 right-0 flex border-t z-40"
          style={{ background: "var(--color-sidebar)", borderColor: "oklch(0.22 0.016 268)" }}>
          {(["chats", "friends", "search"] as Tab[]).map((t) => {
            const icons = { chats: MessageCircle, friends: Users, search: Search };
            const labels = { chats: "Chats", friends: "Friends", search: "Find" };
            const Icon = icons[t];
            return (
              <button key={t} onClick={() => { setTab(t); setSidebarOpen(true); }}
                className={cn("flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition-colors relative",
                  tab === t ? "text-white" : "text-muted-foreground"
                )}>
                <Icon className="h-5 w-5" />
                {labels[t]}
                {t === "friends" && pendingIncoming.length > 0 && (
                  <span className="absolute top-2 left-1/2 ml-2 h-4 w-4 text-[9px] font-bold grid place-items-center rounded-full text-white"
                    style={{ background: "oklch(0.62 0.22 25)" }}>
                    {pendingIncoming.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ─── Rail button (desktop only) ───────────────────────────────
function RailButton({ icon: Icon, active, onClick, label, badge }: {
  icon: typeof MessageCircle; active: boolean; onClick: () => void; label: string; badge?: number;
}) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      className={cn("relative grid h-9 w-9 place-items-center rounded-xl transition-all duration-200",
        active ? "text-white shadow-[0_4px_16px_-4px_oklch(0.65_0.22_280/0.5)]" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
      )} style={active ? { background: "var(--gradient-primary)" } : {}}>
      <Icon className="h-[17px] w-[17px]" />
      {badge ? (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 grid place-items-center rounded-full text-[9px] font-bold text-white"
          style={{ background: "oklch(0.62 0.22 25)" }}>{badge}</span>
      ) : null}
    </button>
  );
}

// ─── Section label ────────────────────────────────────────────
function SectionLabel({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      <Icon className="h-3 w-3" />{label}
    </div>
  );
}

// ─── Chats list ───────────────────────────────────────────────
function ChatsList({ friends, groups, active, onSelect, presence, blockedIds }: {
  friends: Profile[]; groups: Group[]; active: Active;
  onSelect: (a: Active) => void; presence: Set<string>; blockedIds: Set<string>;
}) {
  const visibleFriends = friends.filter((f) => !blockedIds.has(f.id));
  if (visibleFriends.length === 0 && groups.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4"
          style={{ background: "oklch(0.65 0.22 280 / 0.1)", border: "1px solid oklch(0.65 0.22 280 / 0.2)" }}>
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No conversations yet.</p>
      </div>
    );
  }
  return (
    <div className="p-3 space-y-5">
      {groups.length > 0 && (
        <div>
          <SectionLabel icon={UsersRound} label="Groups" />
          <ul className="space-y-0.5 mt-1">
            {groups.map((g) => {
              const isActive = active?.type === "group" && active.id === g.id;
              return (
                <li key={g.id}>
                  <button onClick={() => onSelect({ type: "group", id: g.id })}
                    className={cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive ? "text-white" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                    )} style={isActive ? { background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.2), oklch(0.70 0.18 310 / 0.15))", border: "1px solid oklch(0.65 0.22 280 / 0.25)" } : { border: "1px solid transparent" }}>
                    <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                      style={{ background: "oklch(0.65 0.22 280 / 0.15)", border: "1px solid oklch(0.65 0.22 280 / 0.2)" }}>
                      <UsersRound className="h-4 w-4" style={{ color: "oklch(0.75 0.18 280)" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-sm">{g.name}</div>
                      <div className="truncate text-xs text-muted-foreground">Group chat</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {visibleFriends.length > 0 && (
        <div>
          <SectionLabel icon={Hash} label="Direct messages" />
          <ul className="space-y-0.5 mt-1">
            {visibleFriends.map((f) => {
              const isActive = active?.type === "dm" && active.id === f.id;
              const online = presence.has(f.id);
              return (
                <li key={f.id}>
                  <button onClick={() => onSelect({ type: "dm", id: f.id })}
                    className={cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive ? "text-white" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                    )} style={isActive ? { background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.2), oklch(0.70 0.18 310 / 0.15))", border: "1px solid oklch(0.65 0.22 280 / 0.25)" } : { border: "1px solid transparent" }}>
                    <div className="relative shrink-0">
                      <UserAvatar src={f.avatar_url} name={f.username} />
                      {online && <OnlineDot />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-sm">{f.display_name || f.username}</div>
                      <div className="truncate text-xs text-muted-foreground">@{f.username}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Create group dialog ──────────────────────────────────────
function CreateGroupDialog({ friends, meId, onCreated }: { friends: Profile[]; meId: string; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  function toggle(id: string) { setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Group name is required"); return; }
    setBusy(true);
    const { data: g, error } = await supabase.rpc("create_group", { _name: trimmed, _description: desc.trim() || undefined });
    if (error || !g) { setBusy(false); toast.error(error?.message ?? "Could not create group"); return; }
    if (picked.size > 0) {
      const rows = Array.from(picked).map((uid) => ({ group_id: g.id, user_id: uid, role: "member" as const }));
      const { error: mErr } = await supabase.from("group_members").insert(rows);
      if (mErr) toast.error("Group created, but adding members failed: " + mErr.message);
    }
    setBusy(false); setOpen(false); setName(""); setDesc(""); setPicked(new Set());
    toast.success("Group created");
    qc.invalidateQueries({ queryKey: ["groups"] }); qc.invalidateQueries({ queryKey: ["group-members"] });
    onCreated(g.id);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground" aria-label="New group">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader><DialogTitle>New group</DialogTitle><DialogDescription>Create a group and add friends.</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend plans" className="rounded-xl" /></div>
          <div className="space-y-1.5"><Label>Description (optional)</Label><Input maxLength={200} value={desc} onChange={(e) => setDesc(e.target.value)} className="rounded-xl" /></div>
          <div className="space-y-1.5">
            <Label>Add friends ({picked.size})</Label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {friends.length === 0 && <p className="text-xs text-muted-foreground p-3">No friends yet.</p>}
              {friends.map((f) => (
                <label key={f.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 cursor-pointer">
                  <Checkbox checked={picked.has(f.id)} onCheckedChange={() => toggle(f.id)} />
                  <UserAvatar src={f.avatar_url} name={f.username} size="sm" />
                  <div className="min-w-0 text-sm"><div className="truncate font-medium">{f.display_name || f.username}</div><div className="truncate text-xs text-muted-foreground">@{f.username}</div></div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name.trim()} style={{ background: "var(--gradient-primary)" }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Friends list ─────────────────────────────────────────────
function FriendsList({ accepted, incoming, outgoing, presence, onMessage }: {
  accepted: Profile[]; incoming: { friendship: Friendship; profile: Profile }[];
  outgoing: { friendship: Friendship; profile: Profile }[]; presence: Set<string>; onMessage: (id: string) => void;
}) {
  const qc = useQueryClient();
  async function respond(id: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(status === "accepted" ? "Friend added" : "Declined"); qc.invalidateQueries({ queryKey: ["friendships"] }); }
  }
  async function cancel(id: string) {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["friendships"] });
  }
  return (
    <div className="p-3 space-y-5">
      {incoming.length > 0 && (
        <div>
          <SectionLabel icon={Inbox} label={`Incoming (${incoming.length})`} />
          <div className="space-y-0.5 mt-1">
            {incoming.map(({ friendship, profile }) => (
              <FriendRow key={friendship.id} profile={profile} online={presence.has(profile.id)}>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-green-500/10" style={{ color: "var(--color-online)" }} onClick={() => respond(friendship.id, "accepted")}><Check className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => respond(friendship.id, "rejected")}><X className="h-4 w-4" /></Button>
              </FriendRow>
            ))}
          </div>
        </div>
      )}
      <div>
        <SectionLabel icon={Users} label={`Friends (${accepted.length})`} />
        <div className="space-y-0.5 mt-1">
          {accepted.length === 0 ? <p className="text-xs text-muted-foreground px-3 py-2">No friends yet.</p>
            : accepted.map((p) => (
              <FriendRow key={p.id} profile={p} online={presence.has(p.id)}>
                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs" onClick={() => onMessage(p.id)}>Message</Button>
              </FriendRow>
            ))}
        </div>
      </div>
      {outgoing.length > 0 && (
        <div>
          <SectionLabel icon={UserPlus} label={`Sent (${outgoing.length})`} />
          <div className="space-y-0.5 mt-1">
            {outgoing.map(({ friendship, profile }) => (
              <FriendRow key={friendship.id} profile={profile} online={presence.has(profile.id)}>
                <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => cancel(friendship.id)}>Cancel</Button>
              </FriendRow>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FriendRow({ profile, online, children }: { profile: Profile; online: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
      <div className="relative shrink-0"><UserAvatar src={profile.avatar_url} name={profile.username} />{online && <OnlineDot />}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{profile.display_name || profile.username}</div>
        <div className="truncate text-xs text-muted-foreground">@{profile.username}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">{children}</div>
    </div>
  );
}

// ─── Search users ─────────────────────────────────────────────
function SearchUsers({ meId }: { meId: string }) {
  const [q, setQ] = useState(""); const [results, setResults] = useState<Profile[]>([]); const [loading, setLoading] = useState(false);
  const qc = useQueryClient();
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    let cancelled = false; setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.from("profiles").select("*").or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).neq("id", meId).limit(20);
      if (cancelled) return;
      if (error) toast.error(error.message);
      setResults((data as Profile[]) ?? []); setLoading(false);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, meId]);
  async function addFriend(receiverId: string) {
    const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: receiverId });
    if (error) { if (error.code === "23505") toast.error("Request already exists."); else toast.error(error.message); }
    else { toast.success("Request sent"); qc.invalidateQueries({ queryKey: ["friendships"] }); }
  }
  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search @username…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 rounded-xl" />
      </div>
      {loading && <div className="flex items-center gap-2 text-xs text-muted-foreground px-1"><Loader2 className="h-3 w-3 animate-spin" /> Searching…</div>}
      {!loading && q.length >= 2 && results.length === 0 && <div className="text-xs text-muted-foreground px-1">No matches.</div>}
      <div className="space-y-0.5">
        {results.map((p) => (
          <FriendRow key={p.id} profile={p} online={false}>
            <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs gap-1.5" onClick={() => addFriend(p.id)}>
              <UserPlus className="h-3.5 w-3.5" /> Add
            </Button>
          </FriendRow>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyState({ onAdd, isMobile, onOpenSidebar }: { onAdd: () => void; isMobile: boolean; onOpenSidebar: () => void }) {
  return (
    <div className="flex-1 grid place-items-center text-center p-8">
      <div className="max-w-xs">
        {isMobile && (
          <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" onClick={onOpenSidebar}>
            <Menu className="h-4 w-4" /> Open conversations
          </Button>
        )}
        <div className="mx-auto h-14 w-14 rounded-3xl grid place-items-center mb-5 shadow-[0_8px_32px_-8px_oklch(0.65_0.22_280/0.4)]" style={{ background: "var(--gradient-primary)" }}>
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">No conversation open</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Select a chat or find someone new by @username.</p>
        <Button onClick={onAdd} className="gap-2 shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-primary)" }}>
          <Search className="h-4 w-4" /> Find people
        </Button>
      </div>
    </div>
  );
}

// ─── Sticker picker ───────────────────────────────────────────
function StickerPicker({ onPick, onClose }: { onPick: (s: string) => void; onClose: () => void }) {
  const [cat, setCat] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 z-50 rounded-2xl overflow-hidden shadow-[0_8px_40px_-8px_oklch(0_0_0/0.7)] w-[min(320px,90vw)]"
      style={{ background: "oklch(0.16 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}>
      <div className="flex border-b overflow-x-auto" style={{ borderColor: "oklch(0.24 0.016 268)" }}>
        {STICKER_CATEGORIES.map((c, i) => (
          <button key={c.label} onClick={() => setCat(i)}
            className={cn("px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0",
              cat === i ? "text-white border-b-2" : "text-muted-foreground hover:text-foreground"
            )} style={cat === i ? { borderColor: "oklch(0.65 0.22 280)" } : {}}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-0.5 p-3 max-h-[180px] overflow-y-auto">
        {STICKER_CATEGORIES[cat].stickers.map((s) => (
          <button key={s} onClick={() => { onPick(s); onClose(); }}
            className="text-2xl h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 transition-colors">
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────
function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel, confirmVariant = "destructive", onConfirm, loading }: {
  open: boolean; onOpenChange: (v: boolean) => void; title: string; description: string;
  confirmLabel: string; confirmVariant?: "destructive" | "default"; onConfirm: () => void; loading?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-sm">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}
            className={confirmVariant === "destructive" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}
            style={confirmVariant !== "destructive" ? { background: "var(--gradient-primary)" } : {}}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Chat header (shared) ─────────────────────────────────────
function ChatHeader({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <header className="h-14 px-3 sm:px-5 flex items-center gap-2 sm:gap-3 shrink-0 border-b"
      style={{ borderColor: "oklch(0.20 0.016 268)", background: "oklch(0.13 0.015 268)" }}>
      {onBack && (
        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      {children}
    </header>
  );
}

// ─── Message list (shared) ────────────────────────────────────
function MessageList({ scrollRef, loading, children }: {
  scrollRef: React.RefObject<HTMLDivElement | null>; loading: boolean; children: React.ReactNode;
}) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 min-h-0">
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : children}
    </div>
  );
}

// ─── Chat input bar ───────────────────────────────────────────
function ChatInputBar({ value, onChange, onSend, placeholder, sending, onStickerPick, showStickers, onToggleStickers }: {
  value: string; onChange: (v: string) => void; onSend: () => void; placeholder: string; sending: boolean;
  onStickerPick: (s: string) => void; showStickers: boolean; onToggleStickers: () => void;
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSend(); }}
      className="px-3 sm:px-4 py-3 flex items-center gap-2 shrink-0 border-t relative"
      style={{ borderColor: "oklch(0.20 0.016 268)", background: "oklch(0.13 0.015 268)" }}>
      {showStickers && <StickerPicker onPick={onStickerPick} onClose={onToggleStickers} />}
      <Button type="button" size="icon" variant="ghost" onClick={onToggleStickers}
        className={cn("h-10 w-10 rounded-xl shrink-0 transition-all", showStickers ? "text-white" : "text-muted-foreground hover:text-foreground")}
        style={showStickers ? { background: "var(--gradient-primary)" } : {}} aria-label="Stickers">
        <Smile className="h-5 w-5" />
      </Button>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        maxLength={4000} className="h-10 rounded-xl flex-1 text-sm" autoFocus />
      <Button type="submit" size="icon"
        className="h-10 w-10 rounded-xl shrink-0 shadow-[var(--shadow-glow)] transition-all hover:scale-105 active:scale-95"
        style={{ background: "var(--gradient-primary)" }} disabled={sending || !value.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

// ─── Message bubble ───────────────────────────────────────────
function MessageBubble({ content, mine, grouped, senderName, onDelete }: {
  content: string; mine: boolean; grouped: boolean; senderName?: string; onDelete?: () => void;
}) {
  const isSticker = content.length <= 4 && /^\p{Emoji}/u.test(content);
  return (
    <li className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      {senderName && <span className="text-[11px] text-muted-foreground ml-3 mb-0.5 font-medium">{senderName}</span>}
      <div className={cn("group flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]", mine ? "flex-row-reverse" : "flex-row")}>
        {onDelete && (
          <button onClick={onDelete}
            className="shrink-0 h-6 w-6 rounded-lg grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/15 text-muted-foreground hover:text-destructive"
            title="Delete" aria-label="Delete message">
            <Trash className="h-3.5 w-3.5" />
          </button>
        )}
        {isSticker ? (
          <span className="text-4xl leading-none select-none">{content}</span>
        ) : (
          <div className={cn("min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm whitespace-pre-wrap break-words leading-relaxed", mine ? "text-white" : "text-foreground")}
            style={{
              background: mine ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)",
              borderRadius: mine ? (grouped ? "18px 6px 18px 18px" : "18px 6px 6px 18px") : (grouped ? "6px 18px 18px 18px" : "6px 18px 18px 18px"),
              border: mine ? "none" : "1px solid oklch(0.25 0.016 268)",
              boxShadow: mine ? "0 4px 16px -4px oklch(0.65 0.22 280 / 0.4)" : "0 2px 8px -2px oklch(0 0 0 / 0.3)",
            }}>
            {content}
          </div>
        )}
      </div>
    </li>
  );
}

// ─── DM chat window ───────────────────────────────────────────
function ChatWindow({ friend, meId, online, isBlocked, onChatClosed, onBack }: {
  friend: Profile; meId: string; online: boolean; isBlocked: boolean; onChatClosed: () => void; onBack?: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState(""); const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmUnblock, setConfirmUnblock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const msgsQ = useQuery({
    queryKey: ["messages", meId, friend.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`)
        .order("created_at", { ascending: true }).limit(200);
      if (error) throw error; return data as Message[];
    },
  });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgsQ.data]);
  useEffect(() => {
    const unread = (msgsQ.data ?? []).filter((m) => m.receiver_id === meId && !m.read_at);
    if (unread.length === 0) return;
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread.map((m) => m.id)).then(() => {});
  }, [msgsQ.data, meId]);

  async function send(content?: string) {
    const msg = (content ?? text).trim();
    if (!msg || sending || isBlocked) return;
    setSending(true); if (!content) setText("");
    const { error } = await supabase.from("messages").insert({ sender_id: meId, receiver_id: friend.id, content: msg });
    setSending(false);
    if (error) { toast.error(error.message); if (!content) setText(msg); }
    else qc.invalidateQueries({ queryKey: ["messages", meId, friend.id] });
  }
  async function deleteMessage(id: string) {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["messages", meId, friend.id] });
  }
  async function doClearChat() {
    setActionLoading(true);
    const { error } = await supabase.rpc("clear_dm_chat", { _other_user: friend.id });
    setActionLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Chat cleared"); setConfirmClear(false); qc.invalidateQueries({ queryKey: ["messages", meId, friend.id] }); }
  }
  async function doBlock() {
    setActionLoading(true);
    const { error } = await supabase.rpc("block_user", { _target: friend.id });
    setActionLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(`@${friend.username} blocked`); setConfirmBlock(false); qc.invalidateQueries({ queryKey: ["blocked"] }); qc.invalidateQueries({ queryKey: ["friendships"] }); onChatClosed(); }
  }
  async function doUnblock() {
    setActionLoading(true);
    const { error } = await supabase.rpc("unblock_user", { _target: friend.id });
    setActionLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(`@${friend.username} unblocked`); setConfirmUnblock(false); qc.invalidateQueries({ queryKey: ["blocked"] }); }
  }
  async function doDeleteChat() {
    setActionLoading(true);
    const { error: clrErr } = await supabase.rpc("clear_dm_chat", { _other_user: friend.id });
    const { error: fErr } = await supabase.from("friendships").delete()
      .or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`);
    setActionLoading(false);
    if (clrErr || fErr) toast.error(clrErr?.message ?? fErr?.message ?? "Error");
    else { toast.success("Chat deleted"); setConfirmDelete(false); qc.invalidateQueries({ queryKey: ["friendships"] }); qc.invalidateQueries({ queryKey: ["messages"] }); onChatClosed(); }
  }

  return (
    <>
      <ChatHeader onBack={onBack}>
        <div className="relative shrink-0">
          <UserAvatar src={friend.avatar_url} name={friend.username} />
          {online && <OnlineDot />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">{friend.display_name || friend.username}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <span className="truncate">@{friend.username}</span>
            <span className="hidden sm:inline text-muted-foreground/40">·</span>
            <span className="hidden sm:flex items-center gap-1" style={{ color: online ? "var(--color-online)" : undefined }}>
              {online && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-online)" }} />}
              {online ? "online" : "offline"}
            </span>
            {isBlocked && <span className="text-destructive text-[10px] font-semibold uppercase">blocked</span>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => setConfirmClear(true)} className="gap-2 cursor-pointer"><Eraser className="h-4 w-4" /> Clear chat</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="gap-2 cursor-pointer text-destructive focus:text-destructive"><Trash className="h-4 w-4" /> Delete chat</DropdownMenuItem>
            <DropdownMenuSeparator />
            {isBlocked
              ? <DropdownMenuItem onClick={() => setConfirmUnblock(true)} className="gap-2 cursor-pointer"><Ban className="h-4 w-4" /> Unblock</DropdownMenuItem>
              : <DropdownMenuItem onClick={() => setConfirmBlock(true)} className="gap-2 cursor-pointer text-destructive focus:text-destructive"><Ban className="h-4 w-4" /> Block</DropdownMenuItem>
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </ChatHeader>

      <MessageList scrollRef={scrollRef} loading={msgsQ.isLoading}>
        {(msgsQ.data ?? []).length === 0 && !msgsQ.isLoading ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4" style={{ background: "oklch(0.65 0.22 280 / 0.1)", border: "1px solid oklch(0.65 0.22 280 / 0.2)" }}>
                <MessageCircle className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
              </div>
              <p className="text-sm text-muted-foreground">Start of your chat with @{friend.username}.</p>
              <p className="text-sm text-muted-foreground mt-1">Say hi 👋</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {(msgsQ.data ?? []).map((m, i, arr) => {
              const mine = m.sender_id === meId;
              const prev = arr[i - 1];
              const grouped = !!(prev && prev.sender_id === m.sender_id && (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000));
              return <MessageBubble key={m.id} content={m.content} mine={mine} grouped={grouped} onDelete={mine ? () => deleteMessage(m.id) : undefined} />;
            })}
          </ul>
        )}
      </MessageList>

      {isBlocked ? (
        <div className="px-4 py-4 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground"
          style={{ borderColor: "oklch(0.20 0.016 268)", background: "oklch(0.13 0.015 268)" }}>
          <Ban className="h-4 w-4" /> You've blocked this user.
          <button onClick={() => setConfirmUnblock(true)} className="text-primary hover:underline ml-1">Unblock</button>
        </div>
      ) : (
        <ChatInputBar value={text} onChange={setText} onSend={() => send()} placeholder={`Message @${friend.username}`} sending={sending}
          onStickerPick={(s) => send(s)} showStickers={showStickers} onToggleStickers={() => setShowStickers((v) => !v)} />
      )}

      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} title="Clear chat" description={`Permanently delete all messages with @${friend.username}?`} confirmLabel="Clear chat" onConfirm={doClearChat} loading={actionLoading} />
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Delete chat" description={`Delete all messages and remove @${friend.username} from friends?`} confirmLabel="Delete chat" onConfirm={doDeleteChat} loading={actionLoading} />
      <ConfirmDialog open={confirmBlock} onOpenChange={setConfirmBlock} title={`Block @${friend.username}?`} description="They'll be removed from your friends." confirmLabel="Block" onConfirm={doBlock} loading={actionLoading} />
      <ConfirmDialog open={confirmUnblock} onOpenChange={setConfirmUnblock} title={`Unblock @${friend.username}?`} description="You'll need to re-add them as a friend to chat." confirmLabel="Unblock" confirmVariant="default" onConfirm={doUnblock} loading={actionLoading} />
    </>
  );
}

// ─── Group chat window ────────────────────────────────────────
function GroupChatWindow({ group, meId, members, profiles, friends, presence, onLeft, onBack }: {
  group: Group; meId: string; members: GroupMember[]; profiles: Record<string, Profile>;
  friends: Profile[]; presence: Set<string>; onLeft: () => void; onBack?: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState(""); const [sending, setSending] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const meMember = members.find((m) => m.user_id === meId);
  const isAdmin = meMember?.role === "admin";
  const onlineCount = members.filter((m) => presence.has(m.user_id)).length;

  const msgsQ = useQuery({
    queryKey: ["group-messages", group.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("group_messages").select("*").eq("group_id", group.id).order("created_at", { ascending: true }).limit(200);
      if (error) throw error; return data as GroupMessage[];
    },
  });

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgsQ.data]);

  async function send(content?: string) {
    const msg = (content ?? text).trim(); if (!msg || sending) return;
    setSending(true); if (!content) setText("");
    const { error } = await supabase.from("group_messages").insert({ group_id: group.id, sender_id: meId, content: msg });
    setSending(false);
    if (error) { toast.error(error.message); if (!content) setText(msg); }
    else qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
  }
  async function deleteMessage(id: string) {
    const { error } = await supabase.from("group_messages").delete().eq("id", id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
  }
  async function doClearGroupChat() {
    setActionLoading(true);
    const { error } = await supabase.rpc("clear_group_chat", { _group_id: group.id });
    setActionLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Chat cleared"); setConfirmClear(false); qc.invalidateQueries({ queryKey: ["group-messages", group.id] }); }
  }

  return (
    <>
      <ChatHeader onBack={onBack}>
        <div className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
          style={{ background: "oklch(0.65 0.22 280 / 0.15)", border: "1px solid oklch(0.65 0.22 280 / 0.25)" }}>
          <UsersRound className="h-4 w-4" style={{ color: "oklch(0.75 0.18 280)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">{group.name}</div>
          <div className="text-xs text-muted-foreground">{members.length} members · {onlineCount} online</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl shrink-0 text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => setInfoOpen(true)} className="gap-2 cursor-pointer"><Settings2 className="h-4 w-4" /> Group info</DropdownMenuItem>
            {isAdmin && <DropdownMenuItem onClick={() => setConfirmClear(true)} className="gap-2 cursor-pointer text-destructive focus:text-destructive"><Eraser className="h-4 w-4" /> Clear messages</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </ChatHeader>

      <MessageList scrollRef={scrollRef} loading={msgsQ.isLoading}>
        {(msgsQ.data ?? []).length === 0 && !msgsQ.isLoading ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="mx-auto h-12 w-12 rounded-2xl grid place-items-center mb-4" style={{ background: "oklch(0.65 0.22 280 / 0.1)", border: "1px solid oklch(0.65 0.22 280 / 0.2)" }}>
                <UsersRound className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
              </div>
              <p className="text-sm text-muted-foreground">Welcome to <span className="text-foreground font-medium">{group.name}</span> 👋</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-1">
            {(msgsQ.data ?? []).map((m, i, arr) => {
              const mine = m.sender_id === meId;
              const sender = profiles[m.sender_id];
              const prev = arr[i - 1];
              const grouped = !!(prev && prev.sender_id === m.sender_id && (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000));
              return <MessageBubble key={m.id} content={m.content} mine={mine} grouped={grouped}
                senderName={!mine && !grouped ? (sender?.display_name || sender?.username || "Member") : undefined}
                onDelete={mine ? () => deleteMessage(m.id) : undefined} />;
            })}
          </ul>
        )}
      </MessageList>

      <ChatInputBar value={text} onChange={setText} onSend={() => send()} placeholder={`Message ${group.name}`} sending={sending}
        onStickerPick={(s) => send(s)} showStickers={showStickers} onToggleStickers={() => setShowStickers((v) => !v)} />

      <GroupInfoDialog open={infoOpen} onOpenChange={setInfoOpen} group={group} meId={meId} isAdmin={isAdmin}
        memberProfiles={members.map((m) => ({ member: m, profile: m.user_id === meId ? null : profiles[m.user_id] }))}
        friends={friends} presence={presence} onLeft={() => { setInfoOpen(false); onLeft(); }} />
      <ConfirmDialog open={confirmClear} onOpenChange={setConfirmClear} title="Clear group chat"
        description="Delete all messages in this group for everyone? Admins only." confirmLabel="Clear" onConfirm={doClearGroupChat} loading={actionLoading} />
    </>
  );
}

// ─── Group info dialog ────────────────────────────────────────
function GroupInfoDialog({ open, onOpenChange, group, meId, isAdmin, memberProfiles, friends, presence, onLeft }: {
  open: boolean; onOpenChange: (v: boolean) => void; group: Group; meId: string; isAdmin: boolean;
  memberProfiles: { member: GroupMember; profile: Profile | null }[];
  friends: Profile[]; presence: Set<string>; onLeft: () => void;
}) {
  const qc = useQueryClient();
  const memberIds = new Set(memberProfiles.map((m) => m.member.user_id));
  const addable = friends.filter((f) => !memberIds.has(f.id));
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [savingName, setSavingName] = useState(false);
  useEffect(() => { setNameDraft(group.name); setEditingName(false); }, [group.id, group.name, open]);

  async function saveName() {
    const next = nameDraft.trim(); if (!next || next === group.name) { setEditingName(false); return; }
    setSavingName(true);
    const { error } = await supabase.from("groups").update({ name: next, updated_at: new Date().toISOString() }).eq("id", group.id);
    setSavingName(false);
    if (error) toast.error(error.message); else { toast.success("Renamed"); setEditingName(false); qc.invalidateQueries({ queryKey: ["groups"] }); }
  }
  async function setRole(uid: string, role: "admin" | "member") {
    const { error } = await supabase.from("group_members").update({ role }).eq("group_id", group.id).eq("user_id", uid);
    if (error) toast.error(error.message); else { toast.success(role === "admin" ? "Promoted" : "Demoted"); qc.invalidateQueries({ queryKey: ["group-members"] }); }
  }
  async function addMember(uid: string) {
    const { error } = await supabase.from("group_members").insert({ group_id: group.id, user_id: uid, role: "member" });
    if (error) toast.error(error.message); else { toast.success("Added"); qc.invalidateQueries({ queryKey: ["group-members"] }); }
  }
  async function removeMember(uid: string) {
    const { error } = await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", uid);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["group-members"] });
  }
  async function leave() {
    const { error } = await supabase.from("group_members").delete().eq("group_id", group.id).eq("user_id", meId);
    if (error) toast.error(error.message);
    else { toast.success("Left group"); qc.invalidateQueries({ queryKey: ["group-members"] }); qc.invalidateQueries({ queryKey: ["groups"] }); onLeft(); }
  }
  async function deleteGroup() {
    if (!confirm(`Delete "${group.name}"?`)) return;
    const { error } = await supabase.from("groups").delete().eq("id", group.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["groups"] }); onLeft(); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={80} autoFocus className="rounded-xl"
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setNameDraft(group.name); } }} />
              <Button size="sm" onClick={saveName} disabled={savingName} style={{ background: "var(--gradient-primary)" }}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameDraft(group.name); }}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DialogTitle className="flex-1">{group.name}</DialogTitle>
              {isAdmin && <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => setEditingName(true)}><Pencil className="h-3.5 w-3.5" /></Button>}
            </div>
          )}
          {group.description && <DialogDescription>{group.description}</DialogDescription>}
          {!isAdmin && <DialogDescription className="text-xs">Only admins can manage this group.</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Members ({memberProfiles.length})</div>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {memberProfiles.map(({ member, profile }) => {
                const isMe = member.user_id === meId;
                const name = isMe ? "You" : (profile?.display_name || profile?.username || "Member");
                return (
                  <div key={member.user_id} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="relative shrink-0">
                      <UserAvatar src={profile?.avatar_url} name={profile?.username ?? "me"} size="sm" />
                      {presence.has(member.user_id) && <OnlineDot size="sm" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium flex items-center gap-2">
                        {name}
                        {member.role === "admin" && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider"
                            style={{ background: "oklch(0.65 0.22 280 / 0.15)", color: "oklch(0.78 0.18 280)", border: "1px solid oklch(0.65 0.22 280 / 0.25)" }}>
                            Admin
                          </span>
                        )}
                      </div>
                      {!isMe && <div className="truncate text-xs text-muted-foreground">@{profile?.username}</div>}
                    </div>
                    {isAdmin && !isMe && (
                      <>
                        {member.role === "member"
                          ? <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" title="Promote" onClick={() => setRole(member.user_id, "admin")}><Shield className="h-4 w-4" /></Button>
                          : <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" title="Demote" onClick={() => setRole(member.user_id, "member")}><ShieldOff className="h-4 w-4" /></Button>
                        }
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeMember(member.user_id)}><X className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {isAdmin && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Add friends</div>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                {addable.length === 0 ? <p className="text-xs text-muted-foreground p-3">No more friends to add.</p>
                  : addable.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 px-3 py-2">
                      <UserAvatar src={f.avatar_url} name={f.username} size="sm" />
                      <div className="min-w-0 flex-1 text-sm"><div className="truncate font-medium">{f.display_name || f.username}</div><div className="truncate text-xs text-muted-foreground">@{f.username}</div></div>
                      <Button size="sm" variant="ghost" className="rounded-lg text-xs gap-1.5" onClick={() => addMember(f.id)}><UserPlus className="h-3.5 w-3.5" /> Add</Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex sm:justify-between gap-2">
          <div>{isAdmin && <Button variant="ghost" className="text-destructive hover:bg-destructive/10 gap-1.5" onClick={deleteGroup}><Trash2 className="h-4 w-4" /> Delete group</Button>}</div>
          <Button variant="ghost" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={leave}><LeaveIcon className="h-4 w-4" /> Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
