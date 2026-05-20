import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ScanResult } from "./shopify-detector";

// ─── Palette ───────────────────────────────────────────────────────────────────

const C = {
  indigo:    [79, 70, 229] as [number, number, number],
  slate900:  [15, 23, 42]  as [number, number, number],
  slate600:  [71, 85, 105] as [number, number, number],
  slate400:  [148, 163, 184] as [number, number, number],
  slate100:  [241, 245, 249] as [number, number, number],
  white:     [255, 255, 255] as [number, number, number],
  emerald:   [16, 185, 129] as [number, number, number],
  amber:     [217, 119, 6]  as [number, number, number],
  red:       [220, 38, 38]  as [number, number, number],
};

function ratingColor(rating: "fast" | "moderate" | "slow"): [number, number, number] {
  return rating === "fast" ? C.emerald : rating === "moderate" ? C.amber : C.red;
}

function scoreColor(score: number): [number, number, number] {
  return score >= 80 ? C.emerald : score >= 50 ? C.amber : C.red;
}

function statusLabel(status: "pass" | "warn" | "fail"): string {
  return status === "pass" ? "Pass" : status === "warn" ? "Warn" : "Fail";
}

function statusColor(status: "pass" | "warn" | "fail"): [number, number, number] {
  return status === "pass" ? C.emerald : status === "warn" ? C.amber : C.red;
}

// ─── Layout helpers ────────────────────────────────────────────────────────────

const MARGIN = 18;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;

function pageHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...C.slate900);
  doc.rect(0, 0, PAGE_W, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(...C.slate400);
  doc.text("ShopAudit — Shopify Store Analysis Report", MARGIN, 8);
  doc.text(title, PAGE_W - MARGIN, 8, { align: "right" });
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.slate400);
  doc.text(text.toUpperCase(), MARGIN, y);
  doc.setDrawColor(...C.slate100);
  doc.setLineWidth(0.4);
  doc.line(MARGIN + doc.getTextWidth(text.toUpperCase()) + 3, y, PAGE_W - MARGIN, y);
  return y + 6;
}

function scoreBox(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string | number, color: [number, number, number]
) {
  doc.setFillColor(...C.slate100);
  doc.roundedRect(x, y, w, h, 2, 2, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.slate400);
  doc.text(label, x + w / 2, y + 6, { align: "center" });
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color);
  doc.text(String(value), x + w / 2, y + 18, { align: "center" });
}

// ─── Page 1: Cover ─────────────────────────────────────────────────────────────

function buildCoverPage(doc: jsPDF, result: ScanResult) {
  pageHeader(doc, "Cover");

  // Hero banner
  doc.setFillColor(...C.indigo);
  doc.rect(0, 12, PAGE_W, 44, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.white);
  doc.text("Shopify Store Audit", PAGE_W / 2, 30, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 205, 255);
  const displayUrl = result.url.replace(/^https?:\/\//, "");
  doc.text(displayUrl, PAGE_W / 2, 39, { align: "center" });

  const scanned = new Date(result.scannedAt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  doc.setFontSize(7.5);
  doc.setTextColor(180, 185, 240);
  doc.text(`Scanned: ${scanned}`, PAGE_W / 2, 48, { align: "center" });

  // Score boxes
  const overallScore = result.performance.score !== null
    ? Math.round((result.seo.score + result.performance.score) / 2)
    : result.seo.score;
  const bw = 46;
  const bh = 28;
  const by = 66;
  const gap = 6;
  const totalW = 3 * bw + 2 * gap;
  const bx = (PAGE_W - totalW) / 2;

  scoreBox(doc, bx,           by, bw, bh, "Overall Score", overallScore,           scoreColor(overallScore));
  scoreBox(doc, bx + bw + gap,       by, bw, bh, "SEO Score",  result.seo.score,                     scoreColor(result.seo.score));
  scoreBox(doc, bx + (bw + gap) * 2, by, bw, bh, "Perf Score", result.performance.score ?? 0, scoreColor(result.performance.score ?? 0));

  let y = 104;

  // Platform & theme
  y = sectionTitle(doc, "Store Overview", y);

  const rows: [string, string][] = [
    ["Platform",     result.platform],
    ["Page Title",   result.pageTitle ?? "—"],
    ["URL",          result.url],
    ["HTTPS",        result.url.startsWith("https") ? "Yes" : "No"],
    ["Theme",        result.theme?.name ?? "Not detected"],
    ["Theme Version", result.theme?.version ? `v${result.theme.version}` : "—"],
    ["Theme Status", result.theme?.isOutdated ? "Outdated" : result.theme?.isOutdated === false ? "Up to date" : "Unknown"],
    ["Apps Detected", String(result.apps.length)],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: C.slate900 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40, textColor: C.slate600 },
      1: { cellWidth: CONTENT_W - 40 },
    },
    body: rows,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // SEO top issues for cover page
  const topIssues = result.seo.checks.filter(
    (c) => c.status !== "pass" && (c.category === "critical" || c.category === "warning" || !c.category)
  ).slice(0, 5);

  if (topIssues.length > 0) {
    y = sectionTitle(doc, "Top Fixes Required", y);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "striped",
      headStyles: { fillColor: C.slate900, textColor: C.white, fontSize: 7.5, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 36 },
        1: { cellWidth: 16, halign: "center" },
        2: { cellWidth: CONTENT_W - 52 },
      },
      head: [["Check", "Status", "Recommended Fix"]],
      body: topIssues.map((c) => [c.label, statusLabel(c.status), c.fix ?? c.message]),
      didParseCell(data) {
        if (data.column.index === 1 && data.section === "body") {
          const status = topIssues[data.row.index]?.status;
          if (status) data.cell.styles.textColor = statusColor(status);
        }
      },
    });
  }
}

// ─── Page 2: SEO Audit ─────────────────────────────────────────────────────────

function buildSeoPage(doc: jsPDF, result: ScanResult) {
  doc.addPage();
  pageHeader(doc, "SEO Audit");

  let y = 20;
  y = sectionTitle(doc, "SEO Audit Results", y);

  // Score summary strip
  doc.setFillColor(...C.slate100);
  doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, "F");
  const seoCol = scoreColor(result.seo.score);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...seoCol);
  doc.text(`${result.seo.score}`, MARGIN + 6, y + 9.5);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.slate600);
  doc.text("/100", MARGIN + 6 + doc.getTextWidth(`${result.seo.score}`) + 1, y + 9.5);
  doc.setFontSize(7.5);
  doc.setTextColor(...C.emerald);
  doc.text(`${result.seo.passCount} passed`, MARGIN + 36, y + 9.5);
  doc.setTextColor(...C.amber);
  doc.text(`${result.seo.warnCount} warnings`, MARGIN + 60, y + 9.5);
  doc.setTextColor(...C.red);
  doc.text(`${result.seo.failCount} failed`, MARGIN + 90, y + 9.5);
  y += 20;

  // All checks table
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    headStyles: { fillColor: C.slate900, textColor: C.white, fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 36 },
      1: { cellWidth: 16, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: CONTENT_W - 72 },
    },
    head: [["Check", "Status", "Category", "Outcome / Fix"]],
    body: result.seo.checks.map((c) => [
      c.label,
      statusLabel(c.status),
      c.category
        ? c.category.charAt(0).toUpperCase() + c.category.slice(1)
        : "—",
      c.status !== "pass" && c.fix
        ? c.fix.slice(0, 100) + (c.fix.length > 100 ? "…" : "")
        : c.message,
    ]),
    didParseCell(data) {
      if (data.column.index === 1 && data.section === "body") {
        const check = result.seo.checks[data.row.index];
        if (check) data.cell.styles.textColor = statusColor(check.status);
      }
      if (data.column.index === 2 && data.section === "body") {
        const check = result.seo.checks[data.row.index];
        if (check?.category === "critical") data.cell.styles.textColor = C.red;
        else if (check?.category === "warning") data.cell.styles.textColor = C.amber;
        else if (check?.category === "opportunity") data.cell.styles.textColor = C.indigo;
      }
    },
  });
}

// ─── Page 3: Performance & CWV ─────────────────────────────────────────────────

function buildPerformancePage(doc: jsPDF, result: ScanResult) {
  doc.addPage();
  pageHeader(doc, "Performance");

  const p = result.performance;
  // Prefer desktop CWV for the PDF report; fall back to mobile
  const cwv = (p.desktop ?? p.mobile)?.cwv ?? null;
  let y = 20;
  y = sectionTitle(doc, cwv ? "Core Web Vitals (PageSpeed Insights)" : "Core Web Vitals", y);

  const cwvRows = cwv ? [
    { label: "LCP — Largest Contentful Paint",  value: `${cwv.lcp.value}s`,  rating: cwv.lcp.rating, thresholds: "Good <2.5s / Needs Imp. <4s" },
    { label: "FCP — First Contentful Paint",    value: `${cwv.fcp.value}s`,  rating: cwv.fcp.rating, thresholds: "Good <1.8s / Needs Imp. <3s" },
    { label: "INP — Interaction to Next Paint", value: `${cwv.inp.value}ms`, rating: cwv.inp.rating, thresholds: "Good <200ms / Needs Imp. <500ms" },
    { label: "CLS — Cumulative Layout Shift",   value: `${cwv.cls.value}`,   rating: cwv.cls.rating, thresholds: "Good <0.1 / Needs Imp. <0.25" },
  ] : [];

  if (cwvRows.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "striped",
      headStyles: { fillColor: C.slate900, textColor: C.white, fontSize: 7.5, fontStyle: "bold" },
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 72 },
        1: { cellWidth: 22, halign: "center" },
        2: { cellWidth: 24, halign: "center" },
        3: { cellWidth: CONTENT_W - 118 },
      },
      head: [["Metric", "Value", "Rating", "Thresholds"]],
      body: cwvRows.map((r) => [r.label, r.value, r.rating.charAt(0).toUpperCase() + r.rating.slice(1), r.thresholds]),
      didParseCell(data) {
        if (data.column.index === 2 && data.section === "body") {
          const row = cwvRows[data.row.index];
          if (row) data.cell.styles.textColor = ratingColor(row.rating);
        }
      },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(8.5);
    doc.setTextColor(...C.slate600);
    doc.text("PageSpeed data not available for this report.", MARGIN, y + 8);
    y += 20;
  }

  y = sectionTitle(doc, "Technical Metrics", y);

  const perfStatus = (val: number, good: number, warn: number) =>
    val <= good ? "Good" : val <= warn ? "Needs Improvement" : "Poor";
  const perfColor = (val: number, good: number, warn: number): [number, number, number] =>
    val <= good ? C.emerald : val <= warn ? C.amber : C.red;

  const techRows = [
    { label: "JavaScript Files",      value: p.scriptCount,          good: 10, warn: 20 },
    { label: "Render-Blocking Scripts", value: p.renderBlockingCount, good: 0,  warn: 2  },
    { label: "CSS Stylesheets",        value: p.styleSheetCount,      good: 3,  warn: 5  },
    { label: "Total Images",           value: p.imageCount,           good: 10, warn: 20 },
    { label: "Lazy-Loaded Images",     value: p.lazyImageCount,       good: p.imageCount, warn: p.imageCount },
    { label: "HTML Document Size",     value: p.htmlSizeKb,           good: 150, warn: 500 },
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    headStyles: { fillColor: C.slate900, textColor: C.white, fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 72 },
      1: { cellWidth: 28, halign: "center" },
      2: { cellWidth: CONTENT_W - 100, halign: "center" },
    },
    head: [["Metric", "Value", "Status"]],
    body: techRows.map((r) => [
      r.label,
      r.label.includes("Size") ? `${r.value} KB` : String(r.value),
      perfStatus(r.value, r.good, r.warn),
    ]),
    didParseCell(data) {
      if (data.column.index === 2 && data.section === "body") {
        const row = techRows[data.row.index];
        if (row) data.cell.styles.textColor = perfColor(row.value, row.good, row.warn);
      }
    },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...C.slate400);
  doc.text(
    cwv
      ? "* CWV data from Google PageSpeed Insights API. Field data = real Chrome user measurements (p75); Lab = Lighthouse simulation."
      : "* PageSpeed data was not available at scan time. Re-scan the store to retrieve live CWV data.",
    MARGIN, y
  );
}

// ─── Page 4: App Footprint ─────────────────────────────────────────────────────

function buildAppsPage(doc: jsPDF, result: ScanResult) {
  doc.addPage();
  pageHeader(doc, "App Footprint");

  let y = 20;
  y = sectionTitle(doc, `App Footprint — ${result.apps.length} Apps Detected`, y);

  if (result.apps.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.slate400);
    doc.text("No third-party apps detected.", MARGIN, y + 6);
    return;
  }

  const impactLabel = (imp?: "low" | "medium" | "high") =>
    imp ? imp.charAt(0).toUpperCase() + imp.slice(1) : "—";
  const impactColor = (imp?: "low" | "medium" | "high"): [number, number, number] =>
    imp === "high" ? C.red : imp === "medium" ? C.amber : C.slate400;

  const sorted = [...result.apps].sort((a, b) => a.category.localeCompare(b.category));

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "striped",
    headStyles: { fillColor: C.slate900, textColor: C.white, fontSize: 7.5, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 44 },
      2: { cellWidth: CONTENT_W - 102, halign: "center" },
    },
    head: [["App Name", "Category", "Impact"]],
    body: sorted.map((a) => [a.name, a.category, impactLabel(a.impact)]),
    didParseCell(data) {
      if (data.column.index === 2 && data.section === "body") {
        const app = sorted[data.row.index];
        if (app) data.cell.styles.textColor = impactColor(app.impact);
      }
    },
  });

  // Category summary
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
  y = sectionTitle(doc, "By Category", y);

  const cats = [...new Set(sorted.map((a) => a.category))];
  const catSummary = cats.map((cat) => {
    const items = sorted.filter((a) => a.category === cat);
    return [cat, String(items.length), items.map((a) => a.name).join(", ")];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2.5, textColor: C.slate900 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38, textColor: C.slate600 },
      1: { cellWidth: 12, halign: "center", textColor: C.indigo },
      2: { cellWidth: CONTENT_W - 50 },
    },
    body: catSummary,
  });
}

// ─── Entry point ───────────────────────────────────────────────────────────────

export function downloadAuditReport(result: ScanResult): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  buildCoverPage(doc, result);
  buildSeoPage(doc, result);
  buildPerformancePage(doc, result);
  buildAppsPage(doc, result);

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.slate400);
    doc.text(
      `Page ${i} of ${pageCount}  ·  Generated by ShopAudit`,
      PAGE_W / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: "center" }
    );
  }

  const slug = result.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").slice(0, 40);
  doc.save(`shopaudit-${slug}.pdf`);
}
