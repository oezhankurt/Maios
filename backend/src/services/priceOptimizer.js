const { Op } = require('sequelize');
const {
  Product,
  Competitor,
  CompetitorPriceHistory,
} = require('../models');
const amazonService = require('./amazonService');

/**
 * Returns the latest known competitor prices for a product on a marketplace.
 */
async function getCompetitorPrices(productId, marketplace = 'amazon') {
  const competitors = await Competitor.findAll({
    where: { productId, marketplace, status: 'active' },
    include: [
      {
        model: CompetitorPriceHistory,
        as: 'priceHistory',
        separate: true,
        limit: 1,
        order: [['priceDate', 'DESC']],
      },
    ],
  });

  return competitors
    .map((c) => ({
      competitorId: c.id,
      competitorAsin: c.competitorAsin,
      title: c.competitorTitle,
      price: c.priceHistory && c.priceHistory[0] ? Number(c.priceHistory[0].price) : null,
    }))
    .filter((c) => c.price != null);
}

/**
 * Compute an optimal price: undercut the competitor floor slightly, but never
 * below the minimum price that preserves the target margin over unit cost.
 */
function calculateOptimalPrice(myPrice, competitorPrices, { costPerUnit = 0, targetMargin = 20 } = {}) {
  const prices = competitorPrices.map((c) => (typeof c === 'number' ? c : c.price)).filter(Boolean);
  const minMarginPrice = Number(costPerUnit) > 0 ? Number(costPerUnit) / (1 - targetMargin / 100) : 0;

  if (prices.length === 0) {
    return {
      recommendedPrice: Number(myPrice),
      floorPrice: Number(minMarginPrice.toFixed(2)),
      reason: 'No competitor data; holding current price.',
    };
  }

  const minCompetitor = Math.min(...prices);
  // Undercut the cheapest competitor by ~1%.
  let target = Number((minCompetitor * 0.99).toFixed(2));
  let reason = `Undercut cheapest competitor (${minCompetitor}) by 1%.`;

  if (target < minMarginPrice) {
    target = Number(minMarginPrice.toFixed(2));
    reason = `Competitor price below margin floor; holding at ${targetMargin}% margin floor.`;
  }

  return {
    recommendedPrice: target,
    floorPrice: Number(minMarginPrice.toFixed(2)),
    minCompetitorPrice: minCompetitor,
    reason,
  };
}

/** Detects a meaningful price drop (>= 3%). */
function detectPriceDrops(currentPrice, previousPrice) {
  if (previousPrice == null || currentPrice == null || previousPrice === 0) {
    return { dropped: false, pct: 0 };
  }
  const pct = Number((((previousPrice - currentPrice) / previousPrice) * 100).toFixed(2));
  return { dropped: pct >= 3, pct };
}

/**
 * End-to-end recommendation for a product across a marketplace.
 */
async function recommendPriceAdjustment(productId, marketplace = 'amazon') {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error('Product not found');

  const competitorPrices = await getCompetitorPrices(productId, marketplace);
  const optimal = calculateOptimalPrice(Number(product.price), competitorPrices, {
    costPerUnit: Number(product.costPerUnit),
    targetMargin: 20,
  });

  const delta = Number((optimal.recommendedPrice - Number(product.price)).toFixed(2));
  return {
    productId,
    marketplace,
    currentPrice: Number(product.price),
    ...optimal,
    delta,
    action: Math.abs(delta) < 0.01 ? 'hold' : delta < 0 ? 'decrease' : 'increase',
    competitors: competitorPrices,
  };
}

/**
 * Refresh competitor prices for a product from Amazon (or synthetic source)
 * and store a new price history point per competitor.
 */
async function refreshCompetitorPrices(productId, marketplace = 'amazon', date = new Date()) {
  const competitors = await Competitor.findAll({
    where: { productId, marketplace, status: 'active' },
  });
  const priceDate = date.toISOString().slice(0, 10);
  const updates = [];

  for (const c of competitors) {
    const r = amazonService.seeded(`${c.competitorAsin}-${priceDate}`);
    const price = Number((10 + r * 60).toFixed(2));
    // eslint-disable-next-line no-await-in-loop
    await CompetitorPriceHistory.upsert({ competitorId: c.id, price, priceDate });
    // eslint-disable-next-line no-await-in-loop
    await c.update({ lastChecked: new Date() });
    updates.push({ competitorId: c.id, price });
  }
  return updates;
}

module.exports = {
  getCompetitorPrices,
  calculateOptimalPrice,
  detectPriceDrops,
  recommendPriceAdjustment,
  refreshCompetitorPrices,
};
