/**
 * Sample model profile URLs from generated sitemaps; fail if >2 non-200 on preview.
 *
 * Env:
 *   PAGES_PREVIEW_URL — base URL (no trailing slash). Default from GITHUB_REF_NAME.
 *   GITHUB_REF — full ref (e.g. refs/heads/main)
 *   SAMPLE_SIZE — default 30
 *   MAX_FAILURES — default 2
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const SAMPLE_SIZE = Number(process.env.SAMPLE_SIZE ?? "30");
const MAX_FAILURES = Number(process.env.MAX_FAILURES ?? "2");
const publicDir = resolve(process.cwd(), "public");

function previewBaseUrl() {
  if (process.env.PAGES_PREVIEW_URL) {
    return process.env.PAGES_PREVIEW_URL.replace(/\/$/, "");
  }
  const ref = process.env.GITHUB_REF ?? "";
  if (ref === "refs/heads/main" || process.env.GITHUB_REF_NAME === "main") {
    return "https://maturecamrooms.com";
  }
  const branch = (process.env.GITHUB_REF_NAME ?? "main").replace(/\//g, "-");
  return `https://${branch}.maturecamrooms.pages.dev`;
}

function collectModelUrls() {
  const files = readdirSync(publicDir).filter(
    (f) => f.startsWith("sitemap-models-") && f.endsWith(".xml"),
  );
  const urls = [];
  for (const file of files) {
    const xml = readFileSync(resolve(publicDir, file), "utf8");
    const matches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const m of matches) {
      const loc = m[1];
      if (loc.includes("/model/")) urls.push(loc);
    }
  }
  return urls;
}

function pickRandom(items, n) {
  const copy = [...items];
  const out = [];
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

async function probeBaseUrl(base) {
  const probe = `${base}/api/crak/health`;
  try {
    const res = await fetch(probe, {
      redirect: "follow",
      headers: { "User-Agent": "maturecamrooms-ci-verify/1.0" },
    });
    if (res.status === 404 || res.status === 522 || res.status === 525) {
      return { ok: false, status: res.status, probe };
    }
    if (res.status >= 500) {
      return { ok: false, status: res.status, probe };
    }
    return { ok: true, status: res.status, probe };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      probe,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "maturecamrooms-ci-verify/1.0" },
    });
    return { url, status: res.status, ok: res.status === 200 };
  } catch (err) {
    return {
      url,
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const base = previewBaseUrl();
  const baseProbe = await probeBaseUrl(base);
  if (!baseProbe.ok) {
    console.error(
      `::error::Pages preview base URL is not reachable: ${base} (probed ${baseProbe.probe}, status=${baseProbe.status}${baseProbe.error ? `, ${baseProbe.error}` : ""}). For cursor/** branches Cloudflare uses https://<branch-with-slashes-as-dashes>.maturecamrooms.pages.dev — set PAGES_PREVIEW_URL if the alias differs.`,
    );
    process.exit(1);
  }

  const all = collectModelUrls();
  if (all.length < SAMPLE_SIZE) {
    console.error(
      `::error::Only ${all.length} model URLs in sitemap; need at least ${SAMPLE_SIZE}. Run generate:sitemap first.`,
    );
    process.exit(1);
  }

  const sample = pickRandom(all, SAMPLE_SIZE);
  const targets = sample.map((abs) => {
    const path = abs.replace(/^https?:\/\/[^/]+/, "");
    return `${base}${path}`;
  });

  console.log(
    JSON.stringify(
      { base, baseProbeStatus: baseProbe.status, sampled: targets.length, sitemapPool: all.length },
      null,
      2,
    ),
  );

  const results = await Promise.all(targets.map((u) => checkUrl(u)));
  const failures = results.filter((r) => !r.ok);

  if (failures.length > 0) {
    console.error(JSON.stringify({ failures }, null, 2));
  }

  if (failures.length > MAX_FAILURES) {
    console.error(
      `::error::${failures.length} of ${SAMPLE_SIZE} model URLs failed on ${base} (max ${MAX_FAILURES}).`,
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        checked: results.length,
        failures: failures.length,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
