/**
 * prebuild.mjs
 *
 * Patches node_modules/.nitro/vite/services/ssr/index.js BEFORE vite build runs.
 *
 * Why: Nitro copies this file as ssr.mjs into the Vercel output. The file contains
 * a hardcoded import like `import("./assets/server-<HASH>.js")` where HASH is from
 * the PREVIOUS local build. When Vercel rebuilds in the cloud, a different HASH is
 * generated → the hardcoded reference is stale → ERR_MODULE_NOT_FOUND at runtime.
 *
 * Fix: Replace the hardcoded import with a dynamic fs-based lookup that finds the
 * actual server-*.mjs file at runtime. This runs before vite build so Nitro picks
 * up the patched version when it copies ssr.mjs into .vercel/output.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const SSR_INDEX = resolve(root, "node_modules/.nitro/vite/services/ssr/index.js");

if (!existsSync(SSR_INDEX)) {
  console.log("[prebuild] .nitro/vite/services/ssr/index.js not found — skipping SSR patch.");
  console.log("[prebuild] (This is normal on first install; Nitro generates it during build.)");
  process.exit(0);
}

let content = readFileSync(SSR_INDEX, "utf8");

// Check if already patched
if (content.includes("/* dynamic-server-entry-patch */")) {
  console.log("[prebuild] ssr/index.js already patched — skipping.");
  process.exit(0);
}

// Replace the hardcoded server import with a dynamic lookup
// Matches: import("./assets/server-<HASH>.js") or import("./server-<HASH>.mjs")
const HARDCODED_IMPORT = /import\(["']\.\/(?:assets\/)?server-[A-Za-z0-9_-]+\.(?:js|mjs)["']\)/;

if (!HARDCODED_IMPORT.test(content)) {
  console.log("[prebuild] Could not find hardcoded server import pattern — skipping.");
  console.log("[prebuild] Current getServerEntry content:");
  const match = content.match(/async function getServerEntry\(\)[^}]+\}/s);
  if (match) console.log(match[0]);
  process.exit(0);
}

const DYNAMIC_IMPORT = `/* dynamic-server-entry-patch */
(async () => {
  // Dynamically find the actual server-*.mjs in the same directory at runtime.
  // This avoids ERR_MODULE_NOT_FOUND when Vercel cloud build produces a different
  // content hash than the local build that generated this file.
  const { readdirSync } = await import("fs");
  const { dirname: _dn, resolve: _res } = await import("path");
  const { fileURLToPath: _ftu } = await import("url");
  const _dir = _dn(_ftu(import.meta.url));
  const _files = readdirSync(_dir);
  const _serverFile = _files.find((f) => /^server-[A-Za-z0-9_-]+\\.mjs$/.test(f));
  if (!_serverFile) throw new Error("[ssr] No server-*.mjs found in " + _dir);
  return import(_res(_dir, _serverFile));
})()`;

content = content.replace(HARDCODED_IMPORT, DYNAMIC_IMPORT);

writeFileSync(SSR_INDEX, content, "utf8");
console.log("[prebuild] ✓ Patched .nitro/vite/services/ssr/index.js — server import is now dynamic.");
