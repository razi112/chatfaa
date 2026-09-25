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
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: Search,
    title: "Find by @username",
    body: "Search anyone instantly. No phone numbers, no email lookups, no social graphs needed.",
    color: "#22d3ee",
    glow: "rgba(34,211,238,0.15)",
  },
  {
    icon: Shield,
    title: "Private by default",
    body: "Row-level security on every query. You only ever see conversations you're part of.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
  },
  {
    icon: Users,
    title: "Friend system",
    body: "Send a request, get accepted, start chatting. Intentional connections only.",
    color: "#34d399",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    icon: Globe,
    title: "Group chats",
    body: "Create groups, invite friends, manage members and admins with a few clicks.",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.15)",
  },
  {
    icon: Moon,
    title: "Built for the dark",
    body: "A focused, low-glare interface that feels at home next to your editor at 2 am.",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.15)",
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
    if (!loading && user) navigate({ to: "/feed" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden mesh-bg">

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="orb absolute -top-56 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.45) 0%, rgba(236,72,153,0.20) 45%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="orb orb-delay absolute top-1/3 -left-48 w-[550px] h-[550px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.35) 0%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="orb orb-delay-2 absolute bottom-1/4 -right-48 w-[650px] h-[650px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(236,72,153,0.30) 0%, rgba(249,115,22,0.15) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        {/* Extra mid orb */}
        <div
          className="orb-delay absolute top-2/3 left-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(168,85,247,0.20) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-14 py-4 sm:py-5">
        {/* Glass pill nav */}
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-primary)" }}>
            chatfaa
          </span>
        </div>
        <nav
          className="flex items-center gap-1 px-2 py-1.5 rounded-full"
          style={{
            background: "rgba(14,14,28,0.65)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(168,85,247,0.20)",
            boxShadow: "0 4px 24px -4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <Link to="/auth">
            <Button variant="ghost" size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-white/8 rounded-full px-4">
              Log in
            </Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button
              size="sm"
              className="gap-2 px-5 rounded-full font-semibold text-white"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow-sm)",
              }}
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28 text-center md:pt-32">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-8 animate-fade-up"
            style={{
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.35)",
              color: "#c084fc",
              boxShadow: "0 0 20px -4px rgba(168,85,247,0.25)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Real-time · No phone number · Just a username
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6 animate-fade-up-1"
          >
            Chat with anyone,
            <br className="hidden sm:block" />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              one @username away.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base md:text-xl text-muted-foreground leading-relaxed mb-10 sm:mb-12 animate-fade-up-2">
            Chatfaa is a fast, private messenger built for friends, gamers, and study groups.
            Find anyone by username — no phone, no drama. Just conversations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16 px-4 sm:px-0 animate-fade-up-3">
            <Link to="/auth" search={{ mode: "signup" } as never} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-13 px-8 text-base gap-2.5 font-semibold text-white rounded-2xl pulse-glow"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                Create your @username <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-13 px-8 text-base rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                I already have an account
              </Button>
            </Link>
          </div>

          {/* Stats */}
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

        {/* ── Mock chat preview ── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 sm:pb-28 flex justify-center">
          <div
            className="w-full rounded-3xl overflow-hidden"
            style={{
              background: "rgba(14,14,28,0.70)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid rgba(168,85,247,0.22)",
              boxShadow:
                "0 40px 120px -20px rgba(0,0,0,0.75), " +
                "0 0 0 1px rgba(168,85,247,0.12), " +
                "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.035)",
                borderBottom: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: "rgba(244,63,94,0.7)" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: "rgba(251,191,36,0.7)" }} />
              <span className="h-3 w-3 rounded-full" style={{ background: "rgba(52,211,153,0.7)" }} />
              <span className="ml-4 text-xs text-muted-foreground font-medium">chatfaa — @alex</span>
            </div>

            {/* Chat body */}
            <div className="flex" style={{ minHeight: "320px" }}>
              {/* Sidebar */}
              <div
                className="hidden sm:block w-56 shrink-0 border-r p-3 space-y-1"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  borderColor: "rgba(168,85,247,0.15)",
                }}
              >
                {[
                  { name: "alex_dev",      active: true,  online: true  },
                  { name: "sara_m",        active: false, online: true  },
                  { name: "weekend_plans", active: false, online: false, group: true },
                  { name: "john_k",        active: false, online: false },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: c.active
                        ? "rgba(168,85,247,0.18)"
                        : "transparent",
                      border: c.active ? "1px solid rgba(168,85,247,0.25)" : "1px solid transparent",
                      color: c.active ? "white" : "rgba(192,192,220,0.6)",
                    }}
                  >
                    <div className="relative">
                      <div
                        className="h-7 w-7 rounded-full grid place-items-center text-[10px] font-bold text-white shrink-0"
                        style={{
                          background: c.active
                            ? "var(--gradient-primary)"
                            : "rgba(255,255,255,0.08)",
                        }}
                      >
                        {c.group ? "G" : c.name.slice(0, 1).toUpperCase()}
                      </div>
                      {c.online && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                          style={{
                            background: "#34d399",
                            borderColor: "rgba(14,14,28,0.9)",
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
                  { me: true,  text: "welcome! no phone number needed right 😄" },
                  { me: false, text: "exactly — found you by username instantly" },
                  { me: true,  text: "that's the whole idea. clean and simple ✨" },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[65%] px-4 py-2 text-sm"
                      style={{
                        background: msg.me
                          ? "var(--gradient-primary)"
                          : "rgba(255,255,255,0.07)",
                        backdropFilter: msg.me ? "none" : "blur(12px)",
                        color: msg.me ? "white" : "rgba(240,240,255,0.90)",
                        borderRadius: msg.me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        border: msg.me
                          ? "none"
                          : "1px solid rgba(168,85,247,0.18)",
                        boxShadow: msg.me
                          ? "0 4px 16px -4px rgba(168,85,247,0.45)"
                          : "inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Input */}
                <div
                  className="mt-auto flex items-center gap-2 rounded-2xl px-4 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(168,85,247,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="flex-1 text-sm text-muted-foreground">Message @alex_dev</span>
                  <div
                    className="h-7 w-7 rounded-xl grid place-items-center"
                    style={{
                      background: "var(--gradient-primary)",
                      boxShadow: "0 0 12px -2px rgba(168,85,247,0.6)",
                    }}
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

        {/* ── Features ── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 sm:pb-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need,{" "}
              <span
                className="bg-clip-text text-transparent"
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
            {features.map(({ icon: Icon, title, body, color, glow }) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.035)",
                  backdropFilter: "blur(20px) saturate(160%)",
                  WebkitBackdropFilter: "blur(20px) saturate(160%)",
                  border: "1px solid rgba(168,85,247,0.16)",
                  boxShadow: "0 4px 24px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 65%)`,
                  }}
                />
                {/* Hover border glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 1px ${color}40, 0 8px 32px -8px ${color}30`,
                  }}
                />

                {/* Icon */}
                <div
                  className="relative grid h-11 w-11 place-items-center rounded-xl mb-5"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}35`,
                    boxShadow: `0 0 16px -4px ${color}40`,
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

        {/* ── CTA Banner ── */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-20 sm:pb-28">
          <div
            className="relative rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid rgba(168,85,247,0.28)",
              boxShadow:
                "0 20px 80px -20px rgba(168,85,247,0.35), " +
                "0 0 0 1px rgba(168,85,247,0.10), " +
                "inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            {/* Inner radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.20) 0%, transparent 65%)",
              }}
            />
            {/* Corner accent */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(236,72,153,0.18) 0%, transparent 70%)",
                filter: "blur(30px)",
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
                className="relative h-13 px-10 text-base gap-2.5 font-semibold text-white rounded-2xl"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                Create your free account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="border-t py-8 text-center text-sm text-muted-foreground"
          style={{ borderColor: "rgba(168,85,247,0.15)" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className="grid h-6 w-6 place-items-center rounded-lg"
              style={{ background: "var(--gradient-primary)" }}
            >
              <MessageCircle className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className="font-semibold bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              chatfaa
            </span>
          </div>
          © {new Date().getFullYear()} chatfaa · Fast, private, username-first messaging
        </footer>
      </main>
    </div>
  );
}
