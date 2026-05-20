// ─── Types ────────────────────────────────────────────────────────────────────

export type AppCategory =
  | "Email Marketing"
  | "Reviews & UGC"
  | "Analytics"
  | "Upsell & Cross-sell"
  | "Payments & BNPL"
  | "Customer Support"
  | "Subscriptions"
  | "Loyalty & Rewards"
  | "Landing Pages"
  | "Tracking Pixels"
  | "Shipping & Logistics"
  | "Search & Filtering"
  | "AI & Personalization";

export interface DetectedApp {
  id: string;
  name: string;
  category: AppCategory;
  /** How confident we are in this detection */
  confidence: "high" | "medium" | "low";
  /** The specific HTML signals that triggered this match */
  matchedSignals: string[];
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
export type SeoCategory = "critical" | "warning" | "opportunity";

export interface SeoCheck {
  id: string;
  label: string;
  category: SeoCategory;
  status: SeoStatus;
  value: string | null;
  message: string;
  detail: string | null;
  fix: string | null;
  affectedArea: string | null;
  impact: "high" | "medium" | "low";
}

export interface SeoAudit {
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  criticalCount: number;
  warningCount: number;
  opportunityCount: number;
  checks: SeoCheck[];
}

export interface CwvEstimate {
  value: number;
  rating: "fast" | "moderate" | "slow";
}

export interface PerformanceViewMetrics {
  score: number;
  /** "field" = real Chrome user data (CrUX); "lab" = Lighthouse; "estimated" = HTML heuristic */
  dataSource: "field" | "lab" | "estimated";
  cwv: {
    lcp: CwvEstimate;
    fcp: CwvEstimate;
    inp: CwvEstimate;
    cls: CwvEstimate;
    tbt: CwvEstimate; // Total Blocking Time — lab data only
    si:  CwvEstimate; // Speed Index — lab data only
  };
}

export interface PerformanceMetrics {
  scriptCount: number;
  styleSheetCount: number;
  imageCount: number;
  lazyImageCount: number;
  renderBlockingCount: number;
  hasResourceHints: boolean;
  htmlSizeKb: number;
  mobile: PerformanceViewMetrics | null;
  desktop: PerformanceViewMetrics | null;
  score: number | null;
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
// Named entries: high/medium confidence based on how many signals match.
// Generic entries (isGeneric:true): low confidence, only shown when no named app
// in that category was detected.

type AppDef = {
  id: string;
  name: string;
  category: AppCategory;
  signals: string[];
  impact?: "low" | "medium" | "high";
  isGeneric?: boolean;
};

const APP_REGISTRY: AppDef[] = [
  // ── Email Marketing ───────────────────────────────────────────────────────
  { id: "klaviyo",     name: "Klaviyo",             category: "Email Marketing",    impact: "high",   signals: ["klaviyo.com/onsite", "klaviyo.com/media/js", "KlaviyoSubscribe"] },
  { id: "omnisend",    name: "Omnisend",            category: "Email Marketing",    impact: "medium", signals: ["omnisend.com", "OmnisendFormDisplay"] },
  { id: "attentive",   name: "Attentive",           category: "Email Marketing",    impact: "high",   signals: ["attn.tv", "attentive_tag"] },
  { id: "postscript",  name: "Postscript",          category: "Email Marketing",    impact: "low",    signals: ["postscript.io"] },
  { id: "smsbump",     name: "SMSBump",             category: "Email Marketing",    impact: "low",    signals: ["smsbump.com"] },
  { id: "privy",       name: "Privy",               category: "Email Marketing",    impact: "medium", signals: ["privy.com/v2/snippet.js", "PrivyOverlay"] },
  { id: "drip",        name: "Drip",                category: "Email Marketing",    impact: "low",    signals: ["getdrip.com"] },
  { id: "recart",      name: "Recart",              category: "Email Marketing",    impact: "low",    signals: ["recart.com"] },
  { id: "sendlane",    name: "Sendlane",            category: "Email Marketing",    impact: "low",    signals: ["sendlane.com"] },
  { id: "mailchimp",   name: "Mailchimp",           category: "Email Marketing",    impact: "medium", signals: ["mailchimp.com", "mc-embedded-subscribe", "chimpstatic.com"] },
  { id: "activecampaign", name: "ActiveCampaign",   category: "Email Marketing",    impact: "medium", signals: ["activecampaign.com", "activehosted.com"] },
  { id: "brevo",       name: "Brevo",               category: "Email Marketing",    impact: "low",    signals: ["sibautomation.com", "brevo.com", "sendinblue.com"] },
  { id: "generic_email", name: "Email Marketing (unidentified)", category: "Email Marketing", impact: "low", isGeneric: true,
    signals: ["email-capture", "email-signup-form", "newsletter-signup", "popup-email"] },

  // ── Reviews & UGC ─────────────────────────────────────────────────────────
  { id: "judgeme",     name: "Judge.me",            category: "Reviews & UGC",      impact: "medium", signals: ["judge.me", "jdgm-"] },
  { id: "yotpo",       name: "Yotpo Reviews",       category: "Reviews & UGC",      impact: "high",   signals: ["yotpo.com/assets", "yotpoWidgetsContainer", "yotpo.com/widget"] },
  { id: "loox",        name: "Loox",                category: "Reviews & UGC",      impact: "low",    signals: ["loox.io"] },
  { id: "stamped",     name: "Stamped.io",          category: "Reviews & UGC",      impact: "low",    signals: ["stamped.io"] },
  { id: "okendo",      name: "Okendo",              category: "Reviews & UGC",      impact: "medium", signals: ["okendo.io"] },
  { id: "reviews_io",  name: "Reviews.io",          category: "Reviews & UGC",      impact: "low",    signals: ["widget.reviews.io", "reviews.io/media"] },
  { id: "fera",        name: "Fera.ai",             category: "Reviews & UGC",      impact: "low",    signals: ["fera.ai", "fera-widget"] },
  { id: "ali_reviews", name: "Ali Reviews",         category: "Reviews & UGC",      impact: "low",    signals: ["alireviews.io", "ali-reviews"] },
  { id: "shopify_reviews", name: "Shopify Reviews", category: "Reviews & UGC",      impact: "low",    signals: ["shopify-product-reviews", "spr-container"] },
  { id: "generic_reviews", name: "Review Widget (unidentified)", category: "Reviews & UGC", impact: "low", isGeneric: true,
    signals: ["product-reviews-widget", "reviews-widget", "review-badge", "review-stars"] },

  // ── Analytics ─────────────────────────────────────────────────────────────
  { id: "hotjar",      name: "Hotjar",              category: "Analytics",          impact: "high",   signals: ["hotjar.com", "_hjSettings"] },
  { id: "luckyorange", name: "Lucky Orange",        category: "Analytics",          impact: "high",   signals: ["luckyorange.com"] },
  { id: "clarity",     name: "Microsoft Clarity",   category: "Analytics",          impact: "medium", signals: ["clarity.ms"] },
  { id: "heap",        name: "Heap",                category: "Analytics",          impact: "high",   signals: ["heapanalytics.com"] },
  { id: "segment",     name: "Segment",             category: "Analytics",          impact: "high",   signals: ["cdn.segment.io"] },
  { id: "triplewhale", name: "Triple Whale",        category: "Analytics",          impact: "medium", signals: ["triplewhale.com"] },
  { id: "mixpanel",    name: "Mixpanel",            category: "Analytics",          impact: "medium", signals: ["cdn.mxpnl.com", "mixpanel.com"] },
  { id: "northbeam",   name: "Northbeam",           category: "Analytics",          impact: "medium", signals: ["northbeam.io"] },

  // ── Tracking Pixels ───────────────────────────────────────────────────────
  { id: "fb_pixel",    name: "Facebook / Meta Pixel",category: "Tracking Pixels",   impact: "medium", signals: ["connect.facebook.net/en_US/fbevents.js", "fbevents.js", "fbq('init'", 'fbq("init"'] },
  { id: "gtm",         name: "Google Tag Manager",  category: "Tracking Pixels",    impact: "medium", signals: ["googletagmanager.com/gtm.js", "GTM-"] },
  { id: "ga4",         name: "Google Analytics 4",  category: "Tracking Pixels",    impact: "medium", signals: ["gtag('config', 'G-", 'gtag("config", "G-', "google-analytics.com/g/collect"] },
  { id: "tiktok_pixel",name: "TikTok Pixel",        category: "Tracking Pixels",    impact: "medium", signals: ["analytics.tiktok.com", "ttq.load(", "ttq.page("] },
  { id: "snapchat_pixel",name:"Snapchat Pixel",     category: "Tracking Pixels",    impact: "low",    signals: ["sc-static.net/scevent.min.js", "snaptr("] },
  { id: "pinterest_tag",name:"Pinterest Tag",       category: "Tracking Pixels",    impact: "low",    signals: ["ct.pinterest.com", "pintrk("] },
  { id: "twitter_pixel",name:"X (Twitter) Pixel",   category: "Tracking Pixels",    impact: "low",    signals: ["static.ads-twitter.com", "ads.twitter.com/uwt.js"] },
  { id: "bing_uet",    name: "Microsoft / Bing UET",category: "Tracking Pixels",    impact: "low",    signals: ["bat.bing.com", "uetq = window"] },
  { id: "google_ads",  name: "Google Ads",          category: "Tracking Pixels",    impact: "medium", signals: ["googleadservices.com/pagead", "googlesyndication.com/pagead"] },

  // ── Payments & BNPL ───────────────────────────────────────────────────────
  { id: "klarna",      name: "Klarna",              category: "Payments & BNPL",    impact: "medium", signals: ["klarna.com", "klarna-placement", "Klarna.start("] },
  { id: "afterpay",    name: "Afterpay / Clearpay", category: "Payments & BNPL",    impact: "medium", signals: ["afterpay.com", "clearpay.co.uk", "afterpayjs"] },
  { id: "affirm",      name: "Affirm",              category: "Payments & BNPL",    impact: "medium", signals: ["cdn.affirm.com", "affirm.com/v2", "affirm-product-modal"] },
  { id: "sezzle",      name: "Sezzle",              category: "Payments & BNPL",    impact: "low",    signals: ["widget.sezzle.com", "sezzle-checkout-button"] },
  { id: "zip",         name: "Zip / QuadPay",       category: "Payments & BNPL",    impact: "low",    signals: ["zip.co", "quadpay.com"] },
  { id: "paypal",      name: "PayPal",              category: "Payments & BNPL",    impact: "medium", signals: ["paypal.com/sdk/js", "paypalobjects.com"] },
  { id: "shop_pay",    name: "Shop Pay",            category: "Payments & BNPL",    impact: "low",    signals: ["pay.shopify.com", "shopify-payment-terms"] },
  { id: "generic_bnpl",name: "Buy Now Pay Later (unidentified)", category: "Payments & BNPL", impact: "low", isGeneric: true,
    signals: ["buy-now-pay-later", "pay-in-4", "pay-in-installments", "bnpl-widget"] },

  // ── Customer Support ──────────────────────────────────────────────────────
  { id: "gorgias",     name: "Gorgias",             category: "Customer Support",   impact: "medium", signals: ["gorgias.com", "GorgiasChat"] },
  { id: "tidio",       name: "Tidio",               category: "Customer Support",   impact: "low",    signals: ["tidiochat.com"] },
  { id: "intercom",    name: "Intercom",            category: "Customer Support",   impact: "high",   signals: ["intercomSettings", "widget.intercom.io"] },
  { id: "zendesk",     name: "Zendesk",             category: "Customer Support",   impact: "medium", signals: ["zdassets.com", "zopim"] },
  { id: "reamaze",     name: "Re:amaze",            category: "Customer Support",   impact: "low",    signals: ["reamaze.com"] },
  { id: "helpscout",   name: "Help Scout",          category: "Customer Support",   impact: "low",    signals: ["helpscout.net", "beacon-v2.helpscout.net"] },
  { id: "freshdesk",   name: "Freshdesk",           category: "Customer Support",   impact: "low",    signals: ["freshdesk.com/widget", "freshwidget.com"] },
  { id: "livechat",    name: "LiveChat",            category: "Customer Support",   impact: "low",    signals: ["livechatinc.com", "livechat-static.com"] },
  { id: "drift",       name: "Drift",               category: "Customer Support",   impact: "high",   signals: ["drift.com/include", "js.driftt.com"] },
  { id: "generic_chat",name: "Live Chat (unidentified)", category: "Customer Support", impact: "low", isGeneric: true,
    signals: ["chat-widget", "chat-bubble", "chat-launcher", "livechat-widget"] },

  // ── Subscriptions ─────────────────────────────────────────────────────────
  { id: "recharge",    name: "Recharge",            category: "Subscriptions",      impact: "medium", signals: ["rechargepayments.com", "recharge_cart"] },
  { id: "skio",        name: "Skio",                category: "Subscriptions",      impact: "low",    signals: ["skio.com"] },
  { id: "ordergroove", name: "Ordergroove",         category: "Subscriptions",      impact: "medium", signals: ["ordergroove.com"] },
  { id: "seal_subs",   name: "Seal Subscriptions",  category: "Subscriptions",      impact: "low",    signals: ["seal-subscriptions.com"] },
  { id: "bold_subs",   name: "Bold Subscriptions",  category: "Subscriptions",      impact: "medium", signals: ["boldcommerce.com", "bold-recurring"] },
  { id: "appstle",     name: "Appstle",             category: "Subscriptions",      impact: "low",    signals: ["appstle.com", "appstle-subscription"] },
  { id: "generic_subs",name: "Subscription Widget (unidentified)", category: "Subscriptions", impact: "low", isGeneric: true,
    signals: ["subscribe-and-save", "subscribe_and_save", "subscription-widget"] },

  // ── Loyalty & Rewards ─────────────────────────────────────────────────────
  { id: "smile",       name: "Smile.io",            category: "Loyalty & Rewards",  impact: "medium", signals: ["smile.io", "smile-ui", "bitlabs_smile"] },
  { id: "loyaltylion", name: "LoyaltyLion",         category: "Loyalty & Rewards",  impact: "medium", signals: ["loyaltylion.com", "LoyaltyLion"] },
  { id: "growave",     name: "Growave",             category: "Loyalty & Rewards",  impact: "low",    signals: ["growave.io", "socialshopwave.com"] },
  { id: "rise",        name: "Rise.ai",             category: "Loyalty & Rewards",  impact: "low",    signals: ["rise.ai", "rswidget"] },
  { id: "yotpo_loyalty",name:"Yotpo Loyalty",       category: "Loyalty & Rewards",  impact: "medium", signals: ["swell.is", "swellrewards"] },

  // ── Landing Pages ─────────────────────────────────────────────────────────
  { id: "shogun",      name: "Shogun",              category: "Landing Pages",      impact: "medium", signals: ["shogun.io", "sgpagebuilder", "shogun-root"] },
  { id: "pagefly",     name: "PageFly",             category: "Landing Pages",      impact: "medium", signals: ["pagefly.io", "pf-page", "pfcontainer"] },
  { id: "gempages",    name: "GemPages",            category: "Landing Pages",      impact: "medium", signals: ["gempages.io", "gmpages-", "gem-row"] },
  { id: "replo",       name: "Replo",               category: "Landing Pages",      impact: "medium", signals: ["replo.app", "replo-"] },
  { id: "layouthub",   name: "LayoutHub",           category: "Landing Pages",      impact: "low",    signals: ["layouthub.io"] },

  // ── Shipping & Logistics ──────────────────────────────────────────────────
  { id: "aftership",   name: "AfterShip",           category: "Shipping & Logistics",impact: "low",   signals: ["aftership.com"] },
  { id: "parcellab",   name: "Parcellab",           category: "Shipping & Logistics",impact: "low",   signals: ["parcellab.com"] },
  { id: "route",       name: "Route Protection",    category: "Shipping & Logistics",impact: "low",   signals: ["route.com", "routeapp.io"] },
  { id: "narvar",      name: "Narvar",              category: "Shipping & Logistics",impact: "low",   signals: ["narvar.com"] },
  { id: "loop_returns",name: "Loop Returns",        category: "Shipping & Logistics",impact: "medium",signals: ["loopreturns.com", "returnbar.io"] },
  { id: "shipbob",     name: "ShipBob",             category: "Shipping & Logistics",impact: "medium",signals: ["shipbob.com"] },

  // ── Search & Filtering ────────────────────────────────────────────────────
  { id: "searchanise", name: "Searchanise",         category: "Search & Filtering", impact: "low",    signals: ["searchanise.com"] },
  { id: "klevu",       name: "Klevu",               category: "Search & Filtering", impact: "medium", signals: ["klevu.com"] },
  { id: "boost",       name: "Boost Commerce",      category: "Search & Filtering", impact: "medium", signals: ["boostcommerce.net"] },
  { id: "searchpie",   name: "SearchPie",           category: "Search & Filtering", impact: "low",    signals: ["searchpie.com"] },
  { id: "doofinder",   name: "Doofinder",           category: "Search & Filtering", impact: "low",    signals: ["doofinder.com"] },
  { id: "fastsimon",   name: "Fast Simon",          category: "Search & Filtering", impact: "medium", signals: ["fastsimon.com", "searchanise-widget"] },
  { id: "algolia",     name: "Algolia",             category: "Search & Filtering", impact: "high",   signals: ["algolia.com", "algoliasearch(", "algoliaInsights"] },

  // ── Upsell & Cross-sell ───────────────────────────────────────────────────
  { id: "reconvert",   name: "ReConvert",           category: "Upsell & Cross-sell",impact: "low",    signals: ["reconvert.com"] },
  { id: "bold_upsell", name: "Bold Upsell",         category: "Upsell & Cross-sell",impact: "medium", signals: ["boldapps.net"] },
  { id: "honeycomb",   name: "Honeycomb Upsell",    category: "Upsell & Cross-sell",impact: "low",    signals: ["honeycombapp.com"] },
  { id: "carthook",    name: "CartHook",            category: "Upsell & Cross-sell",impact: "medium", signals: ["carthook.com"] },
  { id: "frequently",  name: "Frequently Bought Together", category: "Upsell & Cross-sell", impact: "low", signals: ["frequently-bought-together", "fbt-product"] },
  { id: "fomo",        name: "Fomo",                category: "Upsell & Cross-sell",impact: "low",    signals: ["fomo.com", "FomoClient"] },
  { id: "trustpulse",  name: "TrustPulse",          category: "Upsell & Cross-sell",impact: "low",    signals: ["trustpulse.com"] },
  { id: "nextsale",    name: "Nextsale",            category: "Upsell & Cross-sell",impact: "low",    signals: ["nextsale.io"] },
  { id: "swym",        name: "Wishlist Plus",       category: "Upsell & Cross-sell",impact: "low",    signals: ["swymcart.com", "swymRelay"] },
  { id: "wishlist_hero",name:"Wishlist Hero",        category: "Upsell & Cross-sell",impact: "low",    signals: ["wishlist-hero.com"] },

  // ── AI & Personalization ──────────────────────────────────────────────────
  { id: "nosto",       name: "Nosto",               category: "AI & Personalization",impact: "high",  signals: ["cdn.nosto.com", "nosto.com/include/"] },
  { id: "limespot",    name: "LimeSpot",            category: "AI & Personalization",impact: "medium",signals: ["limespot.io"] },
  { id: "rebuy",       name: "Rebuy",               category: "AI & Personalization",impact: "medium",signals: ["rebuyengine.com", "rebuy-widget", "rebuy-dynamic"] },
  { id: "wunderkind",  name: "Wunderkind",          category: "AI & Personalization",impact: "high",  signals: ["wunderkind.co", "wknd_"] },
  { id: "octane_ai",   name: "Octane AI",           category: "AI & Personalization",impact: "medium",signals: ["octaneai.com", "octane-ai"] },
  { id: "barilliance", name: "Barilliance",         category: "AI & Personalization",impact: "medium",signals: ["barilliance.net"] },
];

function detectApps(html: string): DetectedApp[] {
  const detected: DetectedApp[] = [];
  const detectedCategories = new Set<AppCategory>();

  // Pass 1: named apps — confidence based on number of matched signals
  for (const def of APP_REGISTRY) {
    if (def.isGeneric) continue;
    const matchedSignals = def.signals.filter((s) => html.includes(s));
    if (matchedSignals.length === 0) continue;
    detected.push({
      id: def.id,
      name: def.name,
      category: def.category,
      confidence: matchedSignals.length >= 2 ? "high" : "medium",
      matchedSignals,
      impact: def.impact,
    });
    detectedCategories.add(def.category);
  }

  // Pass 2: generic patterns — only shown when no named app found in that category
  for (const def of APP_REGISTRY) {
    if (!def.isGeneric) continue;
    if (detectedCategories.has(def.category)) continue;
    const matchedSignals = def.signals.filter((s) => html.includes(s));
    if (matchedSignals.length === 0) continue;
    detected.push({
      id: def.id,
      name: def.name,
      category: def.category,
      confidence: "low",
      matchedSignals,
      impact: def.impact,
    });
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

const CATEGORY_WEIGHT: Record<SeoCategory, number> = { critical: 4, warning: 2, opportunity: 1 };
const STATUS_MULT: Record<SeoStatus, number> = { pass: 1, warn: 0.5, fail: 0 };

function runSeoAudit(html: string, isHttps: boolean, hostname: string): SeoAudit {
  const checks: SeoCheck[] = [];

  function push(
    id: string,
    label: string,
    category: SeoCategory,
    impact: "high" | "medium" | "low",
    affectedArea: string,
    status: SeoStatus,
    value: string | null,
    message: string,
    detail: string | null,
    fix: string | null,
  ) {
    checks.push({ id, label, category, status, value, message, detail, fix, affectedArea, impact });
  }

  // ── 1. HTTPS ──────────────────────────────────────────────────────────────
  push(
    "https", "HTTPS Security", "critical", "high", "Connection",
    isHttps ? "pass" : "fail",
    isHttps ? "Enabled" : "HTTP only",
    isHttps ? "Site is served over HTTPS" : "Site is not using HTTPS",
    "Google uses HTTPS as a ranking signal. Browsers flag HTTP sites as 'Not Secure', which increases bounce rates and damages user trust.",
    isHttps ? null : "Install an SSL/TLS certificate and configure 301 redirects from all HTTP URLs to their HTTPS equivalents.",
  );

  // ── 2. Robots meta (noindex check) ────────────────────────────────────────
  const isNoindex =
    /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html) ||
    /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots["']/i.test(html);
  push(
    "robots", "Robots Meta Tag", "critical", "high", "<head>",
    isNoindex ? "fail" : "pass",
    isNoindex ? "noindex detected" : "index, follow",
    isNoindex ? "Page is blocked from indexing" : "Page is indexable",
    isNoindex
      ? "A noindex directive tells search engines not to include this page in their index. If this is a key landing page, this is a critical SEO error that makes it invisible in search results."
      : null,
    isNoindex
      ? 'Remove noindex from the robots meta tag, or change it to content="index, follow". Verify whether this was set intentionally.'
      : null,
  );

  // ── 3. Viewport meta ──────────────────────────────────────────────────────
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  push(
    "viewport", "Viewport Meta Tag", "critical", "high", "<head>",
    hasViewport ? "pass" : "fail",
    hasViewport ? "Present" : null,
    hasViewport ? "Mobile viewport is configured" : "Missing — mobile users see a broken layout",
    hasViewport ? null : "Without a viewport meta tag, mobile browsers render the page at desktop width and scale it down. Google uses mobile-first indexing, so missing viewport directly impacts rankings.",
    hasViewport ? null : 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside your <head>.',
  );

  // ── 4. Title tag ──────────────────────────────────────────────────────────
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleText = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : null;
  let titleStatus: SeoStatus;
  let titleMsg: string;
  let titleFix: string | null = null;
  if (!titleText) {
    titleStatus = "fail";
    titleMsg = "Missing — required for SEO";
    titleFix = "Write a unique, descriptive 30–60 character title. Include your primary keyword near the beginning and your brand name at the end.";
  } else if (titleText.length < 30) {
    titleStatus = "warn";
    titleMsg = `Too short — ${titleText.length} chars (aim for 30–60)`;
    titleFix = "Expand your title to 30–60 characters. Include your primary keyword and a brief value proposition.";
  } else if (titleText.length > 60) {
    titleStatus = "warn";
    titleMsg = `Too long — ${titleText.length} chars, may be truncated`;
    titleFix = "Shorten to under 60 characters to prevent truncation in search results. Keep your primary keyword within the first 60 characters.";
  } else {
    titleStatus = "pass";
    titleMsg = `${titleText.length} characters — optimal length`;
  }
  push(
    "title", "Title Tag", "critical", "high", "<title>",
    titleStatus, titleText, titleMsg,
    "The title tag is the single most important on-page SEO element. It appears as the clickable headline in search results and heavily influences both rankings and click-through rates.",
    titleFix,
  );

  // ── 5. H1 heading ─────────────────────────────────────────────────────────
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  let h1Status: SeoStatus;
  let h1Value: string | null;
  let h1Msg: string;
  let h1Fix: string | null = null;
  if (h1Matches.length === 0) {
    h1Status = "fail";
    h1Value = null;
    h1Msg = "No H1 tag found";
    h1Fix = "Add a single H1 heading that clearly describes the page's main topic. It should contain your primary keyword and be distinct from the title tag.";
  } else if (h1Matches.length > 1) {
    h1Status = "warn";
    h1Value = `${h1Matches.length} H1 tags found`;
    h1Msg = `${h1Matches.length} H1s — use exactly one`;
    h1Fix = "Remove all but one H1 tag. Multiple H1s dilute keyword signals and confuse the content hierarchy for search engines.";
  } else {
    const h1Text = h1Matches[0][1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    h1Status = "pass";
    h1Value = h1Text || "Present";
    h1Msg = "Single H1 found";
  }
  push(
    "h1", "H1 Heading", "critical", "high", "Body",
    h1Status, h1Value, h1Msg,
    "The H1 is the primary heading of the page and the strongest on-page signal for topic relevance. Search engines use it to understand what the page is about.",
    h1Fix,
  );

  // ── 6. Meta description ───────────────────────────────────────────────────
  const descPatterns = [
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*?)["']/i,
    /<meta[^>]+content=["']([^"']*?)["'][^>]+name=["']description["']/i,
  ];
  let descText: string | null = null;
  for (const p of descPatterns) {
    const m = html.match(p);
    if (m) { descText = m[1].trim(); break; }
  }
  let descStatus: SeoStatus;
  let descMsg: string;
  let descFix: string | null = null;
  if (!descText) {
    descStatus = "fail";
    descMsg = "Missing — impacts click-through rate";
    descFix = "Write a compelling 120–160 character description. Include your primary keyword, a clear value proposition, and a call to action. This is what users see in search results.";
  } else if (descText.length < 120) {
    descStatus = "warn";
    descMsg = `Too short — ${descText.length} chars (aim for 120–160)`;
    descFix = "Expand your meta description to 120–160 characters. Add more detail about what the page offers and why users should click.";
  } else if (descText.length > 160) {
    descStatus = "warn";
    descMsg = `Too long — ${descText.length} chars, will be truncated`;
    descFix = "Shorten to 160 characters or less. Google truncates longer descriptions, cutting off your call to action.";
  } else {
    descStatus = "pass";
    descMsg = `${descText.length} characters — optimal length`;
  }
  push(
    "meta_desc", "Meta Description", "warning", "medium", "<head>",
    descStatus, descText, descMsg,
    "While not a direct ranking factor, meta descriptions are the primary copy users see in search results. A compelling description can significantly increase click-through rates.",
    descFix,
  );

  // ── 7. Canonical tag ──────────────────────────────────────────────────────
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  push(
    "canonical", "Canonical URL", "warning", "medium", "<head>",
    canonicalMatch ? "pass" : "warn",
    canonicalMatch ? canonicalMatch[1] : null,
    canonicalMatch ? "Canonical tag present" : "Missing canonical tag",
    canonicalMatch ? null : "Without a canonical tag, search engines may index multiple URL variants (trailing slash, UTM params, filters) as separate pages. This splits link equity and triggers duplicate content penalties.",
    canonicalMatch ? null : 'Add <link rel="canonical" href="https://yourdomain.com/this-page/"> to <head> to declare the authoritative URL for this page.',
  );

  // ── 8. Open Graph tags ────────────────────────────────────────────────────
  const ogTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
  const ogDesc  = /<meta[^>]+property=["']og:description["']/i.test(html);
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
  let ogStatus: SeoStatus;
  let ogValue: string | null;
  let ogMsg: string;
  let ogFix: string | null = null;
  if (ogCount === 0) {
    ogStatus = "fail";
    ogValue = null;
    ogMsg = "No OG tags found";
    ogFix = "Add og:title, og:description, og:image, and og:url tags. Social platforms use these to generate link preview cards.";
  } else if (!ogImage) {
    ogStatus = "warn";
    ogValue = `${ogCount}/3 core tags`;
    ogMsg = "og:image missing — shares will lack a preview image";
    ogFix = "Add og:image with a URL to an image at least 1200×630px. Without it, social shares show no image, significantly reducing engagement.";
  } else {
    ogStatus = "pass";
    ogValue = "3/3 core tags";
    ogMsg = "Title, description & image present";
  }
  push(
    "og", "Open Graph Tags", "warning", "medium", "<head>",
    ogStatus, ogValue, ogMsg,
    "Open Graph tags control how your page looks when shared on Facebook, LinkedIn, Slack, and other platforms. Missing or incomplete tags result in poor-looking link previews that get fewer clicks.",
    ogFix,
  );

  // ── 9. Heading hierarchy ──────────────────────────────────────────────────
  const h2Count = (html.match(/<h2[\s>]/gi) ?? []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) ?? []).length;
  const h4Count = (html.match(/<h4[\s>]/gi) ?? []).length;
  const hierarchySkipped =
    (h3Count > 0 && h2Count === 0) ||
    (h4Count > 0 && h3Count === 0);
  push(
    "heading_hierarchy", "Heading Hierarchy", "warning", "medium", "Body",
    hierarchySkipped ? "warn" : "pass",
    `H1:${h1Matches.length}, H2:${h2Count}, H3:${h3Count}`,
    hierarchySkipped ? "Heading levels are being skipped" : "Heading structure is logical",
    "Proper heading hierarchy (H1 → H2 → H3) helps search engines understand content structure and improves accessibility for screen readers. Skipping levels signals disorganized content.",
    hierarchySkipped
      ? "Fix heading structure to follow a logical sequence: one H1, then H2 for main sections, H3 for subsections. Never skip from H1 directly to H3."
      : null,
  );

  // ── 10. Image alt text ────────────────────────────────────────────────────
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const imgTotal = imgTags.length;
  if (imgTotal === 0) {
    push(
      "img_alt", "Image Alt Text", "opportunity", "medium", "Images",
      "pass", "No images", "No images found on page", null, null,
    );
  } else {
    const withAlt = imgTags.filter((t) => /\balt\s*=/i.test(t)).length;
    const coverage = Math.round((withAlt / imgTotal) * 100);
    const missing = imgTotal - withAlt;
    push(
      "img_alt", "Image Alt Text", "opportunity", "medium", "Images",
      coverage >= 90 ? "pass" : "warn",
      `${withAlt}/${imgTotal} images have alt text`,
      coverage >= 90
        ? `${coverage}% alt coverage`
        : `${missing} image${missing > 1 ? "s" : ""} missing alt text (${coverage}% coverage)`,
      "Alt text helps search engines understand image content and improves accessibility. For ecommerce, product image alt text is a significant ranking signal for image and product search.",
      coverage < 90
        ? 'Add descriptive alt attributes to all content images (e.g., alt="Red Nike running shoe"). For purely decorative images, use alt="".'
        : null,
    );
  }

  // ── 11. Render-blocking scripts ───────────────────────────────────────────
  const headHtml = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";
  const headScripts = headHtml.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? [];
  const renderBlockingCount = headScripts.filter((s) => !/\b(async|defer)\b/.test(s)).length;
  push(
    "render_blocking", "Render-Blocking Scripts", "opportunity", "medium", "<head>",
    renderBlockingCount === 0 ? "pass" : "warn",
    renderBlockingCount === 0 ? "None detected" : `${renderBlockingCount} script${renderBlockingCount > 1 ? "s" : ""}`,
    renderBlockingCount === 0 ? "No render-blocking scripts found" : `${renderBlockingCount} render-blocking script${renderBlockingCount > 1 ? "s" : ""} in <head>`,
    "Scripts in <head> without async or defer block the browser from rendering the page until they fully download and execute. This directly increases First Contentful Paint (FCP) and Largest Contentful Paint (LCP).",
    renderBlockingCount > 0
      ? "Add async or defer attributes to non-critical scripts. Move third-party scripts to just before </body>. Use a tag manager to consolidate external scripts."
      : null,
  );

  // ── 12. Lazy loading ──────────────────────────────────────────────────────
  const lazyImgs = (html.match(/<img[^>]+loading=["']lazy["']/gi) ?? []).length;
  let lazyStatus: SeoStatus;
  let lazyMsg: string;
  let lazyFix: string | null = null;
  if (imgTotal <= 3) {
    lazyStatus = "pass";
    lazyMsg = imgTotal === 0 ? "No images to lazy load" : "Few images — not required";
  } else if (lazyImgs === 0) {
    lazyStatus = "warn";
    lazyMsg = `0/${imgTotal} images use lazy loading`;
    lazyFix = 'Add loading="lazy" to images that appear below the fold. The hero/above-fold image should NOT be lazy-loaded as it would delay LCP.';
  } else if (lazyImgs < Math.ceil(imgTotal * 0.5)) {
    lazyStatus = "warn";
    lazyMsg = `Only ${lazyImgs}/${imgTotal} images use lazy loading`;
    lazyFix = `Apply loading="lazy" to more below-the-fold images. Currently only ${lazyImgs} of ${imgTotal} images are optimized.`;
  } else {
    lazyStatus = "pass";
    lazyMsg = `${lazyImgs}/${imgTotal} images use lazy loading`;
  }
  push(
    "lazy_loading", "Lazy Loading", "opportunity", "low", "Images",
    lazyStatus, `${lazyImgs}/${imgTotal} lazy`, lazyMsg,
    "Lazy loading defers off-screen images until needed. It reduces initial page weight, improves Time to Interactive, and can significantly improve Core Web Vitals scores on image-heavy pages.",
    lazyFix,
  );

  // ── 13. Twitter Card ──────────────────────────────────────────────────────
  const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
  push(
    "twitter", "Twitter Card Tags", "opportunity", "low", "<head>",
    hasTwitterCard ? "pass" : "warn",
    hasTwitterCard ? "Present" : null,
    hasTwitterCard ? "Twitter Card meta tags present" : "Missing Twitter Card tags",
    "Twitter/X Card tags generate rich previews when your URLs are shared. Without them, tweets with your link show only plain text, which gets fewer clicks and engagement.",
    hasTwitterCard ? null : 'Add <meta name="twitter:card" content="summary_large_image">, plus twitter:title, twitter:description, and twitter:image tags.',
  );

  // ── 14. Structured data ───────────────────────────────────────────────────
  const jsonLdCount = (
    html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) ?? []
  ).length;
  push(
    "schema", "Structured Data (JSON-LD)", "opportunity", "medium", "<head>",
    jsonLdCount > 0 ? "pass" : "warn",
    jsonLdCount > 0 ? `${jsonLdCount} JSON-LD block${jsonLdCount > 1 ? "s" : ""}` : null,
    jsonLdCount > 0
      ? `${jsonLdCount} JSON-LD block${jsonLdCount > 1 ? "s" : ""} detected`
      : "No structured data found",
    "JSON-LD enables Google rich results: product star ratings, prices, availability, breadcrumbs, and FAQs in search listings. For Shopify stores, Product schema can significantly increase click-through rates.",
    jsonLdCount === 0
      ? "Add JSON-LD blocks for Product, Organization, and BreadcrumbList. For ecommerce, Product schema with price, availability, and aggregateRating is highest priority."
      : null,
  );

  // ── 15. Language attribute ────────────────────────────────────────────────
  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  push(
    "lang", "HTML Language Attribute", "opportunity", "low", "<html>",
    langMatch ? "pass" : "warn",
    langMatch ? langMatch[1] : null,
    langMatch ? `lang="${langMatch[1]}" set` : "html lang attribute missing",
    "The lang attribute tells search engines and screen readers which language the page is in. Without it, content may be served to the wrong regional audience or excluded from language-specific results.",
    langMatch ? null : 'Add lang="en" (or your ISO language code) to the opening <html> tag: <html lang="en">.',
  );

  // ── 16. Internal links ────────────────────────────────────────────────────
  const allHrefs = [...html.matchAll(/href=["']([^"'#?]+)/gi)].map((m) => m[1]);
  const internalLinkCount = allHrefs.filter(
    (href) => href.startsWith("/") || href.includes(hostname)
  ).length;
  let linkStatus: SeoStatus;
  let linkMsg: string;
  let linkFix: string | null = null;
  if (internalLinkCount >= 10) {
    linkStatus = "pass";
    linkMsg = `${internalLinkCount} internal links found`;
  } else if (internalLinkCount >= 3) {
    linkStatus = "warn";
    linkMsg = `${internalLinkCount} internal links — consider adding more`;
    linkFix = "Add more contextual internal links to related products, collections, and content. Internal linking passes authority between pages and helps search engines discover your full site structure.";
  } else {
    linkStatus = "warn";
    linkMsg = `Only ${internalLinkCount} internal links found`;
    linkFix = "Significantly increase internal linking. Link to key product categories, top products, and related content from this page. Well-linked pages distribute PageRank throughout your site.";
  }
  push(
    "internal_links", "Internal Linking", "opportunity", "low", "Navigation",
    linkStatus, `${internalLinkCount} links`, linkMsg,
    "Internal links help search engines discover and crawl all pages on your site, and distribute 'link equity' from strong pages to weaker ones, boosting overall site rankings.",
    linkFix,
  );

  // ── Score ─────────────────────────────────────────────────────────────────
  let maxPts = 0;
  let earnedPts = 0;
  for (const c of checks) {
    const w = CATEGORY_WEIGHT[c.category];
    maxPts += w;
    earnedPts += w * STATUS_MULT[c.status];
  }
  const score = Math.round((earnedPts / maxPts) * 100);

  return {
    score,
    passCount:       checks.filter((c) => c.status === "pass").length,
    warnCount:       checks.filter((c) => c.status === "warn").length,
    failCount:       checks.filter((c) => c.status === "fail").length,
    criticalCount:   checks.filter((c) => c.category === "critical"    && c.status !== "pass").length,
    warningCount:    checks.filter((c) => c.category === "warning"     && c.status !== "pass").length,
    opportunityCount:checks.filter((c) => c.category === "opportunity" && c.status !== "pass").length,
    checks,
  };
}

// ─── Page stat extraction ──────────────────────────────────────────────────────
// Counts structural signals from HTML only — no performance estimation.
// Real scores come from the PageSpeed Insights API (/api/pagespeed).

function extractPageStats(html: string): Omit<PerformanceMetrics, "mobile" | "desktop" | "score"> {
  const scriptCount      = (html.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? []).length;
  const styleSheetCount  = (html.match(/<link[^>]+rel=["']stylesheet["'][^>]*/gi) ?? []).length;
  const imageCount       = (html.match(/<img[\s>]/gi) ?? []).length;
  const lazyImageCount   = (html.match(/<img[^>]+loading=["']lazy["']/gi) ?? []).length;

  const headHtml         = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? "";
  const headScripts      = headHtml.match(/<script[^>]+src=["'][^"']+["'][^>]*>/gi) ?? [];
  const renderBlockingCount = headScripts.filter((s) => !/\b(async|defer)\b/.test(s)).length;

  const hasResourceHints = /<link[^>]+rel=["'](preload|prefetch|preconnect|dns-prefetch)["']/i.test(html);
  const htmlSizeKb       = Math.round(html.length / 1024);

  return { scriptCount, styleSheetCount, imageCount, lazyImageCount, renderBlockingCount, hasResourceHints, htmlSizeKb };
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
    seo: runSeoAudit(html, isHttps, hostname),
    performance: {
      ...extractPageStats(html),
      mobile:  null,
      desktop: null,
      score:   null,
    },
    signals,
    detectedCount,
    scannedAt: new Date().toISOString(),
  };
}
