import {
  CRAK_API_BASE,
  CRAK_USER_AGENT,
  getCrakCredentials,
} from "@/lib/crak/config";
import type {
  CrakFetchParams,
  CrakPerformersResponse,
} from "@/lib/crak/types";

export class CrakApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "CrakApiError";
    this.status = status;
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
  return q;
}

export async function fetchPerformers(
  params: CrakFetchParams = {},
): Promise<CrakPerformersResponse> {
  const creds = getCrakCredentials();
  if (!creds) {
    throw new CrakApiError(
      "CrakRevenue API credentials are not configured",
      503,
    );
  }

  const query = buildQuery(params, creds.token);
  const url = `${CRAK_API_BASE}?${query.toString()}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": creds.apiKey,
        "User-Agent": CRAK_USER_AGENT,
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: params.live ? 30 : 120 },
    });

    if (!res.ok) {
      let message = `CrakRevenue API error (${res.status})`;
      try {
        const body = (await res.json()) as { message?: string; error?: string };
        message = body.message ?? body.error ?? message;
      } catch {
        /* non-json */
      }
      throw new CrakApiError(message, res.status);
    }

    const data = (await res.json()) as CrakPerformersResponse;
    if (!data || !Array.isArray(data.performers)) {
      throw new CrakApiError("Malformed CrakRevenue response", 502);
    }
    return data;
  } catch (err) {
    if (err instanceof CrakApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new CrakApiError("CrakRevenue API timeout", 504);
    }
    throw new CrakApiError("Failed to reach CrakRevenue API", 502);
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
