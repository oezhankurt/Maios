const { seeded } = require('./amazonService');

/**
 * Listing Analyzer: Analyze main ASIN vs up to 10 competitor ASINs.
 * Comparison of pricing, reviews, images, keywords, etc.
 */

function analyzeProduct(asin, seed = asin) {
  const r = seeded(seed);

  const prices = [18, 25, 35, 45, 60, 75];
  const price = prices[Math.floor(r * prices.length)];

  return {
    asin,
    title: `Produkt ${asin.substr(-4).toUpperCase()}`,
    price: price.toFixed(2),
    reviews: Math.floor(r * 5000),
    rating: (3.5 + r * 1.5).toFixed(1),
    images: Math.floor(r * 12) + 3,
    bullets: Math.floor(r * 5),
    videos: Math.floor(r * 3),
    description: r > 0.3 ? 'Ja' : 'Nein',
    variants: Math.floor(r * 8) + 1,
    sellers: Math.floor(r * 20) + 1,
    fba: r > 0.5 ? 'Ja' : 'Nein',
  };
}

async function analyzeMainProduct(mainAsin) {
  if (!mainAsin || mainAsin.trim() === '') {
    return { error: 'ASIN erforderlich' };
  }

  const main = analyzeProduct(mainAsin);
  return {
    main,
    lastAnalyzed: new Date().toISOString().split('T')[0],
  };
}

async function addCompetitors(mainAsin, competitorAsins = []) {
  const main = analyzeProduct(mainAsin);
  const competitors = competitorAsins
    .slice(0, 10)
    .map((asin) => analyzeProduct(asin, `${mainAsin}|${asin}`));

  const comparison = {
    price: {
      main: parseFloat(main.price),
      min: Math.min(...competitors.map((c) => parseFloat(c.price))),
      max: Math.max(...competitors.map((c) => parseFloat(c.price))),
      avg: (
        competitors.reduce((sum, c) => sum + parseFloat(c.price), 0) / competitors.length
      ).toFixed(2),
    },
    reviews: {
      main: main.reviews,
      min: Math.min(...competitors.map((c) => c.reviews)),
      max: Math.max(...competitors.map((c) => c.reviews)),
      avg: Math.round(competitors.reduce((sum, c) => sum + c.reviews, 0) / competitors.length),
    },
    rating: {
      main: parseFloat(main.rating),
      min: Math.min(...competitors.map((c) => parseFloat(c.rating))),
      max: Math.max(...competitors.map((c) => parseFloat(c.rating))),
      avg: (
        competitors.reduce((sum, c) => sum + parseFloat(c.rating), 0) / competitors.length
      ).toFixed(1),
    },
  };

  const strengths = [];
  if (main.reviews > comparison.reviews.avg) {
    strengths.push(`${Math.round(((main.reviews - comparison.reviews.avg) / comparison.reviews.avg) * 100)}% mehr Bewertungen als Durchschnitt`);
  }
  if (parseFloat(main.rating) > comparison.rating.avg) {
    strengths.push(`Bessere Bewertung (+${(parseFloat(main.rating) - comparison.rating.avg).toFixed(1)} Sterne)`);
  }
  if (parseFloat(main.price) < comparison.price.avg) {
    strengths.push(`Günstiger (${((1 - parseFloat(main.price) / parseFloat(comparison.price.avg)) * 100).toFixed(0)}% unter Durchschnitt)`);
  }

  const weaknesses = [];
  if (main.images < 8) {
    weaknesses.push(`Nur ${main.images} Bilder (optimal: 8+)`);
  }
  if (main.bullets < 5) {
    weaknesses.push('Unvollständige Bullet Points');
  }
  if (main.description === 'Nein') {
    weaknesses.push('Keine erweiterte Beschreibung');
  }

  return {
    main,
    competitors,
    comparison,
    strengths,
    weaknesses,
  };
}

module.exports = {
  analyzeMainProduct,
  addCompetitors,
};
