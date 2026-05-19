"use client";

import { useState } from "react";
import type { ScanResult } from "@/app/lib/shopify-detector";
import ScanResults, { ScanSkeleton } from "@/app/components/ScanResults";

interface ScanFormProps {
  variant?: "dark" | "light";
  showResults?: boolean;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ScanResult }
  | { status: "error"; message: string };

export default function ScanForm({
  variant = "dark",
  showResults = true,
}: ScanFormProps) {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setState({ status: "loading" });

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState({ status: "error", message: data.error ?? "Scan failed. Please try again." });
        return;
      }

      setState({ status: "success", data });
    } catch {
      setState({
        status: "error",
        message: "Network error — please check your connection and try again.",
      });
    }
  };

  const isLoading = state.status === "loading";
  const isDark = variant === "dark";

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-2xl flex-col gap-3 mx-auto sm:flex-row"
      >
        {/* URL input */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              className={`h-4 w-4 ${isDark ? "text-slate-400" : "text-indigo-200"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
              />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-store.myshopify.com"
            disabled={isLoading}
            className={[
              "h-14 w-full rounded-xl pl-11 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-60",
              isDark
                ? "border border-slate-200 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:border-transparent focus:ring-indigo-500"
                : "border border-white/25 bg-white/15 text-white placeholder-indigo-200 focus:border-transparent focus:ring-white/50",
            ].join(" ")}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className={[
            "flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
            isDark
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-400"
              : "bg-white text-indigo-600 shadow-lg shadow-black/10 hover:bg-indigo-50",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Scanning…
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
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
              Scan Store
            </>
          )}
        </button>
      </form>

      {/* Loading skeleton */}
      {showResults && isLoading && <ScanSkeleton />}

      {/* Error */}
      {showResults && state.status === "error" && (
        <div className="mt-6 flex max-w-2xl mx-auto items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
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
            <p className="mt-0.5 text-sm text-red-600">{state.message}</p>
          </div>
          <button
            onClick={() => setState({ status: "idle" })}
            className="ml-auto shrink-0 text-xs text-red-400 hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Results */}
      {showResults && state.status === "success" && (
        <ScanResults result={state.data} />
      )}
    </div>
  );
}
