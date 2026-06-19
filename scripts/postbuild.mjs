/**
 * postbuild.mjs
 *
 * Patch 1 — tslib __awaiter inline
 *   Replaces `import { __awaiter } from "tslib"` in supabase__functions-js.mjs
 *   with an inline implementation so Node 24 ESM doesn't fail to resolve tslib.
 *
 * Patch 2 — ssr.mjs server hash fix
 *   Nitro generates ssr.mjs with a hardcoded import of `./server-<HASH>.mjs`.
 *   When Vercel rebuilds in the cloud the content hash changes, so the import
 *   reference inside ssr.mjs becomes stale → ERR_MODULE_NOT_FOUND at runtime.
 *   This patch scans for the actual server-*.mjs file that was generated and
 *   rewrites the import in ssr.mjs to match, making every deploy self-consistent.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ── Patch 1: tslib inline ─────────────────────────────────────
const TSLIB_TARGET = resolve(
  root,
  ".vercel/output/functions/__server.func/_libs/supabase__functions-js.mjs"
);

if (!existsSync(TSLIB_TARGET)) {
  console.log("[postbuild] supabase__functions-js.mjs not found, skipping tslib patch.");
} else {
  const TSLIB_IMPORT = `import { __awaiter } from "tslib";`;
  const TSLIB_INLINE = `// tslib __awaiter inlined by postbuild.mjs (avoids ERR_MODULE_NOT_FOUND on Vercel)
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}`;

  let tslibContent = readFileSync(TSLIB_TARGET, "utf8");
  if (!tslibContent.includes(TSLIB_IMPORT)) {
    console.log("[postbuild] tslib import not found — already patched or changed. Skipping.");
  } else {
    tslibContent = tslibContent.replace(TSLIB_IMPORT, TSLIB_INLINE);
    writeFileSync(TSLIB_TARGET, tslibContent, "utf8");
    console.log("[postbuild] ✓ Patch 1: Patched supabase__functions-js.mjs — tslib __awaiter inlined.");
  }
}

// ── Patch 2: ssr.mjs server hash fix ─────────────────────────
const SSR_DIR = resolve(root, ".vercel/output/functions/__server.func/_ssr");
const SSR_FILE = resolve(SSR_DIR, "ssr.mjs");

if (!existsSync(SSR_FILE)) {
  console.log("[postbuild] ssr.mjs not found, skipping server hash patch.");
} else {
  // Find the actual server-*.mjs file generated in this build
  const files = readdirSync(SSR_DIR);
  const serverFile = files.find((f) => /^server-[A-Za-z0-9_-]+\.mjs$/.test(f));

  if (!serverFile) {
    console.log("[postbuild] No server-*.mjs found in _ssr, skipping hash patch.");
  } else {
    let ssrContent = readFileSync(SSR_FILE, "utf8");

    // Replace any existing server-<hash>.mjs import reference with the actual file
    const updated = ssrContent.replace(
      /import\("\.\/server-[A-Za-z0-9_-]+\.mjs"\)/g,
      `import("./${serverFile}")`
    );

    if (updated === ssrContent) {
      console.log(`[postbuild] ssr.mjs already references ${serverFile} or pattern not found. No change needed.`);
    } else {
      writeFileSync(SSR_FILE, updated, "utf8");
      console.log(`[postbuild] ✓ Patch 2: ssr.mjs patched to import "./${serverFile}".`);
    }
  }
}
