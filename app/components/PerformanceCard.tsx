"use client";

import { useState, useEffect, useRef } from "react";
import type {
  CwvEstimate,
  PerformanceMetrics,
  PerformanceViewMetrics,
} from "@/app/lib/shopify-detector";

// ─── Animated Score Ring ───────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const box = 112, r = 44, sw = 6;
  const circumference = 2 * Math.PI * r;

  const [displayed, setDisplayed] = useState(score);
  const prevRef = useRef(score);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current === score) return;
    const from = prevRef.current;
    prevRef.current = score;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let startTs: number | null = null;
    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / 700, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (score - from) * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const color = displayed >= 80 ? "#059669" : displayed >= 50 ? "#d97706" : "#dc2626";
  const targetColor = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  const targetFilled = (score / 100) * circumference;

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: box, height: box }}>
      <svg className="absolute inset-0 -rotate-90" width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
        <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
        <circle
          cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={sw} strokeLinecap="round"
          style={{
            strokeDasharray: `${targetFilled} ${circumference}`,
            stroke: targetColor,
            transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease",
          }}
        />
      </svg>
      <span className="relative text-3xl font-black tabular-nums" style={{ color }}>{displayed}</span>
    </div>
  );
}

// ─── CWV config ────────────────────────────────────────────────────────────────

const CWV_STYLE: Record<CwvEstimate["rating"], { badge: string; barColor: string; label: string }> = {
  fast:     { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", barColor: "#10b981", label: "Good" },
  moderate: { badge: "bg-amber-50 text-amber-700 ring-amber-200",       barColor: "#f59e0b", label: "Needs Work" },
  slow:     { badge: "bg-red-50 text-red-700 ring-red-200",             barColor: "#ef4444", label: "Poor" },
};

const CWV_OFFICIAL = [
  { key: "lcp" as const, label: "LCP", description: "Largest Contentful Paint", unit: "s",  max: 6,   thresholds: [2.5, 4]   as [number, number] },
  { key: "inp" as const, label: "INP", description: "Interaction to Next Paint", unit: "ms", max: 700, thresholds: [200, 500] as [number, number] },
  { key: "cls" as const, label: "CLS", description: "Cumulative Layout Shift",   unit: "",   max: 0.4, thresholds: [0.1, 0.25] as [number, number] },
];

const LAB_METRICS = [
  { key: "fcp" as const, label: "FCP", description: "First Contentful Paint", unit: "s",  max: 5,    thresholds: [1.8, 3]   as [number, number] },
  { key: "tbt" as const, label: "TBT", description: "Total Blocking Time",    unit: "ms", max: 1200, thresholds: [200, 600] as [number, number] },
  { key: "si"  as const, label: "SI",  description: "Speed Index",            unit: "s",  max: 10,   thresholds: [3.4, 5.8] as [number, number] },
];

function fmtValue(value: number, unit: string): string {
  if (unit === "ms") return `${value}ms`;
  if (unit === "s")  return `${value}s`;
  return value.toFixed(2);
}

function fmtThreshold(value: number, unit: string): string {
  if (unit === "ms") return `${value}ms`;
  if (unit === "s")  return `${value}s`;
  return String(value);
}

// ─── Metric Row ────────────────────────────────────────────────────────────────

function MetricRow({
  metric,
  cfg,
}: {
  metric: CwvEstimate;
  cfg: { label: string; description: string; unit: string; max: number; thresholds: [number, number] };
}) {
  const style = CWV_STYLE[metric.rating];
  const fillPct = Math.min((metric.value / cfg.max) * 100, 100);
  const [fast, mod] = cfg.thresholds;

  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="w-8 shrink-0 text-sm font-bold text-slate-700">{cfg.label}</span>
        <span className="flex-1 text-xs text-slate-400 min-w-0 truncate">{cfg.description}</span>
        <span className="shrink-0 text-base font-bold tabular-nums text-slate-900">
          {fmtValue(metric.value, cfg.unit)}
        </span>
        <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-semibold ring-1 transition-all duration-500 ${style.badge}`}>
          {style.label}
        </span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
          style={{ width: `${fillPct}%`, backgroundColor: style.barColor }}
        />
        <div className="absolute inset-y-0 w-px bg-emerald-400/50" style={{ left: `${(fast / cfg.max) * 100}%` }} />
        <div className="absolute inset-y-0 w-px bg-amber-400/50"   style={{ left: `${(mod  / cfg.max) * 100}%` }} />
      </div>
      <div className="relative mt-1 h-3 text-[9px]">
        <span className="absolute -translate-x-1/2 text-emerald-600" style={{ left: `${(fast / cfg.max) * 100}%` }}>
          {fmtThreshold(fast, cfg.unit)}
        </span>
        <span className="absolute -translate-x-1/2 text-amber-600" style={{ left: `${(mod / cfg.max) * 100}%` }}>
          {fmtThreshold(mod, cfg.unit)}
        </span>
      </div>
    </div>
  );
}

function MetricRowSkeleton() {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1.5 flex items-center gap-2">
        <div className="h-3 w-7 animate-pulse rounded bg-slate-100" />
        <div className="h-3 flex-1 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="h-1.5 animate-pulse rounded-full bg-slate-100" />
      <div className="mt-1 h-3" />
    </div>
  );
}

const SOURCE_STYLE: Record<PerformanceViewMetrics["dataSource"], { label: string; cls: string }> = {
  field:     { label: "Field Data",  cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  lab:       { label: "Lab Data",    cls: "bg-violet-50 text-violet-700 ring-violet-200" },
  estimated: { label: "Estimated",   cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

type MetricStatus = "good" | "warn" | "bad";
const RESOURCE_COLOR: Record<MetricStatus, string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad:  "text-red-600",
};

// ─── Main component ────────────────────────────────────────────────────────────

export default function PerformanceCard({
  perf,
  psiLoading = false,
  onRetryPsi,
}: {
  perf: PerformanceMetrics;
  psiLoading?: boolean;
  onRetryPsi?: () => void;
}) {
  const [view, setView] = useState<"mobile" | "desktop">("mobile");

  const current: PerformanceViewMetrics | null = perf[view];
  const cwv = current?.cwv ?? null;
  const src = current ? SOURCE_STYLE[current.dataSource] : null;

  const cwvPassed = cwv
    ? cwv.lcp.rating === "fast" && cwv.inp.rating === "fast" && cwv.cls.rating === "fast"
    : false;

  const scriptStatus: MetricStatus = perf.scriptCount > 20 ? "bad" : perf.scriptCount > 10 ? "warn" : "good";
  const blockStatus:  MetricStatus = perf.renderBlockingCount > 2 ? "bad" : perf.renderBlockingCount > 0 ? "warn" : "good";
  const cssStatus:    MetricStatus = perf.styleSheetCount > 5 ? "bad" : perf.styleSheetCount > 3 ? "warn" : "good";
  const htmlStatus:   MetricStatus = perf.htmlSizeKb < 150 ? "good" : perf.htmlSizeKb > 500 ? "bad" : "warn";

  const resources = [
    { label: "Scripts",     value: String(perf.scriptCount),         status: scriptStatus },
    { label: "Blocking",    value: String(perf.renderBlockingCount),  status: blockStatus  },
    { label: "Stylesheets", value: String(perf.styleSheetCount),      status: cssStatus    },
    { label: "Page Size",   value: `${perf.htmlSizeKb} KB`,           status: htmlStatus   },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </span>
          <h3 className="text-base font-semibold text-slate-800">Performance</h3>
        </div>
        <div className="flex items-center gap-3">
          {src && current && (
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ${src.cls}`}>
              {src.label}
            </span>
          )}
          {psiLoading && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <svg className="h-3 w-3 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Fetching PageSpeed data…
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column body ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-5 lg:divide-x lg:divide-y-0">

        {/* Left: Mobile/Desktop tabs + score dial + resource stats */}
        <div className="p-5 lg:col-span-2">

          {/* Tab toggle */}
          <div className="mb-5 flex rounded-lg bg-slate-100 p-0.5">
            {(["mobile", "desktop"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={[
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-all",
                  view === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600",
                ].join(" ")}
              >
                {v === "mobile" ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                  </svg>
                )}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          {/* Score dial */}
          <div className="mb-5 flex items-center gap-5">
            {current ? (
              <>
                <ScoreRing score={current.score} />
                <div>
                  <p className="text-4xl font-black tabular-nums text-slate-900 leading-none">{current.score}</p>
                  <p className="mt-1 text-sm text-slate-400">/ 100 Performance Score</p>
                  {cwv && (
                    <span className={[
                      "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
                      cwvPassed ? "bg-emerald-600" : "bg-red-600",
                    ].join(" ")}>
                      {cwvPassed ? "✓ CWV Passed" : "✗ CWV Failed"}
                    </span>
                  )}
                </div>
              </>
            ) : psiLoading ? (
              <>
                <div className="h-[112px] w-[112px] animate-pulse rounded-full bg-slate-100" />
                <div className="space-y-2">
                  <div className="h-7 w-14 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 text-slate-300">
                <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-slate-50">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400">Score unavailable</p>
              </div>
            )}
          </div>

          {/* Resource diagnostics grid */}
          <div className="grid grid-cols-2 gap-2">
            {resources.map(({ label, value, status }) => (
              <div key={label} className="rounded-lg bg-slate-50 px-3 py-2.5">
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className={`mt-0.5 text-base font-bold ${RESOURCE_COLOR[status]}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CWV Assessment + Lab Diagnostics */}
        <div className="p-5 lg:col-span-3">
          {cwv ? (
            <>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Core Web Vitals Assessment
              </p>
              {CWV_OFFICIAL.map((cfg) => (
                <MetricRow key={cfg.key} metric={cwv[cfg.key]} cfg={cfg} />
              ))}

              <p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Lab Diagnostics
              </p>
              {LAB_METRICS.map((cfg) => (
                <MetricRow key={cfg.key} metric={cwv[cfg.key]} cfg={cfg} />
              ))}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ring-1 ${src!.cls}`}>
                  {src!.label}
                </span>
                <p className="text-[10px] text-slate-400">
                  {current!.dataSource === "field"
                    ? "Real Chrome user data · 75th percentile"
                    : "Lighthouse simulation"}
                </p>
              </div>
            </>
          ) : psiLoading ? (
            <>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Core Web Vitals Assessment
              </p>
              {[0, 1, 2].map((i) => <MetricRowSkeleton key={i} />)}

              <p className="mb-3 mt-5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Lab Diagnostics
              </p>
              {[0, 1, 2].map((i) => <MetricRowSkeleton key={i} />)}
            </>
          ) : (
            /* Error / unavailable state */
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <svg className="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">PageSpeed data unavailable</p>
                <p className="mt-1 text-xs text-slate-400">Could not fetch real performance metrics for this URL</p>
              </div>
              {onRetryPsi && (
                <button
                  onClick={onRetryPsi}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Refresh Performance Data
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
