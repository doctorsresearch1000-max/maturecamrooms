/**
 * Ensures UI uses canonical /model/{slug} permalinks (no /live/ or /watch/).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const srcRoot = join(process.cwd(), "src");
const forbidden = [
  {
    re: /href\s*=\s*[`'"]\/live\/[^`'"]+[`'"]/g,
    hint: "use modelProfileHref — /live/ is legacy",
  },
  {
    re: /href\s*=\s*[`'"]\/watch\/[^`'"]+[`'"]/g,
    hint: "use modelProfileHref — /watch/ is legacy",
  },
];

const allowed = new Set([
  "app/live/[id]/route.ts",
  "app/watch/[id]/route.ts",
  "lib/http/legacyPlayerRoute.ts",
  "lib/profile/resolvePlayerRouteSlug.ts",
]);

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(name)) files.push(full);
  }
  return files;
}

for (const file of walk(srcRoot)) {
  const rel = relative(srcRoot, file);
  if (allowed.has(rel)) continue;
  const text = readFileSync(file, "utf8");
  for (const { re, hint } of forbidden) {
    re.lastIndex = 0;
    if (re.test(text)) {
      console.error(`verify-profile-internal-links: ${rel}: ${hint}`);
      process.exit(1);
    }
  }
}

console.log("verify-profile-internal-links: OK");
