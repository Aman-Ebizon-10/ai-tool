"use client";

import { useState, useEffect } from "react";
import type { ScanResult } from "@/app/lib/shopify-detector";
import ScanResults, { ScanSkeleton } from "@/app/components/ScanResults";
import ScanForm from "@/app/components/ScanForm";
import ScanHistoryPanel from "@/app/components/ScanHistoryPanel";
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

export default function ScanPageClient() {
  const [url, setUrl] = useState("");
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setScanState({ status: "loading" });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanState({
          status: "error",
          message: data.error ?? "Scan failed. Please try again.",
        });
        return;
      }

      const updated = saveToHistory(data);
      setHistory(updated);
      setScanState({ status: "success", data });
    } catch {
      setScanState({
        status: "error",
        message: "Network error — please check your connection and try again.",
      });
    }
  };

  const handleHistorySelect = (result: ScanResult) => {
    setUrl(result.url);
    setScanState({ status: "success", data: result });
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const isLoading = scanState.status === "loading";
  const currentUrl = scanState.status === "success" ? scanState.data.url : undefined;
  // Show the layout panel whenever there's a scan in progress/done or saved history
  const showLayout = scanState.status !== "idle" || history.length > 0;

  return (
    <div className="w-full">
      <ScanForm
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        variant="dark"
      />

      <p className="mt-5 text-center text-sm text-slate-400">
        No account needed &nbsp;·&nbsp; 100% free &nbsp;·&nbsp; Results in under 30 seconds
      </p>

      {showLayout && (
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-5">
          {/* ── History sidebar ─────────────────────────────────────── */}
          <div className="mt-8 order-2 lg:order-1 w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-24">
            <ScanHistoryPanel
              entries={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
              currentUrl={currentUrl}
            />
          </div>

          {/* ── Results area ────────────────────────────────────────── */}
          <div className="order-1 lg:order-2 flex-1 min-w-0">
            {/* Loading skeleton */}
            {isLoading && <ScanSkeleton />}

            {/* Error */}
            {scanState.status === "error" && (
              <div className="mt-8 flex max-w-2xl mx-auto items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
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

            {/* Results */}
            {scanState.status === "success" && (
              <ScanResults result={scanState.data} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
