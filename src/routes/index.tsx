import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MessageCircle, Search, Users, Zap, Shield, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChatSphere — Real-time chat without phone numbers" },
      { name: "description", content: "Sign up with a username, find friends, and chat in real time. Private by default." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/chat" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground font-bold" style={{ background: "var(--gradient-primary)" }}>
            <MessageCircle className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ChatSphere</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Log in</Button></Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button size="sm" className="shadow-[var(--shadow-glow)]">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-24 text-center md:pt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[color:var(--color-online)]" />
            Real-time. No phone number. Just a username.
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            Chat with anyone,
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
              just a username away.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            ChatSphere is a fast, private messenger built for friends, gamers and study groups.
            Find people by @username, send a friend request, and start talking — instantly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button size="lg" className="h-12 px-7 text-base shadow-[var(--shadow-glow)]">
                Create your @username
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="ghost" className="h-12 px-7 text-base">
                I have an account
              </Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, title: "Real-time", body: "Messages stream the moment you send them. Typing indicators, read receipts, online status." },
            { icon: Search, title: "Find by @username", body: "Search anyone instantly. No phone numbers, no email lookups, no social graphs." },
            { icon: Shield, title: "Private by default", body: "RLS-backed permissions. You only see chats with people you've added." },
            { icon: Users, title: "Friend system", body: "Send a request, get accepted, start chatting. Simple and intentional." },
            { icon: Moon, title: "Built for the dark", body: "A focused, low-glare interface that feels at home next to your editor." },
            { icon: MessageCircle, title: "Free to use", body: "No installs, no app store. Open the page, sign in, you're chatting." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6 transition hover:bg-secondary">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} ChatSphere · Built on Lovable
        </footer>
      </main>
    </div>
  );
}
