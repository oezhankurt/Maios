const { seeded } = require('./amazonService');

/**
 * Index Checker: Check keyword ranking for ASIN(s).
 * Traditional Index (SERP position), Field-ASIN Index (title/bullets), Storefront Index.
 */

function checkKeywordRank(asin, keyword, seed) {
  const r = seeded(seed);

  // Determine if ASIN ranks at all for this keyword (~60% chance)
  if (r < 0.4) {
    return null; // Not indexed
  }

  // Traditional Index: position 1-306+
  const tradIndex = Math.floor(r * 250) + 1;

  // Field-ASIN Index: position 1-50 (if indexed at all)
  const fieldAsin = r > 0.7 ? Math.floor(r * 40) + 1 : null;

  // Storefront Index: position in store
  const storefront = r > 0.8 ? Math.floor(r * 100) + 1 : null;

  // Estimate monthly searches (seed-based)
  const searchVol = Math.max(60, Math.round((80000 * r) / (keyword.split(' ').length + 1)));

  return {
    tradIndex,
    fieldAsin,
    storefront,
    searchVol,
    indexed: true,
  };
}

async function checkKeyword(asin, keyword) {
  if (!asin || !keyword) {
    return { error: 'ASIN und Keyword erforderlich' };
  }

  const seed = `index|${asin}|${keyword}`;
  const rank = checkKeywordRank(asin, keyword, seed);

  if (!rank) {
    return {
      keyword,
      asin,
      indexed: false,
      message: 'Nicht indexiert',
    };
  }

  return {
    keyword,
    asin,
    ...rank,
  };
}

async function checkKeywords(asin, keywords = []) {
  if (!asin) {
    return { error: 'ASIN erforderlich' };
  }

  const results = keywords.slice(0, 200).map((kw) => {
    const seed = `index|${asin}|${kw}`;
    const rank = checkKeywordRank(asin, kw, seed);
    return {
      keyword: kw,
      ...rank,
    };
  });

  const indexed = results.filter((r) => r.indexed).length;
  const onFirstPage = results.filter((r) => r.indexed && r.tradIndex <= 10).length;
  const topTen = results.filter((r) => r.indexed && r.fieldAsin && r.fieldAsin <= 10).length;

  return {
    asin,
    total: results.length,
    indexed,
    onFirstPage,
    topTen,
    results,
  };
}

async function trackRankings(asin, keywords = [], days = 30) {
  // Simulate historical tracking data
  const results = keywords.slice(0, 50).map((kw) => {
    const seed = `index|${asin}|${kw}`;
    const r = seeded(seed);
    const trend = (r - 0.5) * 40; // -20 to +20 position change
    const current = Math.max(1, Math.floor(r * 100) + 1);
    const previous = Math.max(1, current + Math.floor(trend));

    return {
      keyword: kw,
      current,
      previous,
      change: previous - current, // positive = improvement
      days,
      indexed: r > 0.4,
    };
  });

  const improved = results.filter((r) => r.change > 0).length;
  const declined = results.filter((r) => r.change < 0).length;

  return {
    asin,
    period: `${days} Tage`,
    results,
    summary: { improved, declined, stable: results.length - improved - declined },
  };
}

module.exports = {
  checkKeyword,
  checkKeywords,
  trackRankings,
};
