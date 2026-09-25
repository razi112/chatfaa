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

const loginSchema = z.object({
  username: z.string().min(1, "Username required"),
  password: z.string().min(1, "Password required"),
});

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

function useUsernameCheck(value: string) {
  const [status, setStatus] = useState<UsernameStatus>("idle");

  useEffect(() => {
    const trimmed = value.trim();
    if (!trimmed) { setStatus("idle"); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) { setStatus("invalid"); return; }
    setStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .rpc("check_username_exists", { _username: trimmed });
      if (error) { console.error("Username check error:", error); setStatus("idle"); return; }
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
      checking:  { label: "Checking…",               color: "rgba(192,192,220,0.7)", bg: "rgba(255,255,255,0.06)" },
      available: { label: "✓ Available",              color: "#34d399",               bg: "rgba(52,211,153,0.12)" },
      taken:     { label: "✗ Already taken",          color: "#f43f5e",               bg: "rgba(244,63,94,0.12)"  },
      invalid:   { label: "3-20 chars: a-z, 0-9, _", color: "#fbbf24",               bg: "rgba(251,191,36,0.12)" },
    },
    login: {
      checking:  { label: "Checking…",            color: "rgba(192,192,220,0.7)", bg: "rgba(255,255,255,0.06)" },
      available: { label: "✗ Username not found", color: "#f43f5e",               bg: "rgba(244,63,94,0.12)"  },
      taken:     { label: "✓ Username found",     color: "#34d399",               bg: "rgba(52,211,153,0.12)" },
      invalid:   { label: "3-20 chars: a-z, 0-9, _", color: "#fbbf24",           bg: "rgba(251,191,36,0.12)" },
    },
  };

  const { label, color, bg } = config[mode][status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium"
      style={{ color, background: bg, border: `1px solid ${color}40` }}
    >
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
        if (signUpData.session) {
          toast.success("Account created! Welcome to chatfaa 🎉");
          navigate({ to: "/feed" });
          return;
        }
        toast.success("Check your email to confirm your account, then log in.");
        setMode("login");
        setShowPassword(false);
        setForm({ username: parsed.data.username, email: "", password: "" });
      } else {
        const parsed = loginSchema.safeParse({ username: form.username, password: form.password });
        if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }

        const { data: profile, error: lookupErr } = await supabase
          .from("profiles")
          .select("email")
          .ilike("username", parsed.data.username.trim())
          .maybeSingle() as unknown as { data: { email: string } | null; error: unknown };

        if (lookupErr) { console.error("Profile lookup error:", lookupErr); toast.error("Login failed — please try again."); return; }
        if (!profile?.email) { toast.error("No account found with that username."); return; }

        const { error } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: parsed.data.password,
        });
        if (error) {
          if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("credentials")) {
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
    <div className="min-h-screen flex bg-background text-foreground overflow-x-hidden mesh-bg">

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="orb absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.40) 0%, rgba(236,72,153,0.18) 50%, transparent 70%)",
            filter: "blur(65px)",
          }}
        />
        <div
          className="orb orb-delay absolute bottom-0 right-0 w-[550px] h-[550px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(236,72,153,0.25) 0%, rgba(99,102,241,0.15) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        <div
          className="orb-delay-2 absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.22) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* ── Left decorative panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(32px) saturate(160%)",
          WebkitBackdropFilter: "blur(32px) saturate(160%)",
          borderRight: "1px solid rgba(168,85,247,0.18)",
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 25% 20%, rgba(124,58,237,0.18) 0%, transparent 55%)," +
              "radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.12) 0%, transparent 50%)",
          }}
        />
        {/* Top-right accent orb */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(168,85,247,0.25) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3 z-10">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span
            className="text-xl font-bold tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            chatfaa
          </span>
        </Link>

        {/* Body copy */}
        <div className="relative z-10 space-y-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
              Chat without limits,
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                share without borders.
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect with friends using just a username. Real-time, private, and beautifully fast.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              "No phone number required",
              "Login with just your @username",
              "Real-time messages & presence",
              "Group chats with admin controls",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div
                  className="h-5 w-5 rounded-full grid place-items-center shrink-0"
                  style={{
                    background: "rgba(168,85,247,0.15)",
                    border: "1px solid rgba(168,85,247,0.40)",
                    boxShadow: "0 0 8px -2px rgba(168,85,247,0.35)",
                  }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">{feat}</span>
              </div>
            ))}
          </div>

          {/* Glass stat tiles */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "Real-time", label: "Delivery" },
              { value: "< 30s",     label: "Setup time" },
              { value: "Zero",      label: "Phone needed" },
              { value: "∞",         label: "Usernames" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(168,85,247,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="text-lg font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: "var(--gradient-primary)" }}
                >
                  {value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-muted-foreground/50">© {new Date().getFullYear()} chatfaa</p>
      </div>

      {/* ── Right — form panel ── */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md">

          <Link
            to="/"
            className="lg:hidden inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          {/* Glass card */}
          <div
            className="rounded-3xl p-5 sm:p-6 md:p-8 auth-card animate-scale-in"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(168,85,247,0.22)",
              boxShadow:
                "0 32px 80px -20px rgba(0,0,0,0.65), " +
                "0 0 0 1px rgba(168,85,247,0.08), " +
                "inset 0 1px 0 rgba(255,255,255,0.10), " +
                "inset 0 -1px 0 rgba(168,85,247,0.06)",
            }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <span
                className="text-lg font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                chatfaa
              </span>
            </div>

            {/* Tab switcher */}
            <div
              className="flex rounded-xl p-1 mb-7"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.14)" }}
            >
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    mode === m
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={
                    mode === m
                      ? {
                          background: "rgba(168,85,247,0.18)",
                          border: "1px solid rgba(168,85,247,0.28)",
                          boxShadow: "0 2px 12px -4px rgba(168,85,247,0.40), inset 0 1px 0 rgba(255,255,255,0.10)",
                        }
                      : {}
                  }
                >
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

              {/* Username */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <UsernameBadge status={usernameStatus} mode={mode} />
                </div>
                <div
                  className="flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring/60"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border:
                      usernameStatus === "available"
                        ? `1px solid ${mode === "signup" ? "rgba(52,211,153,0.6)" : "rgba(244,63,94,0.6)"}`
                        : usernameStatus === "taken"
                        ? `1px solid ${mode === "signup" ? "rgba(244,63,94,0.6)" : "rgba(52,211,153,0.6)"}`
                        : "1px solid rgba(168,85,247,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
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

              {/* Email (signup only) */}
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
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(168,85,247,0.22)",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div
                  className="flex items-center rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-ring/60"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(168,85,247,0.22)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                >
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
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pr-4 pl-2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-semibold mt-2 text-white transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
                disabled={
                  loading ||
                  (mode === "signup" && (usernameStatus === "taken" || usernameStatus === "checking"))
                }
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait…
                  </span>
                ) : mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  New to chatfaa?{" "}
                  <button
                    onClick={() => switchMode("signup")}
                    className="font-medium text-primary hover:underline"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    onClick={() => switchMode("login")}
                    className="font-medium text-primary hover:underline"
                  >
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
