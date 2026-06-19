/**
 * postbuild.mjs
 *
 * Patches the Vercel serverless output to replace the bare `import { __awaiter } from "tslib"`
 * in supabase__functions-js.mjs with an inline implementation.
 *
 * Why: Nitro's dependency tracer copies tslib into node_modules inside the lambda, but
 * Node 24 ESM resolution fails to find it because the tslib package's exports map
 * points to modules/index.js which itself uses a relative CJS import.
 * Inlining the 10-line __awaiter function permanently eliminates the runtime crash.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const TARGET = resolve(
  root,
  ".vercel/output/functions/__server.func/_libs/supabase__functions-js.mjs"
);

if (!existsSync(TARGET)) {
  console.log("[postbuild] supabase__functions-js.mjs not found, skipping patch.");
  process.exit(0);
}

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

let content = readFileSync(TARGET, "utf8");

if (!content.includes(TSLIB_IMPORT)) {
  console.log("[postbuild] tslib import not found — already patched or changed. Skipping.");
  process.exit(0);
}

content = content.replace(TSLIB_IMPORT, TSLIB_INLINE);
writeFileSync(TARGET, content, "utf8");
console.log("[postbuild] ✓ Patched supabase__functions-js.mjs — tslib __awaiter inlined.");
