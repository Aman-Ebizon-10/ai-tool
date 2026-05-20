"use client";

import { useState, useEffect } from "react";
import type { ScanResult, PerformanceViewMetrics } from "@/app/lib/shopify-detector";
import ScanResults, { ScanSkeleton } from "@/app/components/ScanResults";
import ScanForm from "@/app/components/ScanForm";
import {
  loadHistory,
  saveToHistory,
  clearHistory,
  type HistoryEntry,
} from "@/app/lib/scanHistory";

type ScanState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ScanResult }
  | { status: "error"; message: string };

async function fetchPsi(url: string): Promise<{
  mobile: PerformanceViewMetrics | null;
  desktop: PerformanceViewMetrics | null;
} | null> {
  try {
    const res = await fetch("/api/pagespeed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      console.error("[PageSpeed] API error:", body.error ?? res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("[PageSpeed] Fetch failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// ─── History helpers (mirrored from ScanHistoryPanel for drawer use) ───────────

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function domainLabel(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "");
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${bg}`}>
      {score}
    </span>
  );
}

// ─── History drawer ────────────────────────────────────────────────────────────

function HistoryDrawer({
  entries,
  currentUrl,
  onSelect,
  onClear,
  onClose,
}: {
  entries: HistoryEntry[];
  currentUrl?: string;
  onSelect: (result: ScanResult) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-800">Recent Scans</h2>
            {entries.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {entries.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {entries.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-slate-400 transition-colors hover:text-red-500"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-400">No scans yet</p>
              <p className="text-xs text-slate-300">Your history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {entries.map((entry) => {
                const isActive = entry.url === currentUrl;
                return (
                  <button
                    key={entry.id}
                    onClick={() => onSelect(entry.result)}
                    className={[
                      "w-full px-5 py-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400",
                      isActive ? "bg-indigo-50/60" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <ScoreBadge score={entry.overallScore} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                            {domainLabel(entry.url)}
                          </p>
                          {isActive && (
                            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                              Active
                            </span>
                          )}
                        </div>
                        {entry.pageTitle && (
                          <p className="mt-0.5 truncate text-xs text-slate-400">{entry.pageTitle}</p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">{timeAgo(entry.id)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ScanPageClient() {
  const [url, setUrl] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [psiLoading, setPsiLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const isAuditMode = scanState.status === "success";
  const isLoading   = scanState.status === "loading";
  const currentUrl  = scanState.status === "success" ? scanState.data.url : undefined;

  // Hydrate history from localStorage after mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Toggle audit workspace mode on the <html> element
  useEffect(() => {
    if (isAuditMode) {
      document.documentElement.setAttribute("data-audit-mode", "true");
    } else {
      document.documentElement.removeAttribute("data-audit-mode");
    }
    return () => document.documentElement.removeAttribute("data-audit-mode");
  }, [isAuditMode]);

  const applyPsiResult = (
    base: ScanResult,
    psi: { mobile: PerformanceViewMetrics | null; desktop: PerformanceViewMetrics | null }
  ): ScanResult => {
    const mobile  = psi.mobile  ?? base.performance.mobile;
    const desktop = psi.desktop ?? base.performance.desktop;
    return {
      ...base,
      performance: {
        ...base.performance,
        mobile,
        desktop,
        score: (desktop ?? mobile)?.score ?? null,
      },
    };
  };

  const runPsiPhase = async (scanUrl: string) => {
    setPsiLoading(true);
    const psi = await fetchPsi(scanUrl);
    setPsiLoading(false);
    if (psi) {
      setScanState((prev) => {
        if (prev.status !== "success") return prev;
        const merged = applyPsiResult(prev.data, psi);
        saveToHistory(merged);
        setHistory(loadHistory());
        return { status: "success", data: merged };
      });
    }
  };

  const handleRetryPsi = async () => {
    if (scanState.status !== "success") return;
    await runPsiPhase(scanState.data.url);
  };

  const scrollToResults = () => {
    setTimeout(() => {
      const el = document.getElementById("scan-results");
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }, 80);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setScanState({ status: "loading" });
    setPsiLoading(false);

    try {
      // Phase 1: fast HTML scan — shown immediately
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanState({ status: "error", message: data.error ?? "Scan failed. Please try again." });
        return;
      }

      const updated = saveToHistory(data);
      setHistory(updated);
      setScanState({ status: "success", data });
      scrollToResults();

      // Phase 2: real PageSpeed data — async
      await runPsiPhase(data.url);
    } catch {
      setScanState({ status: "error", message: "Network error — please check your connection and try again." });
      setPsiLoading(false);
    }
  };

  const handleHistorySelect = (result: ScanResult) => {
    setUrl(result.url);
    setScanState({ status: "success", data: result });
    setPsiLoading(false);
    setHistoryOpen(false);
    scrollToResults();
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="w-full">
      {/* Search bar */}
      <ScanForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        variant="dark"
        auditMode={isAuditMode}
      />

      {/* Tagline — hidden in audit mode via CSS */}
      {!isAuditMode && (
        <p className="mt-5 text-center text-sm text-slate-400">
          No account needed &nbsp;·&nbsp; 100% free &nbsp;·&nbsp; Results in under 30 seconds
        </p>
      )}

      {/* Toolbar row (audit mode) */}
      {isAuditMode && (
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Scans
            {history.length > 0 && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {history.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && <ScanSkeleton />}

      {/* Error state */}
      {scanState.status === "error" && (
        <div className="mt-8 flex max-w-2xl mx-auto items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">Scan failed</p>
            <p className="mt-0.5 text-sm text-red-600">{scanState.message}</p>
          </div>
          <button
            onClick={() => setScanState({ status: "idle" })}
            className="ml-auto shrink-0 text-xs text-red-400 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Results — full width in audit mode */}
      {scanState.status === "success" && (
        <ScanResults
          result={scanState.data}
          psiLoading={psiLoading}
          onRetryPsi={handleRetryPsi}
        />
      )}

      {/* History drawer */}
      {historyOpen && (
        <HistoryDrawer
          entries={history}
          currentUrl={currentUrl}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
}
