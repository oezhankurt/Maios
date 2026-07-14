const { Op } = require('sequelize');
const { Keyword, KeywordRanking, Product } = require('../models');
const amazonService = require('./amazonService');

/**
 * Records today's ranking for a keyword on a marketplace, carrying forward the
 * previous position for delta tracking.
 */
async function trackKeywordRanking(keyword, marketplace = 'amazon', date = new Date()) {
  const kw = typeof keyword === 'string' ? await Keyword.findByPk(keyword) : keyword;
  if (!kw) throw new Error('Keyword not found');

  const product = await Product.findByPk(kw.productId);
  const rankDate = date.toISOString().slice(0, 10);

  // Most recent prior ranking for this keyword/marketplace.
  const prior = await KeywordRanking.findOne({
    where: { keywordId: kw.id, marketplace, rankDate: { [Op.lt]: rankDate } },
    order: [['rankDate', 'DESC']],
  });

  // Live scraping would go here; demo mode derives a plausible position that
  // drifts day to day around a keyword-specific baseline.
  const seed = amazonService.seeded(`${kw.id}-${marketplace}-${rankDate}`);
  const baseline = 1 + Math.round(amazonService.seeded(`${kw.id}-${marketplace}`) * 40);
  const drift = Math.round((seed - 0.5) * 8);
  const position = Math.max(1, Math.min(300, baseline + drift));

  const [record] = await KeywordRanking.upsert(
    {
      keywordId: kw.id,
      productId: kw.productId,
      marketplace,
      rankingPosition: position,
      previousRanking: prior ? prior.rankingPosition : null,
      rankDate,
    },
    { returning: true }
  );

  return { record, product, change: detectRankingChanges(prior && prior.rankingPosition, position) };
}

async function getHistoricalRankings(keywordId, days = 30, marketplace = 'amazon') {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return KeywordRanking.findAll({
    where: {
      keywordId,
      marketplace,
      rankDate: { [Op.gte]: start.toISOString().slice(0, 10) },
    },
    order: [['rankDate', 'ASC']],
  });
}

/** Positive delta means improvement (position number went down). */
function detectRankingChanges(previousRanking, currentRanking) {
  if (previousRanking == null || currentRanking == null) {
    return { delta: 0, direction: 'new' };
  }
  const delta = previousRanking - currentRanking;
  let direction = 'stable';
  if (delta > 0) direction = 'up';
  else if (delta < 0) direction = 'down';
  return { delta, direction };
}

/**
 * Linear-ish trend over a series of rankings. Returns slope (positions/day,
 * negative = improving) and a human label.
 */
function analyzeTrend(rankings) {
  const points = rankings
    .filter((r) => r.rankingPosition != null)
    .map((r, i) => ({ x: i, y: r.rankingPosition }));

  if (points.length < 2) {
    return { slope: 0, label: 'insufficient-data', best: null, worst: null, current: null };
  }

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);

  let label = 'stable';
  if (slope < -0.3) label = 'improving';
  else if (slope > 0.3) label = 'declining';

  const positions = points.map((p) => p.y);
  return {
    slope: Number(slope.toFixed(3)),
    label,
    best: Math.min(...positions),
    worst: Math.max(...positions),
    current: positions[positions.length - 1],
  };
}

module.exports = {
  trackKeywordRanking,
  getHistoricalRankings,
  detectRankingChanges,
  analyzeTrend,
};
