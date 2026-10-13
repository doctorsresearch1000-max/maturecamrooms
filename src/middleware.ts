import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  modelPermalinkPath,
  normalizeModelRouteParam,
} from "@/lib/seo/modelPermalink";
import { siteConfig } from "@/lib/site";

function apexHostname(): string {
  try {
    return new URL(siteConfig.url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "maturecamrooms.com";
  }
}

function redirect301(url: URL): NextResponse {
  return NextResponse.redirect(url, 301);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  const apex = apexHostname();

  if (host === `www.${apex}`) {
    const target = new URL(request.url);
    target.hostname = apex;
    target.protocol = "https:";
    target.port = "";
    return redirect301(target);
  }

  const { pathname } = request.nextUrl;

  const modelMatch = pathname.match(/^\/model\/([^/]+)\/?$/);
  if (modelMatch) {
    const rawParam = decodeURIComponent(modelMatch[1]);
    const slug = normalizeModelRouteParam(rawParam);
    if (!slug) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const canonicalPath = modelPermalinkPath(slug);
    const hasQueryOrHash =
      request.nextUrl.search.length > 0 || request.nextUrl.hash.length > 0;
    const pathMismatch =
      pathname.replace(/\/$/, "") !== canonicalPath ||
      rawParam !== slug ||
      hasQueryOrHash;
    if (pathMismatch) {
      const target = new URL(canonicalPath, request.url);
      target.search = "";
      target.hash = "";
      return redirect301(target);
    }
  }

  const intentMatch = pathname.match(/^\/model\/([^/]+)\/(vip|leaks)\/?$/i);
  if (intentMatch) {
    const slug = normalizeModelRouteParam(decodeURIComponent(intentMatch[1]));
    const intent = intentMatch[2].toLowerCase();
    if (!slug) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const canonicalPath = `/model/${slug}/${intent}`;
    if (
      pathname.replace(/\/$/, "") !== canonicalPath ||
      request.nextUrl.search.length > 0
    ) {
      const target = new URL(canonicalPath, request.url);
      target.search = "";
      return redirect301(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/model/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|webp|svg|ico|xml)$).*)",
  ],
};
