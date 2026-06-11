import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle, Search, Users, LogOut, Send, UserPlus, Check, X, Inbox, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type Tab = "chats" | "friends" | "search";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ChatApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("chats");
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);
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

  // Profiles indexed by id for everyone involved in any friendship.
  const friendIds = useMemo(() => {
    const list = friendshipsQ.data ?? [];
    const ids = new Set<string>();
    list.forEach((f) => { ids.add(f.sender_id); ids.add(f.receiver_id); });
    if (user) ids.delete(user.id);
    return Array.from(ids);
  }, [friendshipsQ.data, user]);

  const profilesQ = useQuery({
    queryKey: ["profiles", friendIds],
    enabled: friendIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").in("id", friendIds);
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

  // --- realtime: messages + friendships + presence ---
  useEffect(() => {
    if (!user) return;

    const msgChannel = supabase
      .channel("rt-messages-" + user.id)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["messages"] });
        })
      .on("postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `sender_id=eq.${user.id}` },
        () => {
          qc.invalidateQueries({ queryKey: ["messages"] });
        })
      .subscribe();

    const friendChannel = supabase
      .channel("rt-friendships-" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
        qc.invalidateQueries({ queryKey: ["friendships"] });
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
  const activeFriend = activeFriendId ? (profilesQ.data?.[activeFriendId] ?? null) : null;

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
        <header className="px-4 h-14 flex items-center border-b border-border">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            {tab === "chats" ? "Direct messages" : tab === "friends" ? "Friends" : "Find people"}
          </h2>
        </header>
        <ScrollArea className="flex-1">
          {tab === "chats" && (
            <ChatsList
              friends={acceptedFriends}
              activeId={activeFriendId}
              onSelect={setActiveFriendId}
              presence={presence}
            />
          )}
          {tab === "friends" && (
            <FriendsList
              accepted={acceptedFriends}
              incoming={pendingIncoming}
              outgoing={pendingOutgoing}
              presence={presence}
              onMessage={(id) => { setActiveFriendId(id); setTab("chats"); }}
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

      {/* Main chat */}
      <main className="flex-1 min-w-0 flex flex-col bg-background">
        {activeFriend ? (
          <ChatWindow friend={activeFriend} meId={user.id} online={presence.has(activeFriend.id)} />
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
  friends, activeId, onSelect, presence,
}: {
  friends: Profile[]; activeId: string | null;
  onSelect: (id: string) => void; presence: Set<string>;
}) {
  if (friends.length === 0) {
    return <div className="p-6 text-sm text-muted-foreground">
      No conversations yet. Add a friend to start chatting.
    </div>;
  }
  return (
    <ul className="p-2 space-y-1">
      {friends.map((f) => (
        <li key={f.id}>
          <button
            onClick={() => onSelect(f.id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left transition",
              activeId === f.id ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
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
          Select a friend on the left to start chatting, or find someone new by their @username.
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

  // Mark received messages as read
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
