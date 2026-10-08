import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

const CRAK_ENV_KEYS = [
  "CRAK_API_KEY",
  "CRAK_TOKEN",
  "CRAK_CAM_API_BASE",
  "CRAK_BRANDS",
  "CRAK_LANDING_ID",
  "CRAK_USER_AGENT",
  "CRAKREVENUE_API_KEY",
  "CRAKREVENUE_API_TOKEN",
  "CRACKREVENUE_TOKEN",
] as const;

export type CrakEnvKey = (typeof CRAK_ENV_KEYS)[number];

export type EnvPresence = {
  present: boolean;
  length: number;
  source: "process" | "cloudflare" | "both" | "none";
};

function readFromProcess(key: string): string {
  return process.env[key]?.trim() ?? "";
}

function readFromCloudflare(key: string): string {
  try {
    const ctx = getOptionalRequestContext();
    const raw = ctx?.env?.[key as keyof CloudflareEnv];
    return typeof raw === "string" ? raw.trim() : "";
  } catch {
    return "";
  }
}

/** Runtime env read (avoids relying on build-time inlining). */
export function readCrakRuntimeEnv(key: CrakEnvKey | string): string {
  const fromCf = readFromCloudflare(key);
  const fromProcess = readFromProcess(key);
  return fromCf || fromProcess;
}

export function getCrakEnvPresence(): Record<CrakEnvKey, EnvPresence> {
  const out = {} as Record<CrakEnvKey, EnvPresence>;

  for (const key of CRAK_ENV_KEYS) {
    const fromProcess = readFromProcess(key);
    const fromCf = readFromCloudflare(key);
    const value = fromCf || fromProcess;
    let source: EnvPresence["source"] = "none";
    if (fromProcess && fromCf) source = "both";
    else if (fromCf) source = "cloudflare";
    else if (fromProcess) source = "process";

    out[key] = {
      present: value.length > 0,
      length: value.length,
      source,
    };
  }

  return out;
}

export function getCrakRuntimeDiagnostics() {
  const presence = getCrakEnvPresence();
  let cloudflareContext = false;
  try {
    cloudflareContext = Boolean(getOptionalRequestContext());
  } catch {
    cloudflareContext = false;
  }

  return {
    cloudflareContext,
    presence,
    resolvedApiBase:
      readCrakRuntimeEnv("CRAK_CAM_API_BASE") ||
      "https://performersext-api.pcvdaa.com/performers-ext",
    credentialsReady:
      Boolean(readCrakRuntimeEnv("CRAK_API_KEY") || readCrakRuntimeEnv("CRAKREVENUE_API_KEY")) &&
      Boolean(
        readCrakRuntimeEnv("CRAK_TOKEN") ||
          readCrakRuntimeEnv("CRAKREVENUE_API_TOKEN") ||
          readCrakRuntimeEnv("CRACKREVENUE_TOKEN"),
      ),
  };
}

export function redactCrakUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has("token")) {
      parsed.searchParams.set("token", "[redacted]");
    }
    return parsed.toString();
  } catch {
    return "[invalid-url]";
  }
}
