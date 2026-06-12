import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageCircle, Eye, EyeOff, ArrowLeft, AtSign, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — chatfaa" }] }),
  component: AuthPage,
});

const signupSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9_]{3,20}$/, "3-20 chars: letters, numbers, underscores only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(72),
});

// Login: username + password (we resolve email server-side)
const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

// ─── Username availability hook (same logic as in chat.tsx) ───
type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function useUsernameCheck(value: string) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) { setStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) { setStatus("invalid"); return; }
    setStatus("checking");
    const timer = setTimeout(async () => {
      // Use a SECURITY DEFINER RPC so anon callers can reliably check
      // existence regardless of RLS policies on the profiles table.
      const { data, error } = await supabase
        .rpc("check_username_exists", { _username: trimmed });
      if (error) {
        console.error("Username check error:", error);
        setStatus("idle");
        return;
      }
      // data is boolean: true = username exists (taken), false = free
      setStatus(data ? "taken" : "available");
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  return status;
}

function UsernameBadge({ status, mode }: { status: UsernameStatus; mode: "login" | "signup" }) {
  if (status === "idle") return null;

  const config = {
    signup: {
      checking:  { label: "Checking…",               color: "oklch(0.70 0.015 268)", bg: "oklch(0.22 0.016 268)" },
      available: { label: "✓ Available",              color: "oklch(0.76 0.19 152)",  bg: "oklch(0.20 0.08 152 / 0.3)" },
      taken:     { label: "✗ Already taken",          color: "oklch(0.62 0.22 25)",   bg: "oklch(0.62 0.22 25 / 0.15)" },
      invalid:   { label: "3-20 chars: a-z, 0-9, _", color: "oklch(0.78 0.18 60)",   bg: "oklch(0.78 0.18 60 / 0.12)" },
    },
    login: {
      checking:  { label: "Checking…",       color: "oklch(0.70 0.015 268)", bg: "oklch(0.22 0.016 268)" },
      available: { label: "✗ Username not found", color: "oklch(0.62 0.22 25)",   bg: "oklch(0.62 0.22 25 / 0.15)" },
      taken:     { label: "✓ Username found", color: "oklch(0.76 0.19 152)",  bg: "oklch(0.20 0.08 152 / 0.3)" },
      invalid:   { label: "3-20 chars: a-z, 0-9, _", color: "oklch(0.78 0.18 60)",   bg: "oklch(0.78 0.18 60 / 0.12)" },
    },
  };

  const { label, color, bg } = config[mode][status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium"
      style={{ color, background: bg, border: `1px solid ${color}40` }}>
      {status === "checking" && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
      {label}
    </span>
  );
}

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const { user } = useAuth();
  const navigate = useNavigate();

  // Live username check — active in both modes
  const usernameStatus = useUsernameCheck(form.username);

  useEffect(() => { if (user) navigate({ to: "/feed" }); }, [user, navigate]);

  function switchMode(m: "login" | "signup") {
    setMode(m);
    setForm({ username: "", email: "", password: "" });
    setShowPassword(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
        if (usernameStatus === "taken") { toast.error("That username is already taken."); return; }
        if (usernameStatus === "checking") { toast.error("Still checking username availability…"); return; }

        const { data: signUpData, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
            data: { username: parsed.data.username, display_name: parsed.data.username },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) toast.error("Email already in use. Try logging in.");
          else toast.error(error.message);
          return;
        }
        // If session is immediately available, navigate (email confirm disabled)
        if (signUpData.session) {
          toast.success("Account created! Welcome to chatfaa 🎉");
          navigate({ to: "/feed" });
          return;
        }
        // Email confirmation required
        toast.success("Check your email to confirm your account, then log in.");
        setMode("login");
        setShowPassword(false);
        setForm({ username: parsed.data.username, email: "", password: "" });

      } else {
        // ── Username login: look up email directly from profiles table ──
        const parsed = loginSchema.safeParse({ username: form.username, password: form.password });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

        const { data: profile, error: lookupErr } = await supabase
          .from("profiles")
          .select("email")
          .ilike("username", parsed.data.username.trim())
          .maybeSingle() as unknown as { data: { email: string } | null; error: unknown };

        if (lookupErr) {
          console.error("Profile lookup error:", lookupErr);
          toast.error("Login failed — please try again.");
          return;
        }
        if (!profile?.email) {
          toast.error("No account found with that username.");
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: parsed.data.password,
        });
        if (error) {
          if (
            error.message.toLowerCase().includes("invalid") ||
            error.message.toLowerCase().includes("credentials")
          ) {
            toast.error("Wrong password. Try again.");
          } else if (error.message.toLowerCase().includes("confirm")) {
            toast.error("Please confirm your email before logging in.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        toast.success("Welcome back!");
        navigate({ to: "/feed" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0.55 0.22 280 / 0.35) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(ellipse, oklch(0.60 0.20 310 / 0.20) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* Left decorative panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, oklch(0.14 0.016 268) 0%, oklch(0.11 0.014 268) 100%)", borderRight: "1px solid oklch(0.22 0.016 268)" }}>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 30%, oklch(0.55 0.22 280 / 0.15) 0%, transparent 60%)" }} />
        <Link to="/" className="relative flex items-center gap-3 z-10">
          <div className="grid h-10 w-10 place-items-center rounded-2xl"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">chatfaa</span>
        </Link>
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Chat without limits,<br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                share without borders.
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect with friends using just a username. Real-time, private, and beautifully fast.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "No phone number required",
              "Login with just your @username",
              "Real-time messages & presence",
              "Group chats with admin controls",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full grid place-items-center shrink-0"
                  style={{ background: "oklch(0.65 0.22 280 / 0.2)", border: "1px solid oklch(0.65 0.22 280 / 0.4)" }}>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-primary)" }} />
                </div>
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground/60">© {new Date().getFullYear()} chatfaa</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="rounded-3xl p-8"
            style={{
              background: "linear-gradient(145deg, oklch(0.16 0.016 268 / 0.95), oklch(0.13 0.014 268 / 0.98))",
              border: "1px solid oklch(0.28 0.018 268 / 0.7)",
              boxShadow: "0 24px 80px -20px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.22 280 / 0.05)",
            }}>
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">chatfaa</span>
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-xl p-1 mb-7" style={{ background: "oklch(0.12 0.014 268)" }}>
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => switchMode(m)}
                  className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    mode === m
                      ? "bg-card text-foreground shadow-[0_2px_8px_-2px_oklch(0_0_0/0.4)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}>
                  {m === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Enter your @username and password to continue."
                  : "Pick a username — that's how friends will find you."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* @username — both modes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <UsernameBadge status={usernameStatus} mode={mode} />
                </div>
                <div className="flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring"
                  style={{
                    background: "var(--color-input)",
                    border: usernameStatus === "available"
                      ? `1px solid ${mode === "signup" ? "oklch(0.76 0.19 152 / 0.7)" : "oklch(0.62 0.22 25 / 0.7)"}`
                      : usernameStatus === "taken"
                      ? `1px solid ${mode === "signup" ? "oklch(0.62 0.22 25 / 0.7)" : "oklch(0.76 0.19 152 / 0.7)"}`
                      : "1px solid var(--color-border)",
                  }}>
                  <span className="pl-3 pr-1 text-muted-foreground shrink-0">
                    <AtSign className="h-4 w-4" />
                  </span>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="your_username"
                    className="border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none"
                    required
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {/* Email — signup only */}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="rounded-xl"
                  />
                </div>
              )}

              {/* Password — both modes */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring"
                  style={{ background: "var(--color-input)", border: "1px solid var(--color-border)" }}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="border-0 bg-transparent focus-visible:ring-0 shadow-none rounded-none flex-1"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)}
                    className="pr-4 pl-2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold mt-2 shadow-[var(--shadow-glow)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: "var(--gradient-primary)" }}
                disabled={loading || (mode === "signup" && (usernameStatus === "taken" || usernameStatus === "checking"))}
              >
                {loading
                  ? <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait…
                    </span>
                  : mode === "login" ? "Log in" : "Create account"
                }
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>New to chatfaa?{" "}
                  <button onClick={() => switchMode("signup")} className="font-medium text-primary hover:underline">
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have one?{" "}
                  <button onClick={() => switchMode("login")} className="font-medium text-primary hover:underline">
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
