import type {
  AppCategory,
  DetectedApp,
  MarketplaceDataConfidence,
  ScanResult,
  SeoAudit,
  SeoCheck,
  ThemeInfo,
  UpdateStatus,
} from "@/app/lib/shopify-detector";
import DownloadReportButton from "@/app/components/DownloadReportButton";
import PerformanceCard from "@/app/components/PerformanceCard";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function cleanDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url; }
}

function ScoreRing({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const cfg =
    size === "lg" ? { box: 56, r: 22, sw: 3.5, font: "text-sm font-black" }
    : size === "md" ? { box: 44, r: 17, sw: 3, font: "text-xs font-bold" }
    : { box: 32, r: 12, sw: 2.5, font: "text-[10px] font-bold" };
  const circumference = 2 * Math.PI * cfg.r;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#059669" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: cfg.box, height: cfg.box }}>
      <svg className="absolute inset-0 -rotate-90" width={cfg.box} height={cfg.box} viewBox={`0 0 ${cfg.box} ${cfg.box}`}>
        <circle cx={cfg.box / 2} cy={cfg.box / 2} r={cfg.r} fill="none" stroke="#e2e8f0" strokeWidth={cfg.sw} />
        <circle cx={cfg.box / 2} cy={cfg.box / 2} r={cfg.r} fill="none" stroke={color} strokeWidth={cfg.sw}
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round" />
      </svg>
      <span className={`relative ${cfg.font}`} style={{ color }}>{score}</span>
    </div>
  );
}

function StatusIcon({ status, size = "md" }: { status: "pass" | "warn" | "fail"; size?: "sm" | "md" }) {
  const cls = `shrink-0 ${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`;
  if (status === "pass")
    return (
      <svg className={`${cls} text-emerald-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (status === "warn")
    return (
      <svg className={`${cls} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );
  return (
    <svg className={`${cls} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// ─── Card header atom ──────────────────────────────────────────────────────────

function CardLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100">
        {icon}
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{children}</p>
    </div>
  );
}

// ─── Executive Summary ─────────────────────────────────────────────────────────

function ExecutiveSummary({ result }: { result: ScanResult }) {
  const perfScore     = result.performance.score;
  const criticalCount = result.seo.criticalCount ?? result.seo.failCount;
  const warningCount  = result.seo.warningCount  ?? result.seo.warnCount;
  const domain        = cleanDomain(result.url);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Store identity */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-black text-indigo-600">
            {domain.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-slate-900 leading-snug">{domain}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                result.isShopify
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-slate-100 text-slate-500 ring-slate-200"
              }`}>
                {result.platform}
              </span>
            </div>
            {result.pageTitle && (
              <p className="mt-0.5 truncate text-xs text-slate-500 max-w-xs leading-snug" title={result.pageTitle}>
                {result.pageTitle}
              </p>
            )}
            <p className="mt-px text-[10px] text-slate-300 leading-snug">{result.url}</p>
          </div>
        </div>

        {/* Scores + download */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">SEO</p>
              <ScoreRing score={result.seo.score} size="lg" />
            </div>
            {perfScore !== null && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Perf</p>
                <ScoreRing score={perfScore} size="lg" />
              </div>
            )}
          </div>
          <div className="hidden h-9 w-px bg-slate-100 sm:block" />
          <DownloadReportButton result={result} />
        </div>
      </div>

      {/* Issue strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3">
        {criticalCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {criticalCount} critical {criticalCount === 1 ? "issue" : "issues"}
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {warningCount} {warningCount === 1 ? "warning" : "warnings"}
          </span>
        )}
        {result.apps.length > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {result.apps.length} apps detected
          </span>
        )}
        {criticalCount === 0 && warningCount === 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All SEO checks passed
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-300">
          Scanned {new Date(result.scannedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          &nbsp;·&nbsp;{result.detectedCount}/{result.signals.length} signals
        </span>
      </div>
    </div>
  );
}

// ─── Theme Card ────────────────────────────────────────────────────────────────

const UPDATE_STATUS_CFG: Record<UpdateStatus, {
  label: string;
  cls: string;
  icon: "check" | "arrow" | "warn" | "lock";
}> = {
  "up-to-date":           { label: "Up to date",             cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: "check" },
  "minor-update":         { label: "Minor update available", cls: "bg-blue-50 text-blue-700 ring-blue-200",          icon: "arrow" },
  "major-update":         { label: "Major update available", cls: "bg-amber-50 text-amber-700 ring-amber-200",       icon: "warn"  },
  "verification-limited": { label: "Verification limited",   cls: "bg-slate-100 text-slate-500 ring-slate-200",      icon: "lock"  },
};

const DATA_CONFIDENCE_CFG: Record<MarketplaceDataConfidence, { label: string; cls: string; message: string }> = {
  verified:  { label: "Verified",          cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", message: "Version comparison based on publicly available marketplace data." },
  estimated: { label: "Estimated",         cls: "bg-slate-100 text-slate-500 ring-slate-200",      message: "Marketplace version data partially verified." },
  limited:   { label: "Limited visibility",cls: "bg-slate-100 text-slate-500 ring-slate-200",      message: "Latest version verification may require Shopify admin access." },
};

function UpdateStatusBadge({ status }: { status: UpdateStatus }) {
  const cfg = UPDATE_STATUS_CFG[status];
  return (
    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${cfg.cls}`}>
      {cfg.icon === "check" && (
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {cfg.icon === "arrow" && (
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
        </svg>
      )}
      {cfg.icon === "warn" && (
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      )}
      {cfg.icon === "lock" && (
        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )}
      {cfg.label}
    </span>
  );
}

function ThemeCard({ theme, isShopify }: { theme: ThemeInfo | null; isShopify: boolean }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5 flex items-center gap-2">
        <CardLabel icon={
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
          </svg>
        }>Theme Intelligence</CardLabel>
      </div>

      {!isShopify ? (
        <p className="text-sm text-slate-400">Not a Shopify store</p>
      ) : !theme ? (
        <p className="text-sm text-slate-400">Theme data not exposed in page source</p>
      ) : (
        <div className="flex flex-col gap-3">

          {/* Name + update status */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-bold text-slate-900 leading-tight">{theme.name}</p>
              {theme.publisher && (
                <p className="mt-0.5 text-xs text-slate-500">by {theme.publisher}</p>
              )}
            </div>
            {theme.updateStatus && <UpdateStatusBadge status={theme.updateStatus} />}
          </div>

          {/* Version table */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 divide-y divide-slate-100">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-slate-400">Detected version</span>
              {theme.version ? (
                <span className="font-mono text-xs font-semibold text-slate-700">v{theme.version}</span>
              ) : (
                <span className="text-xs italic text-slate-400">Not detected</span>
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs text-slate-400">Latest available</span>
              {theme.latestVersion ? (
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-xs font-semibold ${
                    theme.updateStatus === "major-update" || theme.updateStatus === "minor-update"
                      ? "text-amber-700" : "text-slate-700"
                  }`}>
                    v{theme.latestVersion}
                  </span>
                  {theme.marketplaceDataConfidence && (
                    <span className={`rounded px-1.5 py-px text-[9px] font-semibold ring-1 ${DATA_CONFIDENCE_CFG[theme.marketplaceDataConfidence].cls}`}>
                      {DATA_CONFIDENCE_CFG[theme.marketplaceDataConfidence].label}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs italic text-slate-400">Not in marketplace database</span>
              )}
            </div>
          </div>

          {/* Update recommendation */}
          {(theme.updateStatus === "major-update" || theme.updateStatus === "minor-update") && theme.latestVersion && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
              <svg className="mt-px h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-xs leading-relaxed text-amber-800">
                {theme.updateStatus === "major-update"
                  ? <><span className="font-semibold">Major update to v{theme.latestVersion} available.</span> Major releases include significant performance and feature improvements.</>
                  : <>Update to <span className="font-semibold">v{theme.latestVersion}</span> for the latest performance and security fixes.</>
                }
              </p>
            </div>
          )}

          {/* Data source note */}
          {theme.marketplaceDataConfidence && (
            <div className="flex items-start gap-1.5 border-t border-slate-100 pt-2.5">
              <svg className="mt-px h-3 w-3 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {DATA_CONFIDENCE_CFG[theme.marketplaceDataConfidence].message}
                {theme.releaseNotesUrl && <> <span className="text-indigo-400">Release notes available.</span></>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Apps Card ─────────────────────────────────────────────────────────────────

const CATEGORY_DOT: Record<AppCategory, string> = {
  "Email Marketing":      "bg-sky-500",
  "Reviews & UGC":        "bg-amber-500",
  "Analytics":            "bg-orange-500",
  "Upsell & Cross-sell":  "bg-rose-500",
  "Payments & BNPL":      "bg-emerald-500",
  "Customer Support":     "bg-teal-500",
  "Subscriptions":        "bg-violet-500",
  "Loyalty & Rewards":    "bg-pink-500",
  "Landing Pages":        "bg-indigo-500",
  "Tracking Pixels":      "bg-red-500",
  "Shipping & Logistics": "bg-cyan-500",
  "Search & Filtering":   "bg-lime-600",
  "AI & Personalization": "bg-purple-500",
};

const CONFIDENCE_DOT: Record<"high" | "medium" | "low", string> = {
  high:   "bg-emerald-500",
  medium: "bg-amber-400",
  low:    "bg-slate-300",
};

const CONFIDENCE_LABEL: Record<"high" | "medium" | "low", string> = {
  high:   "Confirmed",
  medium: "Likely",
  low:    "Inferred",
};

function AppsCard({ apps, isShopify }: { apps: DetectedApp[]; isShopify: boolean }) {
  const groupMap = new Map<AppCategory, DetectedApp[]>();
  for (const app of apps) {
    const existing = groupMap.get(app.category);
    if (existing) existing.push(app);
    else groupMap.set(app.category, [app]);
  }

  const overlapCategories = Array.from(groupMap.entries())
    .filter(([, items]) => items.length > 1)
    .map(([cat]) => cat);

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between">
        <CardLabel icon={
          <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
          </svg>
        }>Apps & Integrations</CardLabel>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {apps.length} detected
        </span>
      </div>

      {!isShopify ? (
        <p className="text-sm text-slate-400">Not a Shopify store</p>
      ) : apps.length === 0 ? (
        <p className="text-sm text-slate-400">No known third-party apps detected</p>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "340px" }}>
          {/* Overlap warnings */}
          {overlapCategories.map((cat) => (
            <div key={`overlap-${cat}`} className="flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-2.5 py-1.5">
              <svg className="h-3 w-3 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-amber-700">
                {groupMap.get(cat)!.length} {cat} tools detected — may overlap
              </p>
            </div>
          ))}

          {/* Category groups */}
          {Array.from(groupMap.entries()).map(([cat, items]) => {
            const dot = CATEGORY_DOT[cat] ?? "bg-slate-400";
            return (
              <div key={cat}>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                  {cat}
                </p>
                <div className="flex flex-wrap gap-1">
                  {items.map((app) => (
                    <span
                      key={app.id}
                      title={`${CONFIDENCE_LABEL[app.confidence]} detection`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${CONFIDENCE_DOT[app.confidence]}`} />
                      {app.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info banner */}
      {isShopify && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
          <svg className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Public scans detect only frontend-visible apps and script integrations. A complete inventory requires Shopify admin access.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── SEO Card ──────────────────────────────────────────────────────────────────

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }) {
  const cfg = {
    high:   "bg-red-50 text-red-600 ring-red-100",
    medium: "bg-amber-50 text-amber-600 ring-amber-100",
    low:    "bg-slate-100 text-slate-400 ring-slate-200",
  };
  const label = { high: "High", medium: "Med", low: "Low" };
  return (
    <span className={`shrink-0 rounded px-1.5 py-px text-[10px] font-semibold ring-1 ${cfg[impact]}`}>
      {label[impact]}
    </span>
  );
}

const SKIP_VALUES = new Set(["Present", "Enabled", "index, follow", "No images found", "No images"]);

function SeoIssueRow({ check }: { check: SeoCheck }) {
  const displayValue =
    check.value && check.value.length > 60 ? check.value.slice(0, 57) + "…" : check.value;
  const hasDetail = !!(check.detail || check.fix);

  const rowContent = (
    <>
      <StatusIcon status={check.status} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="text-[13px] font-medium text-slate-800 leading-snug">{check.label}</span>
          <span className="text-[11px] text-slate-400 leading-snug">{check.message}</span>
        </div>
        {displayValue && !SKIP_VALUES.has(displayValue) && (
          <p className="mt-px truncate font-mono text-[10px] text-slate-400" title={check.value ?? ""}>
            {displayValue}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {check.affectedArea && (
          <span className="rounded bg-slate-100 px-1.5 py-px font-mono text-[10px] text-slate-400">
            {check.affectedArea}
          </span>
        )}
        <ImpactBadge impact={check.impact} />
      </div>
    </>
  );

  if (!hasDetail) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-slate-50">
        {rowContent}
      </div>
    );
  }

  return (
    <details className="group rounded-lg border border-slate-100 transition-colors open:border-slate-200 open:bg-slate-50/40">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 [&::-webkit-details-marker]:hidden">
        {rowContent}
        <svg
          className="h-3 w-3 shrink-0 text-slate-300 transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-1.5 px-2.5 pb-3 pl-9 pt-0">
        {check.detail && (
          <p className="text-xs leading-relaxed text-slate-600">{check.detail}</p>
        )}
        {check.fix && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
            <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-widest text-indigo-400">Recommended Fix</p>
            <p className="text-xs leading-relaxed text-indigo-800">{check.fix}</p>
          </div>
        )}
      </div>
    </details>
  );
}

type SectionColor = "red" | "amber" | "indigo" | "emerald";

const SECTION_CFG: Record<SectionColor, { heading: string; dot: string }> = {
  red:     { heading: "text-red-600",     dot: "bg-red-500"     },
  amber:   { heading: "text-amber-600",   dot: "bg-amber-500"   },
  indigo:  { heading: "text-indigo-600",  dot: "bg-indigo-500"  },
  emerald: { heading: "text-emerald-600", dot: "bg-emerald-500" },
};

function SeoSection({ title, color, checks, defaultOpen = true }: {
  title: string; color: SectionColor; checks: SeoCheck[]; defaultOpen?: boolean;
}) {
  if (checks.length === 0) return null;
  const cfg = SECTION_CFG[color];
  return (
    <details {...(defaultOpen && { open: true })} className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-1.5 [&::-webkit-details-marker]:hidden">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.heading}`}>{title}</span>
        <span className="ml-1 text-[10px] text-slate-400">({checks.length})</span>
        <svg
          className="ml-auto h-3 w-3 shrink-0 text-slate-300 transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="mt-0.5 space-y-0.5">
        {checks.map((c) => <SeoIssueRow key={c.id} check={c} />)}
      </div>
    </details>
  );
}

function SeoCard({ seo }: { seo: SeoAudit }) {
  const scoreColor = seo.score >= 80 ? "text-emerald-600" : seo.score >= 50 ? "text-amber-600" : "text-red-600";

  const criticalIssues = seo.checks.filter((c) => c.category === "critical"    && c.status !== "pass");
  const warningIssues  = seo.checks.filter((c) => c.category === "warning"     && c.status !== "pass");
  const opportunities  = seo.checks.filter((c) => c.category === "opportunity" && c.status !== "pass");
  const passing        = seo.checks.filter((c) => c.status === "pass");

  const criticalCount    = seo.criticalCount    ?? criticalIssues.length;
  const warningCount     = seo.warningCount     ?? warningIssues.length;
  const opportunityCount = seo.opportunityCount ?? opportunities.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <CardLabel icon={
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
            </svg>
          }>SEO Audit</CardLabel>
        </div>
        <div className="flex items-center gap-2.5">
          <ScoreRing score={seo.score} size="lg" />
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Score</p>
            <p className={`text-lg font-black leading-none ${scoreColor}`}>
              {seo.score}<span className="ml-px text-xs font-normal text-slate-400">/100</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-100 bg-slate-50/60 px-5 py-2">
        {criticalCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />{criticalCount} Critical
          </span>
        )}
        {warningCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{warningCount} Warnings
          </span>
        )}
        {opportunityCount > 0 && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />{opportunityCount} Opportunities
          </span>
        )}
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{seo.passCount} Passing
        </span>
      </div>

      {/* Issue sections */}
      <div className="divide-y divide-slate-50 px-5 py-2.5">
        <div className="pb-1"><SeoSection title="Critical Issues"            color="red"     checks={criticalIssues} defaultOpen /></div>
        <div className="py-1"><SeoSection title="Warnings"                   color="amber"   checks={warningIssues}  defaultOpen /></div>
        <div className="py-1"><SeoSection title="Quick Wins & Opportunities" color="indigo"  checks={opportunities}  defaultOpen /></div>
        <div className="pt-1"><SeoSection title="Passing Checks"             color="emerald" checks={passing}        defaultOpen={false} /></div>
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export function ScanSkeleton() {
  return (
    <div className="mt-6 w-full max-w-7xl mx-auto space-y-4">
      {/* Executive summary */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
            <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
        <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3">
          <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
          <div className="ml-auto h-2.5 w-28 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      {/* Theme + Apps */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3.5 flex items-center gap-2">
              <div className="h-6 w-6 animate-pulse rounded-md bg-slate-100" />
              <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="space-y-2.5">
              <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
              <div className="h-14 animate-pulse rounded-lg bg-slate-50" />
            </div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-md bg-slate-100" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="h-3 w-3 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            <span className="text-[11px] text-slate-400">Fetching PageSpeed data…</span>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
          <div className="space-y-4 p-5 lg:col-span-2">
            <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="flex items-center gap-4">
              <div className="h-[90px] w-[90px] animate-pulse rounded-full bg-slate-100" />
              <div className="space-y-2">
                <div className="h-6 w-10 animate-pulse rounded bg-slate-200" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          </div>
          <div className="space-y-3.5 p-5 lg:col-span-3">
            <div className="h-2.5 w-32 animate-pulse rounded bg-slate-100" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1">
                <div className="flex gap-2">
                  <div className="h-2.5 w-7 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 flex-1 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-8 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-14 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-1.5 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-md bg-slate-100" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
            <div className="h-5 w-9 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="flex gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-2.5 w-14 animate-pulse rounded bg-slate-100" />)}
        </div>
        <div className="space-y-0.5 p-5">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Main dashboard ────────────────────────────────────────────────────────────

export default function ScanResults({
  result,
  psiLoading = false,
  onRetryPsi,
}: {
  result: ScanResult;
  psiLoading?: boolean;
  onRetryPsi?: () => void;
}) {
  return (
    <div id="scan-results" className="mt-6 w-full max-w-7xl mx-auto space-y-4">
      <ExecutiveSummary result={result} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ThemeCard theme={result.theme} isShopify={result.isShopify} />
        <AppsCard  apps={result.apps}  isShopify={result.isShopify} />
      </div>

      <PerformanceCard
        perf={result.performance}
        psiLoading={psiLoading}
        onRetryPsi={onRetryPsi}
      />

      <SeoCard seo={result.seo} />
    </div>
  );
}
