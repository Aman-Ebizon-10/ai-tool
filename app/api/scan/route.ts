import { analyzeHtml } from "@/app/lib/shopify-detector";
import { fetchPageSpeedView } from "@/app/lib/pagespeed";

// Increase Vercel function timeout so PSI calls can complete (Pro plan: up to 60s)
export const maxDuration = 30;

const BLOCKED_HOSTS =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|0\.0\.0\.0)/i;

const MAX_BODY_BYTES = 1_048_576; // 1 MB

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function POST(request: Request) {
  // ── Parse body ──────────────────────────────────────────────────────────────
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

  // ── Parse and validate URL ──────────────────────────────────────────────────
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

  // ── Fire PageSpeed calls immediately — they run while the HTML is fetched ──
  // Both strategies run in parallel. Promise.allSettled means a PSI failure
  // never blocks the main scan — we fall back to heuristic estimates instead.
  const psiMobilePromise  = fetchPageSpeedView(target.toString(), "mobile");
  const psiDesktopPromise = fetchPageSpeedView(target.toString(), "desktop");

  // ── Fetch the store HTML ────────────────────────────────────────────────────
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

  // ── Validate response ───────────────────────────────────────────────────────
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

  // ── Read body (capped at 1 MB) ──────────────────────────────────────────────
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

  // ── HTML analysis (heuristic performance used as fallback) ──────────────────
  const result = analyzeHtml(html, target.hostname, target.protocol === "https:");

  // ── Await PSI results — likely already done by now ─────────────────────────
  const [mobileRes, desktopRes] = await Promise.allSettled([
    psiMobilePromise,
    psiDesktopPromise,
  ]);

  if (mobileRes.status === "fulfilled" && desktopRes.status === "fulfilled") {
    // Both strategies succeeded — replace heuristic estimates with real data
    const desktop = desktopRes.value;
    result.performance = {
      // Preserve HTML-derived technical signals (scripts, CSS, images, etc.)
      ...result.performance,
      // Override with authoritative PageSpeed data
      mobile:  mobileRes.value,
      desktop: desktopRes.value,
      score:   desktop.score,
      cwv:     desktop.cwv,
    };
  }
  // If either PSI call failed (rate-limited, no key, timeout), the heuristic
  // performance data from analyzeHtml is used transparently — no error thrown.

  return Response.json(result);
}
