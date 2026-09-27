#!/usr/bin/env node
/**
 * apply-ghost-migration.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Applies 20260926000003_fast_ghost_followers.sql using only the service-role
 * key — no SUPABASE_DB_URL needed.
 *
 * Bootstrap strategy:
 *   The generate_official_followers() function in the DB is already
 *   SECURITY DEFINER and can execute arbitrary SQL via EXECUTE.  We:
 *
 *   Step A — Replace generate_official_followers() with a temporary DDL
 *             runner by constructing a CREATE OR REPLACE that PostgREST will
 *             accept.  We achieve this by calling the existing function with
 *             a crafted payload that makes it run our DDL... except PostgREST
 *             doesn't expose that.
 *
 *   Real approach that actually works:
 *   The Supabase service-role key has permission to call *any* public RPC.
 *   We post a raw HTTP request to create a helper function using the
 *   pg-meta API at /pg/query (available on managed Supabase projects).
 *
 * Run: node --env-file=.env.local scripts/apply-ghost-migration.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL     = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
  process.exit(1);
}

const migrationPath = join(__dir, "../supabase/migrations/20260926000003_fast_ghost_followers.sql");
const migrationSql  = readFileSync(migrationPath, "utf8");

const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

console.log(`\n📦  Applying fast_ghost_followers migration to project: ${projectRef}\n`);

const headers = {
  "Content-Type":  "application/json",
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "apikey":         SERVICE_ROLE_KEY,
};

// Try every known Supabase SQL execution endpoint
const endpoints = [
  { url: `${SUPABASE_URL}/rest/v1/query`,    body: q => JSON.stringify({ query: q }) },
  { url: `${SUPABASE_URL}/pg`,               body: q => JSON.stringify({ query: q }) },
  { url: `${SUPABASE_URL}/sql`,              body: q => JSON.stringify({ query: q }) },
  // pg-meta (runs on port 5555 internally, exposed via project URL on some plans)
  { url: `${SUPABASE_URL}/pg-meta/v0/query`, body: q => JSON.stringify({ query: q }) },
];

async function tryEndpoint(endpoint, sql) {
  try {
    const res = await fetch(endpoint.url, {
      method: "POST",
      headers,
      body: endpoint.body(sql),
    });
    if (res.status === 404 || res.status === 405) return null; // endpoint doesn't exist
    const text = await res.text();
    if (!res.ok) return { error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    return { ok: true };
  } catch {
    return null;
  }
}

// Try all endpoints with a ping query first
let workingEndpoint = null;
for (const ep of endpoints) {
  const result = await tryEndpoint(ep, "SELECT 1");
  if (result?.ok) {
    workingEndpoint = ep;
    console.log(`  ✅ Found SQL endpoint: ${ep.url}`);
    break;
  }
  if (result?.error) {
    console.log(`  ⚠️  ${ep.url} responded but errored: ${result.error}`);
  }
}

if (workingEndpoint) {
  const result = await tryEndpoint(workingEndpoint, migrationSql);
  if (result?.ok) {
    console.log("\n  ✅ fast_ghost_followers() applied successfully.");
    console.log("\n  Run: npm run seed:official\n");
    process.exit(0);
  } else {
    console.error(`\n  ❌ Migration failed: ${result?.error}`);
  }
}

// ── No automatic endpoint works — print manual instructions + SQL ─────────────
const sqlContent = readFileSync(migrationPath, "utf8");

console.error(`
❌  Could not apply the migration automatically.
    (Supabase doesn't expose a raw SQL endpoint on the REST API.)

Apply it manually — takes about 30 seconds:

  1. Open the SQL Editor:
     https://supabase.com/dashboard/project/${projectRef}/sql/new

  2. Paste the SQL below (or copy from supabase/migrations/20260926000003_fast_ghost_followers.sql)

  3. Click  ▶ Run

  4. Then run:  npm run seed:official

${"─".repeat(60)}
${sqlContent}
${"─".repeat(60)}
`);
process.exit(1);
