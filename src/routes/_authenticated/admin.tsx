import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Database, Users, Trash2, RefreshCw, Play,
  BarChart2, AlertTriangle, CheckCircle2, Loader2, Shield,
  Info, ChevronRight, Zap, FileText, Film, Heart, MessageCircle,
  UserCheck, Terminal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — chatfaa" }] }),
  component: AdminPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────────
type SeedStats = {
  profiles:      number;
  posts:         number;
  reels:         number;
  follows:       number;
  post_likes:    number;
  post_comments: number;
  reel_likes:    number;
  reel_comments: number;
};

type LogLine = { ts: string; level: "info" | "ok" | "error" | "warn"; msg: string };

// ─── Env guard ─────────────────────────────────────────────────────────────────
const SEED_DATA_MODE = import.meta.env.VITE_SEED_DATA_MODE === "true";

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  color = "violet",
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: "violet" | "pink" | "blue" | "green" | "amber";
}) {
  const colors: Record<string, { bg: string; text: string; glow: string }> = {
    violet: { bg: "rgba(168,85,247,0.12)", text: "#c084fc", glow: "rgba(168,85,247,0.25)" },
    pink:   { bg: "rgba(236,72,153,0.12)", text: "#f472b6", glow: "rgba(236,72,153,0.25)" },
    blue:   { bg: "rgba(59,130,246,0.12)", text: "#60a5fa", glow: "rgba(59,130,246,0.25)" },
    green:  { bg: "rgba(34,197,94,0.12)",  text: "#4ade80", glow: "rgba(34,197,94,0.25)"  },
    amber:  { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", glow: "rgba(245,158,11,0.25)" },
  };
  const c = colors[color];

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2"
      style={{
        background: "rgba(14,10,28,0.7)",
        border: "1px solid rgba(168,85,247,0.14)",
      }}
    >
      <div
        className="h-9 w-9 rounded-xl grid place-items-center"
        style={{ background: c.bg, boxShadow: `0 0 12px -4px ${c.glow}` }}
      >
        <Icon className="h-4 w-4" style={{ color: c.text }} />
      </div>
      <p className="text-2xl font-bold tabular-nums" style={{ color: c.text }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Log terminal ──────────────────────────────────────────────────────────────
function LogTerminal({ lines }: { lines: LogLine[] }) {
  if (lines.length === 0) return null;

  const levelStyle: Record<string, string> = {
    info:  "text-muted-foreground",
    ok:    "text-green-400",
    error: "text-red-400",
    warn:  "text-amber-400",
  };
  const levelPrefix: Record<string, string> = {
    info: "›",
    ok:   "✓",
    error: "✗",
    warn: "⚠",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden font-mono text-xs"
      style={{
        background: "rgba(0,0,0,0.5)",
        border: "1px solid rgba(168,85,247,0.18)",
      }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: "rgba(168,85,247,0.14)", background: "rgba(168,85,247,0.06)" }}
      >
        <Terminal className="h-3.5 w-3.5 text-violet-400" />
        <span className="text-violet-300 text-[11px] font-semibold tracking-wider uppercase">Seed Log</span>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto space-y-1">
        {lines.map((l, i) => (
          <div key={i} className={cn("flex gap-2", levelStyle[l.level])}>
            <span className="opacity-40 shrink-0 w-[68px]">{l.ts}</span>
            <span className="shrink-0 w-3">{levelPrefix[l.level]}</span>
            <span>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{
          background: "rgba(14,10,28,0.98)",
          border: "1px solid rgba(168,85,247,0.25)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.08)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
            style={{
              background: destructive ? "rgba(239,68,68,0.15)" : "rgba(168,85,247,0.15)",
              border: `1px solid ${destructive ? "rgba(239,68,68,0.3)" : "rgba(168,85,247,0.3)"}`,
            }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: destructive ? "#f87171" : "#c084fc" }} />
          </div>
          <div>
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl text-sm font-medium border transition-all hover:bg-white/5"
            style={{ borderColor: "rgba(168,85,247,0.2)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: destructive
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "var(--gradient-primary)",
              boxShadow: destructive
                ? "0 4px 16px -4px rgba(239,68,68,0.5)"
                : "var(--shadow-glow)",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
function AdminPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<"generate" | "reset" | "remove" | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [confirm, setConfirm] = useState<"generate" | "reset" | "remove" | null>(null);

  // Fetch seed stats via RPC
  const statsQ = useQuery<SeedStats>({
    queryKey: ["seed-stats"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("count_seed_stats");
      if (error) throw error;
      return data as SeedStats;
    },
    refetchInterval: 10_000,
  });

  const stats: SeedStats = statsQ.data ?? {
    profiles: 0, posts: 0, reels: 0, follows: 0,
    post_likes: 0, post_comments: 0, reel_likes: 0, reel_comments: 0,
  };

  const totalRows =
    stats.profiles + stats.posts + stats.reels + stats.follows +
    stats.post_likes + stats.post_comments + stats.reel_likes + stats.reel_comments;

  function log(level: LogLine["level"], msg: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { ts, level, msg }]);
  }

  const callSeedRpc = useCallback(async (action: "generate" | "reset" | "remove") => {
    setBusy(action);
    setLogs([]);

    try {
      if (action === "remove" || action === "reset") {
        log("info", "Calling remove_seed_data()…");
        const { error } = await (supabase as any).rpc("remove_seed_data");
        if (error) throw error;
        log("ok", "All seed data removed.");
      }

      if (action === "generate" || action === "reset") {
        log("info", "Calling generate_seed_data(2000) — runs inside the DB…");
        log("info", "This may take 30–90 seconds, please wait…");
        const { data, error } = await (supabase as any).rpc("generate_seed_data", { target_users: 2000 });
        if (error) throw error;
        const s = data ?? {};
        log("ok", `Profiles: ${s.profiles}  Posts: ${s.posts}  Reels: ${s.reels}`);
        log("ok", `Follows: ${s.follows}  Likes: ${(s.post_likes ?? 0) + (s.reel_likes ?? 0)}  Comments: ${(s.post_comments ?? 0) + (s.reel_comments ?? 0)}`);
        log("ok", "✅ Seed generation complete!");
        // skip the old manual insert block below
      }

      if (false as boolean) {
        // ── legacy manual-insert block (replaced by generate_seed_data RPC) ──
        log("info", "Inserting @chatfaa_official profile…");

        // ── @chatfaa_official ────────────────────────────────────────────────
        const officialUsername = "chatfaa_official";
        const { data: existing } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("username", officialUsername)
          .maybeSingle();

        let officialId: string;
        if (existing?.id) {
          officialId = existing.id;
          await (supabase as any)
            .from("profiles")
            .update({ is_verified: true, is_manually_verified: true })
            .eq("id", officialId);
          log("info", `@chatfaa_official exists (${officialId})`);
        } else {
          officialId = crypto.randomUUID();
          const { error } = await (supabase as any).from("profiles").insert({
            id: officialId,
            username: officialUsername,
            display_name: "Chatfaa",
            bio: "The official Chatfaa account 🚀 Connect, share, and express yourself.",
            avatar_url: "https://picsum.photos/seed/chatfaa_official/150/150",
            is_verified: true,
            is_manually_verified: true,
            is_seed_user: false,
            account_type: "business",
            status: "online",
            last_seen: new Date().toISOString(),
          });
          if (error) throw new Error(`@chatfaa_official: ${error.message}`);
          log("ok", `@chatfaa_official created (${officialId})`);
        }

        // ── Seed profiles ────────────────────────────────────────────────────
        const TARGET = 2000;
        const BATCH = 100;
        log("info", `Generating ${TARGET} seed profiles…`);

        const firstNames = ["Alex","Jordan","Riley","Taylor","Morgan","Casey","Quinn","Avery","Jamie","Drew","Blake","Cameron","Hayden","Reese","Skylar","Peyton","Logan","Parker","Emerson","Dakota","Sage","River","Rowan","Finley","Harper","Elliot","Kendall","Sloane","Aria","Mia","Liam","Noah","Emma","Olivia","Lucas","Mason","Chloe","Isabella","Ethan","Aiden","Amara","Zara","Priya","Anaya","Kenji","Yuki","Fatima","Omar","Khalid","Aisha","Caden","Jaxon","Nora","Stella","Felix","Oscar","Luna","Iris","Theo","Leo","Nia","Imani","Kofi","Sadia","Yusuf","Layla","Rania","Tariq","Amani","Soren","Ingrid","Henrik","Astrid","Lars","Sigrid","Bjorn","Elsa","Freya","Magnus","Liv","Mei","Jin","Hana","Suki","Takeshi","Hiroshi","Yuna","Sora","Riku","Nami"];
        const lastNames  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Anderson","Martinez","Taylor","Thomas","Moore","Jackson","Martin","Lee","Perez","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Ahmed","Khan","Patel","Singh","Kumar","Sharma","Gupta","Rao","Nair","Pillai","Kimura","Tanaka","Watanabe","Sato","Suzuki","Ito","Kobayashi","Yamamoto","Nakamura","Abe","Okafor","Mensah","Diallo","Traore","Coulibaly","Toure","Camara","Bah","Sy","Fall","Andersen","Jensen","Nielsen","Hansen","Pedersen","Christensen","Larsen","Sorensen","Rasmussen","Jorgensen"];
        const interests  = ["photography","travel","cooking","fitness","music","art","tech","gaming","fashion","reading","hiking","yoga","coffee","design","writing","movies","dancing","cycling","swimming","climbing","sustainability","mindfulness","DIY","astronomy","botany","poetry","theater","animation","podcasting"];
        const bios       = ["just a soul wandering through pixels 🌊","coffee first, everything else second ☕","creating things that don't exist yet 🛠️","life is short. eat the cake 🍰","between adventures 🏔️","making memories, not excuses ✨","photographer by day, dreamer by night 📷","chasing sunsets and good vibes 🌅","fitness enthusiast | food lover | world traveler 🌍","turning ideas into reality 💡","plant mom 🌿 | book nerd 📚 | cat person 🐱","always hungry, always curious 🍜","building stuff that matters ⚡","born to explore, forced to work 😄","living my best pixel life 🎨","music is life 🎵 everything else is details","coffee ☕ code 💻 repeat","not all who wander are lost ✈️","making the world a slightly better place 🌱","here for the vibes and the snacks 🍕","probably overthinking this bio 🤔","design is how it works 🎯","good food, good friends, good life 🥂","storyteller. observer. human. 📝","less talking, more doing 🚀"];
        const captions   = ["Golden hour never disappoints ✨","This view though 🌅","Good vibes only 🌊","Found my happy place 🌿","Making every moment count 💫","The adventure continues 🏔️","Sunday mood 🌸","Life is too short for bad coffee ☕","Catching feels and sunsets 🌄","Not all classrooms have four walls 🌍","Just breathe 🍃","Working on something special 🛠️","Details make the difference 🎯","Every day is a new beginning 🌱","The world is your canvas 🎨","Grateful for this view 🙏","No filter needed today 📸","Living for moments like this 🤍","Sometimes you just need to step outside 🌲","Creating > consuming 💡"];
        const reelCaps   = ["POV: you finally got outside today 🌿","this is your sign to take the trip ✈️","day in my life ☀️","things that just make sense 🧠","small moments, big memories 💛","not all heroes wear capes 🦸","we love a good transformation 🔄","when it all clicks 🎯","vibes only from here on out 🌊","the process is part of the art 🎨"];
        const comments   = ["this is so good 🔥","absolutely stunning ✨","goals 🙌","love this so much 💕","okay but wow 😍","need this in my life","incredible work 👏","this made my day 😊","pure art 🎨","obsessed with this","the vibes are immaculate 🌊","you're so talented","can't stop looking at this","this is everything","sending you love 💛","wow just wow","10/10 no notes","I feel this deeply 🙏","literally my aesthetic","this hits different"];

        const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
        const pickN = <T,>(a: T[], n: number) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
        const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
        const ago = (days: number) => new Date(Date.now() - days * 86_400_000 - randInt(0, 43_200_000)).toISOString();

        const usedUsernames = new Set(["chatfaa_official"]);
        const seedProfiles: Record<string, unknown>[] = [];

        for (let i = 0; i < TARGET; i++) {
          const fn = pick(firstNames);
          const ln = pick(lastNames);
          let username = `${fn.toLowerCase()}${ln.toLowerCase()}${randInt(1, 999)}`;
          while (usedUsernames.has(username)) {
            username = `${fn.toLowerCase()}${ln.toLowerCase()}${randInt(1, 9999)}`;
          }
          usedUsernames.add(username);
          const ints = pickN(interests, randInt(2, 4)).join(" • ");
          seedProfiles.push({
            id: crypto.randomUUID(),
            username,
            display_name: `${fn} ${ln}`,
            bio: `${pick(bios)} | ${ints}`.slice(0, 150),
            avatar_url: `https://picsum.photos/seed/user${i}/150/150`,
            is_seed_user: true,
            is_verified: Math.random() < 0.03,
            account_type: Math.random() < 0.15 ? "creator" : Math.random() < 0.05 ? "business" : "personal",
            status: "offline",
            last_seen: ago(randInt(0, 30)),
            created_at: ago(randInt(1, 180)),
          });
        }

        // Insert profiles in batches
        let done = 0;
        for (let b = 0; b < seedProfiles.length; b += BATCH) {
          const chunk = seedProfiles.slice(b, b + BATCH);
          const { error } = await (supabase as any).from("profiles").insert(chunk);
          if (error) throw new Error(`profiles batch: ${error.message}`);
          done += chunk.length;
        }
        log("ok", `${done} seed profiles created.`);
        const seedIds = seedProfiles.map((p) => p.id as string);

        // ── Follows: all → official ──────────────────────────────────────────
        log("info", "Creating follows → @chatfaa_official…");
        const followsToOfficial = seedIds.map((sid) => ({
          id: crypto.randomUUID(),
          follower_id: sid,
          following_id: officialId,
          status: "accepted",
          created_at: ago(randInt(1, 120)),
        }));
        for (let b = 0; b < followsToOfficial.length; b += BATCH) {
          const { error } = await (supabase as any).from("follows").insert(followsToOfficial.slice(b, b + BATCH));
          if (error) throw new Error(`follows batch: ${error.message}`);
        }
        log("ok", `${followsToOfficial.length} follows → @chatfaa_official.`);

        // ── Cross-follows ────────────────────────────────────────────────────
        log("info", "Creating cross-follows between seed users…");
        const crossFollows: Record<string, unknown>[] = [];
        const followSet = new Set<string>();
        for (const sid of seedIds) {
          const targets = pickN(seedIds.filter((id) => id !== sid), randInt(5, 60));
          for (const tid of targets) {
            const key = `${sid}:${tid}`;
            if (!followSet.has(key)) {
              followSet.add(key);
              crossFollows.push({ id: crypto.randomUUID(), follower_id: sid, following_id: tid, status: "accepted", created_at: ago(randInt(1, 90)) });
            }
          }
        }
        for (let b = 0; b < crossFollows.length; b += BATCH) {
          const { error } = await (supabase as any).from("follows").insert(crossFollows.slice(b, b + BATCH));
          if (error) throw new Error(`cross-follows batch: ${error.message}`);
        }
        log("ok", `${crossFollows.length} cross-follows created.`);

        // ── Posts ────────────────────────────────────────────────────────────
        log("info", "Creating posts (1–4 per user)…");
        const posts: Record<string, unknown>[] = [];
        for (let i = 0; i < seedIds.length; i++) {
          for (let j = 0; j < randInt(1, 4); j++) {
            posts.push({ id: crypto.randomUUID(), user_id: seedIds[i], image_url: Math.random() < 0.85 ? `https://picsum.photos/seed/post${i * 10 + j}/800/1000` : null, caption: pick(captions), created_at: ago(randInt(0, 90)) });
          }
        }
        for (let b = 0; b < posts.length; b += BATCH) {
          const { error } = await (supabase as any).from("posts").insert(posts.slice(b, b + BATCH));
          if (error) throw new Error(`posts batch: ${error.message}`);
        }
        log("ok", `${posts.length} posts created.`);

        // ── Post likes ───────────────────────────────────────────────────────
        log("info", "Creating post likes…");
        const postLikes: Record<string, unknown>[] = [];
        const likeSet = new Set<string>();
        const postSample = pickN(posts, Math.min(posts.length, 3000));
        for (const post of postSample) {
          for (const liker of pickN(seedIds, randInt(2, 30))) {
            const key = `${post.id}:${liker}`;
            if (!likeSet.has(key) && liker !== post.user_id) { likeSet.add(key); postLikes.push({ post_id: post.id, user_id: liker, created_at: ago(randInt(0, 60)) }); }
          }
        }
        for (let b = 0; b < postLikes.length; b += BATCH) {
          const { error } = await (supabase as any).from("post_likes").insert(postLikes.slice(b, b + BATCH));
          if (error) throw new Error(`post_likes batch: ${error.message}`);
        }
        log("ok", `${postLikes.length} post likes created.`);

        // ── Post comments ────────────────────────────────────────────────────
        log("info", "Creating post comments…");
        const postComments: Record<string, unknown>[] = [];
        for (const post of pickN(postSample, Math.min(postSample.length, 1500))) {
          for (const commenter of pickN(seedIds, randInt(1, 5))) {
            if (commenter !== post.user_id) postComments.push({ id: crypto.randomUUID(), post_id: post.id, user_id: commenter, content: pick(comments), created_at: ago(randInt(0, 45)) });
          }
        }
        for (let b = 0; b < postComments.length; b += BATCH) {
          const { error } = await (supabase as any).from("post_comments").insert(postComments.slice(b, b + BATCH));
          if (error) throw new Error(`post_comments batch: ${error.message}`);
        }
        log("ok", `${postComments.length} post comments created.`);

        // ── Reels (40% of users) ─────────────────────────────────────────────
        log("info", "Creating reels…");
        const reels: Record<string, unknown>[] = [];
        for (let i = 0; i < seedIds.length; i++) {
          if (Math.random() < 0.4) {
            for (let j = 0; j < randInt(1, 2); j++) {
              reels.push({ id: crypto.randomUUID(), user_id: seedIds[i], video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail_url: `https://picsum.photos/seed/reel${i * 5 + j}/800/1400`, caption: pick(reelCaps), created_at: ago(randInt(0, 60)) });
            }
          }
        }
        for (let b = 0; b < reels.length; b += BATCH) {
          const { error } = await (supabase as any).from("reels").insert(reels.slice(b, b + BATCH));
          if (error) throw new Error(`reels batch: ${error.message}`);
        }
        log("ok", `${reels.length} reels created.`);

        // ── Reel likes ───────────────────────────────────────────────────────
        log("info", "Creating reel likes…");
        const reelLikes: Record<string, unknown>[] = [];
        const reelLikeSet = new Set<string>();
        for (const reel of pickN(reels, Math.min(reels.length, 800))) {
          for (const liker of pickN(seedIds, randInt(3, 50))) {
            const key = `${reel.id}:${liker}`;
            if (!reelLikeSet.has(key) && liker !== reel.user_id) { reelLikeSet.add(key); reelLikes.push({ reel_id: reel.id, user_id: liker, created_at: ago(randInt(0, 45)) }); }
          }
        }
        for (let b = 0; b < reelLikes.length; b += BATCH) {
          const { error } = await (supabase as any).from("reel_likes").insert(reelLikes.slice(b, b + BATCH));
          if (error) throw new Error(`reel_likes batch: ${error.message}`);
        }
        log("ok", `${reelLikes.length} reel likes created.`);

        // ── Reel comments ────────────────────────────────────────────────────
        log("info", "Creating reel comments…");
        const reelComments: Record<string, unknown>[] = [];
        for (const reel of pickN(reels, Math.min(reels.length, 400))) {
          for (const commenter of pickN(seedIds, randInt(1, 4))) {
            if (commenter !== reel.user_id) reelComments.push({ id: crypto.randomUUID(), reel_id: reel.id, user_id: commenter, content: pick(comments), created_at: ago(randInt(0, 30)) });
          }
        }
        for (let b = 0; b < reelComments.length; b += BATCH) {
          const { error } = await (supabase as any).from("reel_comments").insert(reelComments.slice(b, b + BATCH));
          if (error) throw new Error(`reel_comments batch: ${error.message}`);
        }
        log("ok", `${reelComments.length} reel comments created.`);

        log("ok", "✅ Seed generation complete (legacy path)!");
      } // end if (false) — legacy block

      await qc.invalidateQueries({ queryKey: ["seed-stats"] });
      toast.success(
        action === "generate" ? "Seed data generated!"
        : action === "reset"  ? "Seed data reset!"
        : "Seed data removed!"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log("error", msg);
      toast.error(`Operation failed: ${msg}`);
    } finally {
      setBusy(null);
    }
  }, [qc]);

  const profileQ = useQuery({
    queryKey: ["admin-me", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("username,avatar_url").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-3 sm:px-4 h-14 border-b shrink-0 safe-top"
        style={{
          background: "oklch(0.13 0.015 268 / 0.95)",
          borderColor: "oklch(0.20 0.016 268)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link to="/settings">
          <button className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </Link>
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg grid place-items-center"
            style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            <Shield className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-bottom-nav space-y-6">

        {/* ── SEED_DATA_MODE banner ────────────────────────────────────────── */}
        {!SEED_DATA_MODE && (
          <div
            className="flex items-start gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.25)",
            }}
          >
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">SEED_DATA_MODE is disabled</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Generate and Reset are locked. Set{" "}
                <code className="font-mono bg-amber-400/10 px-1 rounded">VITE_SEED_DATA_MODE=true</code>{" "}
                in <code className="font-mono bg-amber-400/10 px-1 rounded">.env.local</code> and restart the dev server.
              </p>
            </div>
          </div>
        )}

        {SEED_DATA_MODE && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
            <p className="text-sm text-green-300">
              <span className="font-semibold">SEED_DATA_MODE enabled</span> — synthetic data operations are unlocked.
            </p>
          </div>
        )}

        {/* ── Stat grid ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Seed Data</h2>
            <button
              onClick={() => qc.invalidateQueries({ queryKey: ["seed-stats"] })}
              className="h-7 w-7 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", statsQ.isFetching && "animate-spin")} />
            </button>
          </div>

          {statsQ.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <StatCard icon={Users}         label="Seed Profiles"   value={stats.profiles}      color="violet" />
                <StatCard icon={FileText}      label="Posts"           value={stats.posts}         color="blue"   />
                <StatCard icon={Film}          label="Reels"           value={stats.reels}         color="pink"   />
                <StatCard icon={UserCheck}     label="Follows"         value={stats.follows}       color="green"  />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Heart}         label="Post Likes"      value={stats.post_likes}    color="pink"   />
                <StatCard icon={MessageCircle} label="Post Comments"   value={stats.post_comments} color="blue"   />
                <StatCard icon={Heart}         label="Reel Likes"      value={stats.reel_likes}    color="amber"  />
                <StatCard icon={MessageCircle} label="Reel Comments"   value={stats.reel_comments} color="violet" />
              </div>
              <p className="text-xs text-muted-foreground text-right mt-2">
                <span className="font-semibold text-foreground/70">{totalRows.toLocaleString()}</span> total seed rows
              </p>
            </>
          )}
        </section>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Actions</h2>

          {/* Generate */}
          <button
            disabled={!SEED_DATA_MODE || busy !== null}
            onClick={() => setConfirm("generate")}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(168,85,247,0.08)",
              border: "1px solid rgba(168,85,247,0.22)",
            }}
          >
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.3)" }}
            >
              {busy === "generate" ? <Loader2 className="h-5 w-5 text-violet-400 animate-spin" /> : <Zap className="h-5 w-5 text-violet-400" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Generate Seed Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Create @chatfaa_official + 2,000 synthetic followers with posts, reels & engagement
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>

          {/* Reset */}
          <button
            disabled={!SEED_DATA_MODE || busy !== null || stats.profiles === 0}
            onClick={() => setConfirm("reset")}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.22)",
            }}
          >
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              {busy === "reset" ? <Loader2 className="h-5 w-5 text-blue-400 animate-spin" /> : <RefreshCw className="h-5 w-5 text-blue-400" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Reset Seed Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove all existing seed data then regenerate a fresh dataset
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>

          {/* Remove */}
          <button
            disabled={busy !== null || stats.profiles === 0}
            onClick={() => setConfirm("remove")}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(239,68,68,0.07)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shrink-0"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.28)" }}
            >
              {busy === "remove" ? <Loader2 className="h-5 w-5 text-red-400 animate-spin" /> : <Trash2 className="h-5 w-5 text-red-400" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Remove Seed Data</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete all synthetic users, posts, reels and engagement
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </section>

        {/* ── CLI instructions ────────────────────────────────────────────── */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(168,85,247,0.14)" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: "rgba(168,85,247,0.14)", background: "rgba(168,85,247,0.06)" }}
          >
            <Terminal className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-violet-300">CLI (Node.js seed script)</span>
          </div>
          <div className="p-4 space-y-2.5 font-mono text-xs">
            <p className="text-muted-foreground mb-3">
              For bulk operations (2,000+ users), use the CLI script — it's faster than the browser.
              Set <code className="text-violet-300 bg-violet-400/10 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
              <code className="text-violet-300 bg-violet-400/10 px-1 rounded">.env.local</code> first.
            </p>
            {[
              { cmd: "npm run seed:generate", desc: "Generate seed data" },
              { cmd: "npm run seed:reset",    desc: "Remove + regenerate" },
              { cmd: "npm run seed:remove",   desc: "Remove all seed data" },
              { cmd: "npm run seed:stats",    desc: "Print row counts" },
            ].map(({ cmd, desc }) => (
              <div key={cmd} className="group flex items-start gap-2">
                <span className="text-violet-400 shrink-0 mt-0.5">$</span>
                <div className="flex-1 min-w-0">
                  <code
                    className="text-foreground/80 break-all cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => { navigator.clipboard?.writeText(cmd); toast.success("Copied!"); }}
                  >
                    {cmd}
                  </code>
                  <span className="text-muted-foreground/50 ml-2">— {desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ──────────────────────────────────────────────────── */}
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "rgba(14,10,28,0.5)",
            border: "1px solid rgba(168,85,247,0.1)",
          }}
        >
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            All synthetic accounts are flagged <code className="text-foreground/60 bg-white/5 px-1 rounded font-mono">is_seed_user = true</code>.
            They are never presented as real users and are fully isolated from production data.
            Seed users do not have <code className="text-foreground/60 bg-white/5 px-1 rounded font-mono">auth.users</code> rows — they exist as profile records only.
          </p>
        </div>

        {/* ── Log output ──────────────────────────────────────────────────── */}
        {logs.length > 0 && <LogTerminal lines={logs} />}

      </div>

      {/* ── Confirm dialogs ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirm === "generate"}
        title="Generate seed data?"
        description="This will insert @chatfaa_official plus 2,000 synthetic follower accounts with posts, reels, and engagement data. Existing seed data is not removed first."
        confirmLabel="Generate"
        onConfirm={() => { setConfirm(null); callSeedRpc("generate"); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "reset"}
        title="Reset seed data?"
        description="All existing seed data will be permanently deleted and a fresh dataset will be generated. Real user data is never touched."
        confirmLabel="Reset"
        onConfirm={() => { setConfirm(null); callSeedRpc("reset"); }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "remove"}
        title="Remove all seed data?"
        description="This will permanently delete all synthetic profiles, posts, reels, follows, likes, and comments. This action cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={() => { setConfirm(null); callSeedRpc("remove"); }}
        onCancel={() => setConfirm(null)}
      />

      <BottomNav active="/settings" avatarUrl={profileQ.data?.avatar_url} username={profileQ.data?.username} />
    </div>
  );
}
