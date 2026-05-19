"use client";

interface ScanFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  variant?: "dark" | "light";
}

export default function ScanForm({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
  variant = "dark",
}: ScanFormProps) {
  const isDark = variant === "dark";

  return (
    <form
      onSubmit={onSubmit}
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
          onChange={(e) => onUrlChange(e.target.value)}
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
  );
}
