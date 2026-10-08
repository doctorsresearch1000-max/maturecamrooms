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

type CloudflareEnvLike = Record<string, unknown>;

function readFromProcess(key: string): string {
  try {
    return process.env[key]?.trim() ?? "";
  } catch {
    return "";
  }
}

/**
 * Defensive access to Pages/Workers env via next-on-pages (never throws).
 */
function getCloudflareEnv(): CloudflareEnvLike | undefined {
  try {
    // Lazy require: @cloudflare/next-on-pages is edge-only and breaks Node tooling.
    const req = eval("require") as NodeRequire;
    const mod = req("@cloudflare/next-on-pages") as {
      getOptionalRequestContext?: () => { env?: CloudflareEnvLike };
    };
    const ctx = mod.getOptionalRequestContext?.();
    const env = ctx?.env;
    return env && typeof env === "object"
      ? (env as CloudflareEnvLike)
      : undefined;
  } catch {
    return undefined;
  }
}

function readFromCloudflare(key: string): string {
  try {
    const env = getCloudflareEnv();
    const raw = env?.[key];
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

  try {
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
  } catch {
    for (const key of CRAK_ENV_KEYS) {
      out[key] = { present: false, length: 0, source: "none" };
    }
  }

  return out;
}

export function getCrakRuntimeDiagnostics() {
  try {
    const presence = getCrakEnvPresence();
    const cloudflareContext = Boolean(getCloudflareEnv());

    return {
      cloudflareContext,
      presence,
      resolvedApiBase:
        readCrakRuntimeEnv("CRAK_CAM_API_BASE") ||
        "https://performersext-api.pcvdaa.com/performers-ext",
      credentialsReady:
        Boolean(
          readCrakRuntimeEnv("CRAK_API_KEY") ||
            readCrakRuntimeEnv("CRAKREVENUE_API_KEY"),
        ) &&
        Boolean(
          readCrakRuntimeEnv("CRAK_TOKEN") ||
            readCrakRuntimeEnv("CRAKREVENUE_API_TOKEN") ||
            readCrakRuntimeEnv("CRACKREVENUE_TOKEN"),
        ),
    };
  } catch {
    return {
      cloudflareContext: false,
      presence: {} as Record<CrakEnvKey, EnvPresence>,
      resolvedApiBase:
        "https://performersext-api.pcvdaa.com/performers-ext",
      credentialsReady: false,
    };
  }
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
