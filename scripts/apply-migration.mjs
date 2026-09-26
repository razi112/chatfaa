#!/usr/bin/env node
/**
 * Applies a SQL file directly to the Supabase Postgres database.
 *
 * Usage:
 *   node --env-file=.env.local scripts/apply-migration.mjs <file.sql>
 *
 * Requires in .env.local:
 *   SUPABASE_DB_URL  — postgres connection string
 *                      Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
 *                      Find it: Supabase Dashboard → Project Settings → Database → Connection string → URI
 *                      (Use the "Session mode" / port 5432 string, not the pooler)
 *
 *   OR provide individual parts:
 *   SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD
 */

import pg from "pg";
import { readFileSync } from "fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.mjs <file.sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf8");

const connectionString =
  process.env.SUPABASE_DB_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "❌  SUPABASE_DB_URL is not set in .env.local\n\n" +
    "    Find it: Supabase Dashboard → Project Settings → Database\n" +
    "             → Connection string → URI (Session mode, port 5432)\n\n" +
    "    It looks like:\n" +
    "    postgresql://postgres.[ref]:[db-password]@aws-0-[region].pooler.supabase.com:5432/postgres\n\n" +
    "    Add it to .env.local as:\n" +
    "    SUPABASE_DB_URL=\"postgresql://...\"\n"
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log(`\n📦  Applying: ${file}`);
  await client.query(sql);
  console.log(`✅  Done.\n`);
} catch (err) {
  console.error(`\n❌  Error:`, err.message);
  process.exit(1);
} finally {
  await client.end();
}
