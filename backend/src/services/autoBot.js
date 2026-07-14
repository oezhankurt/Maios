const { Op } = require('sequelize');
const {
  Product,
  Keyword,
  KeywordRanking,
  PPCCampaign,
  PPCPerformance,
  Competitor,
  CompetitorPriceHistory,
  Alert,
} = require('../models');
const ppcService = require('./ppcService');
const priceOptimizer = require('./priceOptimizer');
const rankingService = require('./rankingService');
const logger = require('../utils/logger');

/**
 * The automation engine. It inspects recent data for each active product and:
 *  - detects ranking drops → triggers a PPC bid increase + alert
 *  - detects ACoS above target → raises an alert
 *  - detects competitor price drops → triggers a price adjustment + alert
 * Alerts are de-duplicated within a 24h window to avoid noise.
 */

const RANKING_DROP_THRESHOLD = 5; // positions lost since previous reading

async function createAlert(userId, { productId = null, type, severity, title, message, meta = {} }) {
  // De-dup: skip if an identical active alert was created in the last 24h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await Alert.findOne({
    where: { userId, productId, type, title, createdAt: { [Op.gte]: since } },
  });
  if (existing) return existing;
  return Alert.create({ userId, productId, type, severity, title, message, meta });
}

async function detectRankingDrops(product) {
  const alerts = [];
  const keywords = await Keyword.findAll({ where: { productId: product.id, status: 'active' } });

  for (const kw of keywords) {
    // eslint-disable-next-line no-await-in-loop
    const latest = await KeywordRanking.findOne({
      where: { keywordId: kw.id },
      order: [['rankDate', 'DESC']],
    });
    if (!latest || latest.previousRanking == null) continue;

    const change = rankingService.detectRankingChanges(
      latest.previousRanking,
      latest.rankingPosition
    );

    if (change.direction === 'down' && Math.abs(change.delta) >= RANKING_DROP_THRESHOLD) {
      // Trigger a bid increase on the product's campaigns to defend rank.
      // eslint-disable-next-line no-await-in-loop
      const campaigns = await PPCCampaign.findAll({
        where: { productId: product.id, status: 'active' },
      });
      for (const c of campaigns) {
        // eslint-disable-next-line no-await-in-loop
        await c.update({ dailyBudget: Number((Number(c.dailyBudget) * 1.15).toFixed(2)) });
      }

      // eslint-disable-next-line no-await-in-loop
      const alert = await createAlert(product.userId, {
        productId: product.id,
        type: 'ranking_drop',
        severity: 'warning',
        title: `Ranking drop for "${kw.keyword}"`,
        message: `Dropped ${Math.abs(change.delta)} positions (from ${latest.previousRanking} to ${latest.rankingPosition}). Increased PPC budgets 15% to defend.`,
        meta: { keywordId: kw.id, delta: change.delta },
      });
      alerts.push(alert);
    }
  }
  return alerts;
}

async function detectHighAcos(product) {
  const alerts = [];
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const campaigns = await PPCCampaign.findAll({
    where: { productId: product.id, status: 'active' },
  });

  for (const c of campaigns) {
    // eslint-disable-next-line no-await-in-loop
    const rows = await PPCPerformance.findAll({
      where: { campaignId: c.id, performanceDate: { [Op.gte]: since.toISOString().slice(0, 10) } },
    });
    if (rows.length === 0) continue;

    const spend = rows.reduce((s, r) => s + Number(r.spend), 0);
    const sales = rows.reduce((s, r) => s + Number(r.sales), 0);
    const acos = ppcService.calculateACoS(spend, sales);

    if (acos > Number(c.targetAcos) * 1.2) {
      // eslint-disable-next-line no-await-in-loop
      const alert = await createAlert(product.userId, {
        productId: product.id,
        type: 'acos_high',
        severity: acos > Number(c.targetAcos) * 1.5 ? 'critical' : 'warning',
        title: `High ACoS on "${c.campaignName}"`,
        message: `7-day ACoS is ${acos}% (target ${c.targetAcos}%). Consider lowering bids or pausing wasteful terms.`,
        meta: { campaignId: c.id, acos, targetAcos: Number(c.targetAcos) },
      });
      alerts.push(alert);
    }
  }
  return alerts;
}

async function detectCompetitorPriceDrops(product) {
  const alerts = [];
  const competitors = await Competitor.findAll({
    where: { productId: product.id, status: 'active' },
  });

  for (const c of competitors) {
    // eslint-disable-next-line no-await-in-loop
    const history = await CompetitorPriceHistory.findAll({
      where: { competitorId: c.id },
      order: [['priceDate', 'DESC']],
      limit: 2,
    });
    if (history.length < 2) continue;

    const drop = priceOptimizer.detectPriceDrops(
      Number(history[0].price),
      Number(history[1].price)
    );
    if (drop.dropped) {
      // eslint-disable-next-line no-await-in-loop
      const rec = await priceOptimizer.recommendPriceAdjustment(product.id, c.marketplace);
      // eslint-disable-next-line no-await-in-loop
      const alert = await createAlert(product.userId, {
        productId: product.id,
        type: 'competitor_price',
        severity: 'warning',
        title: `Competitor price drop (${c.competitorAsin || c.competitorTitle})`,
        message: `Competitor dropped ${drop.pct}% to ${history[0].price}. Recommended price: ${rec.recommendedPrice} (${rec.action}).`,
        meta: { competitorId: c.id, dropPct: drop.pct, recommendation: rec },
      });
      alerts.push(alert);
    }
  }
  return alerts;
}

/**
 * Runs all detectors across every active product and returns the alerts raised.
 */
async function run() {
  logger.info('AutoBot: running automation sweep');
  const products = await Product.findAll({ where: { status: 'active' } });
  const allAlerts = [];

  for (const product of products) {
    try {
      // eslint-disable-next-line no-await-in-loop
      allAlerts.push(...(await detectRankingDrops(product)));
      // eslint-disable-next-line no-await-in-loop
      allAlerts.push(...(await detectHighAcos(product)));
      // eslint-disable-next-line no-await-in-loop
      allAlerts.push(...(await detectCompetitorPriceDrops(product)));
    } catch (err) {
      logger.error(`AutoBot error for product ${product.id}: ${err.message}`);
    }
  }

  logger.info(`AutoBot: sweep complete, ${allAlerts.length} alert(s) raised`);
  return allAlerts;
}

module.exports = {
  run,
  createAlert,
  detectRankingDrops,
  detectHighAcos,
  detectCompetitorPriceDrops,
};
