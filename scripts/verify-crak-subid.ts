/**
 * Static check: outbound affiliate URL building must go through crak-subid helpers.
 * Usage: npx tsx scripts/verify-crak-subid.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  applyCrakTrackingSubId,
  CRAK_SUBID_DEFAULT,
  withCrakSubId,
} from "../src/lib/affiliate/crak-subid";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`verify-crak-subid: ${message}`);
    process.exit(1);
  }
}

// Unit checks for URL helper behavior
const sample =
  "https://www.streamate.com/cam/ExampleModel?foo=1&subid=old_value";
const tagged = withCrakSubId(sample);
assert(
  tagged.includes(`subid=${CRAK_SUBID_DEFAULT}`),
  "withCrakSubId should set subid",
);
assert(!tagged.includes("subid=old_value"), "withCrakSubId should replace subid");

const smartlink = applyCrakTrackingSubId(
  "https://go.crakrevenue.com/?cmp=1",
  { platform: "crak" },
);
assert(
  smartlink.includes(`subid=${CRAK_SUBID_DEFAULT}`),
  "crak platform URLs should get subid",
);

const stripchat = applyCrakTrackingSubId(
  "https://stripchat.com/model?userId=1",
  { platform: "stripchat" },
);
assert(
  !stripchat.includes("subid="),
  "stripchat URLs should not get crak subid",
);

const srcRoot = join(process.cwd(), "src");
const forbiddenPatterns: { re: RegExp; hint: string }[] = [
  {
    re: /https:\/\/[^"'\s]*streamate\.com[^"'\s]*/gi,
    hint: "hardcoded streamate URL — use resolveRoomUrl / buildAffiliateRoomUrl",
  },
  {
    re: /https:\/\/[^"'\s]*crakrevenue\.com[^"'\s]*/gi,
    hint: "hardcoded crakrevenue URL — use affiliate helpers",
  },
];

const allowedPaths = new Set([
  "lib/affiliate/crak-subid.ts",
  "lib/crak/config.ts",
  "lib/crak/diagnostics.ts",
  "app/api/crak/health/route.ts",
]);

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else if (/\.(tsx?|jsx?)$/.test(name)) {
      files.push(full);
    }
  }
  return files;
}

for (const file of walk(srcRoot)) {
  const rel = relative(srcRoot, file);
  if (allowedPaths.has(rel)) continue;
  const text = readFileSync(file, "utf8");
  for (const { re, hint } of forbiddenPatterns) {
    re.lastIndex = 0;
    const match = re.exec(text);
    if (match) {
      console.error(
        `verify-crak-subid: ${rel}: found ${match[0]} — ${hint}`,
      );
      process.exit(1);
    }
  }
}

console.log("verify-crak-subid: OK");
