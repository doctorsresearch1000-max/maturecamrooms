import {
  getCrakApiBase,
  getCrakCredentials,
  getCrakUserAgent,
  resolveCrakBrands,
} from "@/lib/crak/config";
import { redactCrakUrl } from "@/lib/crak/diagnostics";
import type {
  CrakFetchParams,
  CrakPerformersResponse,
} from "@/lib/crak/types";

export class CrakApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "CrakApiError";
    this.status = status;
    this.detail = detail;
  }
}

function buildQuery(params: CrakFetchParams, token: string): URLSearchParams {
  const q = new URLSearchParams();
  q.set("token", token);
  q.set("lang", params.lang ?? "en");
  q.set("gender", params.gender ?? "f");
  if (params.page !== undefined) q.set("page", String(params.page));
  if (params.size !== undefined) q.set("size", String(params.size));
  if (params.sorting) q.set("sorting", params.sorting);
  if (params.live !== undefined) q.set("live", String(params.live));
  if (params.tags) q.set("tags", params.tags);
  if (params.ethnicities) q.set("ethnicities", params.ethnicities);
  if (params.ages) q.set("ages", params.ages);
  if (params.name) q.set("name", params.name);
  if (params.brands) q.set("brands", params.brands);
  else q.set("brands", resolveCrakBrands());
  return q;
}

function logCrakFetchFailure(
  url: string,
  err: unknown,
  httpStatus?: number,
): void {
  const payload = {
    url: redactCrakUrl(url),
    httpStatus,
    errorName: err instanceof Error ? err.name : typeof err,
    errorMessage: err instanceof Error ? err.message : String(err),
    cause:
      err instanceof Error && err.cause != null
        ? String(err.cause)
        : undefined,
  };
  console.error("[crak] fetchPerformers failed", payload);
}

export async function fetchPerformers(
  params: CrakFetchParams = {},
): Promise<CrakPerformersResponse> {
  const creds = getCrakCredentials();
  if (!creds) {
    throw new CrakApiError(
      "CrakRevenue API credentials are not configured",
      503,
      "CRAK_API_KEY and CRAK_TOKEN missing at runtime",
    );
  }

  const query = buildQuery(params, creds.token);
  const apiBase = getCrakApiBase();
  const url = `${apiBase}?${query.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    // Workers fetch does not implement RequestInit.cache (no-store crashes runtime).
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": creds.apiKey,
        "User-Agent": getCrakUserAgent(),
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      let message = `CrakRevenue API error (${res.status})`;
      let bodyText = "";
      try {
        bodyText = await res.text();
        const body = JSON.parse(bodyText) as {
          message?: string;
          error?: string;
        };
        message = body.message ?? body.error ?? message;
      } catch {
        if (bodyText) message = `${message}: ${bodyText.slice(0, 200)}`;
      }
      logCrakFetchFailure(url, new Error(message), res.status);
      throw new CrakApiError(message, res.status, `HTTP ${res.status}`);
    }

    const data = (await res.json()) as CrakPerformersResponse;
    if (!data || !Array.isArray(data.performers)) {
      const malformed = new CrakApiError("Malformed CrakRevenue response", 502);
      logCrakFetchFailure(url, malformed);
      throw malformed;
    }
    return data;
  } catch (err) {
    if (err instanceof CrakApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      logCrakFetchFailure(url, err);
      throw new CrakApiError("CrakRevenue API timeout", 504, err.message);
    }
    logCrakFetchFailure(url, err);
    const detail =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    throw new CrakApiError("Failed to reach CrakRevenue API", 502, detail);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchPerformerByName(
  nameClean: string,
): Promise<CrakPerformersResponse> {
  return fetchPerformers({
    name: nameClean,
    size: 5,
    page: 1,
    gender: "f",
  });
}
