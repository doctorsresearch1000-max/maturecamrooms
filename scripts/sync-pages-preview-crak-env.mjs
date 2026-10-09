/**
 * Ensures CRAK_* exist in Cloudflare Pages Preview deployment_configs.env_vars
 * so branch previews (wrangler pages deploy --branch=...) can call CRAK at runtime.
 * GitHub Actions secrets are build-time only unless mirrored here.
 */
import https from "node:https";

const accountId =
  process.env.CLOUDFLARE_ACCOUNT_ID ?? "b1a465896521acc54d57f28ce75cc717";
const projectName = process.env.CLOUDFLARE_PAGES_PROJECT ?? "maturecamrooms";
const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

if (!apiToken) {
  console.log("sync-pages-preview-crak-env: skip (no CLOUDFLARE_API_TOKEN)");
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
  console.log("sync-pages-preview-crak-env: skip (CRAK_API_KEY + CRAK_TOKEN missing)");
  process.exit(0);
}

const project = await apiRequest(
  "GET",
  `/accounts/${accountId}/pages/projects/${projectName}`,
);

const previewConfig = project.deployment_configs?.preview ?? {};
const existingVars = previewConfig.env_vars ?? {};
const env_vars = { ...existingVars };

for (const [key, value] of Object.entries(crak)) {
  env_vars[key] = { type: "secret_text", value };
}

await apiRequest("PATCH", `/accounts/${accountId}/pages/projects/${projectName}`, {
  deployment_configs: {
    preview: {
      ...previewConfig,
      env_vars,
    },
  },
});

console.log(
  `sync-pages-preview-crak-env: updated Preview env_vars for ${projectName} (${Object.keys(crak).join(", ")})`,
);
