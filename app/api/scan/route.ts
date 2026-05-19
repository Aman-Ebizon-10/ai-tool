import { analyzeHtml } from "@/app/lib/shopify-detector";

const BLOCKED_HOSTS =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|0\.0\.0\.0)/i;

const MAX_BODY_BYTES = 1_048_576; // 1 MB

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function POST(request: Request) {
  // Parse body
  let rawUrl: string;
  try {
    const body = await request.json();
    rawUrl = typeof body?.url === "string" ? body.url : "";
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!rawUrl.trim()) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  // Parse and validate URL
  let target: URL;
  try {
    target = new URL(normalizeUrl(rawUrl));
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return Response.json(
      { error: "Only HTTP and HTTPS URLs are allowed" },
      { status: 400 }
    );
  }

  if (BLOCKED_HOSTS.test(target.hostname)) {
    return Response.json({ error: "URL is not allowed" }, { status: 403 });
  }

  // Fetch the page
  let response: Response;
  try {
    response = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ShopAudit/1.0; +https://shopaudit.io)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");
    return Response.json(
      {
        error: isTimeout
          ? "The store took too long to respond"
          : "Could not reach the store — check the URL and try again",
      },
      { status: 504 }
    );
  }

  // Validate content type
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok) {
    return Response.json(
      { error: `Store returned HTTP ${response.status}` },
      { status: 422 }
    );
  }
  if (!contentType.includes("text/html")) {
    return Response.json(
      { error: "URL did not return an HTML page" },
      { status: 422 }
    );
  }

  // Read body, capped at MAX_BODY_BYTES
  let html: string;
  try {
    const buffer = await response.arrayBuffer();
    const slice =
      buffer.byteLength > MAX_BODY_BYTES
        ? buffer.slice(0, MAX_BODY_BYTES)
        : buffer;
    html = new TextDecoder("utf-8", { fatal: false }).decode(slice);
  } catch {
    return Response.json(
      { error: "Failed to read the page response" },
      { status: 500 }
    );
  }

  const result = analyzeHtml(html, target.hostname, target.protocol === "https:");
  return Response.json(result);
}
