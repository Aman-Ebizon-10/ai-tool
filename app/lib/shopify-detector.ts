// ─── Types ────────────────────────────────────────────────────────────────────

export type AppCategory =
  | "Email & SMS"
  | "Reviews"
  | "Loyalty"
  | "Live Chat"
  | "Search"
  | "Analytics"
  | "Upsell / CRO"
  | "Subscriptions"
  | "Social Proof"
  | "Wishlist"
  | "Shipping";

export interface DetectedApp {
  id: string;
  name: string;
  category: AppCategory;
  impact?: "low" | "medium" | "high";
}

export interface ShopifySignal {
  id: string;
  label: string;
  description: string;
  detected: boolean;
}

export interface ThemeInfo {
  /** Canonical display name: "Dawn", "Turbo", or formatted schema_name */
  name: string;
  /** The raw name the merchant gave this theme deployment (Shopify.theme.name) */
  internalName: string;
  /** schema_name from Shopify.theme — the actual theme product identifier */
  schemaName: string | null;
  /** schema_version — the version running on this store */
  version: string | null;
  /** Latest known version from our registry (null = not tracked) */
  latestVersion: string | null;
  /** true = store is behind latest; null = can't determine */
  isOutdated: boolean | null;
  /** Shopify internal theme ID */
  themeId: string | null;
  /** Non-null = purchased from Shopify Theme Store */
  themeStoreId: number | null;
  /** "main" | "unpublished" — which theme slot */
  role: string | null;
  /** Publisher name if known */
  publisher: string | null;
  /** True = official free Shopify theme, null = unknown */
  free: boolean | null;
  /** high = full Shopify.theme object parsed; low = pattern-matched */
  confidence: "high" | "low";
}

export type SeoStatus = "pass" | "warn" | "fail";

export interface SeoCheck {
  id: string;
  label: string;
  status: SeoStatus;
  /** The raw value found (title text, char count, etc.) */
  value: string | null;
  /** Short human-readable outcome */
  message: string;
}

export interface SeoAudit {
  score: number;       // 0–100
  passCount: number;
  warnCount: number;
  failCount: number;
  checks: SeoCheck[];
}

export interface CwvEstimate {
  value: number;
  rating: "fast" | "moderate" | "slow";
}

export interface PerformanceMetrics {
  score: number;
  scriptCount: number;
  styleSheetCount: number;
  imageCount: number;
  lazyImageCount: number;
  renderBlockingCount: number;
  hasResourceHints: boolean;
  htmlSizeKb: number;
  /** Heuristic estimates derived from static HTML signals — not real field data */
  cwv: {
    lcp: CwvEstimate; // seconds
    fcp: CwvEstimate; // seconds
    inp: CwvEstimate; // milliseconds
    cls: CwvEstimate; // unitless
  };
}

export interface ScanResult {
  url: string;
  isShopify: boolean;
  platform: string;
  pageTitle: string | null;
  metaDescription: string | null;
  theme: ThemeInfo | null;
  apps: DetectedApp[];
  seo: SeoAudit;
  performance: PerformanceMetrics;
  signals: ShopifySignal[];
  detectedCount: number;
  scannedAt: string;
}

// ─── App registry ─────────────────────────────────────────────────────────────
// Each entry lists string signals: if ANY appears in the HTML, the app is detected.

const APP_REGISTRY: Array<{
  id: string;
  name: string;
  category: AppCategory;
  signals: string[];
  impact?: "low" | "medium" | "high";
}> = [
  // Email & SMS
  { id: "klaviyo",     name: "Klaviyo",          category: "Email & SMS",   impact: "high",   signals: ["klaviyo.com/onsite", "klaviyo.com/media/js", "KlaviyoSubscribe"] },
  { id: "omnisend",    name: "Omnisend",          category: "Email & SMS",   impact: "medium", signals: ["omnisend.com", "OmnisendFormDisplay"] },
  { id: "attentive",   name: "Attentive",         category: "Email & SMS",   impact: "high",   signals: ["attn.tv", "attentive_tag"] },
  { id: "postscript",  name: "Postscript",        category: "Email & SMS",   impact: "low",    signals: ["postscript.io"] },
  { id: "smsbump",     name: "SMSBump",           category: "Email & SMS",   impact: "low",    signals: ["smsbump.com"] },
  { id: "privy",       name: "Privy",             category: "Email & SMS",   impact: "medium", signals: ["privy.com/v2/snippet.js", "PrivyOverlay"] },
  { id: "drip",        name: "Drip",              category: "Email & SMS",   impact: "low",    signals: ["getdrip.com"] },
  { id: "recart",      name: "Recart",            category: "Email & SMS",   impact: "low",    signals: ["recart.com"] },
  { id: "sendlane",    name: "Sendlane",          category: "Email & SMS",   impact: "low",    signals: ["sendlane.com"] },
  // Reviews
  { id: "judgeme",     name: "Judge.me",          category: "Reviews",       impact: "medium", signals: ["judge.me", "jdgm-"] },
  { id: "yotpo",       name: "Yotpo",             category: "Reviews",       impact: "high",   signals: ["yotpo.com/assets", "yotpoWidgetsContainer", "yotpo.com/widget"] },
  { id: "loox",        name: "Loox",              category: "Reviews",       impact: "low",    signals: ["loox.io"] },
  { id: "stamped",     name: "Stamped.io",        category: "Reviews",       impact: "low",    signals: ["stamped.io"] },
  { id: "okendo",      name: "Okendo",            category: "Reviews",       impact: "medium", signals: ["okendo.io"] },
  { id: "reviews_io",  name: "Reviews.io",        category: "Reviews",       impact: "low",    signals: ["widget.reviews.io", "reviews.io/media"] },
  { id: "fera",        name: "Fera.ai",           category: "Reviews",       impact: "low",    signals: ["fera.ai", "fera-widget"] },
  { id: "ali_reviews", name: "Ali Reviews",       category: "Reviews",       impact: "low",    signals: ["alireviews.io", "ali-reviews"] },
  // Loyalty & Rewards
  { id: "smile",       name: "Smile.io",          category: "Loyalty",       impact: "medium", signals: ["smile.io", "smile-ui", "bitlabs_smile"] },
  { id: "loyaltylion", name: "LoyaltyLion",       category: "Loyalty",       impact: "medium", signals: ["loyaltylion.com", "LoyaltyLion"] },
  { id: "growave",     name: "Growave",           category: "Loyalty",       impact: "low",    signals: ["growave.io", "socialshopwave.com"] },
  { id: "rise",        name: "Rise.ai",           category: "Loyalty",       impact: "low",    signals: ["rise.ai", "rswidget"] },
  { id: "yotpo_loyalty", name: "Yotpo Loyalty",  category: "Loyalty",       impact: "medium", signals: ["swell.is", "swellrewards"] },
  // Live Chat & Support
  { id: "gorgias",     name: "Gorgias",           category: "Live Chat",     impact: "medium", signals: ["gorgias.com", "GorgiasChat"] },
  { id: "tidio",       name: "Tidio",             category: "Live Chat",     impact: "low",    signals: ["tidiochat.com"] },
  { id: "intercom",    name: "Intercom",          category: "Live Chat",     impact: "high",   signals: ["intercomSettings", "widget.intercom.io"] },
  { id: "zendesk",     name: "Zendesk",           category: "Live Chat",     impact: "medium", signals: ["zdassets.com", "zopim"] },
  { id: "reamaze",     name: "Re:amaze",          category: "Live Chat",     impact: "low",    signals: ["reamaze.com"] },
  { id: "helpscout",   name: "Help Scout",        category: "Live Chat",     impact: "low",    signals: ["helpscout.net", "beacon-v2.helpscout.net"] },
  { id: "freshdesk",   name: "Freshdesk",         category: "Live Chat",     impact: "low",    signals: ["freshdesk.com/widget", "freshwidget.com"] },
  { id: "livechat",    name: "LiveChat",          category: "Live Chat",     impact: "low",    signals: ["livechatinc.com", "livechat-static.com"] },
  // Search
  { id: "searchanise", name: "Searchanise",       category: "Search",        impact: "low",    signals: ["searchanise.com"] },
  { id: "klevu",       name: "Klevu",             category: "Search",        impact: "medium", signals: ["klevu.com"] },
  { id: "boost",       name: "Boost Commerce",    category: "Search",        impact: "medium", signals: ["boostcommerce.net"] },
  { id: "searchpie",   name: "SearchPie",         category: "Search",        impact: "low",    signals: ["searchpie.com"] },
  { id: "doofinder",   name: "Doofinder",         category: "Search",        impact: "low",    signals: ["doofinder.com"] },
  { id: "searchie",    name: "Fast Simon",        category: "Search",        impact: "medium", signals: ["fastsimon.com", "searchanise-widget"] },
  // Analytics & Heatmaps
  { id: "hotjar",      name: "Hotjar",            category: "Analytics",     impact: "high",   signals: ["hotjar.com", "_hjSettings"] },
  { id: "luckyorange", name: "Lucky Orange",      category: "Analytics",     impact: "high",   signals: ["luckyorange.com"] },
  { id: "clarity",     name: "Microsoft Clarity", category: "Analytics",     impact: "medium", signals: ["clarity.ms"] },
  { id: "heap",        name: "Heap",              category: "Analytics",     impact: "high",   signals: ["heapanalytics.com"] },
  { id: "segment",     name: "Segment",           category: "Analytics",     impact: "high",   signals: ["cdn.segment.io"] },
  { id: "triplewhale", name: "Triple Whale",      category: "Analytics",     impact: "medium", signals: ["triplewhale.com"] },
  // Upsell & CRO
  { id: "reconvert",   name: "ReConvert",         category: "Upsell / CRO",  impact: "low",    signals: ["reconvert.com"] },
  { id: "bold",        name: "Bold Commerce",     category: "Upsell / CRO",  impact: "medium", signals: ["boldcommerce.com"] },
  { id: "honeycomb",   name: "Honeycomb",         category: "Upsell / CRO",  impact: "low",    signals: ["honeycombapp.com"] },
  { id: "zipify",      name: "Zipify Pages",      category: "Upsell / CRO",  impact: "medium", signals: ["zipify.com"] },
  { id: "frequently",  name: "Frequently Bought Together", category: "Upsell / CRO", impact: "low", signals: ["frequently-bought-together", "fbt-product"] },
  // Subscriptions
  { id: "recharge",    name: "Recharge",          category: "Subscriptions", impact: "medium", signals: ["rechargepayments.com", "recharge_cart"] },
  { id: "skio",        name: "Skio",              category: "Subscriptions", impact: "low",    signals: ["skio.com"] },
  { id: "ordergroove", name: "Ordergroove",       category: "Subscriptions", impact: "medium", signals: ["ordergroove.com"] },
  { id: "seal_subscriptions", name: "Seal Subscriptions", category: "Subscriptions", impact: "low", signals: ["seal-subscriptions.com"] },
  // Social Proof
  { id: "fomo",        name: "Fomo",              category: "Social Proof",  impact: "low",    signals: ["fomo.com", "FomoClient"] },
  { id: "trustpulse",  name: "TrustPulse",        category: "Social Proof",  impact: "low",    signals: ["trustpulse.com"] },
  { id: "nextsale",    name: "Nextsale",          category: "Social Proof",  impact: "low",    signals: ["nextsale.io"] },
  // Wishlist
  { id: "swym",        name: "Wishlist Plus",     category: "Wishlist",      impact: "low",    signals: ["swymcart.com", "swymRelay"] },
  { id: "wishlist_hero", name: "Wishlist Hero",   category: "Wishlist",      impact: "low",    signals: ["wishlist-hero.com"] },
  // Shipping & Tracking
  { id: "aftership",   name: "AfterShip",         category: "Shipping",      impact: "low",    signals: ["aftership.com"] },
  { id: "parcellab",   name: "Parcellab",         category: "Shipping",      impact: "low",    signals: ["parcellab.com"] },
];

function detectApps(html: string): DetectedApp[] {
  const detected: DetectedApp[] = [];
  for (const def of APP_REGISTRY) {
    if (def.signals.some((s) => html.includes(s))) {
      detected.push({ id: def.id, name: def.name, category: def.category, impact: def.impact });
    }
  }
  return detected;
}

// ─── Known-theme registry ──────────────────────────────────────────────────────
// Keyed by schema_name (lowercase). Maps to display metadata.

type KnownTheme = { name: string; publisher: string; free: boolean; latestVersion?: string };

const KNOWN_THEMES: Record<string, KnownTheme> = {
  // Shopify free themes
  dawn:       { name: "Dawn",       publisher: "Shopify", free: true,  latestVersion: "14.0.0" },
  debut:      { name: "Debut",      publisher: "Shopify", free: true,  latestVersion: "8.2.0"  },
  brooklyn:   { name: "Brooklyn",   publisher: "Shopify", free: true,  latestVersion: "9.1.0"  },
  narrative:  { name: "Narrative",  publisher: "Shopify", free: true,  latestVersion: "4.1.0"  },
  venture:    { name: "Venture",    publisher: "Shopify", free: true,  latestVersion: "7.0.0"  },
  supply:     { name: "Supply",     publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  minimal:    { name: "Minimal",    publisher: "Shopify", free: true,  latestVersion: "8.0.0"  },
  boundless:  { name: "Boundless",  publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  sense:      { name: "Sense",      publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  craft:      { name: "Craft",      publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  refresh:    { name: "Refresh",    publisher: "Shopify", free: true,  latestVersion: "5.0.0"  },
  crave:      { name: "Crave",      publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  ride:       { name: "Ride",       publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  origin:     { name: "Origin",     publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  studio:     { name: "Studio",     publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  colorblock: { name: "Colorblock", publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  taste:      { name: "Taste",      publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  highlight:  { name: "Highlight",  publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  trade:      { name: "Trade",      publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  publisher:  { name: "Publisher",  publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  cascade:    { name: "Cascade",    publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  hero:       { name: "Hero",       publisher: "Shopify", free: true,  latestVersion: "4.0.0"  },
  // Premium themes
  turbo:      { name: "Turbo",      publisher: "Out of the Sandbox", free: false, latestVersion: "8.0.1"  },
  flex:       { name: "Flex",       publisher: "Out of the Sandbox", free: false, latestVersion: "8.0.1"  },
  prestige:   { name: "Prestige",   publisher: "Maestrooo",          free: false, latestVersion: "10.7.2" },
  impulse:    { name: "Impulse",    publisher: "Archetype Themes",   free: false, latestVersion: "7.3.0"  },
  movement:   { name: "Movement",   publisher: "Archetype Themes",   free: false, latestVersion: "4.0.0"  },
  motion:     { name: "Motion",     publisher: "Archetype Themes",   free: false, latestVersion: "10.0.0" },
  context:    { name: "Context",    publisher: "Archetype Themes",   free: false, latestVersion: "3.0.0"  },
  symmetry:   { name: "Symmetry",   publisher: "Clean Canvas",       free: false, latestVersion: "7.0.0"  },
  retina:     { name: "Retina",     publisher: "Clean Canvas",       free: false, latestVersion: "7.0.0"  },
  atlantic:   { name: "Atlantic",   publisher: "Clean Canvas",       free: false, latestVersion: "7.0.0"  },
  pipeline:   { name: "Pipeline",   publisher: "Groupthought",       free: false, latestVersion: "5.0.0"  },
  warehouse:  { name: "Warehouse",  publisher: "Pixel Union",        free: false, latestVersion: "7.0.0"  },
  superstore: { name: "Superstore", publisher: "Pixel Union",        free: false, latestVersion: "6.0.0"  },
  empire:     { name: "Empire",     publisher: "Pixel Union",        free: false, latestVersion: "9.0.0"  },
  kingdom:    { name: "Kingdom",    publisher: "Pixel Union",        free: false, latestVersion: "5.0.0"  },
  expanse:    { name: "Expanse",    publisher: "Pixel Union",        free: false, latestVersion: "5.0.0"  },
  streamline: { name: "Streamline", publisher: "Blend Themes",       free: false, latestVersion: "7.0.0"  },
  vantage:    { name: "Vantage",    publisher: "Eight Themes",       free: false, latestVersion: "8.0.0"  },
  district:   { name: "District",   publisher: "Style Hatch",        free: false, latestVersion: "7.0.0"  },
  debutify:   { name: "Debutify",   publisher: "Debutify",           free: false, latestVersion: "5.0.0"  },
  booster:    { name: "Booster",    publisher: "BoosterTheme",       free: false, latestVersion: "5.0.0"  },
  envy:       { name: "Envy",       publisher: "Maestrooo",          free: false, latestVersion: "8.0.0"  },
  focal:      { name: "Focal",      publisher: "Maestrooo",          free: false, latestVersion: "8.0.0"  },
  baseline:   { name: "Baseline",   publisher: "Fuel",               free: false, latestVersion: "5.0.0"  },
};

// Formats a raw schema_name slug into a human-readable name.
// e.g., "allbirds-theme" → "Allbirds Theme", "GS2" → "GS2"
function formatSchemaName(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Returns negative if a < b (a is older), 0 if equal, positive if a > b
function compareSemver(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

// ─── Theme extraction ──────────────────────────────────────────────────────────

function extractThemeInfo(html: string): ThemeInfo | null {
  // Primary: Shopify.theme = { … } — handles one level of nesting in the JSON.
  const rawMatch = html.match(/Shopify\.theme\s*=\s*(\{(?:[^{}]|\{[^{}]*\})*\})/);
  if (rawMatch) {
    let obj: Record<string, unknown> | null = null;
    try {
      obj = JSON.parse(rawMatch[1]);
    } catch {
      // Occasionally the value isn't clean JSON (extra trailing comma, etc.).
      // Fall through to field-by-field extraction below.
    }

    const raw = rawMatch[1];
    const internalName =
      (obj?.name as string | undefined) ??
      raw.match(/"name"\s*:\s*"([^"]+)"/)?.[1] ??
      "";

    const schemaName =
      (obj?.schema_name as string | undefined) ??
      raw.match(/"schema_name"\s*:\s*"([^"]+)"/)?.[1] ??
      null;

    const version =
      (obj?.schema_version as string | undefined) ??
      raw.match(/"schema_version"\s*:\s*"([^"]+)"/)?.[1] ??
      null;

    const themeId =
      obj?.id != null ? String(obj.id) :
      raw.match(/"id"\s*:\s*(\d+)/)?.[1] ?? null;

    const themeStoreId =
      obj?.theme_store_id != null && obj.theme_store_id !== "null"
        ? Number(obj.theme_store_id) || null
        : null;

    const role =
      (obj?.role as string | undefined) ??
      raw.match(/"role"\s*:\s*"([^"]+)"/)?.[1] ??
      null;

    const key = schemaName?.toLowerCase() ?? "";
    const known = KNOWN_THEMES[key];
    const latestVersion = known?.latestVersion ?? null;
    const isOutdated =
      version && latestVersion
        ? compareSemver(version, latestVersion) < 0
        : null;

    return {
      name: known?.name ?? (schemaName ? formatSchemaName(schemaName) : internalName || "Unknown Theme"),
      internalName,
      schemaName,
      version,
      latestVersion,
      isOutdated,
      themeId,
      themeStoreId,
      role,
      publisher: known?.publisher ?? null,
      free: known?.free ?? null,
      confidence: "high",
    };
  }

  // Fallback: CSS class / asset pattern matching for well-known themes
  const patterns: Array<[RegExp, string]> = [
    [/\bturbo[-_]theme\b|out-of-the-sandbox\/turbo/i, "turbo"],
    [/\bflex[-_]theme\b|out-of-the-sandbox\/flex/i,   "flex"],
    [/\bprestige[-_]theme\b|maestrooo\/prestige/i,    "prestige"],
    [/\bimpulse[-_]theme\b|archetype.*impulse/i,      "impulse"],
    [/\bdebutify\b/i,                                  "debutify"],
    [/\bbooster[-_]theme\b/i,                          "booster"],
    [/\bdawn[-_.](?:js|css)\b/i,                       "dawn"],
    [/\bnarrative[-_.](?:js|css)\b/i,                  "narrative"],
  ];

  for (const [re, key] of patterns) {
    if (re.test(html)) {
      const known = KNOWN_THEMES[key];
      return {
        name:          known?.name ?? formatSchemaName(key),
        internalName:  "",
        schemaName:    key,
        version:       null,
        latestVersion: known?.latestVersion ?? null,
        isOutdated:    null, // can't compare without a detected version
        themeId:       null,
        themeStoreId:  null,
        role:          null,
        publisher:     known?.publisher ?? null,
        free:          known?.free ?? null,
        confidence:    "low",
      };
    }
  }

  return null;
}

// ─── SEO audit ────────────────────────────────────────────────────────────────

// Points per status (equal-weight scoring out of 100).
const SEO_PTS: Record<SeoStatus, number> = { pass: 10, warn: 5, fail: 0 };

function runSeoAudit(html: string, isHttps: boolean): SeoAudit {
  const checks: SeoCheck[] = [];

  function push(
    id: string,
    label: string,
    status: SeoStatus,
    value: string | null,
    message: string,
  ) {
    checks.push({ id, label, status, value, message });
  }

  // ── 1. Title tag ──────────────────────────────────────────────────────────
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null;
  if (!titleText) {
    push("title", "Title Tag", "fail", null, "Missing — required for SEO");
  } else if (titleText.length < 30) {
    push("title", "Title Tag", "warn", titleText, `Too short — ${titleText.length} chars (aim for 30–60)`);
  } else if (titleText.length > 60) {
    push("title", "Title Tag", "warn", titleText, `Too long — ${titleText.length} chars (aim for 30–60)`);
  } else {
    push("title", "Title Tag", "pass", titleText, `${titleText.length} characters`);
  }

  // ── 2. Meta description ───────────────────────────────────────────────────
  const descPatterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*?)["']/i,
    /<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']description["']/i,
  ];
  let descText: string | null = null;
  for (const p of descPatterns) {
    const m = html.match(p);
    if (m) { descText = m[1].trim(); break; }
  }
  if (!descText) {
    push("meta_desc", "Meta Description", "fail", null, "Missing — important for click-through rate");
  } else if (descText.length < 120) {
    push("meta_desc", "Meta Description", "warn", descText, `Too short — ${descText.length} chars (aim for 120–160)`);
  } else if (descText.length > 160) {
    push("meta_desc", "Meta Description", "warn", descText, `Too long — ${descText.length} chars (aim for 120–160)`);
  } else {
    push("meta_desc", "Meta Description", "pass", descText, `${descText.length} characters`);
  }

  // ── 3. H1 heading ─────────────────────────────────────────────────────────
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
    push("h1", "H1 Heading", "fail", null, "No H1 tag found");
  } else if (h1Matches.length > 1) {
    push("h1", "H1 Heading", "warn", `${h1Matches.length} H1 tags`, `${h1Matches.length} H1s found — use exactly one`);
  } else {
    const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    push("h1", "H1 Heading", "pass", h1Text || "Present", "Single H1 found");
  }

  // ── 4. Canonical tag ──────────────────────────────────────────────────────
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (canonicalMatch) {
    push("canonical", "Canonical URL", "pass", canonicalMatch[1], "Canonical tag present");
  } else {
    push("canonical", "Canonical URL", "warn", null, "Missing — recommended to prevent duplicate content");
  }

  // ── 5. Open Graph ─────────────────────────────────────────────────────────
  const ogTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
  const ogDesc  = /<meta[^>]+property=["']og:description["']/i.test(html);
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  if (ogCount === 0) {
    push("og", "Open Graph", "fail", null, "No OG tags — social shares will look broken");
  } else if (!ogImage) {
    push("og", "Open Graph", "warn", `${ogCount}/3 tags`, "og:image missing — required for rich social previews");
  } else {
    push("og", "Open Graph", "pass", "3/3 tags", "Title, description & image present");
  }

  // ── 6. Twitter Card ───────────────────────────────────────────────────────
  const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
  push(
    "twitter",
    "Twitter Card",
    hasTwitterCard ? "pass" : "warn",
    hasTwitterCard ? "Present" : null,
    hasTwitterCard ? "Twitter Card meta tag present" : "Missing — Twitter/X shares won't show a rich card",
  );

  // ── 7. Robots (noindex check) ─────────────────────────────────────────────
  const isNoindex =
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
    /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
  push(
    "robots",
    "Robots Meta",
    isNoindex ? "fail" : "pass",
    isNoindex ? "noindex" : "index, follow",
    isNoindex ? "Page blocked from indexing — check if intentional" : "Page is indexable",
  );

  // ── 8. Viewport ───────────────────────────────────────────────────────────
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  push(
    "viewport",
    "Viewport Meta",
    hasViewport ? "pass" : "fail",
    hasViewport ? "Present" : null,
    hasViewport ? "Mobile viewport configured" : "Missing — required for mobile usability ranking",
  );

  // ── 9. HTTPS ──────────────────────────────────────────────────────────────
  push(
    "https",
    "HTTPS",
    isHttps ? "pass" : "fail",
    isHttps ? "Enabled" : "HTTP only",
    isHttps ? "Secure connection" : "Site is not HTTPS — negative ranking signal",
  );

  // ── 10. Structured data ───────────────────────────────────────────────────
  const jsonLdCount = (
    html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []
  ).length;
  push(
    "schema",
    "Structured Data",
    jsonLdCount > 0 ? "pass" : "warn",
    jsonLdCount > 0 ? `${jsonLdCount} JSON-LD block${jsonLdCount > 1 ? "s" : ""}` : null,
    jsonLdCount > 0
      ? `${jsonLdCount} JSON-LD block${jsonLdCount > 1 ? "s" : ""} detected`
      : "No JSON-LD found — add Product/Organization schema",
  );

  // ── 11. Language attribute ────────────────────────────────────────────────
  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  push(
    "lang",
    "Language",
    langMatch ? "pass" : "warn",
    langMatch ? langMatch[1] : null,
    langMatch ? `lang="${langMatch[1]}"` : "html lang attribute missing — helps search engines identify language",
  );

  // ── Score ─────────────────────────────────────────────────────────────────
  const maxPts = checks.length * SEO_PTS.pass;
  const earnedPts = checks.reduce((sum, c) => sum + SEO_PTS[c.status], 0);
  const score = Math.round((earnedPts / maxPts) * 100);

  return {
    score,
    passCount:  checks.filter((c) => c.status === "pass").length,
    warnCount:  checks.filter((c) => c.status === "warn").length,
    failCount:  checks.filter((c) => c.status === "fail").length,
    checks,
  };
}

// ─── Performance analysis ─────────────────────────────────────────────────────

function analyzePerformance(html: string): PerformanceMetrics {
  const scriptCount = (html.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? []).length;
  const styleSheetCount = (html.match(/<link[^>]+rel=["']stylesheet["'][^>]*/gi) ?? []).length;
  const imageCount = (html.match(/<img[\s>]/gi) ?? []).length;
  const lazyImageCount = (html.match(/<img[^>]+loading=["']lazy["']/gi) ?? []).length;

  const headHtml = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";
  const headScripts = headHtml.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? [];
  const renderBlockingCount = headScripts.filter((s) => !/\b(async|defer)\b/.test(s)).length;

  const hasResourceHints = /<link[^>]+rel=["'](preload|prefetch|preconnect|dns-prefetch)["']/i.test(html);
  const htmlSizeKb = Math.round(html.length / 1024);

  let score = 100;
  score -= Math.min(scriptCount * 2, 30);
  score -= Math.min(renderBlockingCount * 8, 25);
  score -= Math.min(styleSheetCount * 2, 15);
  if (imageCount > 0) {
    if (lazyImageCount / imageCount >= 0.3) score += 5;
    else score -= 5;
  }
  if (hasResourceHints) score += 5;
  if (htmlSizeKb < 150) score += 5;
  else if (htmlSizeKb > 500) score -= 10;

  // ── Core Web Vitals heuristic estimates ────────────────────────────────────
  // Derived from static HTML signals; not real field data.
  const lazyPct = imageCount > 0 ? lazyImageCount / imageCount : 1;

  // LCP (Largest Contentful Paint) — thresholds: <2.5s fast, 2.5–4s moderate, >4s slow
  let lcpVal = 1.2;
  lcpVal += Math.min(renderBlockingCount * 0.55, 2.5);
  lcpVal += htmlSizeKb > 600 ? 0.6 : htmlSizeKb > 300 ? 0.3 : 0;
  if (!hasResourceHints) lcpVal += 0.2;
  if (imageCount > 5 && lazyPct < 0.2) lcpVal += 0.3;
  lcpVal = Math.max(0.5, Math.round(lcpVal * 10) / 10);

  // FCP (First Contentful Paint) — thresholds: <1.8s fast, 1.8–3s moderate, >3s slow
  let fcpVal = 0.7;
  fcpVal += Math.min(renderBlockingCount * 0.45, 1.8);
  fcpVal += htmlSizeKb > 500 ? 0.3 : htmlSizeKb > 250 ? 0.15 : 0;
  if (hasResourceHints) fcpVal -= 0.15;
  fcpVal = Math.max(0.3, Math.round(fcpVal * 10) / 10);

  // INP (Interaction to Next Paint) — thresholds: <200ms fast, 200–500ms moderate, >500ms slow
  const inpVal = Math.round(
    Math.min(80 + scriptCount * 5 + renderBlockingCount * 20, 700) / 10
  ) * 10;

  // CLS (Cumulative Layout Shift) — thresholds: <0.1 fast, 0.1–0.25 moderate, >0.25 slow
  let clsVal = 0.04;
  if (imageCount > 0) clsVal += (1 - lazyPct) * 0.22;
  clsVal = Math.max(0, Math.round(clsVal * 100) / 100);

  function cwvRating(val: number, fastThresh: number, moderateThresh: number): "fast" | "moderate" | "slow" {
    return val < fastThresh ? "fast" : val < moderateThresh ? "moderate" : "slow";
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    scriptCount,
    styleSheetCount,
    imageCount,
    lazyImageCount,
    renderBlockingCount,
    hasResourceHints,
    htmlSizeKb,
    cwv: {
      lcp: { value: lcpVal, rating: cwvRating(lcpVal, 2.5, 4) },
      fcp: { value: fcpVal, rating: cwvRating(fcpVal, 1.8, 3) },
      inp: { value: inpVal, rating: cwvRating(inpVal, 200, 500) },
      cls: { value: clsVal, rating: cwvRating(clsVal, 0.1, 0.25) },
    },
  };
}

// ─── HTML helpers ──────────────────────────────────────────────────────────────

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

function extractMetaDescription(html: string): string | null {
  const patterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*?)["']/i,
    /<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']description["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

// ─── Main analyser ─────────────────────────────────────────────────────────────

export function analyzeHtml(html: string, hostname: string, isHttps = true): ScanResult {
  const signals: ShopifySignal[] = [
    {
      id: "cdn",
      label: "Shopify CDN",
      description: "Assets loaded from cdn.shopify.com",
      detected: html.includes("cdn.shopify.com"),
    },
    {
      id: "js_object",
      label: "Shopify JS Object",
      description: "window.Shopify JavaScript object present",
      detected: /window\.Shopify|var Shopify\s*=/.test(html),
    },
    {
      id: "myshopify",
      label: "myshopify.com Domain",
      description: "Store hosted on or linked to myshopify.com",
      detected: hostname.includes("myshopify.com") || html.includes(".myshopify.com"),
    },
    {
      id: "sections",
      label: "Shopify Sections",
      description: "shopify-section CSS class in page markup",
      detected: html.includes("shopify-section"),
    },
    {
      id: "analytics",
      label: "Shopify Analytics",
      description: "ShopifyAnalytics tracking object detected",
      detected: /ShopifyAnalytics|Shopify\.analytics/.test(html),
    },
    {
      id: "generator",
      label: "Generator Meta Tag",
      description: '<meta name="generator" content="Shopify">',
      detected: /<meta[^>]+generator[^>]+[Ss]hopify/.test(html),
    },
    {
      id: "theme",
      label: "Shopify Theme Data",
      description: "Shopify.theme object embedded in page",
      detected: /Shopify\.theme/.test(html),
    },
    {
      id: "storefront_api",
      label: "Storefront API",
      description: "References to Shopify Storefront API detected",
      detected:
        html.includes("storefront.shopify.com") ||
        html.includes("shopify_storefront"),
    },
  ];

  const detectedCount = signals.filter((s) => s.detected).length;
  const isShopify = hostname.includes("myshopify.com") || detectedCount >= 2;

  return {
    url: hostname,
    isShopify,
    platform: isShopify ? "Shopify" : "Unknown",
    pageTitle: extractTitle(html),
    metaDescription: extractMetaDescription(html),
    theme: isShopify ? extractThemeInfo(html) : null,
    apps: isShopify ? detectApps(html) : [],
    seo: runSeoAudit(html, isHttps),
    performance: analyzePerformance(html),
    signals,
    detectedCount,
    scannedAt: new Date().toISOString(),
  };
}
