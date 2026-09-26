#!/usr/bin/env node
/**
 * Chatfaa Seed-Data Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates auth.users rows via supabase.auth.admin (service-role), then inserts
 * profiles, posts, reels, follows, likes and comments in batches.
 *
 * Usage:
 *   npm run seed:generate   — insert @chatfaa_official + 2,000 seed users
 *   npm run seed:reset      — remove all seed data then regenerate
 *   npm run seed:remove     — remove all seed data
 *   npm run seed:stats      — show current seed row counts
 *
 * Requirements (.env.local):
 *   SUPABASE_URL              — project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service-role key (bypasses RLS + has auth.admin)
 *   SEED_DATA_MODE=true       — safety guard
 */

import { createClient } from "@supabase/supabase-js";

// ─── Config ───────────────────────────────────────────────────────────────────
const SEED_DATA_MODE    = process.env.SEED_DATA_MODE === "true";
const SUPABASE_URL      = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_SEED_USERS = 2000;
const BATCH             = 50; // conservative batch size

// ─── Argument check ───────────────────────────────────────────────────────────
const command = process.argv[2];
if (!["generate", "reset", "remove", "stats"].includes(command)) {
  console.error(`
Usage: node scripts/seed.mjs <command>
  generate  insert @chatfaa_official + ${TARGET_SEED_USERS} seed users
  reset     remove all seed data then regenerate
  remove    remove all seed data
  stats     show current seed-data row counts

npm aliases:
  npm run seed:generate / seed:reset / seed:remove / seed:stats
`);
  process.exit(1);
}
if (!SUPABASE_URL)      { console.error("❌  SUPABASE_URL not set in .env.local"); process.exit(1); }
if (!SERVICE_ROLE_KEY)  { console.error("❌  SUPABASE_SERVICE_ROLE_KEY not set in .env.local"); process.exit(1); }
if ((command === "generate" || command === "reset") && !SEED_DATA_MODE) {
  console.error("❌  SEED_DATA_MODE=true is required in .env.local to generate seed data.");
  process.exit(1);
}

// ─── Supabase client (service-role) ──────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ─── Data pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = ["Alex","Jordan","Riley","Taylor","Morgan","Casey","Quinn","Avery","Jamie","Drew","Blake","Cameron","Hayden","Reese","Skylar","Peyton","Logan","Parker","Emerson","Dakota","Sage","River","Rowan","Finley","Harper","Elliot","Kendall","Sloane","Aria","Mia","Liam","Noah","Emma","Olivia","Lucas","Mason","Chloe","Isabella","Ethan","Aiden","Amara","Zara","Priya","Anaya","Kenji","Yuki","Fatima","Omar","Khalid","Aisha","Nora","Stella","Felix","Oscar","Luna","Iris","Theo","Leo","Nia","Kofi","Yusuf","Layla","Rania","Tariq","Soren","Ingrid","Henrik","Astrid","Lars","Freya","Magnus","Mei","Jin","Hana","Suki","Hiroshi","Yuna"];
const LAST_NAMES  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Anderson","Martinez","Taylor","Thomas","Moore","Jackson","Martin","Lee","Perez","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Ahmed","Khan","Patel","Singh","Kumar","Sharma","Gupta","Rao","Nair","Pillai","Kimura","Tanaka","Watanabe","Sato","Suzuki","Ito","Kobayashi","Yamamoto","Nakamura","Abe","Okafor","Mensah","Diallo","Traore","Coulibaly","Toure","Andersen","Jensen","Nielsen","Hansen","Pedersen","Christensen","Larsen","Sorensen"];
const BIOS        = ["just a soul wandering through pixels 🌊","coffee first, everything else second ☕","creating things that don't exist yet 🛠️","life is short. eat the cake 🍰","between adventures 🏔️","making memories, not excuses ✨","photographer by day, dreamer by night 📷","chasing sunsets and good vibes 🌅","fitness enthusiast | food lover | world traveler 🌍","turning ideas into reality 💡","plant mom 🌿 | book nerd 📚 | cat person 🐱","building stuff that matters ⚡","born to explore, forced to work 😄","living my best pixel life 🎨","music is life 🎵 everything else is details","not all who wander are lost ✈️","making the world a slightly better place 🌱","here for the vibes and the snacks 🍕","probably overthinking this bio 🤔","design is how it works 🎯","good food, good friends, good life 🥂","storyteller. observer. human. 📝","less talking, more doing 🚀","finding beauty in the ordinary 🌸","living one adventure at a time 🎒"];
const INTERESTS   = ["photography","travel","cooking","fitness","music","art","tech","gaming","fashion","reading","hiking","yoga","coffee","design","writing","movies","dancing","cycling","swimming","climbing","sustainability","mindfulness","DIY","astronomy","botany","poetry","theater","animation","podcasting"];
const CAPTIONS    = ["Golden hour never disappoints ✨","This view though 🌅","Good vibes only 🌊","Found my happy place 🌿","Making every moment count 💫","The adventure continues 🏔️","Sunday mood 🌸","Life is too short for bad coffee ☕","Catching feels and sunsets 🌄","Not all classrooms have four walls 🌍","Just breathe 🍃","Working on something special 🛠️","Details make the difference 🎯","Every day is a new beginning 🌱","The world is your canvas 🎨","Grateful for this view 🙏","No filter needed today 📸","Living for moments like this 🤍","Sometimes you just need to step outside 🌲","Creating > consuming 💡"];
const REEL_CAPS   = ["POV: you finally got outside today 🌿","this is your sign to take the trip ✈️","day in my life ☀️","things that just make sense 🧠","small moments, big memories 💛","not all heroes wear capes 🦸","we love a good transformation 🔄","when it all clicks 🎯","vibes only from here on out 🌊","the process is part of the art 🎨"];
const COMMENTS    = ["this is so good 🔥","absolutely stunning ✨","goals 🙌","love this so much 💕","okay but wow 😍","need this in my life","incredible work 👏","this made my day 😊","pure art 🎨","obsessed with this","the vibes are immaculate 🌊","you're so talented","can't stop looking at this","this is everything","sending you love 💛","wow just wow","10/10 no notes","I feel this deeply 🙏","literally my aesthetic","this hits different"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pick    = (a) => a[Math.floor(Math.random() * a.length)];
const pickN   = (a, n) => [...a].sort(() => Math.random() - 0.5).slice(0, Math.min(n, a.length));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const ago     = (days) => new Date(Date.now() - days * 86_400_000 - randInt(0, 43_200_000)).toISOString();
const chunks  = (arr, size) => { const r = []; for (let i = 0; i < arr.length; i += size) r.push(arr.slice(i, i + size)); return r; };
const fmt     = (n) => Number(n).toLocaleString();
const hr      = () => console.log("─".repeat(54));

async function batchInsert(table, rows, label) {
  if (!rows.length) return 0;
  let done = 0;
  for (const chunk of chunks(rows, BATCH)) {
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw new Error(`[${table}] ${error.message}`);
    done += chunk.length;
    process.stdout.write(`\r  ↳ ${label}: ${fmt(done)} / ${fmt(rows.length)}   `);
  }
  console.log();
  return done;
}

// ─── stats ────────────────────────────────────────────────────────────────────
async function stats() {
  console.log("\n📊  Seed-data stats:\n");
  const { data, error } = await supabase.rpc("count_seed_stats");
  if (error) throw error;
  const s = data ?? {};
  const rows = [
    ["Seed profiles",  s.profiles],
    ["Posts",          s.posts],
    ["Reels",          s.reels],
    ["Follows",        s.follows],
    ["Post likes",     s.post_likes],
    ["Post comments",  s.post_comments],
    ["Reel likes",     s.reel_likes],
    ["Reel comments",  s.reel_comments],
  ];
  for (const [label, count] of rows)
    console.log(`   ${label.padEnd(18)} ${fmt(count ?? 0).padStart(8)}`);
  const total = rows.reduce((sum, [, c]) => sum + (c ?? 0), 0);
  console.log(); hr();
  console.log(`   ${"Total rows".padEnd(18)} ${fmt(total).padStart(8)}`);
  hr(); console.log();
}

// ─── remove ───────────────────────────────────────────────────────────────────
async function remove() {
  console.log("\n🗑️   Removing seed data…");

  // Collect seed user IDs first
  const { data: seedProfiles } = await supabase
    .from("profiles").select("id").eq("is_seed_user", true);
  const seedIds = (seedProfiles ?? []).map((p) => p.id);

  if (seedIds.length === 0) {
    console.log("   Nothing to remove.\n");
    return;
  }

  console.log(`   Found ${fmt(seedIds.length)} seed profiles to remove…`);

  // Delete in child-first order (or rely on cascade)
  const { error: rpcError } = await supabase.rpc("remove_seed_data");
  if (rpcError) throw rpcError;

  // Delete auth.users for seed accounts (supabase.auth.admin)
  let authDeleted = 0;
  for (const chunk of chunks(seedIds, 20)) {
    for (const id of chunk) {
      const { error } = await supabase.auth.admin.deleteUser(id);
      if (!error) authDeleted++;
    }
  }
  console.log(`   ✅ Removed ${fmt(seedIds.length)} profiles + ${fmt(authDeleted)} auth users.\n`);
}

// ─── generate ─────────────────────────────────────────────────────────────────
async function generate() {
  hr();
  console.log(`🌱  Generating seed data — ${fmt(TARGET_SEED_USERS)} users`);
  hr();
  const t0 = Date.now();

  // ── 1. @chatfaa_official ────────────────────────────────────────────────────
  console.log("\n1️⃣   @chatfaa_official…");
  let officialId;
  const { data: existing } = await supabase
    .from("profiles").select("id").eq("username", "chatfaa_official").maybeSingle();

  if (existing?.id) {
    officialId = existing.id;
    await supabase.from("profiles")
      .update({ is_verified: true, is_manually_verified: true })
      .eq("id", officialId);
    console.log(`   ↳ already exists (${officialId})`);
  } else {
    // Create auth user first
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: "chatfaa_official@seed.chatfaa.internal",
      email_confirm: true,
      user_metadata: { is_seed: true },
    });
    if (authErr) throw new Error(`auth @chatfaa_official: ${authErr.message}`);
    officialId = authData.user.id;

    // The on_auth_user_created trigger may have auto-created a stub profile.
    // Upsert so we set the correct username/display_name regardless.
    const { error: profErr } = await supabase.from("profiles").upsert({
      id: officialId,
      username: "chatfaa_official",
      display_name: "Chatfaa",
      bio: "The official Chatfaa account 🚀 Connect, share, and express yourself.",
      avatar_url: "https://picsum.photos/seed/chatfaa_official/150/150",
      is_verified: true,
      is_manually_verified: true,
      is_seed_user: false,
      account_type: "business",
      status: "online",
      last_seen: new Date().toISOString(),
    }, { onConflict: "id" });
    if (profErr) throw new Error(`profile @chatfaa_official: ${profErr.message}`);
    console.log(`   ↳ created (${officialId})`);
  }

  // ── 2. Seed profiles ────────────────────────────────────────────────────────
  console.log(`\n2️⃣   Creating ${fmt(TARGET_SEED_USERS)} seed users (auth + profiles)…`);
  const usedUsernames = new Set(["chatfaa_official"]);
  const seedProfiles  = [];
  const authCreations = [];

  for (let i = 0; i < TARGET_SEED_USERS; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    // Username: max 20 chars, alphanumeric + underscore only
    // Pattern: first5 + last5 + 4-digit number = max 14 chars, always valid
    const fnPart = fn.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
    const lnPart = ln.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
    let username = `${fnPart}_${lnPart}${randInt(1000, 9999)}`;
    while (usedUsernames.has(username))
      username = `${fnPart}_${lnPart}${randInt(10000, 99999)}`.slice(0, 20);
    usedUsernames.add(username);

    const ints = pickN(INTERESTS, randInt(2, 4)).join(" • ");
    const createdAt = ago(randInt(1, 180));

    authCreations.push({
      email: `${username}@seed.chatfaa.internal`,
      email_confirm: true,
      user_metadata: { is_seed: true },
      created_at: createdAt,
    });
    seedProfiles.push({
      username,
      display_name: `${fn} ${ln}`,
      bio: `${pick(BIOS)} | ${ints}`.slice(0, 150),
      avatar_url: `https://picsum.photos/seed/user${i}/150/150`,
      is_seed_user: true,
      is_verified: Math.random() < 0.03,
      account_type: Math.random() < 0.15 ? "creator" : Math.random() < 0.05 ? "business" : "personal",
      status: "offline",
      last_seen: ago(randInt(0, 30)),
      created_at: createdAt,
    });
  }

  // Create auth users in batches and collect their IDs
  const seedIds = [];
  let authDone = 0;
  for (const chunk of chunks(authCreations, 10)) {
    await Promise.all(
      chunk.map(async (payload, ci) => {
        const { data, error } = await supabase.auth.admin.createUser(payload);
        if (error) throw new Error(`auth user ${authDone + ci}: ${error.message}`);
        seedIds.push(data.user.id);
      })
    );
    authDone += chunk.length;
    process.stdout.write(`\r  ↳ auth users: ${fmt(authDone)} / ${fmt(TARGET_SEED_USERS)}   `);
  }
  console.log();

  // Attach IDs to profile rows and upsert (trigger may have auto-created stubs)
  const profileRows = seedProfiles.map((p, i) => ({ ...p, id: seedIds[i] }));
  let profDone = 0;
  for (const chunk of chunks(profileRows, BATCH)) {
    const { error } = await supabase.from("profiles").upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`[profiles upsert] ${error.message}`);
    profDone += chunk.length;
    process.stdout.write(`\r  ↳ profiles: ${fmt(profDone)} / ${fmt(profileRows.length)}   `);
  }
  console.log();

  // ── 3. Follows → official ───────────────────────────────────────────────────
  console.log("\n3️⃣   Follows → @chatfaa_official…");
  const followsToOfficial = seedIds.map((sid) => ({
    id: crypto.randomUUID(),
    follower_id: sid,
    following_id: officialId,
    status: "accepted",
    created_at: ago(randInt(1, 120)),
  }));
  await batchInsert("follows", followsToOfficial, "follows");

  // ── 4. Cross-follows ─────────────────────────────────────────────────────────
  console.log("\n4️⃣   Cross-follows…");
  const crossFollows = [];
  const followSet = new Set();
  for (const sid of seedIds) {
    for (const tid of pickN(seedIds.filter((id) => id !== sid), randInt(5, 40))) {
      const key = `${sid}:${tid}`;
      if (!followSet.has(key)) {
        followSet.add(key);
        crossFollows.push({ id: crypto.randomUUID(), follower_id: sid, following_id: tid, status: "accepted", created_at: ago(randInt(1, 90)) });
      }
    }
  }
  await batchInsert("follows", crossFollows, "cross-follows");

  // ── 5. Posts ─────────────────────────────────────────────────────────────────
  console.log("\n5️⃣   Posts (1–4 per user)…");
  const posts = [];
  for (let i = 0; i < seedIds.length; i++) {
    for (let j = 0; j < randInt(1, 4); j++) {
      posts.push({ id: crypto.randomUUID(), user_id: seedIds[i], image_url: Math.random() < 0.85 ? `https://picsum.photos/seed/post${i * 10 + j}/800/1000` : null, caption: pick(CAPTIONS), created_at: ago(randInt(0, 90)) });
    }
  }
  await batchInsert("posts", posts, "posts");

  // ── 6. Post likes ─────────────────────────────────────────────────────────────
  console.log("\n6️⃣   Post likes…");
  const postLikes = [];
  const likeSet = new Set();
  for (const post of pickN(posts, Math.min(posts.length, 3000))) {
    for (const liker of pickN(seedIds, randInt(2, 20))) {
      const key = `${post.id}:${liker}`;
      if (!likeSet.has(key) && liker !== post.user_id) {
        likeSet.add(key);
        postLikes.push({ post_id: post.id, user_id: liker, created_at: ago(randInt(0, 60)) });
      }
    }
  }
  await batchInsert("post_likes", postLikes, "post likes");

  // ── 7. Post comments ─────────────────────────────────────────────────────────
  console.log("\n7️⃣   Post comments…");
  const postComments = [];
  for (const post of pickN(posts, Math.min(posts.length, 1500))) {
    for (const commenter of pickN(seedIds, randInt(1, 5))) {
      if (commenter !== post.user_id)
        postComments.push({ id: crypto.randomUUID(), post_id: post.id, user_id: commenter, content: pick(COMMENTS), created_at: ago(randInt(0, 45)) });
    }
  }
  await batchInsert("post_comments", postComments, "post comments");

  // ── 8. Reels ─────────────────────────────────────────────────────────────────
  console.log("\n8️⃣   Reels (40% of users)…");
  const reels = [];
  for (let i = 0; i < seedIds.length; i++) {
    if (Math.random() < 0.4) {
      for (let j = 0; j < randInt(1, 2); j++) {
        reels.push({ id: crypto.randomUUID(), user_id: seedIds[i], video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail_url: `https://picsum.photos/seed/reel${i * 5 + j}/800/1400`, caption: pick(REEL_CAPS), created_at: ago(randInt(0, 60)) });
      }
    }
  }
  await batchInsert("reels", reels, "reels");

  // ── 9. Reel likes ─────────────────────────────────────────────────────────────
  console.log("\n9️⃣   Reel likes…");
  const reelLikes = [];
  const reelLikeSet = new Set();
  for (const reel of pickN(reels, Math.min(reels.length, 800))) {
    for (const liker of pickN(seedIds, randInt(3, 40))) {
      const key = `${reel.id}:${liker}`;
      if (!reelLikeSet.has(key) && liker !== reel.user_id) {
        reelLikeSet.add(key);
        reelLikes.push({ reel_id: reel.id, user_id: liker, created_at: ago(randInt(0, 45)) });
      }
    }
  }
  await batchInsert("reel_likes", reelLikes, "reel likes");

  // ── 10. Reel comments ────────────────────────────────────────────────────────
  console.log("\n🔟   Reel comments…");
  const reelComments = [];
  for (const reel of pickN(reels, Math.min(reels.length, 400))) {
    for (const commenter of pickN(seedIds, randInt(1, 4))) {
      if (commenter !== reel.user_id)
        reelComments.push({ id: crypto.randomUUID(), reel_id: reel.id, user_id: commenter, content: pick(COMMENTS), created_at: ago(randInt(0, 30)) });
    }
  }
  await batchInsert("reel_comments", reelComments, "reel comments");

  // ── Summary ───────────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅  Seed generation complete in ${elapsed}s!\n`);
  await stats();
}

// ─── Entry point ──────────────────────────────────────────────────────────────
(async () => {
  try {
    switch (command) {
      case "generate": await generate(); break;
      case "reset":    await remove(); await generate(); break;
      case "remove":   await remove(); break;
      case "stats":    await stats(); break;
    }
  } catch (err) {
    console.error("\n❌  Error:", err.message ?? err);
    process.exit(1);
  }
})();
