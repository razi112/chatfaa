import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Search, Users, LogOut, Send, UserPlus, Check, X, Inbox, Loader2,
  Plus, UsersRound, Settings2, LogOut as LeaveIcon, Trash2, Pencil, Shield, ShieldOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "ChatSphere" }] }),
  component: ChatApp,
});

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

type Tab = "chats" | "friends" | "search";
type Active =
  | { type: "dm"; id: string }
  | { type: "group"; id: string }
  | null;

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ChatApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("chats");
  const [active, setActive] = useState<Active>(null);
  const [presence, setPresence] = useState<Set<string>>(new Set());

  // --- queries ---
  const profileQ = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  const friendshipsQ = useQuery({
    queryKey: ["friendships", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("friendships").select("*")
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Friendship[];
    },
  });

  const groupsQ = useQuery({
    queryKey: ["groups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("groups").select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Group[];
    },
  });

  // All group memberships across user's groups
  const groupIds = useMemo(() => (groupsQ.data ?? []).map((g) => g.id), [groupsQ.data]);
  const allMembersQ = useQuery({
    queryKey: ["group-members", groupIds],
    enabled: groupIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("group_members").select("*").in("group_id", groupIds);
      if (error) throw error;
      return data as GroupMember[];
    },
  });

  // Collect every profile we need (friends + group members + me)
  const involvedIds = useMemo(() => {
    const ids = new Set<string>();
    (friendshipsQ.data ?? []).forEach((f) => { ids.add(f.sender_id); ids.add(f.receiver_id); });
    (allMembersQ.data ?? []).forEach((m) => { ids.add(m.user_id); });
    if (user) ids.delete(user.id);
    return Array.from(ids);
  }, [friendshipsQ.data, allMembersQ.data, user]);

  const profilesQ = useQuery({
    queryKey: ["profiles", involvedIds],
    enabled: involvedIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", involvedIds);
      if (error) throw error;
      const map: Record<string, Profile> = {};
      (data as Profile[]).forEach((p) => { map[p.id] = p; });
      return map;
    },
  });

  const acceptedFriends = useMemo(() => {
    const list = friendshipsQ.data ?? [];
    const map = profilesQ.data ?? {};
    return list
      .filter((f) => f.status === "accepted")
      .map((f) => {
        const otherId = f.sender_id === user?.id ? f.receiver_id : f.sender_id;
        return map[otherId];
      })
      .filter(Boolean) as Profile[];
  }, [friendshipsQ.data, profilesQ.data, user]);

  const pendingIncoming = useMemo(() => {
    const list = friendshipsQ.data ?? [];
    const map = profilesQ.data ?? {};
    return list
      .filter((f) => f.status === "pending" && f.receiver_id === user?.id)
      .map((f) => ({ friendship: f, profile: map[f.sender_id] }))
      .filter((x) => x.profile);
  }, [friendshipsQ.data, profilesQ.data, user]);

  const pendingOutgoing = useMemo(() => {
    const list = friendshipsQ.data ?? [];
    const map = profilesQ.data ?? {};
    return list
      .filter((f) => f.status === "pending" && f.sender_id === user?.id)
      .map((f) => ({ friendship: f, profile: map[f.receiver_id] }))
      .filter((x) => x.profile);
  }, [friendshipsQ.data, profilesQ.data, user]);

  // --- realtime: messages + friendships + groups + presence ---
  useEffect(() => {
    if (!user) return;

    const msgChannel = supabase
      .channel("rt-messages-" + user.id)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["messages"] }))
      .subscribe();

    const friendChannel = supabase
      .channel("rt-friendships-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
        qc.invalidateQueries({ queryKey: ["friendships"] });
      })
      .subscribe();

    const groupChannel = supabase
      .channel("rt-groups-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, () => {
        qc.invalidateQueries({ queryKey: ["groups"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, () => {
        qc.invalidateQueries({ queryKey: ["group-members"] });
        qc.invalidateQueries({ queryKey: ["groups"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["group-messages"] });
      })
      .subscribe();

    const presenceChannel = supabase.channel("online-users", {
      config: { presence: { key: user.id } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        setPresence(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(friendChannel);
      supabase.removeChannel(groupChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, qc]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
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

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Rail */}
      <aside className="w-16 shrink-0 bg-sidebar flex flex-col items-center py-4 gap-3 border-r border-border">
        <div className="grid h-10 w-10 place-items-center rounded-xl"
          style={{ background: "var(--gradient-primary)" }}>
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="mt-2 flex flex-col gap-1">
          <RailButton icon={MessageCircle} active={tab === "chats"} onClick={() => setTab("chats")} label="Chats" />
          <RailButton icon={Users} active={tab === "friends"} onClick={() => setTab("friends")} label="Friends"
            badge={pendingIncoming.length || undefined} />
          <RailButton icon={Search} active={tab === "search"} onClick={() => setTab("search")} label="Find" />
        </div>
        <div className="mt-auto flex flex-col items-center gap-2">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={me?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {initials(me?.username ?? "?")}
            </AvatarFallback>
          </Avatar>
          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Side panel */}
      <section className="w-72 shrink-0 bg-card border-r border-border flex flex-col">
        <header className="px-4 h-14 flex items-center justify-between border-b border-border">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {tab === "chats" ? "Conversations" : tab === "friends" ? "Friends" : "Find people"}
          </h2>
          {tab === "chats" && (
            <CreateGroupDialog friends={acceptedFriends} meId={user.id} onCreated={(id) => setActive({ type: "group", id })} />
          )}
        </header>
        <ScrollArea className="flex-1">
          {tab === "chats" && (
            <ChatsList
              friends={acceptedFriends}
              groups={groups}
              active={active}
              onSelect={setActive}
              presence={presence}
            />
          )}
          {tab === "friends" && (
            <FriendsList
              accepted={acceptedFriends}
              incoming={pendingIncoming}
              outgoing={pendingOutgoing}
              presence={presence}
              onMessage={(id) => { setActive({ type: "dm", id }); setTab("chats"); }}
            />
          )}
          {tab === "search" && <SearchUsers meId={user.id} />}
        </ScrollArea>
        {me && (
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            Signed in as <span className="text-foreground font-medium">@{me.username}</span>
          </div>
        )}
      </section>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col bg-background">
        {activeFriend ? (
          <ChatWindow friend={activeFriend} meId={user.id} online={presence.has(activeFriend.id)} />
        ) : activeGroup ? (
          <GroupChatWindow
            group={activeGroup}
            meId={user.id}
            members={allMembers.filter((m) => m.group_id === activeGroup.id)}
            profiles={profiles}
            friends={acceptedFriends}
            presence={presence}
            onLeft={() => setActive(null)}
          />
        ) : (
          <EmptyState onAdd={() => setTab("search")} />
        )}
      </main>
    </div>
  );
}

function RailButton({
  icon: Icon, active, onClick, label, badge,
}: {
  icon: typeof MessageCircle; active: boolean; onClick: () => void; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-xl transition",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      {badge ? (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ChatsList({
  friends, groups, active, onSelect, presence,
}: {
  friends: Profile[]; groups: Group[]; active: Active;
  onSelect: (a: Active) => void; presence: Set<string>;
}) {
  if (friends.length === 0 && groups.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground">
      No conversations yet. Add a friend or create a group to start chatting.
    </div>;
  }
  return (
    <div className="p-2 space-y-4">
      {groups.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <UsersRound className="h-3 w-3" /> Groups
          </div>
          <ul className="space-y-1">
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => onSelect({ type: "group", id: g.id })}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition",
                    active?.type === "group" && active.id === g.id
                      ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={g.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      <UsersRound className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm">{g.name}</div>
                    <div className="truncate text-xs text-muted-foreground">Group</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {friends.length > 0 && (
        <div>
          <div className="flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            <MessageCircle className="h-3 w-3" /> Direct messages
          </div>
          <ul className="space-y-1">
            {friends.map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => onSelect({ type: "dm", id: f.id })}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition",
                    active?.type === "dm" && active.id === f.id
                      ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={f.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials(f.username)}</AvatarFallback>
                    </Avatar>
                    {presence.has(f.id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[color:var(--color-online)]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm">{f.display_name || f.username}</div>
                    <div className="truncate text-xs text-muted-foreground">@{f.username}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CreateGroupDialog({
  friends, meId, onCreated,
}: { friends: Profile[]; meId: string; onCreated: (id: string) => void }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Group name is required"); return; }
    setBusy(true);
    // Use a SECURITY DEFINER RPC so group creation works regardless of
    // any client-side auth/session edge cases — the function uses auth.uid()
    // server-side and atomically creates the group + creator-as-admin row.
    const { data: g, error } = await supabase.rpc("create_group", {
      _name: trimmed,
      _description: desc.trim() || undefined,
    });

    if (error || !g) {
      setBusy(false);
      toast.error(error?.message ?? "Could not create group");
      return;
    }

    if (picked.size > 0) {
      const rows = Array.from(picked).map((uid) => ({ group_id: g.id, user_id: uid, role: "member" as const }));
      const { error: mErr } = await supabase.from("group_members").insert(rows);
      if (mErr) toast.error("Group created, but adding members failed: " + mErr.message);
    }
    setBusy(false);
    setOpen(false);
    setName(""); setDesc(""); setPicked(new Set());
    toast.success("Group created");
    qc.invalidateQueries({ queryKey: ["groups"] });
    qc.invalidateQueries({ queryKey: ["group-members"] });
    onCreated(g.id);
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="New group" title="New group">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>Create a group and add friends to it.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="group-name">Name</Label>
            <Input id="group-name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Weekend plans" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="group-desc">Description (optional)</Label>
            <Input id="group-desc" maxLength={200} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Add friends ({picked.size})</Label>
            <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border">
              {friends.length === 0 && (
                <p className="text-xs text-muted-foreground p-3">You have no friends yet — you can add members later.</p>
              )}
              {friends.map((f) => (
                <label key={f.id} className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent/40 cursor-pointer">
                  <Checkbox checked={picked.has(f.id)} onCheckedChange={() => toggle(f.id)} />
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={f.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{initials(f.username)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 text-sm">
                    <div className="truncate font-medium">{f.display_name || f.username}</div>
                    <div className="truncate text-xs text-muted-foreground">@{f.username}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name.trim()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FriendsList({
  accepted, incoming, outgoing, presence, onMessage,
}: {
  accepted: Profile[];
  incoming: { friendship: Friendship; profile: Profile }[];
  outgoing: { friendship: Friendship; profile: Profile }[];
  presence: Set<string>;
  onMessage: (id: string) => void;
}) {
  const qc = useQueryClient();

  async function respond(id: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("friendships").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(status === "accepted" ? "Friend added" : "Request declined"); qc.invalidateQueries({ queryKey: ["friendships"] }); }
  }
  async function cancel(id: string) {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["friendships"] });
  }

  return (
    <div className="p-3 space-y-5">
      {incoming.length > 0 && (
        <Section title={`Incoming requests (${incoming.length})`} icon={Inbox}>
          {incoming.map(({ friendship, profile }) => (
            <Row key={friendship.id} profile={profile} online={presence.has(profile.id)}>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[color:var(--color-online)]"
                onClick={() => respond(friendship.id, "accepted")} aria-label="Accept">
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                onClick={() => respond(friendship.id, "rejected")} aria-label="Decline">
                <X className="h-4 w-4" />
              </Button>
            </Row>
          ))}
        </Section>
      )}

      <Section title={`Friends (${accepted.length})`} icon={Users}>
        {accepted.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">You have no friends yet. Try the Find tab.</p>
        ) : accepted.map((p) => (
          <Row key={p.id} profile={p} online={presence.has(p.id)}>
            <Button size="sm" variant="ghost" onClick={() => onMessage(p.id)}>Message</Button>
          </Row>
        ))}
      </Section>

      {outgoing.length > 0 && (
        <Section title={`Sent (${outgoing.length})`} icon={UserPlus}>
          {outgoing.map(({ friendship, profile }) => (
            <Row key={friendship.id} profile={profile} online={presence.has(profile.id)}>
              <Button size="sm" variant="ghost" onClick={() => cancel(friendship.id)}>Cancel</Button>
            </Row>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-2 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ profile, online, children }: { profile: Profile; online: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent/60">
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials(profile.username)}</AvatarFallback>
        </Avatar>
        {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-[color:var(--color-online)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{profile.display_name || profile.username}</div>
        <div className="truncate text-xs text-muted-foreground">@{profile.username}</div>
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

function SearchUsers({ meId }: { meId: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.from("profiles").select("*")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq("id", meId)
        .limit(20);
      if (cancelled) return;
      if (error) toast.error(error.message);
      setResults((data as Profile[]) ?? []);
      setLoading(false);
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, meId]);

  async function addFriend(receiverId: string) {
    const { error } = await supabase.from("friendships").insert({ sender_id: meId, receiver_id: receiverId });
    if (error) {
      if (error.code === "23505") toast.error("Request already exists.");
      else toast.error(error.message);
    } else {
      toast.success("Request sent");
      qc.invalidateQueries({ queryKey: ["friendships"] });
    }
  }

  return (
    <div className="p-3 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by @username or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>
      {loading && <div className="text-xs text-muted-foreground px-2 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Searching…</div>}
      {!loading && q.length >= 2 && results.length === 0 && (
        <div className="text-xs text-muted-foreground px-2">No matches.</div>
      )}
      <div className="space-y-1">
        {results.map((p) => (
          <Row key={p.id} profile={p} online={false}>
            <Button size="sm" variant="ghost" onClick={() => addFriend(p.id)}>
              <UserPlus className="h-4 w-4 mr-1" /> Add
            </Button>
          </Row>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex-1 grid place-items-center text-center p-8">
      <div className="max-w-sm">
        <div className="mx-auto h-14 w-14 rounded-2xl grid place-items-center" style={{ background: "var(--gradient-primary)" }}>
          <MessageCircle className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Pick a conversation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a friend or a group on the left, or find someone new by their @username.
        </p>
        <Button className="mt-5" onClick={onAdd}>
          <Search className="h-4 w-4 mr-2" /> Find people
        </Button>
      </div>
    </div>
  );
}

function ChatWindow({ friend, meId, online }: { friend: Profile; meId: string; online: boolean }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const msgsQ = useQuery({
    queryKey: ["messages", meId, friend.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${meId},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${meId})`)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgsQ.data]);

  useEffect(() => {
    const unread = (msgsQ.data ?? []).filter((m) => m.receiver_id === meId && !m.read_at);
    if (unread.length === 0) return;
    supabase.from("messages").update({ read_at: new Date().toISOString() })
      .in("id", unread.map((m) => m.id)).then(() => {});
  }, [msgsQ.data, meId]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    const { error } = await supabase.from("messages").insert({
      sender_id: meId, receiver_id: friend.id, content,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      setText(content);
    } else {
      qc.invalidateQueries({ queryKey: ["messages", meId, friend.id] });
    }
  }

  return (
    <>
      <header className="h-14 px-5 border-b border-border flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarImage src={friend.avatar_url ?? undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials(friend.username)}</AvatarFallback>
          </Avatar>
          {online && <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-[color:var(--color-online)]" />}
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight truncate">{friend.display_name || friend.username}</div>
          <div className="text-xs text-muted-foreground">@{friend.username} · {online ? "online" : "offline"}</div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {msgsQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading messages…</div>
        ) : (msgsQ.data ?? []).length === 0 ? (
          <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
            <div>
              <p>This is the start of your conversation with @{friend.username}.</p>
              <p className="mt-1">Say hi 👋</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {(msgsQ.data ?? []).map((m, i, arr) => {
              const mine = m.sender_id === meId;
              const prev = arr[i - 1];
              const grouped = prev && prev.sender_id === m.sender_id &&
                (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000);
              return (
                <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words",
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm",
                    grouped && (mine ? "rounded-tr-sm" : "rounded-tl-sm")
                  )}>
                    {m.content}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-border p-4 flex items-center gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message @${friend.username}`}
          maxLength={4000}
          className="h-11"
          autoFocus
        />
        <Button type="submit" size="icon" className="h-11 w-11" disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </>
  );
}

function GroupChatWindow({
  group, meId, members, profiles, friends, presence, onLeft,
}: {
  group: Group; meId: string; members: GroupMember[];
  profiles: Record<string, Profile>; friends: Profile[];
  presence: Set<string>; onLeft: () => void;
}) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meMember = members.find((m) => m.user_id === meId);
  const isAdmin = meMember?.role === "admin";

  const msgsQ = useQuery({
    queryKey: ["group-messages", group.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("group_messages").select("*")
        .eq("group_id", group.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as GroupMessage[];
    },
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgsQ.data]);

  async function send() {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    const { error } = await supabase.from("group_messages").insert({
      group_id: group.id, sender_id: meId, content,
    });
    setSending(false);
    if (error) { toast.error(error.message); setText(content); }
    else qc.invalidateQueries({ queryKey: ["group-messages", group.id] });
  }

  const memberProfiles = members
    .map((m) => ({ member: m, profile: m.user_id === meId ? null : profiles[m.user_id] }))
    .filter((x) => x.member.user_id === meId || x.profile);

  const onlineCount = members.filter((m) => presence.has(m.user_id)).length;

  return (
    <>
      <header className="h-14 px-5 border-b border-border flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={group.avatar_url ?? undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            <UsersRound className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-tight truncate">{group.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {members.length} member{members.length === 1 ? "" : "s"} · {onlineCount} online
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Group info" onClick={() => setInfoOpen(true)}>
          <Settings2 className="h-4 w-4" />
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        {msgsQ.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading messages…</div>
        ) : (msgsQ.data ?? []).length === 0 ? (
          <div className="h-full grid place-items-center text-center text-sm text-muted-foreground">
            <div>
              <p>Welcome to <span className="text-foreground font-medium">{group.name}</span>.</p>
              <p className="mt-1">Be the first to say something 👋</p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {(msgsQ.data ?? []).map((m, i, arr) => {
              const mine = m.sender_id === meId;
              const sender = profiles[m.sender_id];
              const prev = arr[i - 1];
              const grouped = prev && prev.sender_id === m.sender_id &&
                (new Date(m.created_at).getTime() - new Date(prev.created_at).getTime() < 60_000);
              return (
                <li key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                  {!mine && !grouped && (
                    <div className="text-[11px] text-muted-foreground ml-3 mb-0.5">
                      {sender?.display_name || sender?.username || "Member"}
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap break-words",
                    mine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm",
                    grouped && (mine ? "rounded-tr-sm" : "rounded-tl-sm")
                  )}>
                    {m.content}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-border p-4 flex items-center gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${group.name}`}
          maxLength={4000}
          className="h-11"
          autoFocus
        />
        <Button type="submit" size="icon" className="h-11 w-11" disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <GroupInfoDialog
        open={infoOpen} onOpenChange={setInfoOpen}
        group={group} meId={meId} isAdmin={isAdmin}
        memberProfiles={memberProfiles}
        friends={friends}
        presence={presence}
        onLeft={() => { setInfoOpen(false); onLeft(); }}
      />
    </>
  );
}

function GroupInfoDialog({
  open, onOpenChange, group, meId, isAdmin, memberProfiles, friends, presence, onLeft,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  group: Group; meId: string; isAdmin: boolean;
  memberProfiles: { member: GroupMember; profile: Profile | null }[];
  friends: Profile[]; presence: Set<string>;
  onLeft: () => void;
}) {
  const qc = useQueryClient();
  const memberIds = new Set(memberProfiles.map((m) => m.member.user_id));
  const addable = friends.filter((f) => !memberIds.has(f.id));

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(group.name);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => { setNameDraft(group.name); setEditingName(false); }, [group.id, group.name, open]);

  async function saveName() {
    const next = nameDraft.trim();
    if (!next || next === group.name) { setEditingName(false); return; }
    setSavingName(true);
    const { error } = await supabase.from("groups")
      .update({ name: next, updated_at: new Date().toISOString() })
      .eq("id", group.id);
    setSavingName(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Group renamed");
      setEditingName(false);
      qc.invalidateQueries({ queryKey: ["groups"] });
    }
  }

  async function setRole(uid: string, role: "admin" | "member") {
    const { error } = await supabase.from("group_members")
      .update({ role }).eq("group_id", group.id).eq("user_id", uid);
    if (error) toast.error(error.message);
    else {
      toast.success(role === "admin" ? "Promoted to admin" : "Demoted to member");
      qc.invalidateQueries({ queryKey: ["group-members"] });
    }
  }

  async function addMember(uid: string) {
    const { error } = await supabase.from("group_members").insert({ group_id: group.id, user_id: uid, role: "member" });
    if (error) toast.error(error.message);
    else {
      toast.success("Member added");
      qc.invalidateQueries({ queryKey: ["group-members"] });
    }
  }
  async function removeMember(uid: string) {
    const { error } = await supabase.from("group_members").delete()
      .eq("group_id", group.id).eq("user_id", uid);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["group-members"] });
  }
  async function leave() {
    const { error } = await supabase.from("group_members").delete()
      .eq("group_id", group.id).eq("user_id", meId);
    if (error) toast.error(error.message);
    else {
      toast.success("You left the group");
      qc.invalidateQueries({ queryKey: ["group-members"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      onLeft();
    }
  }
  async function deleteGroup() {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("groups").delete().eq("id", group.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Group deleted");
      qc.invalidateQueries({ queryKey: ["groups"] });
      onLeft();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={80}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setEditingName(false); setNameDraft(group.name); } }}
              />
              <Button size="sm" onClick={saveName} disabled={savingName}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameDraft(group.name); }}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <DialogTitle className="flex-1">{group.name}</DialogTitle>
              {isAdmin && (
                <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Rename group" onClick={() => setEditingName(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
          {group.description && <DialogDescription>{group.description}</DialogDescription>}
          {!isAdmin && (
            <DialogDescription className="text-xs">Only admins can rename, manage members, change roles, or delete this group.</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
              Members ({memberProfiles.length})
            </div>
            <div className="max-h-56 overflow-y-auto rounded-md border border-border divide-y divide-border">
              {memberProfiles.map(({ member, profile }) => {
                const isMe = member.user_id === meId;
                const p = isMe ? null : profile!;
                const name = isMe ? "You" : (p?.display_name || p?.username || "Member");
                const handle = isMe ? "" : `@${p?.username ?? ""}`;
                return (
                  <div key={member.user_id} className="flex items-center gap-3 px-3 py-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                          {initials(p?.username ?? "me")}
                        </AvatarFallback>
                      </Avatar>
                      {presence.has(member.user_id) && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-[color:var(--color-online)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium flex items-center gap-2">
                        {name}
                        {member.role === "admin" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase tracking-wider">Admin</span>
                        )}
                      </div>
                      {handle && <div className="truncate text-xs text-muted-foreground">{handle}</div>}
                    </div>
                    {isAdmin && !isMe && (
                      <>
                        {member.role === "member" ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8"
                            aria-label="Promote to admin" title="Promote to admin"
                            onClick={() => setRole(member.user_id, "admin")}>
                            <Shield className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-8 w-8"
                            aria-label="Demote to member" title="Demote to member"
                            onClick={() => setRole(member.user_id, "member")}>
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                          onClick={() => removeMember(member.user_id)} aria-label="Remove">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {isAdmin && (
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                Add friends
              </div>
              <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
                {addable.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3">No more friends to add.</p>
                ) : addable.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={f.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px]">{initials(f.username)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="truncate font-medium">{f.display_name || f.username}</div>
                      <div className="truncate text-xs text-muted-foreground">@{f.username}</div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => addMember(f.id)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <div>
            {isAdmin && (
              <Button variant="ghost" className="text-destructive" onClick={deleteGroup}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete group
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={leave}>
            <LeaveIcon className="h-4 w-4 mr-1" /> Leave group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
