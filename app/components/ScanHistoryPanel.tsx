"use client";

import type { ScanResult } from "@/app/lib/shopify-detector";
import type { HistoryEntry } from "@/app/lib/scanHistory";

interface Props {
  entries: HistoryEntry[];
  onSelect: (result: ScanResult) => void;
  onClear: () => void;
  currentUrl?: string;
}

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
  const bg =
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${bg}`}
    >
      {score}
    </span>
  );
}

export default function ScanHistoryPanel({ entries, onSelect, onClear, currentUrl }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Recent Scans
            </p>
            {entries.length > 0 && (
              <p className="text-[10px] text-slate-400">
                {entries.length} scan{entries.length !== 1 ? "s" : ""} saved
              </p>
            )}
          </div>
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="rounded px-2 py-1 text-[10px] font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="px-4 py-8 text-center">
          <svg
            className="mx-auto mb-2 h-8 w-8 text-slate-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
            />
          </svg>
          <p className="text-xs font-medium text-slate-400">No scans yet</p>
          <p className="mt-0.5 text-[10px] text-slate-300">
            Your history will appear here
          </p>
        </div>
      )}

      {/* Entry list */}
      {entries.length > 0 && (
        <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 460 }}>
          {entries.map((entry) => {
            const isActive = entry.url === currentUrl;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry.result)}
                className={[
                  "w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400",
                  isActive ? "bg-indigo-50/60 ring-1 ring-inset ring-indigo-100" : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <ScoreBadge score={entry.overallScore} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">
                        {domainLabel(entry.url)}
                      </p>
                      {isActive && (
                        <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-indigo-600">
                          Active
                        </span>
                      )}
                    </div>
                    {entry.pageTitle && (
                      <p className="mt-px truncate text-[10px] text-slate-400">
                        {entry.pageTitle}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {timeAgo(entry.id)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
