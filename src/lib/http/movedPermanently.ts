import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/site";

export function movedPermanently(
  pathOrUrl: string,
  headers?: HeadersInit,
): NextResponse {
  const target = pathOrUrl.startsWith("http")
    ? pathOrUrl.split("?")[0].split("#")[0]
    : absoluteUrl(pathOrUrl);
  return NextResponse.redirect(target, {
    status: 301,
    headers,
  });
}
