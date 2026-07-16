const { seeded } = require('./amazonService');

/**
 * Listing Builder: Product listing management table with statuses,
 * generated images tracking, KPR (Key Performance Rating), KPS (Key Product Score).
 */

const STATUSES = ['Entwurf', 'Überarbeitung', 'Fehler', 'Synchronisiert'];

function generateListingId() {
  return 'LST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function buildListing(asin, idx) {
  const r = seeded(`listing|${asin}|${idx}`);
  const statuses = ['Entwurf', 'Überarbeitung', 'Fehler', 'Synchronisiert'];
  const status = statuses[Math.floor(r * statuses.length)];

  const products = [
    'NEX Ashwagandha KSM-66® Kapseln mit 300 mg Wurzelextrakt',
    'sovita Omega 3 Fischöl Kapseln hochdosiert',
    'sovita Sabal Kürbis Kapseln mit Kürbiskernöl',
    'Magnesium Glycinat hochdosiert 400mg',
    'Vitamin D3 2000 IU + K2 Kapseln',
  ];

  const idx2 = Math.floor(r * products.length);
  const title = products[idx2];

  return {
    id: asin + '-' + idx,
    asin,
    title,
    marketplace: 'DE',
    version: Math.floor(r * 5) + 1,
    status,
    generatedImages: Math.floor(r * 12),
    kpr: Math.round(r * 100),
    kps: Math.round(r * 98),
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
  };
}

async function getListings(filters = {}) {
  const listings = [];
  const baseAsins = ['B0F9X766FD', 'B00Q1L9XW', 'B00Q1LFI04', 'B088PLKZ9Q', 'B09VKXQHJ2'];

  baseAsins.forEach((asin, idx) => {
    listings.push(buildListing(asin, idx));
  });

  // Apply filters
  if (filters.status && filters.status !== 'Alle Listings') {
    return listings.filter((l) => l.status === filters.status);
  }
  if (filters.marketplace) {
    return listings.filter((l) => l.marketplace === filters.marketplace);
  }

  return listings;
}

async function getListing(id) {
  const parts = id.split('-');
  const asin = parts[0];
  const idx = parseInt(parts[1], 10);
  return buildListing(asin, idx);
}

async function createListing(data) {
  return {
    id: generateListingId(),
    ...data,
    status: 'Entwurf',
    version: 1,
    generatedImages: 0,
    kpr: 0,
    kps: 0,
    lastUpdated: new Date().toLocaleDateString('de-DE'),
  };
}

async function updateListing(id, data) {
  const listing = await getListing(id);
  return { ...listing, ...data, version: (listing.version || 1) + 1 };
}

async function deleteListing(id) {
  return { success: true, id };
}

async function getMetadata() {
  return {
    statuses: STATUSES,
    marketplaces: ['DE', 'AT', 'CH'],
    totalListings: 4,
    synced: 3,
    errors: 1,
  };
}

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMetadata,
};
