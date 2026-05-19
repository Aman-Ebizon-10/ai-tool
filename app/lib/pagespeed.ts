import type { PerformanceViewMetrics } from "./shopify-detector";

const PSI_ENDPOINT =
  "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function cwvRating(val: number, fast: number, moderate: number): "fast" | "moderate" | "slow" {
  return val < fast ? "fast" : val < moderate ? "moderate" : "slow";
}

// numericValue in LH audits is sometimes null/undefined even when the key exists
function safeNum(audit: unknown): number | null {
  if (audit !== null && typeof audit === "object" && "numericValue" in audit) {
    const v = (audit as { numericValue: unknown }).numericValue;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }
  return null;
}

// LH reports LCP and FCP in milliseconds — convert to seconds (1 decimal place)
function msToSec(ms: number): number {
  return Math.round(ms / 100) / 10;
}

// ─── Single-strategy fetch ─────────────────────────────────────────────────────

export async function fetchPageSpeedView(
  url: string,
  strategy: "mobile" | "desktop"
): Promise<PerformanceViewMetrics> {
  const params = new URLSearchParams({ url, strategy });

  const apiKey = process.env.PAGESPEED_API_KEY;
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${PSI_ENDPOINT}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    throw new Error(`PageSpeed Insights returned HTTP ${res.status}`);
  }

  const data: unknown = await res.json();

  if (!data || typeof data !== "object") {
    throw new Error("Unexpected PageSpeed response shape");
  }

  const d = data as Record<string, unknown>;
  const lh = d.lighthouseResult as Record<string, unknown> | undefined;
  const audits = (lh?.audits as Record<string, unknown>) ?? {};
  const perfScore = (
    (lh?.categories as Record<string, unknown> | undefined)?.performance as
      | { score?: unknown }
      | undefined
  )?.score;

  const score = typeof perfScore === "number" ? Math.round(perfScore * 100) : 0;

  // Metric values from Lighthouse audits
  const lcpMs  = safeNum(audits["largest-contentful-paint"]);
  const fcpMs  = safeNum(audits["first-contentful-paint"]);
  const inpMs  = safeNum(audits["interaction-to-next-paint"]);
  const clsRaw = safeNum(audits["cumulative-layout-shift"]);

  // Unit conversions — fall back to "needs improvement" boundary if audit absent
  const lcpVal = lcpMs  !== null ? msToSec(lcpMs)                    : 2.5;
  const fcpVal = fcpMs  !== null ? msToSec(fcpMs)                    : 1.8;
  const inpVal = inpMs  !== null ? Math.round(inpMs / 10) * 10       : 200;
  const clsVal = clsRaw !== null ? Math.round(clsRaw * 100) / 100    : 0.1;

  return {
    score,
    cwv: {
      lcp: { value: lcpVal, rating: cwvRating(lcpVal, 2.5, 4) },
      fcp: { value: fcpVal, rating: cwvRating(fcpVal, 1.8, 3) },
      inp: { value: inpVal, rating: cwvRating(inpVal, 200, 500) },
      cls: { value: clsVal, rating: cwvRating(clsVal, 0.1, 0.25) },
    },
  };
}
