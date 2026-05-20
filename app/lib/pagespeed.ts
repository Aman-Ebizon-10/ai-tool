import type { PerformanceViewMetrics } from "./shopify-detector";

const PSI_ENDPOINT =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// ─── API key detection ─────────────────────────────────────────────────────────
const PAGESPEED_API_KEY =
  process.env.GOOGLE_PAGESPEED_API_KEY ?? process.env.PAGESPEED_API_KEY ?? "";

if (PAGESPEED_API_KEY) {
  console.log("[PageSpeed] API key detected — authenticated requests enabled");
} else {
  console.warn(
    "[PageSpeed] No API key found (GOOGLE_PAGESPEED_API_KEY is not set). " +
      "Unauthenticated requests have a low rate limit and may fail under load. " +
      "Add your key to .env.local to increase quota."
  );
}

// ─── In-process cache (5-min TTL) ─────────────────────────────────────────────
// Shared across warm lambda instances; helps avoid redundant PSI calls on
// repeated scans of the same URL within the same server process.
const CACHE_TTL_MS = 5 * 60 * 1000;
interface CacheEntry { data: PerformanceViewMetrics; expiresAt: number }
const cache = new Map<string, CacheEntry>();

function cacheKey(url: string, strategy: string) { return `${strategy}:${url}`; }

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cwvRating(val: number, fast: number, moderate: number): "fast" | "moderate" | "slow" {
  return val < fast ? "fast" : val < moderate ? "moderate" : "slow";
}

function safeNum(audit: unknown): number | null {
  if (audit !== null && typeof audit === "object" && "numericValue" in audit) {
    const v = (audit as { numericValue: unknown }).numericValue;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  return null;
}

function msToSec(ms: number): number { return Math.round(ms / 100) / 10; }

// CrUX metric object helpers
function cruxNum(m: unknown): number | null {
  if (m && typeof m === "object" && "percentile" in m) {
    const v = (m as { percentile: unknown }).percentile;
    return typeof v === "number" ? v : null;
  }
  return null;
}

function cruxCat(m: unknown): "fast" | "moderate" | "slow" {
  if (m && typeof m === "object" && "category" in m) {
    const c = (m as { category: unknown }).category;
    if (c === "FAST") return "fast";
    if (c === "SLOW") return "slow";
  }
  return "moderate";
}

// ─── Core fetcher ──────────────────────────────────────────────────────────────

async function fetchPSI(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PerformanceViewMetrics> {
  const key = cacheKey(url, strategy);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const params = new URLSearchParams({ url, strategy });
  if (PAGESPEED_API_KEY) params.set("key", PAGESPEED_API_KEY);

  const res = await fetch(`${PSI_ENDPOINT}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(50_000),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = (await res.json()) as Record<string, unknown>;
      const msg = (errBody?.error as Record<string, unknown> | undefined)?.message;
      if (typeof msg === "string") detail = ` — ${msg}`;
    } catch { /* ignore parse errors */ }

    if (res.status === 429) {
      throw new Error(
        `PageSpeed API rate limit exceeded${PAGESPEED_API_KEY ? "" : " — add GOOGLE_PAGESPEED_API_KEY to .env.local to increase quota"}${detail}`
      );
    }
    if (res.status === 400 && !PAGESPEED_API_KEY) {
      throw new Error(`PageSpeed API returned HTTP 400 — an API key may be required${detail}`);
    }
    throw new Error(`PageSpeed API returned HTTP ${res.status}${detail}`);
  }

  const data: unknown = await res.json();
  if (!data || typeof data !== "object") {
    throw new Error("Unexpected PageSpeed response shape");
  }

  const d = data as Record<string, unknown>;

  // ── Lighthouse lab data ────────────────────────────────────────────────────
  const lh     = d.lighthouseResult as Record<string, unknown> | undefined;
  const audits = (lh?.audits as Record<string, unknown>) ?? {};

  const perfScore = (
    (lh?.categories as Record<string, unknown> | undefined)?.performance as
      | { score?: unknown }
      | undefined
  )?.score;
  const score = typeof perfScore === "number" ? Math.round(perfScore * 100) : 0;

  const lcpMs  = safeNum(audits["largest-contentful-paint"]);
  const fcpMs  = safeNum(audits["first-contentful-paint"]);
  const inpMs  = safeNum(audits["interaction-to-next-paint"]);
  const clsRaw = safeNum(audits["cumulative-layout-shift"]);
  const tbtMs  = safeNum(audits["total-blocking-time"]);
  const siMs   = safeNum(audits["speed-index"]);

  // ── CrUX field data (real Chrome user measurements — p75) ─────────────────
  const loadingExp  = d.loadingExperience as Record<string, unknown> | undefined;
  const cruxMetrics = (loadingExp?.metrics as Record<string, unknown>) ?? {};
  const overallCat  = typeof loadingExp?.overall_category === "string"
    ? loadingExp.overall_category
    : "NONE";
  // Field data is available when overall_category is set and LCP is present
  const hasFieldData = overallCat !== "NONE" && cruxNum(cruxMetrics["LARGEST_CONTENTFUL_PAINT_MS"]) !== null;

  const cruxLcp = cruxMetrics["LARGEST_CONTENTFUL_PAINT_MS"];
  const cruxInp = cruxMetrics["INTERACTION_TO_NEXT_PAINT"];
  const cruxCls = cruxMetrics["CUMULATIVE_LAYOUT_SHIFT_SCORE"];
  const cruxFcp = cruxMetrics["FIRST_CONTENTFUL_PAINT_MS"];

  let lcpVal: number, fcpVal: number, inpVal: number, clsVal: number;
  let lcpRating: "fast" | "moderate" | "slow";
  let fcpRating: "fast" | "moderate" | "slow";
  let inpRating: "fast" | "moderate" | "slow";
  let clsRating: "fast" | "moderate" | "slow";
  let dataSource: "field" | "lab";

  if (hasFieldData) {
    // Prefer real user data from CrUX — matches what pagespeed.web.dev shows
    dataSource = "field";
    lcpVal = msToSec(cruxNum(cruxLcp)!);
    fcpVal = msToSec(cruxNum(cruxFcp) ?? (fcpMs ?? 1800));
    // INP stored as ms in CrUX; round to nearest 10ms for display
    inpVal = Math.round((cruxNum(cruxInp) ?? (inpMs ?? 200)) / 10) * 10;
    // CrUX stores CLS as integer × 100 (e.g. 5 → CLS 0.05)
    clsVal = Math.round((cruxNum(cruxCls) ?? 0) / 100 * 100) / 100;

    lcpRating = cruxCat(cruxLcp);
    fcpRating = cruxCat(cruxFcp);
    inpRating = cruxCat(cruxInp);
    clsRating = cruxCat(cruxCls);
  } else {
    // Fall back to Lighthouse lab simulation
    dataSource = "lab";
    lcpVal = lcpMs  !== null ? msToSec(lcpMs)                  : 2.5;
    fcpVal = fcpMs  !== null ? msToSec(fcpMs)                  : 1.8;
    inpVal = inpMs  !== null ? Math.round(inpMs / 10) * 10     : 200;
    clsVal = clsRaw !== null ? Math.round(clsRaw * 100) / 100  : 0.1;

    lcpRating = cwvRating(lcpVal, 2.5, 4);
    fcpRating = cwvRating(fcpVal, 1.8, 3);
    inpRating = cwvRating(inpVal, 200, 500);
    clsRating = cwvRating(clsVal, 0.1, 0.25);
  }

  // TBT and Speed Index are always lab data (no CrUX equivalent)
  const tbtVal = tbtMs !== null ? Math.round(tbtMs / 10) * 10 : 300;
  const siVal  = siMs  !== null ? msToSec(siMs)               : 3.4;

  const result: PerformanceViewMetrics = {
    score,
    dataSource,
    cwv: {
      lcp: { value: lcpVal, rating: lcpRating },
      fcp: { value: fcpVal, rating: fcpRating },
      inp: { value: inpVal, rating: inpRating },
      cls: { value: clsVal, rating: clsRating },
      tbt: { value: tbtVal, rating: cwvRating(tbtVal, 200, 600) },
      si:  { value: siVal,  rating: cwvRating(siVal,  3.4, 5.8) },
    },
  };

  cache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function fetchPageSpeedMobile(url: string): Promise<PerformanceViewMetrics> {
  return fetchPSI(url, "mobile");
}

export async function fetchPageSpeedDesktop(url: string): Promise<PerformanceViewMetrics> {
  return fetchPSI(url, "desktop");
}

/** Kept for backward compatibility with existing callers. */
export async function fetchPageSpeedView(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PerformanceViewMetrics> {
  return fetchPSI(url, strategy);
}
