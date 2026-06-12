import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  MessageCircle, Search, Users, Zap, Shield, Moon,
  ArrowRight, Sparkles, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chatfaa — Real-time chat without phone numbers" },
      { name: "description", content: "Sign up with a username, find friends, and chat in real time. Private by default." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Zap,
    title: "Instant delivery",
    body: "Messages stream the moment you send them — typing indicators, read receipts, live presence.",
    color: "oklch(0.78 0.20 85)",
  },
  {
    icon: Search,
    title: "Find by @username",
    body: "Search anyone instantly. No phone numbers, no email lookups, no social graphs needed.",
    color: "oklch(0.72 0.20 200)",
  },
  {
    icon: Shield,
    title: "Private by default",
    body: "Row-level security on every query. You only ever see conversations you're part of.",
    color: "oklch(0.70 0.20 310)",
  },
  {
    icon: Users,
    title: "Friend system",
    body: "Send a request, get accepted, start chatting. Intentional connections only.",
    color: "oklch(0.76 0.19 152)",
  },
  {
    icon: Globe,
    title: "Group chats",
    body: "Create groups, invite friends, manage members and admins with a few clicks.",
    color: "oklch(0.74 0.20 240)",
  },
  {
    icon: Moon,
    title: "Built for the dark",
    body: "A focused, low-glare interface that feels at home next to your editor at 2 am.",
    color: "oklch(0.68 0.18 280)",
  },
];

const stats = [
  { label: "Messages sent", value: "Real-time" },
  { label: "Phone number required", value: "Zero" },
  { label: "Setup time", value: "< 30s" },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/chat" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="orb absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(ellipse, oklch(0.55 0.22 280 / 0.5) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="orb orb-delay absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, oklch(0.65 0.20 320 / 0.6) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="orb absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, oklch(0.60 0.20 240 / 0.5) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-14 py-5">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">chatfaa</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button
              size="sm"
              className="gap-2 px-5 shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-28 text-center md:pt-32">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-medium mb-8"
            style={{
              background: "oklch(0.65 0.22 280 / 0.12)",
              border: "1px solid oklch(0.65 0.22 280 / 0.3)",
              color: "oklch(0.80 0.15 280)",
            }}>
            <Sparkles className="h-3.5 w-3.5" />
            Real-time · No phone number · Just a username
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
            Chat with anyone,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              one @username away.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
            Chatfaa is a fast, private messenger built for friends, gamers, and study groups.
            Find anyone by username — no phone, no drama. Just conversations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button
                size="lg"
                className="h-13 px-8 text-base gap-2.5 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Create your @username <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base border-border/60 hover:bg-card"
              >
                I already have an account
              </Button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-10 text-center">
            {stats.map(({ label, value }) => (
              <div key={label}>
                <div
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mock chat preview */}
        <section className="mx-auto max-w-4xl px-6 pb-28 flex justify-center">
          <div
            className="w-full rounded-3xl overflow-hidden shadow-[0_40px_120px_-20px_oklch(0_0_0/0.7)]"
            style={{ border: "1px solid oklch(0.30 0.018 268 / 0.7)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-4" style={{ background: "oklch(0.13 0.015 268)" }}>
              <span className="h-3 w-3 rounded-full bg-destructive/70" />
              <span className="h-3 w-3 rounded-full" style={{ background: "oklch(0.75 0.18 85 / 0.7)" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: "oklch(0.75 0.18 150 / 0.7)" }} />
              <span className="ml-4 text-xs text-muted-foreground font-medium">chatfaa — @alex</span>
            </div>
            {/* Chat body */}
            <div
              className="flex"
              style={{ background: "oklch(0.12 0.014 268)", minHeight: "320px" }}
            >
              {/* Sidebar */}
              <div
                className="w-56 shrink-0 border-r p-3 space-y-1"
                style={{ background: "oklch(0.10 0.013 268)", borderColor: "oklch(0.22 0.016 268)" }}
              >
                {[
                  { name: "alex_dev", active: true, online: true },
                  { name: "sara_m", active: false, online: true },
                  { name: "weekend_plans", active: false, online: false, group: true },
                  { name: "john_k", active: false, online: false },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: c.active ? "oklch(0.65 0.22 280 / 0.15)" : "transparent",
                      color: c.active ? "white" : "oklch(0.65 0.018 268)",
                    }}
                  >
                    <div className="relative">
                      <div
                        className="h-7 w-7 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
                        style={{ background: c.active ? "var(--gradient-primary)" : "oklch(0.22 0.018 268)" }}
                      >
                        {c.group ? "G" : c.name.slice(0, 1).toUpperCase()}
                      </div>
                      {c.online && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                          style={{
                            background: "oklch(0.76 0.19 152)",
                            borderColor: "oklch(0.10 0.013 268)",
                          }}
                        />
                      )}
                    </div>
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
              {/* Messages */}
              <div className="flex-1 flex flex-col px-6 py-5 gap-3">
                {[
                  { me: false, text: "hey! just joined chatfaa 👋" },
                  { me: true, text: "welcome! no phone number needed right 😄" },
                  { me: false, text: "exactly — found you by username instantly" },
                  { me: true, text: "that's the whole idea. clean and simple ✨" },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[65%] rounded-2xl px-4 py-2 text-sm"
                      style={{
                        background: msg.me
                          ? "var(--gradient-primary)"
                          : "oklch(0.18 0.016 268)",
                        color: msg.me ? "white" : "oklch(0.90 0.005 260)",
                        borderRadius: msg.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {/* Input */}
                <div
                  className="mt-auto flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ background: "oklch(0.18 0.016 268)", border: "1px solid oklch(0.26 0.018 268)" }}
                >
                  <span className="flex-1 text-sm text-muted-foreground">Message @alex_dev</span>
                  <div
                    className="h-7 w-7 rounded-lg grid place-items-center"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white fill-none stroke-current stroke-2">
                      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need,
              <span
                className="bg-clip-text text-transparent ml-2"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                nothing you don't.
              </span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Built lean and focused. Every feature earns its place.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body, color }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "oklch(0.15 0.015 268 / 0.8)",
                  border: "1px solid oklch(0.25 0.018 268 / 0.7)",
                  boxShadow: "0 4px 24px -8px oklch(0 0 0 / 0.4)",
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${color}18 0%, transparent 60%)`,
                  }}
                />
                <div
                  className="relative grid h-11 w-11 place-items-center rounded-xl mb-5"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="relative font-semibold text-base mb-2">{title}</h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-4xl px-6 pb-28">
          <div
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, oklch(0.20 0.020 270) 0%, oklch(0.16 0.018 268) 100%)",
              border: "1px solid oklch(0.30 0.020 268 / 0.7)",
              boxShadow: "0 20px 80px -20px oklch(0.65 0.22 280 / 0.3)",
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "radial-gradient(ellipse at top, oklch(0.65 0.22 280 / 0.12) 0%, transparent 60%)",
              }}
            />
            <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to start chatting?
            </h2>
            <p className="relative text-muted-foreground mb-8 max-w-md mx-auto">
              Pick a username and you're in. No installs, no app stores, no waiting.
            </p>
            <Link to="/auth" search={{ mode: "signup" } as never}>
              <Button
                size="lg"
                className="relative h-13 px-10 text-base gap-2.5 shadow-[var(--shadow-glow)]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Create your free account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="border-t py-8 text-center text-sm text-muted-foreground"
          style={{ borderColor: "oklch(0.22 0.016 268)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="grid h-6 w-6 place-items-center rounded-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <MessageCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-foreground/70">chatfaa</span>
          </div>
          © {new Date().getFullYear()} chatfaa · Fast, private, username-first messaging
        </footer>
      </main>
    </div>
  );
}
