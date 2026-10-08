const IFRAME_HOST_ALLOWLIST = [
  "hybridclient.naiadsystems.com",
  "www.naiadsystems.com",
  "naiadsystems.com",
];

const STREAM_HOST_ALLOWLIST = [
  ...IFRAME_HOST_ALLOWLIST,
  "stripchat.com",
  "chaturbate.com",
];

export function isAllowedIframeUrl(url: string): boolean {
  return isAllowedHost(url, IFRAME_HOST_ALLOWLIST);
}

export function isAllowedStreamUrl(url: string): boolean {
  return isAllowedHost(url, STREAM_HOST_ALLOWLIST);
}

function isAllowedHost(url: string, hosts: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return hosts.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

export function pickSafeStreamUrl(
  iframeFeedUrl?: string,
  streamFeedUrl?: string,
): string | undefined {
  if (iframeFeedUrl && isAllowedIframeUrl(iframeFeedUrl)) {
    return iframeFeedUrl;
  }
  if (streamFeedUrl && isAllowedStreamUrl(streamFeedUrl)) {
    return streamFeedUrl;
  }
  return undefined;
}
