import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const url = "https://rnzfmkddwdlkengxvcow.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuemZta2Rkd2Rsa2VuZ3h2Y293Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM5NjA2NSwiZXhwIjoyMTA1OTcyMDY1fQ.Z1dMmZfCD81W37-AilmC1rDCELATtSkWYSeKGZIEs5A";

const supabase = createClient(url, key, {
  auth: { persistSession: false }
});

const sql = readFileSync("./supabase/migrations/20260926000004_fast_ghost_followers_v2.sql", "utf8");

// Use the Supabase SQL editor endpoint via rpc
const { data, error } = await supabase.rpc("exec_sql", { sql });
if (error) {
  // exec_sql might not exist — try via pg_query if available
  console.error("exec_sql failed:", error.message);
  process.exit(1);
}
console.log("Migration applied:", JSON.stringify(data));
