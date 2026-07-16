const amazonService = require('./amazonService');

/**
 * cerebroService — reverse-ASIN & keyword expansion (Helium 10 "Cerebro"/"Magnet").
 *
 * Reverse-ASIN: given competitor ASINs, discover which keywords each product
 * ranks for, compare them side by side and surface keyword gaps. Keyword mode
 * expands a seed into related keywords.
 *
 * In demo mode everything is derived deterministically from the ASIN / keyword
 * string so results are stable. When real rank data is available (Brand
 * Analytics / SP-API) this is where those queries plug in — the row shape
 * already matches, so the UI needs no changes.
 */

// English product roots used to give arbitrary demo ASINs a stable keyword
// universe (so the reverse-ASIN comparison is meaningful).
const ROOTS = [
  'magnesium supplement', 'yoga mat', 'cutting board', 'water bottle',
  'resistance bands', 'coffee grinder', 'dog leash', 'desk organizer',
  'face roller', 'garden gloves', 'led strip lights', 'phone holder',
];

const PRE = ['best', 'cheap', 'premium', 'organic', 'natural', 'pure', 'professional', 'travel', 'bulk', 'mini'];
const SUF = ['for women', 'for men', 'for kids', 'set', 'bundle', 'refill', 'xl', 'kit', 'gift', 'with case', 'near me', 'online'];

const seeded = amazonService.seeded;

function asinRoot(asin) {
  return ROOTS[Math.floor(seeded(asin) * ROOTS.length)];
}

/** Deterministic keyword metrics derived from the phrase. */
function keywordMetrics(phrase) {
  const r = seeded(phrase);
  const r2 = seeded(`${phrase}-2`);
  const r3 = seeded(`${phrase}-3`);
  const words = phrase.trim().split(/\s+/).length;

  // Longer tail → lower volume, less competition.
  const searchVolume = Math.max(60, Math.round((90000 * r) / words));
  const competingProducts = Math.round(40 + r2 * 9000);
  const sponsoredAsins = Math.round(3 + r3 * 480);
  const bid = Number((0.2 + r * 2.8).toFixed(2));
  const suggestedBid = { value: bid, min: Number((bid * 0.7).toFixed(2)), max: Number((bid * 1.35).toFixed(2)) };
  const trendPct = Math.round(-15 + r2 * 45);
  const trend = { pct: trendPct, direction: trendPct > 2 ? 'up' : trendPct < -2 ? 'down' : 'flat' };
  // Cerebro IQ: demand vs. competition (higher = better opportunity).
  const cerebroIQ = Math.round((searchVolume / Math.max(1, competingProducts)) * 10);
  // CPR: rough units-to-rank estimate.
  const cpr = Math.max(8, Math.round(Math.sqrt(searchVolume) * 0.47));
  const organic = r3 > 0.38; // most keywords are organic, some paid-only
  const amazonRecommended = r > 0.72;
  const smartComplete = r2 > 0.86;

  return {
    searchVolume, competingProducts, sponsoredAsins, suggestedBid,
    trend, cerebroIQ, cpr, organic, amazonRecommended, smartComplete,
  };
}

/** Build a keyword pool from roots; each keyword is tagged with its roots. */
function buildPool(roots) {
  const map = new Map(); // phrase -> Set(root)
  const add = (phrase, root) => {
    const p = phrase.trim().toLowerCase();
    if (p.length < 3) return;
    if (!map.has(p)) map.set(p, new Set());
    map.get(p).add(root);
  };
  roots.forEach((root) => {
    add(root, root);
    const head = root.split(' ');
    head.forEach((w) => add(w, root));
    PRE.forEach((m) => add(`${m} ${root}`, root));
    SUF.forEach((m) => add(`${root} ${m}`, root));
    // a few two-word tails around the head noun
    const noun = head[head.length - 1];
    PRE.slice(0, 6).forEach((m) => add(`${m} ${noun}`, root));
  });
  return map;
}

function rankFor(asin, phrase, belongs) {
  const rr = seeded(`${asin}|${phrase}`);
  // Products rank far more often for keywords in their own root universe.
  const chance = belongs ? 0.82 : 0.12;
  if (rr > chance) return null;
  // Better (lower) positions for own-universe keywords.
  const pos = belongs ? 1 + Math.floor((rr / chance) * 120) : 60 + Math.floor((rr / chance) * 246);
  return Math.min(306, pos);
}

function wordFrequency(phrases) {
  const counts = {};
  phrases.forEach((p) => {
    p.split(/\s+/).forEach((w) => {
      if (w.length < 2) return;
      counts[w] = (counts[w] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);
}

function summarize(phrase, rows) {
  const anchor = rows.find((r) => r.keyword === phrase.toLowerCase()) || rows[0] || null;
  const totalVolume = rows.reduce((s, r) => s + r.searchVolume, 0);
  return {
    phrase,
    searchVolume: anchor ? anchor.searchVolume : 0,
    cerebroIQ: anchor ? anchor.cerebroIQ : 0,
    cpr: anchor ? anchor.cpr : 0,
    totalVolume,
    averageVolume: rows.length ? Math.round(totalVolume / rows.length) : 0,
    distribution: {
      total: rows.length,
      organic: rows.filter((r) => r.organic).length,
      paid: rows.filter((r) => !r.organic).length,
      amazonRecommended: rows.filter((r) => r.amazonRecommended).length,
      smartComplete: rows.filter((r) => r.smartComplete).length,
    },
    wordFrequency: wordFrequency(rows.map((r) => r.keyword)),
  };
}

function enrich(phrase, roots) {
  return { keyword: phrase, roots, ...keywordMetrics(phrase) };
}

/**
 * Reverse-ASIN — up to 10 ASINs. Returns keywords the products rank for, each
 * with a per-ASIN rank column (null = not ranking → a keyword gap), plus a
 * summary and word frequency.
 */
function reverseAsin(asins = []) {
  const clean = asins.map((a) => String(a).trim()).filter(Boolean).slice(0, 10);
  if (clean.length === 0) return { asins: [], summary: summarize('', []), keywords: [] };

  const rootByAsin = {};
  clean.forEach((a) => { rootByAsin[a] = asinRoot(a); });
  const roots = Array.from(new Set(Object.values(rootByAsin)));
  const pool = buildPool(roots);

  const rows = [];
  pool.forEach((rootSet, phrase) => {
    const row = enrich(phrase, Array.from(rootSet));
    const ranks = {};
    let anyRank = false;
    clean.forEach((a) => {
      const belongs = rootSet.has(rootByAsin[a]);
      const rank = rankFor(a, phrase, belongs);
      ranks[a] = rank;
      if (rank != null) anyRank = true;
    });
    if (!anyRank) return; // only keep keywords at least one ASIN ranks for
    row.ranks = ranks;
    // rankingAsins = how many of the input products rank for this keyword.
    row.rankingAsins = clean.filter((a) => ranks[a] != null).length;
    rows.push(row);
  });

  rows.sort((a, b) => b.searchVolume - a.searchVolume);
  const anchor = roots[0];
  return { asins: clean, summary: summarize(anchor, rows), keywords: rows.slice(0, 200) };
}

/**
 * Keyword mode (Magnet) — expand a seed keyword into related keywords with the
 * same metrics. No per-ASIN ranks.
 */
function keywordSearch(seed) {
  const term = String(seed || '').trim().toLowerCase();
  if (!term) return { asins: [], summary: summarize('', []), keywords: [] };
  const pool = buildPool([term]);
  const rows = [];
  pool.forEach((rootSet, phrase) => rows.push(enrich(phrase, Array.from(rootSet))));
  rows.sort((a, b) => b.searchVolume - a.searchVolume);
  return { asins: [], summary: summarize(term, rows), keywords: rows.slice(0, 200) };
}

/**
 * Analyze a pasted list of keywords (Cerebro "Schlüsselwörter analysieren").
 */
function analyzeKeywords(keywords = []) {
  const clean = keywords.map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 200);
  const rows = clean.map((k) => enrich(k, []));
  rows.sort((a, b) => b.searchVolume - a.searchVolume);
  return { asins: [], summary: summarize(clean[0] || '', rows), keywords: rows };
}

module.exports = { reverseAsin, keywordSearch, analyzeKeywords, ROOTS };
