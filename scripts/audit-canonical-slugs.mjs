/**
 * Sitemap guardian — abort build if indexed model URLs are not sanitized.
 * Usage: node scripts/audit-canonical-slugs.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const publicDir = resolve(root, "public");

function fail(message) {
  console.error(`audit-canonical-slugs: ${message}`);
  process.exit(1);
}

const { sanitizeModelSlug, isSanitizedModelSlug } = await import(
  "../src/lib/seo/modelPermalink.ts"
);

const samples = [
  ["foo_bar", "foo-bar"],
  ["@Model_Name", "model-name"],
  ["UPPER", "upper"],
];

for (const [input, expected] of samples) {
  const out = sanitizeModelSlug(input);
  if (out !== expected) {
    fail(`sanitizeModelSlug("${input}") expected "${expected}", got "${out}"`);
  }
}

if (sanitizeModelSlug("bad_slug") !== "bad-slug") {
  fail("underscores must normalize to hyphens");
}

const modelLocRe = /<loc>([^<]+)<\/loc>/g;
const xmlFiles = existsSync(publicDir)
  ? readdirSync(publicDir).filter(
      (f) => f.startsWith("sitemap") && f.endsWith(".xml"),
    )
  : [];

for (const file of xmlFiles) {
  const raw = readFileSync(resolve(publicDir, file), "utf8");
  let match;
  while ((match = modelLocRe.exec(raw)) !== null) {
    const loc = match[1];
    if (!loc.includes("/model/")) continue;
    const segment = loc.split("/model/")[1]?.split(/[?#]/)[0] ?? "";
    if (!segment) continue;
    if (segment.includes("_")) {
      fail(`${file}: unsanitized underscore in <loc> ${loc}`);
    }
    if (!isSanitizedModelSlug(segment)) {
      fail(`${file}: slug failed guardian: ${segment} (${loc})`);
    }
    const decoded = decodeURIComponent(segment);
    if (decoded !== segment && !isSanitizedModelSlug(decoded)) {
      fail(`${file}: encoded slug invalid: ${loc}`);
    }
  }
}

console.log("audit-canonical-slugs: OK");
