/**
 * Mirrors CRAK_* from GitHub Actions into Cloudflare Pages deployment_configs
 * for Production and Preview. Required for branch previews; also restores
 * Production if a prior PATCH echoed redacted env_vars from GET.
 *
 * Never spread env_vars from GET — secret values are omitted and would wipe keys.
 */
import https from "node:https";

const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ?? "b1a465896521acc54d57f28ce75cc717";
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT ?? "maturecamrooms";
const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

if (!apiToken) {
  console.log("sync-pages-crak-env: skip (no CLOUDFLARE_API_TOKEN)");
  process.exit(0);
}

function pickCrakEnv() {
  const apiKey = (
    process.env.CRAK_API_KEY ||
    process.env.CRAKREVENUE_API_KEY ||
    ""
  ).trim();
  const token = (
    process.env.CRAK_TOKEN ||
    process.env.CRAKREVENUE_API_TOKEN ||
    process.env.CRACKREVENUE_TOKEN ||
    ""
  ).trim();
  if (!apiKey || !token) {
    return null;
  }
  const optional = [
    ["CRAK_CAM_API_BASE", process.env.CRAK_CAM_API_BASE],
    ["CRAK_BRANDS", process.env.CRAK_BRANDS],
    ["CRAK_LANDING_ID", process.env.CRAK_LANDING_ID],
    ["CRAK_USER_AGENT", process.env.CRAK_USER_AGENT],
  ];
  const env = {
    CRAK_API_KEY: apiKey,
    CRAK_TOKEN: token,
  };
  for (const [key, value] of optional) {
    const v = value?.trim();
    if (v) env[key] = v;
  }
  return env;
}

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      {
        hostname: "api.cloudflare.com",
        path: `/client/v4${path}`,
        method,
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.success) {
              reject(
                new Error(
                  `Cloudflare API ${method} ${path} failed: ${JSON.stringify(parsed.errors ?? parsed)}`,
                ),
              );
              return;
            }
            resolve(parsed.result);
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const crak = pickCrakEnv();
if (!crak) {
  console.log("sync-pages-crak-env: skip (CRAK_API_KEY + CRAK_TOKEN missing)");
  process.exit(0);
}

const project = await apiRequest(
  "GET",
  `/accounts/${accountId}/pages/projects/${projectName}`,
);

const productionConfig = project.deployment_configs?.production ?? {};
const previewConfig = project.deployment_configs?.preview ?? {};
const failOpen =
  productionConfig.fail_open ?? previewConfig.fail_open ?? false;

const env_vars = Object.fromEntries(
  Object.entries(crak).map(([key, value]) => [
    key,
    { type: "secret_text", value },
  ]),
);

await apiRequest("PATCH", `/accounts/${accountId}/pages/projects/${projectName}`, {
  deployment_configs: {
    production: { fail_open: failOpen, env_vars },
    preview: { fail_open: failOpen, env_vars },
  },
});

console.log(
  `sync-pages-crak-env: set CRAK env_vars on Production + Preview for ${projectName} (${Object.keys(crak).join(", ")})`,
);
