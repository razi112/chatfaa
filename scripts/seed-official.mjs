#!/usr/bin/env node
/**
 * seed-official.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches @chatfaa_official:
 *   1. Likes + comments on all official posts (from existing 2k seed users)
 *   2. 1,000,000 ghost followers via fast_ghost_followers() RPC (parallel)
 *   3. chatfaa_official follows 3,654 accounts via add_official_following() RPC
 *
 * Run: npm run seed:official
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const SUPABASE_URL     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_DATA_MODE   = process.env.SEED_DATA_MODE === "true";

const OFFICIAL_USERNAME = "chatfaa_official";
const TARGET_FOLLOWERS  = 1_000_000;
const TARGET_FOLLOWING  = 3_654;

// Tuning: 3 parallel RPC calls × 5 000 rows = 15 000 rows per round
// The function disables on_auth_user_created for the bulk INSERT so each
// call is ~3 bulk statements regardless of batch size — no per-row overhead.
const PARALLEL         = 3;
const ROWS_PER_CALL    = 5000;
const MAX_RETRIES      = 3;   // per-call retry on transient errors

if (!SUPABASE_URL)     { console.error("❌  SUPABASE_URL not set"); process.exit(1); }
if (!SERVICE_ROLE_KEY) { console.error("❌  SUPABASE_SERVICE_ROLE_KEY not set"); process.exit(1); }
if (!SEED_DATA_MODE)   { console.error("❌  SEED_DATA_MODE=true required in .env.local"); process.exit(1); }

const s = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const pick    = (a) => a[Math.floor(Math.random() * a.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const ago     = (days) => new Date(Date.now() - days * 86_400_000 - randInt(0, 43_200_000)).toISOString();
const chunks  = (arr, n) => { const r = []; for (let i = 0; i < arr.length; i += n) r.push(arr.slice(i, i + n)); return r; };
const fmt     = (n) => Number(n).toLocaleString();
const hr      = () => console.log("─".repeat(56));

const COMMENTS = [
  "this is so good 🔥","absolutely love this ✨","goals 🙌","love this 💕",
  "okay but wow 😍","incredible 👏","this made my day 😊","pure vibes 🎨",
  "obsessed 💜","you're amazing 🌟","can't stop looking 👀","this is everything",
  "sending love 💛","wow 🤩","10/10 👌","I feel this 🙏","iconic 👑",
  "chatfaa never misses 💎","the GOAT 🐐","living for this 🌊","we love chatfaa ❤️",
  "top tier 🏆","real ones know 🔑","drop more 🙌","following for life 💯",
  "always showing up 🫶","this community is everything 💙","blessed to be here 🙏",
];

async function apiInsert(table, rows, label) {
  if (!rows.length) return;
  let done = 0;
  for (const chunk of chunks(rows, 200)) {
    const { error } = await s.from(table).insert(chunk);
    if (error && error.code !== "23505")
      throw new Error(`[${table}] ${error.message}`);
    done += chunk.length;
    process.stdout.write(`\r  ↳ ${label}: ${fmt(done)} / ${fmt(rows.length)}   `);
  }
  console.log();
}

(async () => {
  hr();
  console.log("🌟  @chatfaa_official enrichment");
  hr();
  const t0 = Date.now();

  // ── Resolve official account ────────────────────────────────────────────
  const { data: official } = await s.from("profiles").select("id")
    .eq("username", OFFICIAL_USERNAME).single();
  if (!official) {
    console.error("❌  @chatfaa_official not found — run npm run seed:generate first");
    process.exit(1);
  }
  const OFFICIAL_ID = official.id;
  console.log(`\n✅  @chatfaa_official  (${OFFICIAL_ID})`);

  // ── Verify fast_ghost_followers RPC exists ──────────────────────────────
  const { error: rpcCheck } = await s.rpc("fast_ghost_followers", {
    p_official_id: OFFICIAL_ID, p_batch_size: 1
  });
  if (rpcCheck && rpcCheck.code === "PGRST202") {
    console.error("\n❌  fast_ghost_followers() not found in DB.");
    console.error("    Apply the migration first:");
    console.error("    → https://supabase.com/dashboard/project/rnzfmkddwdlkengxvcow/sql/new");
    console.error("    → Paste: supabase/migrations/20260926000003_fast_ghost_followers.sql");
    process.exit(1);
  }

  // ── Load seed user pool ─────────────────────────────────────────────────
  const { data: seedUsers } = await s.from("profiles").select("id")
    .eq("is_seed_user", true).limit(5000);
  const seedIds = (seedUsers ?? []).map(p => p.id);
  console.log(`   ↳ ${fmt(seedIds.length)} seed users in pool`);

  // ── 1. Likes + comments on all official posts ───────────────────────────
  console.log("\n❤️   Likes & comments on official posts…");
  const { data: officialPosts } = await s.from("posts").select("id")
    .eq("user_id", OFFICIAL_ID);
  const postIds = (officialPosts ?? []).map(p => p.id);
  console.log(`   ↳ ${postIds.length} post(s)`);

  if (postIds.length > 0 && seedIds.length > 0) {
    const { data: exLikes } = await s.from("post_likes")
      .select("post_id,user_id").in("post_id", postIds);
    const exSet = new Set((exLikes ?? []).map(l => `${l.post_id}:${l.user_id}`));

    const postLikes = [];
    for (const pid of postIds)
      for (const uid of seedIds)
        if (!exSet.has(`${pid}:${uid}`))
          postLikes.push({ post_id: pid, user_id: uid, created_at: ago(randInt(0, 180)) });

    if (postLikes.length) await apiInsert("post_likes", postLikes, "post likes");
    else console.log("   ↳ All likes already exist ✓");

    // Comments — add fresh ones each run (not deduped — intentional variety)
    const { count: existingComments } = await s.from("post_comments")
      .select("*", { count: "exact", head: true })
      .in("post_id", postIds);

    if ((existingComments ?? 0) < postIds.length * 10) {
      const postComments = [];
      for (const pid of postIds) {
        const commenters = [...seedIds].sort(() => Math.random() - 0.5)
          .slice(0, randInt(10, 25));
        for (const uid of commenters)
          postComments.push({
            id: randomUUID(), post_id: pid, user_id: uid,
            content: pick(COMMENTS),
            created_at: ago(randInt(0, 120)),
          });
      }
      await apiInsert("post_comments", postComments, "post comments");
    } else {
      console.log(`   ↳ ${fmt(existingComments)} comments already exist ✓`);
    }
  }

  // ── 2. Ghost followers up to 1,000,000 ─────────────────────────────────
  const { count: currFollowers } = await s.from("follows")
    .select("id", { count: "exact", head: true })
    .eq("following_id", OFFICIAL_ID);

  const needed = Math.max(0, TARGET_FOLLOWERS - (currFollowers ?? 0));
  console.log(`\n👥  Followers: ${fmt(currFollowers ?? 0)} → ${fmt(TARGET_FOLLOWERS)}  (need ${fmt(needed)} more)`);

  if (needed > 0) {
    console.log(`\n   Using fast_ghost_followers() — ${PARALLEL} parallel × ${fmt(ROWS_PER_CALL)} rows/call`);
    console.log(`   Estimated rounds: ~${Math.ceil(needed / (PARALLEL * ROWS_PER_CALL))}\n`);

    let totalInserted  = 0;
    let remaining      = needed;
    const startTime    = Date.now();

    // Per-call wrapper with retry on transient timeout / 5xx
    async function callRpc(rowsEach) {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const { data, error } = await s.rpc("fast_ghost_followers", {
          p_official_id: OFFICIAL_ID,
          p_batch_size:  rowsEach,
        });
        if (!error) return data ?? 0;

        const isTimeout  = error.message?.includes("timeout") || error.message?.includes("canceling");
        const isTransient = isTimeout || error.code === "500" || error.code === "503";

        if (isTransient && attempt < MAX_RETRIES) {
          // On timeout, halve the batch size for subsequent calls this round
          if (isTimeout) rowsEach = Math.max(100, Math.floor(rowsEach / 2));
          await new Promise(r => setTimeout(r, attempt * 1500));
          continue;
        }
        throw new Error(`fast_ghost_followers (attempt ${attempt}): ${error.message}`);
      }
      return 0;
    }

    while (remaining > 0) {
      const batchCount = Math.min(PARALLEL, Math.ceil(remaining / ROWS_PER_CALL));
      const rowsEach   = Math.min(ROWS_PER_CALL, Math.ceil(remaining / batchCount));

      const results = await Promise.all(
        Array.from({ length: batchCount }, () => callRpc(rowsEach))
      );

      const roundInserted = results.reduce((a, b) => a + b, 0);
      totalInserted += roundInserted;
      remaining     -= roundInserted;

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate    = Math.round(totalInserted / Math.max(1, (Date.now() - startTime) / 1000));
      const eta     = remaining > 0 ? Math.ceil(remaining / Math.max(1, rate)) : 0;

      process.stdout.write(
        `\r  ↳ ${fmt(totalInserted)} / ${fmt(needed)} inserted` +
        `  (${fmt(rate)}/s  elapsed ${elapsed}s  ETA ${eta}s)     `
      );

      if (roundInserted === 0) {
        console.log("\n   ⚠️  No new rows inserted — may already be at target");
        break;
      }
    }
    console.log(); // newline after progress
  } else {
    console.log("   ↳ Already at target ✓");
  }

  // ── 3. official → following 3,654 accounts ─────────────────────────────
  const { count: currFollowing } = await s.from("follows")
    .select("id", { count: "exact", head: true })
    .eq("follower_id", OFFICIAL_ID);

  const needFollowing = Math.max(0, TARGET_FOLLOWING - (currFollowing ?? 0));
  console.log(`\n➡️   Following: ${fmt(currFollowing ?? 0)} → ${fmt(TARGET_FOLLOWING)}  (need ${fmt(needFollowing)} more)`);

  if (needFollowing > 0) {
    const { data: result, error: fwErr } = await s.rpc("add_official_following", {
      p_official_id: OFFICIAL_ID,
      p_count:       needFollowing,
    });
    if (fwErr) throw new Error(`add_official_following: ${fwErr.message}`);
    console.log(`   ↳ Added ${fmt(result ?? 0)} following rows`);
  } else {
    console.log("   ↳ Already at target ✓");
  }

  // ── Final counts + summary ─────────────────────────────────────────────
  const [
    { count: finalFollowers },
    { count: finalFollowing },
    { count: finalLikes },
    { count: finalComments },
  ] = await Promise.all([
    s.from("follows").select("id", { count: "exact", head: true }).eq("following_id", OFFICIAL_ID),
    s.from("follows").select("id", { count: "exact", head: true }).eq("follower_id",  OFFICIAL_ID),
    s.from("post_likes").select("*", { count: "exact", head: true }).in("post_id", postIds),
    s.from("post_comments").select("*", { count: "exact", head: true }).in("post_id", postIds),
  ]);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✅  Done in ${elapsed}s\n`);
  hr();
  console.log(`   ${"Followers".padEnd(24)} ${fmt(finalFollowers ?? 0).padStart(12)}`);
  console.log(`   ${"Following".padEnd(24)} ${fmt(finalFollowing ?? 0).padStart(12)}`);
  console.log(`   ${"Post likes (official)".padEnd(24)} ${fmt(finalLikes ?? 0).padStart(12)}`);
  console.log(`   ${"Post comments (official)".padEnd(24)} ${fmt(finalComments ?? 0).padStart(12)}`);
  hr();
  console.log();

})().catch(err => {
  console.error("\n❌  Error:", err.message ?? err);
  process.exit(1);
});
