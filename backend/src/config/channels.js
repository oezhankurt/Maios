/**
 * Central channel registry for Maios — config-driven so new marketplaces,
 * search engines and advertising platforms can be added in one place and
 * surface everywhere (filters, dashboards, connection status).
 *
 * status: 'demo' until a real connector/credentials are wired up.
 * Everything here is DACH-focused (Germany / Austria / Switzerland).
 */

// ── Sales marketplaces (Vertriebskanäle) ──────────────────────────────────
const marketplaces = [
  { id: 'amazon', label: 'Amazon', region: 'DACH', status: 'demo' },
  { id: 'ebay', label: 'eBay', region: 'DACH', status: 'demo' },
  { id: 'kaufland', label: 'Kaufland', region: 'DACH', status: 'demo' },
  { id: 'otto', label: 'Otto', region: 'DE', status: 'demo' },
  { id: 'shop_apotheke', label: 'Shop Apotheke', region: 'DACH', status: 'demo' },
  { id: 'docmorris', label: 'DocMorris', region: 'DACH', status: 'demo' },
  { id: 'medpex', label: 'medpex', region: 'DE', status: 'demo' },
  { id: 'idealo', label: 'idealo', region: 'DACH', status: 'demo' },
];

// ── Search engines (für Off-Amazon-SEO / Keyword-Nachfrage) ───────────────
const searchEngines = [
  { id: 'google', label: 'Google', region: 'DACH', status: 'demo' },
  { id: 'bing', label: 'Bing', region: 'DACH', status: 'demo' },
];

// ── Advertising platforms (Werbeplattformen DACH) ─────────────────────────
const adPlatforms = [
  { id: 'amazon_ads', label: 'Amazon Ads', region: 'DACH', status: 'demo' },
  { id: 'google_ads', label: 'Google Ads', region: 'DACH', status: 'demo' },
  { id: 'microsoft_ads', label: 'Microsoft Ads (Bing)', region: 'DACH', status: 'demo' },
  { id: 'meta_ads', label: 'Meta Ads (FB/Insta)', region: 'DACH', status: 'demo' },
  { id: 'tiktok_ads', label: 'TikTok Ads', region: 'DACH', status: 'demo' },
  { id: 'pinterest_ads', label: 'Pinterest Ads', region: 'DACH', status: 'demo' },
  { id: 'criteo', label: 'Criteo', region: 'DACH', status: 'demo' },
  { id: 'kaufland_ads', label: 'Kaufland Ads', region: 'DACH', status: 'demo' },
  { id: 'otto_ads', label: 'OTTO Retail Media', region: 'DE', status: 'demo' },
];

const marketplaceIds = marketplaces.map((m) => m.id);
const adPlatformIds = adPlatforms.map((a) => a.id);

module.exports = {
  marketplaces,
  searchEngines,
  adPlatforms,
  marketplaceIds,
  adPlatformIds,
  all: { marketplaces, searchEngines, adPlatforms },
};
