// ─── Theme Marketplace Registry ───────────────────────────────────────────────
// Internal database of known Shopify themes with marketplace version data.
// dataConfidence reflects how current and reliable our version information is:
//   "verified"  – Shopify official themes; version data sourced from public GitHub/changelog
//   "estimated" – Well-known paid themes; version approximate from public release history
//   "limited"   – Theme is recognised but current version data is not reliably tracked

export type MarketplaceDataConfidence = "verified" | "estimated" | "limited";

export interface ThemeRegistryEntry {
  name: string;
  vendor: string;
  free: boolean;
  latestVersion: string;
  dataConfidence: MarketplaceDataConfidence;
  releaseNotesUrl?: string;
  releaseDate?: string;
}

export const THEME_REGISTRY: Record<string, ThemeRegistryEntry> = {

  // ── Shopify Official Free Themes (actively maintained) ─────────────────────
  dawn: {
    name: "Dawn", vendor: "Shopify", free: true,
    latestVersion: "15.0.0", dataConfidence: "verified",
    releaseNotesUrl: "https://github.com/Shopify/dawn/releases",
  },
  sense: {
    name: "Sense", vendor: "Shopify", free: true,
    latestVersion: "11.0.0", dataConfidence: "verified",
  },
  refresh: {
    name: "Refresh", vendor: "Shopify", free: true,
    latestVersion: "14.0.0", dataConfidence: "verified",
  },
  craft: {
    name: "Craft", vendor: "Shopify", free: true,
    latestVersion: "10.0.0", dataConfidence: "verified",
  },
  crave: {
    name: "Crave", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  ride: {
    name: "Ride", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  origin: {
    name: "Origin", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  studio: {
    name: "Studio", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  colorblock: {
    name: "Colorblock", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  taste: {
    name: "Taste", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  highlight: {
    name: "Highlight", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  trade: {
    name: "Trade", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  publisher: {
    name: "Publisher", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  cascade: {
    name: "Cascade", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },
  hero: {
    name: "Hero", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "verified",
  },

  // ── Shopify Legacy Free Themes (deprecated / no new major updates) ──────────
  debut: {
    name: "Debut", vendor: "Shopify", free: true,
    latestVersion: "8.2.0", dataConfidence: "estimated",
    releaseDate: "2023-01",
  },
  brooklyn: {
    name: "Brooklyn", vendor: "Shopify", free: true,
    latestVersion: "9.1.0", dataConfidence: "estimated",
    releaseDate: "2023-01",
  },
  narrative: {
    name: "Narrative", vendor: "Shopify", free: true,
    latestVersion: "4.1.0", dataConfidence: "estimated",
    releaseDate: "2023-01",
  },
  venture: {
    name: "Venture", vendor: "Shopify", free: true,
    latestVersion: "7.0.0", dataConfidence: "estimated",
    releaseDate: "2023-01",
  },
  supply: {
    name: "Supply", vendor: "Shopify", free: true,
    latestVersion: "4.0.0", dataConfidence: "estimated",
    releaseDate: "2022-06",
  },
  minimal: {
    name: "Minimal", vendor: "Shopify", free: true,
    latestVersion: "8.0.0", dataConfidence: "estimated",
    releaseDate: "2022-06",
  },
  boundless: {
    name: "Boundless", vendor: "Shopify", free: true,
    latestVersion: "4.0.0", dataConfidence: "estimated",
    releaseDate: "2022-06",
  },

  // ── Premium Themes — Out of the Sandbox ────────────────────────────────────
  turbo: {
    name: "Turbo", vendor: "Out of the Sandbox", free: false,
    latestVersion: "9.0.0", dataConfidence: "estimated",
    releaseNotesUrl: "https://outofthesandbox.com/pages/theme-updates-turbo",
  },
  flex: {
    name: "Flex", vendor: "Out of the Sandbox", free: false,
    latestVersion: "9.0.0", dataConfidence: "estimated",
    releaseNotesUrl: "https://outofthesandbox.com/pages/theme-updates-flex",
  },

  // ── Premium Themes — Maestrooo ─────────────────────────────────────────────
  prestige: {
    name: "Prestige", vendor: "Maestrooo", free: false,
    latestVersion: "10.7.0", dataConfidence: "estimated",
  },
  envy: {
    name: "Envy", vendor: "Maestrooo", free: false,
    latestVersion: "8.0.0", dataConfidence: "limited",
  },
  focal: {
    name: "Focal", vendor: "Maestrooo", free: false,
    latestVersion: "8.0.0", dataConfidence: "limited",
  },
  warehouse: {
    name: "Warehouse", vendor: "Maestrooo", free: false,
    latestVersion: "8.0.0", dataConfidence: "limited",
  },

  // ── Premium Themes — Archetype Themes ─────────────────────────────────────
  impulse: {
    name: "Impulse", vendor: "Archetype Themes", free: false,
    latestVersion: "7.3.0", dataConfidence: "estimated",
  },
  motion: {
    name: "Motion", vendor: "Archetype Themes", free: false,
    latestVersion: "10.0.0", dataConfidence: "estimated",
  },
  movement: {
    name: "Movement", vendor: "Archetype Themes", free: false,
    latestVersion: "4.0.0", dataConfidence: "limited",
  },
  context: {
    name: "Context", vendor: "Archetype Themes", free: false,
    latestVersion: "3.0.0", dataConfidence: "limited",
  },

  // ── Premium Themes — Clean Canvas ─────────────────────────────────────────
  symmetry: {
    name: "Symmetry", vendor: "Clean Canvas", free: false,
    latestVersion: "7.0.0", dataConfidence: "estimated",
  },
  retina: {
    name: "Retina", vendor: "Clean Canvas", free: false,
    latestVersion: "7.0.0", dataConfidence: "limited",
  },
  atlantic: {
    name: "Atlantic", vendor: "Clean Canvas", free: false,
    latestVersion: "7.0.0", dataConfidence: "limited",
  },

  // ── Premium Themes — Pixel Union ──────────────────────────────────────────
  empire: {
    name: "Empire", vendor: "Pixel Union", free: false,
    latestVersion: "9.0.0", dataConfidence: "estimated",
  },
  expanse: {
    name: "Expanse", vendor: "Pixel Union", free: false,
    latestVersion: "5.0.0", dataConfidence: "limited",
  },
  superstore: {
    name: "Superstore", vendor: "Pixel Union", free: false,
    latestVersion: "6.0.0", dataConfidence: "limited",
  },
  kingdom: {
    name: "Kingdom", vendor: "Pixel Union", free: false,
    latestVersion: "5.0.0", dataConfidence: "limited",
  },

  // ── Premium Themes — Groupthought ─────────────────────────────────────────
  pipeline: {
    name: "Pipeline", vendor: "Groupthought", free: false,
    latestVersion: "9.0.0", dataConfidence: "estimated",
  },

  // ── Premium Themes — Others ────────────────────────────────────────────────
  streamline: {
    name: "Streamline", vendor: "Blend Themes", free: false,
    latestVersion: "7.0.0", dataConfidence: "limited",
  },
  vantage: {
    name: "Vantage", vendor: "Eight Themes", free: false,
    latestVersion: "8.0.0", dataConfidence: "limited",
  },
  district: {
    name: "District", vendor: "Style Hatch", free: false,
    latestVersion: "7.0.0", dataConfidence: "limited",
  },
  debutify: {
    name: "Debutify", vendor: "Debutify", free: false,
    latestVersion: "5.0.0", dataConfidence: "estimated",
  },
  booster: {
    name: "Booster", vendor: "BoosterTheme", free: false,
    latestVersion: "5.0.0", dataConfidence: "limited",
  },
  baseline: {
    name: "Baseline", vendor: "Fuel Themes", free: false,
    latestVersion: "5.0.0", dataConfidence: "limited",
  },
};
