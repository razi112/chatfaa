import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Search, Users, LogOut, Send, UserPlus, Check, X, Inbox, Loader2,
  Plus, UsersRound, Settings2, LogOut as LeaveIcon, Trash2, Pencil, Shield, ShieldOff,
  Hash, Smile, Eraser, Ban, MoreVertical, Trash, ArrowLeft, Menu,
  User, Camera, KeyRound, AlertTriangle, Save, Play, Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { NotesTray } from "@/components/Notes";
import { BottomNav } from "@/components/BottomNav";
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
  const [profileOpen, setProfileOpen] = useState(false);

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
        {tab === "chats" && (
          <>
            <NotesTray meId={user.id} meProfile={me ?? null} friendIds={acceptedFriends.map(f => f.id)} />
            <div className="h-px mx-4 mb-1" style={{ background: "var(--border)" }} />
            <ChatsList friends={acceptedFriends} groups={groups} active={active} onSelect={handleSelect} presence={presence} blockedIds={blockedIds} meId={user.id} />
          </>
        )}
        {tab === "friends" && <FriendsList accepted={acceptedFriends} incoming={pendingIncoming} outgoing={pendingOutgoing} presence={presence} onMessage={(id) => { handleSelect({ type: "dm", id }); setTab("chats"); }} />}
        {tab === "search" && <SearchUsers meId={user.id} />}
      </ScrollArea>

      {me && (
        <div className="border-t px-4 py-3 flex items-center gap-3 shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
          <button
            onClick={() => setProfileOpen(true)}
            className="relative shrink-0 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all"
            aria-label="Profile settings"
          >
            <UserAvatar src={me.avatar_url} name={me.username} size="sm" />
            {presence.has(user.id) && <OnlineDot size="sm" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: "oklch(0.80 0.15 280)" }}>@{me.username}</div>
            {me.display_name && <div className="text-[10px] text-muted-foreground truncate">{me.display_name}</div>}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/8"
            onClick={() => setProfileOpen(true)} aria-label="Settings">
            <Settings2 className="h-4 w-4" />
          </Button>
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
              <Link to="/feed">
                <RailButton icon={Home} active={false} onClick={() => {}} label="Feed" />
              </Link>
              {/* Chat is always the active page — sidebar tab bar handles chats/friends/search */}
              <RailButton icon={MessageCircle} active={true} onClick={() => setTab("chats")} label="Chat" />
              <Link to="/reels">
                <RailButton icon={Play} active={false} onClick={() => {}} label="Reels" />
              </Link>
            </div>
            <div className="flex flex-col items-center gap-2 pt-2 border-t w-full" style={{ borderColor: "oklch(0.18 0.016 268)" }}>
              <button
                onClick={() => setProfileOpen(true)}
                className="relative rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all"
                aria-label="Profile settings"
              >
                <UserAvatar src={me?.avatar_url} name={me?.username ?? "?"} size="sm" />
                {presence.has(user.id) && <OnlineDot size="sm" />}
              </button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                onClick={() => setProfileOpen(true)} aria-label="Settings">
                <Settings2 className="h-4 w-4" />
              </Button>
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

            {/* ── Tab bar ── */}
            <div className="flex border-b shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
              {(["chats", "friends", "search"] as Tab[]).map((t) => {
                const icons = { chats: MessageCircle, friends: Users, search: Search };
                const Icon = icons[t];
                return (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn(
                      "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium uppercase tracking-wide transition-colors relative",
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
                      <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full"
                        style={{ background: "var(--gradient-primary)" }} />
                    )}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1 min-h-0">
              {tab === "chats" && (
                <>
                  <NotesTray meId={user.id} meProfile={me ?? null} friendIds={acceptedFriends.map(f => f.id)} />
                  <div className="h-px mx-4 mb-1" style={{ background: "var(--border)" }} />
                  <ChatsList friends={acceptedFriends} groups={groups} active={active} onSelect={setActive} presence={presence} blockedIds={blockedIds} meId={user.id} />
                </>
              )}
              {tab === "friends" && <FriendsList accepted={acceptedFriends} incoming={pendingIncoming} outgoing={pendingOutgoing} presence={presence} onMessage={(id) => { setActive({ type: "dm", id }); setTab("chats"); }} />}
              {tab === "search" && <SearchUsers meId={user.id} />}
            </ScrollArea>
            {me && (
              <div className="border-t px-4 py-3 flex items-center gap-2 shrink-0" style={{ borderColor: "oklch(0.20 0.016 268)" }}>
                <button onClick={() => setProfileOpen(true)} className="relative shrink-0 rounded-full" aria-label="Settings">
                  <UserAvatar src={me.avatar_url} name={me.username} size="sm" />
                </button>
                <span className="text-xs text-muted-foreground flex-1 truncate min-w-0 font-semibold" style={{ color: "oklch(0.80 0.15 280)" }}>
                  @{me.username}
                </span>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setProfileOpen(true)} aria-label="Settings">
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
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
        <nav className="fixed bottom-0 left-0 right-0 flex border-t z-40 bottom-nav"
          style={{ background: "var(--color-sidebar)", borderColor: "oklch(0.22 0.016 268)" }}>
          <Link to="/feed" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium text-muted-foreground hover:text-white transition-colors">
            <Home className="h-5 w-5" />
            Feed
          </Link>
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
          <Link to="/reels" className="flex-1 flex flex-col items-center gap-0.5 py-3 text-[10px] font-medium text-muted-foreground hover:text-white transition-colors">
            <Play className="h-5 w-5" />
            Reels
          </Link>
        </nav>
      )}

      {/* ── Profile settings dialog ── */}
      {me && (
        <ProfileSettingsDialog
          open={profileOpen}
          onOpenChange={setProfileOpen}
          profile={me}
          userId={user.id}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

// ─── Profile Settings Dialog ──────────────────────────────────
function ProfileSettingsDialog({ open, onOpenChange, profile, userId, onSignOut }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  profile: Profile; userId: string; onSignOut: () => void;
}) {
  const qc = useQueryClient();

  // ── Profile tab state ────────────────────────────────────────
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Avatar state ─────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Username tab state ───────────────────────────────────────
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const usernameStatus = useUsernameCheck(newUsername, profile.username);

  // ── Password tab state ───────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── Danger zone ──────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Reset form when profile changes or dialog opens
  useEffect(() => {
    if (open) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
      setAvatarPreview(null);
      setAvatarFile(null);
      setNewUsername("");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setDeleteConfirm("");
    }
  }, [open, profile]);

  // ── Avatar pick ──────────────────────────────────────────────
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function uploadAvatar(): Promise<string | null> {
    if (!avatarFile) return null;
    setUploadingAvatar(true);
    const ext = avatarFile.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true });
    setUploadingAvatar(false);
    if (error) { toast.error("Avatar upload failed: " + error.message); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Bust cache with timestamp
    return `${data.publicUrl}?t=${Date.now()}`;
  }

  // ── Save profile ─────────────────────────────────────────────
  async function saveProfile() {
    setSavingProfile(true);
    let avatarUrl: string | null | undefined = undefined;

    if (avatarFile) {
      avatarUrl = await uploadAvatar();
      if (avatarUrl === null) { setSavingProfile(false); return; }
    }

    const updates: { display_name: string; bio: string; updated_at: string; avatar_url?: string } = {
      updated_at: new Date().toISOString(),
      display_name: displayName.trim() || profile.username,
      bio: bio.trim(),
    };
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    }
  }

  // ── Change username ──────────────────────────────────────────
  async function saveUsername() {
    if (!newUsername.trim()) { toast.error("Enter a new username"); return; }
    setSavingUsername(true);
    const { error } = await supabase.rpc("change_username", { _new_username: newUsername.trim() });
    setSavingUsername(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Username updated");
      setNewUsername("");
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  }

  // ── Change password ──────────────────────────────────────────
  async function savePassword() {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setSavingPassword(true);
    // Re-authenticate first to verify current password
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser?.email) { toast.error("Could not verify identity"); setSavingPassword(false); return; }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: authUser.email, password: currentPassword,
    });
    if (signInErr) { toast.error("Current password is incorrect"); setSavingPassword(false); return; }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
  }

  // ── Delete account ───────────────────────────────────────────
  async function deleteAccount() {
    if (deleteConfirm !== profile.username) { toast.error("Type your username to confirm"); return; }
    setDeleting(true);
    const { error } = await supabase.rpc("delete_own_account");
    setDeleting(false);
    if (error) toast.error(error.message);
    else onSignOut();
  }

  const currentAvatar = avatarPreview ?? profile.avatar_url ?? undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl w-[calc(100vw-2rem)] max-w-lg p-0 overflow-hidden gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "oklch(0.24 0.016 268)" }}>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: "oklch(0.75 0.18 280)" }} />
            Profile & Settings
          </DialogTitle>
          <DialogDescription className="text-xs mt-0.5">Manage your account, appearance, and security.</DialogDescription>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full rounded-none border-b px-4 h-11 bg-transparent justify-start gap-0"
            style={{ borderColor: "oklch(0.24 0.016 268)" }}>
            {[
              { value: "profile", label: "Profile" },
              { value: "username", label: "Username" },
              { value: "password", label: "Password" },
              { value: "danger",   label: "Danger" },
            ].map((t) => (
              <TabsTrigger key={t.value} value={t.value}
                className={cn("rounded-none border-b-2 border-transparent px-4 py-2 text-xs font-medium data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground",
                  t.value === "danger" && "data-[state=active]:text-destructive data-[state=active]:border-destructive"
                )}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Profile tab ── */}
          <TabsContent value="profile" className="px-6 py-5 space-y-5 mt-0">
            {/* View profile link */}
            <Link to="/profile" onClick={() => onOpenChange(false)}>
              <Button variant="outline" size="sm" className="w-full gap-2 mb-1 rounded-xl border-primary/30 text-primary hover:bg-primary/10">
                <User className="h-4 w-4" /> View my profile page
              </Button>
            </Link>
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage src={currentAvatar} />
                  <AvatarFallback className="text-xl font-bold"
                    style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.3), oklch(0.70 0.18 310 / 0.3))", color: "oklch(0.80 0.15 280)" }}>
                    {initials(profile.username)}
                  </AvatarFallback>
                </Avatar>
                <button onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full grid place-items-center border-2 transition-colors"
                  style={{ background: "var(--gradient-primary)", borderColor: "var(--color-background)" }}
                  aria-label="Change avatar">
                  <Camera className="h-3.5 w-3.5 text-white" />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">@{profile.username}</div>
                {profile.display_name && <div className="text-sm text-muted-foreground truncate">{profile.display_name}</div>}
                <button onClick={() => avatarInputRef.current?.click()}
                  className="text-xs mt-1.5 font-medium transition-colors"
                  style={{ color: "oklch(0.75 0.18 280)" }}>
                  {uploadingAvatar ? "Uploading…" : "Change photo"}
                </button>
              </div>
            </div>

            <Separator style={{ background: "oklch(0.24 0.016 268)" }} />

            {/* Display name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Display name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile.username} maxLength={50} className="rounded-xl" />
              <p className="text-[11px] text-muted-foreground">This is how your name appears in chats.</p>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people a bit about yourself…" maxLength={160} rows={3}
                className="rounded-xl resize-none text-sm" />
              <p className="text-[11px] text-muted-foreground">{bio.length}/160</p>
            </div>

            <Button onClick={saveProfile} disabled={savingProfile || uploadingAvatar}
              className="w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}>
              {savingProfile || uploadingAvatar
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
                : <><Save className="h-4 w-4" /> Save profile</>
              }
            </Button>
          </TabsContent>

          {/* ── Username tab ── */}
          <TabsContent value="username" className="px-6 py-5 space-y-4 mt-0">
            <div className="rounded-xl p-4 space-y-1" style={{ background: "oklch(0.17 0.016 268)", border: "1px solid oklch(0.24 0.016 268)" }}>
              <p className="text-xs text-muted-foreground">Current username</p>
              <p className="font-bold text-lg" style={{ color: "oklch(0.80 0.15 280)" }}>@{profile.username}</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">New username</Label>
                <UsernameBadge status={usernameStatus} />
              </div>
              <div className="flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring"
                style={{
                  background: "var(--color-input)",
                  border: `1px solid ${usernameStatus === "available" ? "oklch(0.76 0.19 152 / 0.6)" : usernameStatus === "taken" ? "oklch(0.62 0.22 25 / 0.6)" : "var(--color-border)"}`,
                }}>
                <span className="pl-3 pr-1 text-muted-foreground text-sm font-medium select-none">@</span>
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="new_username" maxLength={20}
                  className="border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none" />
              </div>
              <p className="text-[11px] text-muted-foreground">3-20 chars: letters, numbers, underscores only.</p>
            </div>
            <Button onClick={saveUsername}
              disabled={savingUsername || !newUsername.trim() || usernameStatus === "taken" || usernameStatus === "checking" || usernameStatus === "invalid" || usernameStatus === "same"}
              className="w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}>
              {savingUsername ? <><Loader2 className="h-4 w-4 animate-spin" /> Changing…</> : "Change username"}
            </Button>
          </TabsContent>

          {/* ── Password tab ── */}
          <TabsContent value="password" className="px-6 py-5 space-y-4 mt-0">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Current password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password" className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">New password</Label>
              <div className="flex items-center rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring"
                style={{ background: "var(--color-input)", border: "1px solid var(--color-border)" }}>
                <Input type={showNewPw ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" minLength={8} autoComplete="new-password"
                  className="border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none flex-1" />
                <button type="button" onClick={() => setShowNewPw((v) => !v)}
                  className="pr-3 pl-2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}>
                  {showNewPw
                    ? <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    : <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Confirm new password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" autoComplete="new-password" className="rounded-xl" />
            </div>
            <Button onClick={savePassword} disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="w-full gap-2 rounded-xl shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}>
              {savingPassword ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : <><KeyRound className="h-4 w-4" /> Update password</>}
            </Button>
          </TabsContent>

          {/* ── Danger zone tab ── */}
          <TabsContent value="danger" className="px-6 py-5 space-y-4 mt-0">
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "oklch(0.62 0.22 25 / 0.08)", border: "1px solid oklch(0.62 0.22 25 / 0.3)" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: "oklch(0.62 0.22 25)" }} />
                <p className="text-sm font-semibold" style={{ color: "oklch(0.62 0.22 25)" }}>Delete account</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This permanently deletes your account, all messages, friendships, and group memberships.
                This action <strong className="text-foreground">cannot be undone</strong>.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Type <span className="font-bold text-foreground">@{profile.username}</span> to confirm
              </Label>
              <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={profile.username} className="rounded-xl" />
            </div>
            <Button
              onClick={deleteAccount}
              disabled={deleting || deleteConfirm !== profile.username}
              className="w-full gap-2 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</> : <><Trash2 className="h-4 w-4" /> Delete my account</>}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Username availability hook ───────────────────────────────
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "same";

function useUsernameCheck(value: string, currentUsername?: string) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) { setStatus("idle"); return; }

    // Same as current
    if (currentUsername && trimmed.toLowerCase() === currentUsername.toLowerCase()) {
      setStatus("same"); return;
    }
    // Format check
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) { setStatus("invalid"); return; }

    setStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", trimmed)
        .maybeSingle();
      if (error) { setStatus("idle"); return; }
      setStatus(data ? "taken" : "available");
    }, 400);

    return () => clearTimeout(timer);
  }, [value, currentUsername]);

  return status;
}

// Small inline badge shown next to username inputs
function UsernameBadge({ status }: { status: UsernameStatus }) {
  if (status === "idle" || status === "same") return null;

  const config: Record<Exclude<UsernameStatus, "idle" | "same">, { label: string; color: string; bg: string }> = {
    checking:  { label: "Checking…",  color: "oklch(0.70 0.015 268)", bg: "oklch(0.22 0.016 268)" },
    available: { label: "✓ Available", color: "oklch(0.76 0.19 152)", bg: "oklch(0.20 0.08 152 / 0.3)" },
    taken:     { label: "✗ Taken",     color: "oklch(0.62 0.22 25)",  bg: "oklch(0.62 0.22 25 / 0.15)" },
    invalid:   { label: "3-20 chars: a-z, 0-9, _", color: "oklch(0.78 0.18 60)", bg: "oklch(0.78 0.18 60 / 0.12)" },
  };

  const { label, color, bg } = config[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium"
      style={{ color, background: bg, border: `1px solid ${color}40` }}>
      {status === "checking" && <Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />}
      {label}
    </span>
  );
}
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
function ChatsList({ friends, groups, active, onSelect, presence, blockedIds, meId }: {
  friends: Profile[]; groups: Group[]; active: Active;
  onSelect: (a: Active) => void; presence: Set<string>; blockedIds: Set<string>;
  meId: string;
}) {
  const visibleFriends = friends.filter((f) => !blockedIds.has(f.id));

  // Fetch last message + unread count for every DM in one query
  const dmPreviewQ = useQuery({
    queryKey: ["dm-previews", meId, visibleFriends.map((f) => f.id).join(",")],
    enabled: visibleFriends.length > 0,
    refetchInterval: false,
    queryFn: async () => {
      if (visibleFriends.length === 0) return {} as Record<string, { lastMsg: Message; unread: number }>;
      // Pull the last 1 message per conversation + unread count
      const friendIds = visibleFriends.map((f) => f.id);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          friendIds
            .map((id) => `and(sender_id.eq.${meId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${meId})`)
            .join(",")
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error || !data) return {} as Record<string, { lastMsg: Message; unread: number }>;
      const msgs = data as Message[];
      const result: Record<string, { lastMsg: Message; unread: number }> = {};
      for (const fId of friendIds) {
        const thread = msgs.filter(
          (m) => (m.sender_id === meId && m.receiver_id === fId) || (m.sender_id === fId && m.receiver_id === meId)
        );
        if (thread.length === 0) continue;
        const unread = thread.filter((m) => m.sender_id === fId && m.receiver_id === meId && !m.read_at).length;
        result[fId] = { lastMsg: thread[0], unread };
      }
      return result;
    },
  });

  // Re-fetch previews whenever messages change — subscribe directly to the realtime invalidations
  const qc = useQueryClient();
  useEffect(() => {
    if (!meId || visibleFriends.length === 0) return;
    const ch = supabase.channel(`rt-dm-previews-${meId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${meId}` },
        () => qc.invalidateQueries({ queryKey: ["dm-previews"] })
      )
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${meId}` },
        () => qc.invalidateQueries({ queryKey: ["dm-previews"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch).catch(() => {}); };
  }, [meId, qc]);

  const previews = dmPreviewQ.data ?? {};

  // Sort friends: unread first, then by last message time
  const sortedFriends = [...visibleFriends].sort((a, b) => {
    const pa = previews[a.id]; const pb = previews[b.id];
    if (!pa && !pb) return 0;
    if (!pa) return 1;
    if (!pb) return -1;
    if (pa.unread > 0 && pb.unread === 0) return -1;
    if (pb.unread > 0 && pa.unread === 0) return 1;
    return new Date(pb.lastMsg.created_at).getTime() - new Date(pa.lastMsg.created_at).getTime();
  });

  if (sortedFriends.length === 0 && groups.length === 0) {
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

  function previewText(msg: Message): string {
    const isMe = msg.sender_id === meId;
    const isEmoji = msg.content.length <= 4 && /^\p{Emoji}/u.test(msg.content);
    const text = isEmoji ? msg.content : msg.content.slice(0, 40) + (msg.content.length > 40 ? "…" : "");
    return isMe ? `You: ${text}` : text;
  }

  function timeLabel(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h`;
    if (diffH < 48) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
                    <div className="min-w-0 flex-1">
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
      {sortedFriends.length > 0 && (
        <div>
          <SectionLabel icon={Hash} label="Direct messages" />
          <ul className="space-y-0.5 mt-1">
            {sortedFriends.map((f) => {
              const isActive = active?.type === "dm" && active.id === f.id;
              const online = presence.has(f.id);
              const preview = previews[f.id];
              const unread = preview?.unread ?? 0;
              const hasUnread = unread > 0 && !isActive;
              return (
                <li key={f.id}>
                  <button
                    onClick={() => onSelect({ type: "dm", id: f.id })}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive ? "text-white" : "text-foreground/80 hover:bg-white/5 hover:text-foreground"
                    )}
                    style={
                      isActive
                        ? { background: "linear-gradient(135deg, oklch(0.65 0.22 280 / 0.2), oklch(0.70 0.18 310 / 0.15))", border: "1px solid oklch(0.65 0.22 280 / 0.25)" }
                        : { border: "1px solid transparent" }
                    }
                  >
                    <div className="relative shrink-0">
                      <UserAvatar src={f.avatar_url} name={f.username} />
                      {online && <OnlineDot />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn("truncate text-sm", hasUnread ? "font-semibold text-foreground" : "font-medium")}>
                          {f.display_name || f.username}
                        </span>
                        {preview && (
                          <span className={cn("text-[10px] shrink-0", hasUnread ? "text-primary font-semibold" : "text-muted-foreground")}>
                            {timeLabel(preview.lastMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        {preview ? (
                          <span className={cn("truncate text-xs", hasUnread ? "text-foreground/80" : "text-muted-foreground")}>
                            {previewText(preview.lastMsg)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">@{f.username}</span>
                        )}
                        {hasUnread && (
                          <span
                            className="shrink-0 h-5 min-w-5 px-1 rounded-full text-[10px] font-bold text-white grid place-items-center"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </div>
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

// ─── Read receipt tick ────────────────────────────────────────
function ReadTick({ readAt }: { readAt: string | null | undefined }) {
  if (readAt) {
    // Double tick — seen (blue)
    return (
      <span className="inline-flex items-center shrink-0" title="Seen">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden>
          <path d="M1 5.5l3.5 3.5L11 2" stroke="oklch(0.65 0.20 230)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 5.5l3.5 3.5L16 2" stroke="oklch(0.65 0.20 230)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  // Single tick — sent/delivered (muted)
  return (
    <span className="inline-flex items-center shrink-0" title="Delivered">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path d="M1 5.5l3.5 3.5L10 2" stroke="oklch(0.75 0 0 / 0.50)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// ─── Message bubble ───────────────────────────────────────────
function MessageBubble({ content, mine, grouped, senderName, onDelete, readAt, isLast }: {
  content: string; mine: boolean; grouped: boolean; senderName?: string; onDelete?: () => void;
  readAt?: string | null; isLast?: boolean;
}) {
  const isSticker = content.length <= 4 && /^\p{Emoji}/u.test(content);
  // Show tick on every sent message in a DM (readAt !== undefined means it's a DM sent by me)
  const showTick = mine && readAt !== undefined;

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
          <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
            <span className="text-4xl leading-none select-none">{content}</span>
            {showTick && (
              <div className="mt-0.5 mr-0.5"><ReadTick readAt={readAt} /></div>
            )}
          </div>
        ) : (
          <div
            className={cn("min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-sm whitespace-pre-wrap break-words leading-relaxed", mine ? "text-white" : "text-foreground")}
            style={{
              background: mine ? "var(--gradient-primary)" : "oklch(0.18 0.016 268)",
              borderRadius: mine
                ? (grouped ? "18px 6px 18px 18px" : "18px 6px 6px 18px")
                : (grouped ? "6px 18px 18px 18px" : "6px 18px 18px 18px"),
              border: mine ? "none" : "1px solid oklch(0.25 0.016 268)",
              boxShadow: mine
                ? "0 4px 16px -4px oklch(0.65 0.22 280 / 0.4)"
                : "0 2px 8px -2px oklch(0 0 0 / 0.3)",
            }}
          >
            {/* Text + tick sit on the same line; tick floats to bottom-right */}
            <span>{content}</span>
            {showTick && (
              <span className="inline-flex items-end ml-1.5 -mb-0.5 align-bottom opacity-90">
                <ReadTick readAt={readAt} />
              </span>
            )}
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

  // Track whether user is scrolled near the bottom
  const [atBottom, setAtBottom] = useState(true);
  const atBottomRef = useRef(true); // ref for use inside effects without stale closure
  const [newMsgCount, setNewMsgCount] = useState(0);
  const prevMsgCount = useRef(0);

  // Reset state when switching to a different friend
  useEffect(() => {
    setAtBottom(true);
    atBottomRef.current = true;
    setNewMsgCount(0);
    prevMsgCount.current = 0;
  }, [friend.id]);

  const msgsQ = useQuery({
    queryKey: ["messages", meId, friend.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`)
        .order("created_at", { ascending: true }).limit(200);
      if (error) throw error; return data as Message[];
    },
  });

  // Handle new messages arriving
  useEffect(() => {
    if (!msgsQ.data) return;
    const el = scrollRef.current;
    if (!el) return;
    const total = msgsQ.data.length;

    if (prevMsgCount.current === 0) {
      // Initial load — jump to bottom immediately
      el.scrollTop = el.scrollHeight;
      prevMsgCount.current = total;
      return;
    }

    const added = total - prevMsgCount.current;
    prevMsgCount.current = total;
    if (added <= 0) return;

    const newestMsg = msgsQ.data[msgsQ.data.length - 1];
    const isMine = newestMsg?.sender_id === meId;

    if (atBottomRef.current || isMine) {
      // Auto-scroll: at bottom OR we just sent a message
      el.scrollTop = el.scrollHeight;
      setNewMsgCount(0);
    } else {
      // User is scrolled up — count incoming messages for banner
      const newIncoming = msgsQ.data.slice(-added).filter((m) => m.sender_id === friend.id).length;
      if (newIncoming > 0) setNewMsgCount((n) => n + newIncoming);
    }
  }, [msgsQ.data, friend.id, meId]);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      const threshold = 80;
      const bottom = el!.scrollHeight - el!.scrollTop - el!.clientHeight < threshold;
      atBottomRef.current = bottom;
      setAtBottom(bottom);
      if (bottom) setNewMsgCount(0);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToBottom() {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setNewMsgCount(0);
  }

  // Mark incoming messages as read when visible
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
    <div className="relative flex flex-col flex-1 min-h-0">
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

      {/* New message banner — shown when user is scrolled up and new messages arrive */}
      {newMsgCount > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-2"
          style={{ background: "var(--gradient-primary)", boxShadow: "0 4px 20px -4px oklch(0.65 0.22 280 / 0.6)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 2v8M2 7l4 4 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {newMsgCount} new message{newMsgCount > 1 ? "s" : ""}
        </button>
      )}

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
              // isLast = last message sent by me (show tick only on the most recent sent msg)
              const isLast = mine && !arr.slice(i + 1).some((nm) => nm.sender_id === meId);
              return (
                <MessageBubble key={m.id} content={m.content} mine={mine} grouped={grouped}
                  readAt={mine ? m.read_at : undefined}
                  isLast={isLast}
                  onDelete={mine ? () => deleteMessage(m.id) : undefined} />
              );
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
    </div>
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
