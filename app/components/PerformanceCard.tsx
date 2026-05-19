"use client";

import { useState, useEffect, useRef } from "react";
import type {
  CwvEstimate,
  PerformanceMetrics,
  PerformanceViewMetrics,
} from "@/app/lib/shopify-detector";

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const box = 64, r = 24, sw = 4;
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
    const duration = 700;
    function tick(ts: number) {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (score - from) * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const filled = (displayed / 100) * circumference;
  const color = displayed >= 80 ? "#059669" : displayed >= 50 ? "#d97706" : "#dc2626";
  const targetFilled = (score / 100) * circumference;
  const targetColor = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: box, height: box }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={box}
        height={box}
        viewBox={`0 0 ${box} ${box}`}
      >
        <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={r}
          fill="none"
          strokeWidth={sw}
          strokeLinecap="round"
          style={{
            strokeDasharray: `${targetFilled} ${circumference}`,
            stroke: targetColor,
            transition: "stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.5s ease",
          }}
        />
      </svg>
      <span className="relative text-sm font-bold" style={{ color }}>
        {displayed}
      </span>
    </div>
  );
}

// ─── CWV config ────────────────────────────────────────────────────────────────

const CWV_STYLE: Record<CwvEstimate["rating"], { badge: string; barColor: string; label: string }> = {
  fast:     { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", barColor: "#10b981", label: "Fast" },
  moderate: { badge: "bg-amber-50 text-amber-700 ring-amber-200",       barColor: "#f59e0b", label: "Moderate" },
  slow:     { badge: "bg-red-50 text-red-700 ring-red-200",             barColor: "#ef4444", label: "Slow" },
};

const CWV_OFFICIAL: Array<{
  key: keyof PerformanceViewMetrics["cwv"];
  label: string;
  description: string;
  unit: string;
  max: number;
  thresholds: [number, number];
}> = [
  { key: "lcp", label: "LCP", description: "Largest Contentful Paint", unit: "s",  max: 6,   thresholds: [2.5, 4] },
  { key: "inp", label: "INP", description: "Interaction to Next Paint", unit: "ms", max: 700, thresholds: [200, 500] },
  { key: "cls", label: "CLS", description: "Cumulative Layout Shift",   unit: "",   max: 0.4, thresholds: [0.1, 0.25] },
];

function fmtValue(value: number, unit: string): string {
  if (unit === "ms") return `${value}ms`;
  if (unit === "s") return `${value}s`;
  return value.toFixed(2);
}

function fmtThreshold(value: number, unit: string): string {
  if (unit === "ms") return `${value}ms`;
  if (unit === "s") return `${value}s`;
  return String(value);
}

// ─── CWV Row ───────────────────────────────────────────────────────────────────

function CwvRow({
  metric,
  cfg,
}: {
  metric: CwvEstimate;
  cfg: (typeof CWV_OFFICIAL)[number];
}) {
  const style = CWV_STYLE[metric.rating];
  const fillPct = Math.min((metric.value / cfg.max) * 100, 100);
  const [fast, mod] = cfg.thresholds;

  return (
    <div className="mb-3.5 last:mb-0">
      {/* Label row */}
      <div className="mb-1.5 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold text-slate-800">{cfg.label}</span>
          <span className="ml-1.5 text-[10px] text-slate-400">{cfg.description}</span>
        </div>
        <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
          {fmtValue(metric.value, cfg.unit)}
        </span>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 transition-all duration-500 ${style.badge}`}>
          {style.label}
        </span>
      </div>
      {/* Bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fillPct}%`,
            backgroundColor: style.barColor,
            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1), background-color 0.5s ease",
          }}
        />
        <div className="absolute inset-y-0 w-0.5 bg-emerald-400/50" style={{ left: `${(fast / cfg.max) * 100}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-amber-400/50"   style={{ left: `${(mod  / cfg.max) * 100}%` }} />
      </div>
      {/* Threshold labels */}
      <div className="relative mt-1 h-3 text-[9px]">
        <span
          className="absolute -translate-x-1/2 text-emerald-600"
          style={{ left: `${(fast / cfg.max) * 100}%` }}
        >
          {fmtThreshold(fast, cfg.unit)}
        </span>
        <span
          className="absolute -translate-x-1/2 text-amber-600"
          style={{ left: `${(mod / cfg.max) * 100}%` }}
        >
          {fmtThreshold(mod, cfg.unit)}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

type View = "mobile" | "desktop";
type MetricStatus = "good" | "warn" | "bad";

const METRIC_COLOR: Record<MetricStatus, string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-red-600",
};

export default function PerformanceCard({ perf }: { perf: PerformanceMetrics }) {
  const [view, setView] = useState<View>("mobile");

  const current: PerformanceViewMetrics = perf[view];
  const { cwv } = current;

  const cwvPassed =
    cwv.lcp.rating === "fast" &&
    cwv.inp.rating === "fast" &&
    cwv.cls.rating === "fast";

  const scoreBg =
    current.score >= 80
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : current.score >= 50
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-red-50 border-red-200 text-red-700";

  const scriptStatus: MetricStatus = perf.scriptCount > 20 ? "bad" : perf.scriptCount > 10 ? "warn" : "good";
  const blockStatus: MetricStatus  = perf.renderBlockingCount > 2 ? "bad" : perf.renderBlockingCount > 0 ? "warn" : "good";
  const cssStatus: MetricStatus    = perf.styleSheetCount > 5 ? "bad" : perf.styleSheetCount > 3 ? "warn" : "good";
  const htmlStatus: MetricStatus   = perf.htmlSizeKb < 150 ? "good" : perf.htmlSizeKb > 500 ? "bad" : "warn";

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Performance
          </p>
        </div>
        <span className={`rounded-full border px-3 py-0.5 text-xs font-bold transition-colors ${scoreBg}`}>
          {current.score}/100
        </span>
      </div>

      {/* ── Mobile / Desktop tab toggle ─────────────────────────────────────── */}
      <div className="mt-3 flex rounded-lg bg-slate-100 p-0.5">
        {(["mobile", "desktop"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
              view === v
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {v === "mobile" ? (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3"
                />
              </svg>
            ) : (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3"
                />
              </svg>
            )}
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Score dial + technical stats ───────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-4">
        <ScoreRing score={current.score} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-slate-500">
            Scripts{" "}
            <span className={`font-semibold ${METRIC_COLOR[scriptStatus]}`}>
              {perf.scriptCount}
            </span>
          </span>
          <span className="text-slate-500">
            Blocking{" "}
            <span className={`font-semibold ${METRIC_COLOR[blockStatus]}`}>
              {perf.renderBlockingCount}
            </span>
          </span>
          <span className="text-slate-500">
            CSS{" "}
            <span className={`font-semibold ${METRIC_COLOR[cssStatus]}`}>
              {perf.styleSheetCount}
            </span>
          </span>
          <span className="text-slate-500">
            HTML{" "}
            <span className={`font-semibold ${METRIC_COLOR[htmlStatus]}`}>
              {perf.htmlSizeKb}KB
            </span>
          </span>
        </div>
      </div>

      {/* ── Core Web Vitals Assessment ──────────────────────────────────────── */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Core Web Vitals Assessment
          </p>
          <span
            className={[
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white transition-all duration-300",
              cwvPassed ? "bg-emerald-700" : "bg-red-700",
            ].join(" ")}
          >
            {cwvPassed ? "PASSED" : "FAILED"}
          </span>
        </div>

        {/* LCP, INP, CLS rows */}
        {CWV_OFFICIAL.map((cfg) => (
          <CwvRow key={cfg.key} metric={cwv[cfg.key]} cfg={cfg} />
        ))}
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <p className="mt-3 text-right text-[10px] text-slate-400">
        Heuristic estimate · run Lighthouse for real values
      </p>
    </div>
  );
}
