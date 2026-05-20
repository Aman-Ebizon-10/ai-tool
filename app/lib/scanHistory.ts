import type { ScanResult } from "./shopify-detector";

export interface HistoryEntry {
  id: string; // scannedAt ISO string — used as stable key
  url: string;
  pageTitle: string | null;
  overallScore: number;
  result: ScanResult;
}

const KEY = "shopaudit_history";
const MAX = 10;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(result: ScanResult): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: result.scannedAt,
    url: result.url,
    pageTitle: result.pageTitle,
    overallScore: result.performance.score !== null
      ? Math.round((result.seo.score + result.performance.score) / 2)
      : result.seo.score,
    result,
  };
  // Deduplicate by URL — newest scan for a URL wins
  const deduped = loadHistory().filter((e) => e.url !== result.url);
  const updated = [entry, ...deduped].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
