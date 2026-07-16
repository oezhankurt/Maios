const amazonService = require('./amazonService');
const keywordService = require('./keywordService');

/**
 * productResearchService — the "Black Box" engine (Helium 10 style).
 *
 * It searches a market of products (not the seller's own catalogue) and scores
 * each one as an opportunity, so the seller can find products worth launching.
 *
 * In demo mode the market is a deterministic synthetic pool derived from the
 * ASIN string, so results are stable and plausible. When Amazon SP-API access
 * is configured this is where the real product database queries go — the shape
 * of the returned rows already matches, so the UI needs no changes ("API-ready").
 */

// DACH-relevant categories with representative product nouns. Kept in German
// since the audience is a German seller; the demo ASINs are Amazon-style.
const CATALOG = {
  'Küche': ['Küchenwaage', 'Gewürzmühle', 'Schneidebrett', 'Küchenmesser-Set', 'Vorratsdosen', 'Nudelholz', 'Silikon-Backform', 'French Press', 'Salatschleuder', 'Küchenreibe'],
  'Haushalt & Wohnen': ['Wäschekorb', 'Duftkerze', 'Bilderrahmen', 'Kleiderbügel-Set', 'Mülleimer', 'Vorhang', 'Kissenbezug', 'Aufbewahrungsbox', 'Türstopper', 'LED-Lichterkette'],
  'Sport & Freizeit': ['Yogamatte', 'Faszienrolle', 'Springseil', 'Trinkflasche', 'Widerstandsbänder', 'Fitness-Handschuhe', 'Wanderrucksack', 'Fahrradlicht', 'Sportarmband', 'Gymnastikball'],
  'Beauty & Pflege': ['Gesichtsroller', 'Make-up-Pinsel-Set', 'Haarbürste', 'Nagelset', 'Bartöl', 'Gesichtsmaske', 'Rasierhobel', 'Kosmetikspiegel', 'Haarklammern', 'Peeling-Handschuh'],
  'Gesundheit': ['Massagegerät', 'Blutdruckmessgerät', 'Pillendose', 'Fieberthermometer', 'Nasendusche', 'Haltungstrainer', 'Kompressionsstrümpfe', 'Akupressurmatte', 'Handgelenkbandage', 'Wärmflasche'],
  'Baby & Kind': ['Lätzchen-Set', 'Nachtlicht', 'Beißring', 'Wickelunterlage', 'Kinderbesteck', 'Spielmatte', 'Babyphone', 'Trinklernbecher', 'Stoffbuch', 'Krabbeldecke'],
  'Garten': ['Gartenhandschuhe', 'Pflanztöpfe', 'Gießkanne', 'Rankgitter', 'Solarleuchte', 'Gartenschere', 'Vogelhaus', 'Schneckenzaun', 'Kompostbeutel', 'Pflanzenlampe'],
  'Büro': ['Schreibtischorganizer', 'Notizbuch', 'Kabelbox', 'Monitorständer', 'Handballenauflage', 'Whiteboard', 'Stiftehalter', 'Laptop-Ständer', 'Aktenordner', 'Schreibtischmatte'],
  'Haustier': ['Hundenapf', 'Katzenspielzeug', 'Hundeleine', 'Fellbürste', 'Futterautomat', 'Kratzbaum', 'Hundebett', 'Transportbox', 'Kausnack-Halter', 'Trinkbrunnen'],
  'Elektronik-Zubehör': ['Kabelorganizer', 'Handyhalterung', 'USB-Hub', 'Laptop-Tasche', 'Powerbank-Hülle', 'Displayschutz', 'Tastatur-Abdeckung', 'Ladekabel-Set', 'Webcam-Abdeckung', 'Ringlicht'],
};

const BRANDS = ['Nordic', 'PureLine', 'EcoNest', 'VitaGrip', 'Amaro', 'Kubiq', 'Lumio', 'Terra', 'Momenta', 'Feinwerk'];
const SIZE_TIERS = ['small', 'standard', 'oversize'];
const SIZE_LABEL = { small: 'Klein', standard: 'Standard', oversize: 'Übergroß' };
const FULFILLMENTS = ['FBA', 'FBM', 'AMZ'];

function asinFor(seed) {
  // Amazon-style 10-char ASIN, deterministic from the seed.
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = 'B0';
  for (let i = 0; i < 8; i += 1) {
    const r = amazonService.seeded(`${seed}-asin-${i}`);
    out += alphabet[Math.floor(r * alphabet.length)];
  }
  return out;
}

/**
 * Opportunity index ("P-Index", 0-100). Rewards products with strong demand
 * (monthly revenue) but weak competition (few reviews, few sellers) and a
 * healthy price — i.e. easy markets that still make money.
 */
function pIndex({ monthlyRevenue, reviews, sellers, price }) {
  const demand = Math.min(1, Math.log10(monthlyRevenue + 1) / Math.log10(150000)); // 0..1
  const reviewEase = 1 - Math.min(1, reviews / 2000); // fewer reviews → easier
  const sellerEase = 1 - Math.min(1, (sellers - 1) / 25); // fewer sellers → easier
  const priceFit = price >= 18 && price <= 60 ? 1 : 0.6; // sweet spot for margin
  const score = demand * 0.4 + reviewEase * 0.3 + sellerEase * 0.2 + priceFit * 0.1;
  return Math.round(score * 100);
}

function buildProduct(category, noun, variant) {
  const seed = `${category}|${noun}|${variant}`;
  const r = amazonService.seeded(seed);
  const r2 = amazonService.seeded(`${seed}-2`);
  const r3 = amazonService.seeded(`${seed}-3`);

  const price = Number((9 + r * 65).toFixed(2));
  const monthlySales = Math.round(50 + r2 * 3500); // units / month
  const monthlyRevenue = Number((price * monthlySales).toFixed(0));
  const reviews = Math.round(3 + r3 * 3200);
  const rating = Number((3.6 + r * 1.4).toFixed(1));
  const bsr = Math.round(200 + r2 * 90000);
  const sellers = Math.round(1 + r3 * 22);
  const variations = Math.round(1 + r * 8);
  const sizeTier = SIZE_TIERS[Math.floor(r2 * SIZE_TIERS.length)];
  const fulfillment = FULFILLMENTS[Math.floor(r3 * FULFILLMENTS.length)];
  const brand = BRANDS[Math.floor(r * BRANDS.length)];
  const ageMonths = Math.round(2 + r3 * 70);

  const row = {
    asin: asinFor(seed),
    title: `${brand} ${noun}`,
    category,
    price,
    monthlySales,
    monthlyRevenue,
    reviews,
    rating,
    bsr,
    sellers,
    variations,
    sizeTier,
    sizeLabel: SIZE_LABEL[sizeTier],
    fulfillment,
    ageMonths,
  };
  row.pIndex = pIndex(row);
  return row;
}

let MARKET = null;
function market() {
  if (MARKET) return MARKET;
  const rows = [];
  Object.entries(CATALOG).forEach(([category, nouns]) => {
    nouns.forEach((noun) => {
      // Two competing offers per noun → a richer, more realistic market.
      rows.push(buildProduct(category, noun, 'a'));
      rows.push(buildProduct(category, noun, 'b'));
    });
  });
  MARKET = rows;
  return rows;
}

function inRange(value, min, max) {
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

const num = (v) => (v === '' || v == null ? null : Number(v));

/**
 * Search the product market with Black-Box-style filters. All filters are
 * optional; unset filters don't constrain the result.
 */
function searchProducts(filters = {}) {
  const f = {
    categories: filters.categories || [],
    priceMin: num(filters.priceMin),
    priceMax: num(filters.priceMax),
    revenueMin: num(filters.revenueMin),
    revenueMax: num(filters.revenueMax),
    salesMin: num(filters.salesMin),
    salesMax: num(filters.salesMax),
    reviewsMin: num(filters.reviewsMin),
    reviewsMax: num(filters.reviewsMax),
    ratingMin: num(filters.ratingMin),
    ratingMax: num(filters.ratingMax),
    sellersMin: num(filters.sellersMin),
    sellersMax: num(filters.sellersMax),
    bsrMin: num(filters.bsrMin),
    bsrMax: num(filters.bsrMax),
    sizeTiers: filters.sizeTiers || [],
    fulfillment: filters.fulfillment || [],
  };

  let rows = market().filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.sizeTiers.length && !f.sizeTiers.includes(p.sizeTier)) return false;
    if (f.fulfillment.length && !f.fulfillment.includes(p.fulfillment)) return false;
    return (
      inRange(p.price, f.priceMin, f.priceMax) &&
      inRange(p.monthlyRevenue, f.revenueMin, f.revenueMax) &&
      inRange(p.monthlySales, f.salesMin, f.salesMax) &&
      inRange(p.reviews, f.reviewsMin, f.reviewsMax) &&
      inRange(p.rating, f.ratingMin, f.ratingMax) &&
      inRange(p.sellers, f.sellersMin, f.sellersMax) &&
      inRange(p.bsr, f.bsrMin, f.bsrMax)
    );
  });

  rows = rows.sort((a, b) => b.pIndex - a.pIndex).slice(0, 100);
  return rows;
}

/**
 * Wettbewerber tab — given an ASIN (or a category), return the competing
 * offers in that market, sorted by revenue. If the ASIN is unknown we pick a
 * demo product so the tab is never empty.
 */
function findCompetitors(asin, filters = {}) {
  const all = market();
  let anchor = all.find((p) => p.asin === asin);
  if (!anchor && asin) {
    // Unknown ASIN → seed a synthetic anchor so the demo still responds.
    const r = amazonService.seeded(asin);
    const cats = Object.keys(CATALOG);
    anchor = all.find((p) => p.category === cats[Math.floor(r * cats.length)]);
  }
  if (!anchor) anchor = all[0];

  let rows = all.filter((p) => p.category === anchor.category);
  rows = searchWithinRows(rows, filters).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  return { anchor, category: anchor.category, competitors: rows };
}

function searchWithinRows(rows, filters) {
  const f = {
    priceMin: num(filters.priceMin), priceMax: num(filters.priceMax),
    revenueMin: num(filters.revenueMin), revenueMax: num(filters.revenueMax),
    reviewsMin: num(filters.reviewsMin), reviewsMax: num(filters.reviewsMax),
    ratingMin: num(filters.ratingMin), ratingMax: num(filters.ratingMax),
  };
  return rows.filter(
    (p) =>
      inRange(p.price, f.priceMin, f.priceMax) &&
      inRange(p.monthlyRevenue, f.revenueMin, f.revenueMax) &&
      inRange(p.reviews, f.reviewsMin, f.reviewsMax) &&
      inRange(p.rating, f.ratingMin, f.ratingMax)
  );
}

/**
 * Keywords tab — Black-Box keyword search: keyword ideas around a seed term,
 * filtered by search volume and word count. Built on the keyword engine.
 */
async function searchKeywords(filters = {}) {
  const seed = (filters.seed || '').trim();
  if (!seed) return [];
  const ideas = await keywordService.researchKeywords(seed, filters.category || '');
  const volMin = num(filters.volumeMin);
  const volMax = num(filters.volumeMax);
  const wordsMin = num(filters.wordsMin);
  const wordsMax = num(filters.wordsMax);
  return ideas.filter((k) => {
    const words = k.keyword.trim().split(/\s+/).length;
    return inRange(k.searchVolume, volMin, volMax) && inRange(words, wordsMin, wordsMax);
  });
}

/**
 * Add parent-level vs. child-ASIN splits. A listing family (parent) aggregates
 * all its variations; a single child ASIN is roughly the parent divided by the
 * number of variations. Mirrors Black Box's "auf Elternebene" vs "ASIN" columns.
 */
function withParentSplit(p) {
  const v = Math.max(1, p.variations);
  return {
    ...p,
    parentSales: p.monthlySales,
    parentRevenue: p.monthlyRevenue,
    asinSales: Math.round(p.monthlySales / v),
    asinRevenue: Math.round(p.monthlyRevenue / v),
  };
}

function phraseTokens(phrase) {
  return (phrase || '')
    .toLowerCase()
    .replace(/[^a-zäöüß0-9\s&-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function matchesPhrase(p, tokens) {
  if (!tokens.length) return true;
  const hay = `${p.title} ${p.category}`.toLowerCase();
  return tokens.some((t) => hay.includes(t));
}

/**
 * Nische tab — a market segment defined by a keyword phrase. Returns the
 * products in that segment with parent/ASIN revenue splits.
 */
function searchNiche(phrase, filters = {}) {
  const tokens = phraseTokens(phrase);
  const f = {
    categories: filters.categories || [],
    sizeTiers: filters.sizeTiers || [],
    priceMin: num(filters.priceMin), priceMax: num(filters.priceMax),
    parentRevMin: num(filters.parentRevMin), parentRevMax: num(filters.parentRevMax),
    asinRevMin: num(filters.asinRevMin), asinRevMax: num(filters.asinRevMax),
    reviewsMin: num(filters.reviewsMin), reviewsMax: num(filters.reviewsMax),
    ratingMin: num(filters.ratingMin), ratingMax: num(filters.ratingMax),
  };

  let rows = market().filter((p) => matchesPhrase(p, tokens));
  // Unknown phrase → seed a category so the demo segment is never empty.
  if (rows.length === 0 && phrase) {
    const r = amazonService.seeded(phrase);
    const cats = Object.keys(CATALOG);
    const cat = cats[Math.floor(r * cats.length)];
    rows = market().filter((p) => p.category === cat);
  }

  rows = rows.map(withParentSplit).filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.sizeTiers.length && !f.sizeTiers.includes(p.sizeTier)) return false;
    return (
      inRange(p.price, f.priceMin, f.priceMax) &&
      inRange(p.parentRevenue, f.parentRevMin, f.parentRevMax) &&
      inRange(p.asinRevenue, f.asinRevMin, f.asinRevMax) &&
      inRange(p.reviews, f.reviewsMin, f.reviewsMax) &&
      inRange(p.rating, f.ratingMin, f.ratingMax)
    );
  });

  return rows.sort((a, b) => b.parentRevenue - a.parentRevenue).slice(0, 100);
}

const TARGET_SOURCES = {
  frequently_bought: 'Häufig zusammen gekauft',
  amazon_suggested: 'Vorschläge von Amazon',
  also_bought: 'Kunde hat auch gekauft',
};

/**
 * Produkt-Targeting tab — given one or more ASINs, find related products
 * (for Sponsored Products product targeting), tagged with the relation source.
 */
function searchTargeting(asinsInput, source, filters = {}) {
  const all = market();
  const asins = (asinsInput || '')
    .split(/[\s,;]+/)
    .map((a) => a.trim())
    .filter(Boolean);

  const anchors = asins.length
    ? asins.map((a) => all.find((p) => p.asin === a) || seedAnchor(a))
    : [all[0]];
  const cats = new Set(anchors.map((a) => a.category));

  const f = {
    categories: filters.categories || [],
    priceMin: num(filters.priceMin), priceMax: num(filters.priceMax),
    parentRevMin: num(filters.parentRevMin), parentRevMax: num(filters.parentRevMax),
    asinRevMin: num(filters.asinRevMin), asinRevMax: num(filters.asinRevMax),
    reviewsMin: num(filters.reviewsMin), reviewsMax: num(filters.reviewsMax),
    ratingMin: num(filters.ratingMin), ratingMax: num(filters.ratingMax),
  };
  const anchorAsins = new Set(anchors.map((a) => a.asin));
  const sourceLabel = TARGET_SOURCES[source] || 'Vorschläge von Amazon';

  let rows = all
    .filter((p) => cats.has(p.category) && !anchorAsins.has(p.asin))
    .map((p) => ({ ...withParentSplit(p), source: sourceLabel }))
    .filter((p) => {
      if (f.categories.length && !f.categories.includes(p.category)) return false;
      return (
        inRange(p.price, f.priceMin, f.priceMax) &&
        inRange(p.parentRevenue, f.parentRevMin, f.parentRevMax) &&
        inRange(p.asinRevenue, f.asinRevMin, f.asinRevMax) &&
        inRange(p.reviews, f.reviewsMin, f.reviewsMax) &&
        inRange(p.rating, f.ratingMin, f.ratingMax)
      );
    });

  return {
    anchors: anchors.map((a) => ({ asin: a.asin, title: a.title, category: a.category })),
    source: sourceLabel,
    products: rows.sort((a, b) => b.pIndex - a.pIndex).slice(0, 100),
  };
}

function seedAnchor(asin) {
  const all = market();
  const r = amazonService.seeded(asin);
  const cats = Object.keys(CATALOG);
  const cat = cats[Math.floor(r * cats.length)];
  const anchor = all.find((p) => p.category === cat) || all[0];
  return { ...anchor, asin };
}

/**
 * Elite Analytics — aggregate segment metrics for a niche phrase: total
 * segment revenue, averages, review distribution and top brands. This is the
 * "Erschließe wichtige Einblicke" report at the market-segment level.
 */
function nicheAnalytics(phrase, filters = {}) {
  const rows = searchNiche(phrase, filters);
  const n = rows.length;
  if (n === 0) {
    return { productCount: 0, phrase: phrase || '', segments: [], brands: [], reviewBuckets: [] };
  }
  const sum = (sel) => rows.reduce((s, r) => s + sel(r), 0);
  const round = (x, d = 0) => Number(x.toFixed(d));

  const segmentRevenue = sum((r) => r.parentRevenue);
  const segmentSales = sum((r) => r.parentSales);
  const avgPrice = round(sum((r) => r.price) / n, 2);
  const avgReviews = round(sum((r) => r.reviews) / n);
  const avgRating = round(sum((r) => r.rating) / n, 1);
  const goodRated = rows.filter((r) => r.rating >= 4.3).length; // "Anzahl guter Bewertungen"

  const brandMap = {};
  rows.forEach((r) => {
    const brand = r.title.split(' ')[0];
    brandMap[brand] = brandMap[brand] || { brand, count: 0, revenue: 0 };
    brandMap[brand].count += 1;
    brandMap[brand].revenue += r.parentRevenue;
  });
  const brands = Object.values(brandMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const buckets = [
    { label: '0–100', min: 0, max: 100 },
    { label: '100–500', min: 100, max: 500 },
    { label: '500–1.000', min: 500, max: 1000 },
    { label: '1.000+', min: 1000, max: Infinity },
  ];
  const reviewBuckets = buckets.map((b) => ({
    label: b.label,
    count: rows.filter((r) => r.reviews >= b.min && r.reviews < b.max).length,
  }));

  return {
    phrase: phrase || '',
    productCount: n,
    segmentRevenue,
    segmentSales,
    avgPrice,
    avgReviews,
    avgRating,
    goodRated,
    brands,
    reviewBuckets,
  };
}

function categories() {
  return Object.keys(CATALOG);
}

module.exports = {
  searchProducts,
  findCompetitors,
  searchKeywords,
  searchNiche,
  searchTargeting,
  nicheAnalytics,
  categories,
  sizeTiers: () => SIZE_TIERS.map((id) => ({ id, label: SIZE_LABEL[id] })),
  targetSources: () => Object.entries(TARGET_SOURCES).map(([id, label]) => ({ id, label })),
  pIndex,
};
