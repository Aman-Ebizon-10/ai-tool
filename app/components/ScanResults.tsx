import type {
  AppCategory,
  DetectedApp,
  PerformanceMetrics,
  ScanResult,
  SeoAudit,
  SeoCheck,
  ThemeInfo,
} from "@/app/lib/shopify-detector";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const cfg =
    size === "sm"
      ? { box: 44, r: 17, sw: 3, font: "text-xs" }
      : { box: 56, r: 22, sw: 4, font: "text-sm" };
  const circumference = 2 * Math.PI * cfg.r;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: cfg.box, height: cfg.box }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={cfg.box}
        height={cfg.box}
        viewBox={`0 0 ${cfg.box} ${cfg.box}`}
      >
        <circle
          cx={cfg.box / 2}
          cy={cfg.box / 2}
          r={cfg.r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={cfg.sw}
        />
        <circle
          cx={cfg.box / 2}
          cy={cfg.box / 2}
          r={cfg.r}
          fill="none"
          stroke={color}
          strokeWidth={cfg.sw}
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className={`relative font-bold ${cfg.font}`} style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function StatusIcon({
  status,
  size = "md",
}: {
  status: "pass" | "warn" | "fail";
  size?: "sm" | "md";
}) {
  const cls = `shrink-0 ${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`;
  if (status === "pass")
    return (
      <svg className={`${cls} text-emerald-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (status === "warn")
    return (
      <svg className={`${cls} text-amber-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  return (
    <svg className={`${cls} text-red-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InfoChip({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-white/8 bg-white/4 px-2.5 py-1">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-xs font-medium text-slate-300 ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Summary Bar ───────────────────────────────────────────────────────────────

function SummaryBar({ result }: { result: ScanResult }) {
  const overallScore = Math.round(
    (result.seo.score + result.performance.score) / 2
  );
  const scoreColor =
    overallScore >= 80
      ? "text-emerald-400"
      : overallScore >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-white/5 px-6 py-4">
      {/* Score */}
      <div className="flex items-center gap-3">
        <ScoreRing score={overallScore} size="sm" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Overall
          </p>
          <p className={`text-xl font-bold ${scoreColor}`}>
            {overallScore}
            <span className="text-xs font-normal text-slate-500">/100</span>
          </p>
        </div>
      </div>

      <div className="hidden h-10 w-px bg-white/5 sm:block" />

      {/* Store info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
              result.isShopify
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-slate-700 text-slate-400"
            }`}
          >
            {result.platform}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-white">
          {result.pageTitle ?? result.url}
        </p>
        <p className="truncate text-xs text-slate-500">{result.url}</p>
      </div>

      {/* Issue counts */}
      <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
        {result.seo.failCount > 0 && (
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            {result.seo.failCount} failed
          </span>
        )}
        {result.seo.warnCount > 0 && (
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {result.seo.warnCount} warnings
          </span>
        )}
        {result.seo.failCount === 0 && result.seo.warnCount === 0 && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All SEO checks passed
          </span>
        )}
        <p className="text-[10px] text-slate-600">
          {new Date(result.scannedAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isShopify,
}: {
  theme: ThemeInfo | null;
  isShopify: boolean;
}) {
  const badgeLabel = theme?.free
    ? "Shopify Free"
    : theme?.themeStoreId
    ? "Theme Store"
    : "Custom Theme";
  const badgeColor = theme?.free
    ? "bg-sky-500/15 text-sky-400"
    : theme?.themeStoreId
    ? "bg-violet-500/15 text-violet-400"
    : "bg-slate-500/15 text-slate-400";

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
            <svg
              className="h-4 w-4 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
              />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Theme
          </p>
        </div>
        {theme && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      {/* Content */}
      {!isShopify ? (
        <p className="text-sm text-slate-600">Not a Shopify store</p>
      ) : !theme ? (
        <p className="text-sm text-slate-600">
          Theme data not exposed in page source
        </p>
      ) : (
        <>
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">{theme.name}</p>
              {theme.confidence === "low" && (
                <span className="text-[10px] text-amber-500/70">
                  low confidence
                </span>
              )}
            </div>
            {theme.publisher && (
              <p className="mt-0.5 text-sm text-slate-400">
                by {theme.publisher}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {theme.version && (
              <InfoChip label="Version" value={theme.version} />
            )}
            {theme.role && <InfoChip label="Role" value={theme.role} />}
            {theme.themeStoreId && (
              <InfoChip
                label="Store ID"
                value={String(theme.themeStoreId)}
                mono
              />
            )}
            {theme.schemaName &&
              theme.schemaName.toLowerCase() !== theme.name.toLowerCase() && (
                <InfoChip label="Schema" value={theme.schemaName} mono />
              )}
          </div>

          {theme.internalName &&
            theme.internalName.toLowerCase() !== theme.name.toLowerCase() && (
              <p className="mt-3 truncate text-xs text-slate-600">
                Deployed as:{" "}
                <span className="font-mono text-slate-500">
                  {theme.internalName}
                </span>
              </p>
            )}
        </>
      )}
    </div>
  );
}

// ─── Apps Card ─────────────────────────────────────────────────────────────────

const CATEGORY_STYLE: Record<AppCategory, { dot: string }> = {
  "Email & SMS": { dot: "bg-sky-400" },
  Reviews: { dot: "bg-amber-400" },
  Loyalty: { dot: "bg-violet-400" },
  "Live Chat": { dot: "bg-emerald-400" },
  Search: { dot: "bg-cyan-400" },
  Analytics: { dot: "bg-orange-400" },
  Upsell: { dot: "bg-rose-400" },
  Subscriptions: { dot: "bg-teal-400" },
  "Social Proof": { dot: "bg-lime-400" },
  Wishlist: { dot: "bg-pink-400" },
  Shipping: { dot: "bg-slate-400" },
};

const CATEGORY_ORDER: AppCategory[] = [
  "Email & SMS",
  "Reviews",
  "Loyalty",
  "Live Chat",
  "Search",
  "Analytics",
  "Upsell",
  "Subscriptions",
  "Social Proof",
  "Wishlist",
  "Shipping",
];

const PERF_IMPACT_IDS = new Set([
  "hotjar",
  "luckyorange",
  "heap",
  "segment",
  "clarity",
  "triplewhale",
]);

const OVERLAP_CATEGORIES: AppCategory[] = [
  "Email & SMS",
  "Reviews",
  "Live Chat",
  "Subscriptions",
];

function AppsCard({
  apps,
  isShopify,
}: {
  apps: DetectedApp[];
  isShopify: boolean;
}) {
  const grouped = CATEGORY_ORDER.reduce<Record<string, DetectedApp[]>>(
    (acc, cat) => {
      const items = apps.filter((a) => a.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {}
  );

  const overlapWarnings = OVERLAP_CATEGORIES.filter(
    (cat) => (grouped[cat]?.length ?? 0) > 1
  );

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
            <svg
              className="h-4 w-4 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z"
              />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Apps
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
            apps.length > 0
              ? "bg-violet-500/15 text-violet-300"
              : "bg-slate-700 text-slate-500"
          }`}
        >
          {apps.length} detected
        </span>
      </div>

      {!isShopify ? (
        <p className="text-sm text-slate-600">Not a Shopify store</p>
      ) : apps.length === 0 ? (
        <p className="text-sm text-slate-600">
          No known third-party apps detected
        </p>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "280px" }}>
          {overlapWarnings.map((cat) => (
            <div
              key={`overlap-${cat}`}
              className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2"
            >
              <svg
                className="h-3.5 w-3.5 shrink-0 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-xs text-amber-300">
                {grouped[cat]?.length} {cat} apps detected — may conflict
              </p>
            </div>
          ))}

          {Object.entries(grouped).map(([cat, items]) => {
            const style = CATEGORY_STYLE[cat as AppCategory];
            return (
              <div key={cat}>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {cat}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/4 px-2.5 py-1.5"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                      />
                      <span className="text-xs font-medium text-slate-200">
                        {app.name}
                      </span>
                      {PERF_IMPACT_IDS.has(app.id) && (
                        <span className="rounded px-1 py-0.5 text-[9px] font-semibold bg-orange-500/20 text-orange-400">
                          perf
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SEO Card ──────────────────────────────────────────────────────────────────

const SEO_SEVERITY: Record<string, "critical" | "high" | "medium" | "low"> = {
  robots: "critical",
  https: "critical",
  title: "high",
  meta_desc: "high",
  h1: "high",
  viewport: "high",
  og: "medium",
  canonical: "medium",
  twitter: "low",
  schema: "low",
  lang: "low",
};

const SEVERITY_CONFIG = {
  critical: {
    label: "Critical",
    color: "text-red-400",
    dot: "bg-red-400",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    dot: "bg-orange-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    dot: "bg-amber-400",
  },
  low: {
    label: "Low",
    color: "text-slate-400",
    dot: "bg-slate-400",
  },
} as const;

function SeoCheckRow({ check }: { check: SeoCheck }) {
  const displayValue =
    check.value && check.value.length > 60
      ? check.value.slice(0, 57) + "…"
      : check.value;
  const skip = ["Present", "Enabled", "index, follow"];

  return (
    <div className="flex items-start gap-2 rounded-lg px-3 py-1.5">
      <StatusIcon status={check.status} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-xs font-medium text-slate-200">
            {check.label}
          </span>
          <span className="text-[11px] text-slate-500">{check.message}</span>
        </div>
        {displayValue && !skip.includes(displayValue) && (
          <p
            className="mt-0.5 truncate font-mono text-[10px] text-slate-600"
            title={check.value ?? ""}
          >
            {displayValue}
          </p>
        )}
      </div>
    </div>
  );
}

function SeoCard({ seo }: { seo: SeoAudit }) {
  const scoreBg =
    seo.score >= 80
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
      : seo.score >= 50
      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
      : "bg-red-500/10 border-red-500/20 text-red-300";

  const bySeverity = (["critical", "high", "medium", "low"] as const)
    .map((sev) => ({
      sev,
      checks: seo.checks.filter((c) => SEO_SEVERITY[c.id] === sev),
    }))
    .filter((g) => g.checks.length > 0);

  const quickWins = seo.checks
    .filter(
      (c) =>
        c.status !== "pass" &&
        (SEO_SEVERITY[c.id] === "critical" || SEO_SEVERITY[c.id] === "high")
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
            <svg
              className="h-4 w-4 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
              />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            SEO Audit
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-bold ${scoreBg}`}
        >
          {seo.score}/100
        </span>
      </div>

      {/* Score summary */}
      <div className="mb-4 flex items-center gap-4">
        <ScoreRing score={seo.score} />
        <div className="flex flex-col gap-1 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {seo.passCount} passed
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {seo.warnCount} warnings
          </span>
          {seo.failCount > 0 && (
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              {seo.failCount} failed
            </span>
          )}
        </div>
      </div>

      {/* Quick wins */}
      {quickWins.length > 0 && (
        <div className="mb-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.08] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-amber-500">
            Quick Wins
          </p>
          <div className="space-y-1.5">
            {quickWins.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <StatusIcon status={c.status} size="sm" />
                <span className="text-xs font-medium text-slate-300">
                  {c.label}
                </span>
                <span className="text-xs text-slate-600">— {c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checks grouped by severity */}
      <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: "220px" }}>
        {bySeverity.map(({ sev, checks }) => {
          const cfg = SEVERITY_CONFIG[sev];
          const hasIssues = checks.some((c) => c.status !== "pass");
          return (
            <details key={sev} open={hasIssues}>
              <summary
                className={`flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/5 ${cfg.color}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className="ml-auto text-[10px] font-normal text-slate-600">
                  {checks.length} checks
                </span>
              </summary>
              <div className="mt-1 space-y-0.5 pl-2">
                {checks.map((c) => (
                  <SeoCheckRow key={c.id} check={c} />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

// ─── Performance Card ──────────────────────────────────────────────────────────

type MetricStatus = "good" | "warn" | "bad";
const METRIC_COLOR: Record<MetricStatus, string> = {
  good: "text-emerald-400",
  warn: "text-amber-400",
  bad: "text-red-400",
};

function PerformanceCard({ perf }: { perf: PerformanceMetrics }) {
  const scoreBg =
    perf.score >= 80
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
      : perf.score >= 50
      ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
      : "bg-red-500/10 border-red-500/20 text-red-300";

  const lazyPct =
    perf.imageCount > 0
      ? Math.round((perf.lazyImageCount / perf.imageCount) * 100)
      : 0;

  const metrics: { label: string; value: string; status: MetricStatus }[] = [
    {
      label: "External Scripts",
      value: String(perf.scriptCount),
      status:
        perf.scriptCount > 20 ? "bad" : perf.scriptCount > 10 ? "warn" : "good",
    },
    {
      label: "Render-Blocking",
      value: String(perf.renderBlockingCount),
      status:
        perf.renderBlockingCount > 2
          ? "bad"
          : perf.renderBlockingCount > 0
          ? "warn"
          : "good",
    },
    {
      label: "Stylesheets",
      value: String(perf.styleSheetCount),
      status:
        perf.styleSheetCount > 5
          ? "bad"
          : perf.styleSheetCount > 3
          ? "warn"
          : "good",
    },
    {
      label: "Images",
      value: String(perf.imageCount),
      status: "good",
    },
    {
      label: "Lazy Loaded",
      value: `${lazyPct}%`,
      status: lazyPct >= 30 ? "good" : lazyPct > 0 ? "warn" : "bad",
    },
    {
      label: "Resource Hints",
      value: perf.hasResourceHints ? "Yes" : "No",
      status: perf.hasResourceHints ? "good" : "warn",
    },
    {
      label: "HTML Size",
      value: `${perf.htmlSizeKb} KB`,
      status:
        perf.htmlSizeKb < 150 ? "good" : perf.htmlSizeKb > 500 ? "bad" : "warn",
    },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-white/8 bg-white/[0.03] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <svg
              className="h-4 w-4 text-blue-400"
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
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Performance
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-bold ${scoreBg}`}
        >
          {perf.score}/100
        </span>
      </div>

      {/* Score ring + top stats */}
      <div className="mb-4 flex items-center gap-4">
        <ScoreRing score={perf.score} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <span className="text-slate-500">
            Scripts{" "}
            <span
              className={`font-semibold ${METRIC_COLOR[metrics[0].status]}`}
            >
              {perf.scriptCount}
            </span>
          </span>
          <span className="text-slate-500">
            Blocking{" "}
            <span
              className={`font-semibold ${METRIC_COLOR[metrics[1].status]}`}
            >
              {perf.renderBlockingCount}
            </span>
          </span>
          <span className="text-slate-500">
            CSS{" "}
            <span
              className={`font-semibold ${METRIC_COLOR[metrics[2].status]}`}
            >
              {perf.styleSheetCount}
            </span>
          </span>
          <span className="text-slate-500">
            HTML{" "}
            <span
              className={`font-semibold ${METRIC_COLOR[metrics[6].status]}`}
            >
              {perf.htmlSizeKb}KB
            </span>
          </span>
        </div>
      </div>

      {/* Full metrics list */}
      <div className="flex flex-col gap-1">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5"
          >
            <span className="text-xs text-slate-500">{m.label}</span>
            <span className={`text-xs font-semibold ${METRIC_COLOR[m.status]}`}>
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export function ScanSkeleton() {
  return (
    <div className="mt-8 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
      {/* Summary bar */}
      <div className="flex items-center gap-4 border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-white/8" />
          <div className="space-y-1.5">
            <div className="h-2 w-12 animate-pulse rounded bg-white/6" />
            <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        <div className="hidden h-10 w-px bg-white/5 sm:block" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-20 animate-pulse rounded bg-white/8" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-2.5 w-32 animate-pulse rounded bg-white/5" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 animate-pulse rounded bg-white/8" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 animate-pulse rounded-lg bg-white/10" />
                <div className="h-2.5 w-16 animate-pulse rounded bg-white/8" />
              </div>
              <div className="h-5 w-16 animate-pulse rounded-full bg-white/8" />
            </div>
            <div className="space-y-2.5">
              <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/6" />
              <div className="mt-3 flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-md bg-white/8" />
                <div className="h-6 w-16 animate-pulse rounded-md bg-white/5" />
              </div>
              {i >= 2 && (
                <div className="mt-2 space-y-1.5">
                  {[70, 55, 65, 45].map((w, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5"
                    >
                      <div
                        className="h-2.5 animate-pulse rounded bg-white/8"
                        style={{ width: `${w}%` }}
                      />
                      <div className="h-2.5 w-8 animate-pulse rounded bg-white/6" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-white/5 bg-white/[0.02] px-6 py-3">
        <svg
          className="h-3 w-3 animate-spin text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-xs text-slate-500">Fetching and analyzing store…</p>
      </div>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export default function ScanResults({ result }: { result: ScanResult }) {
  return (
    <div className="mt-8 w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm shadow-2xl shadow-black/40">
      <SummaryBar result={result} />

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <ThemeCard theme={result.theme} isShopify={result.isShopify} />
        <AppsCard apps={result.apps} isShopify={result.isShopify} />
        <SeoCard seo={result.seo} />
        <PerformanceCard perf={result.performance} />
      </div>

      <div className="border-t border-white/5 bg-white/[0.02] px-6 py-3">
        <p className="text-xs text-slate-600">
          Scanned at{" "}
          {new Date(result.scannedAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
          {" · "}
          {result.detectedCount}/{result.signals.length} Shopify signals
          detected
        </p>
      </div>
    </div>
  );
}
