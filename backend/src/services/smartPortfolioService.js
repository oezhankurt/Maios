const { Op } = require('sequelize');
const { PPCCampaign, PPCPerformance, SmartPortfolio, AutomationRule, Product } = require('../models');
const ppcService = require('./ppcService');
const logger = require('../utils/logger');

/**
 * Smart Portfolio engine — the Adference-style PPC automation.
 *
 *  - computeCampaignMetrics: rolls up a campaign's performance over a window
 *  - evaluateRule: checks a Campaign-Mover rule's conditions against a campaign
 *  - applyRules: moves matching campaigns into their target Smart Portfolio
 *  - optimizePortfolio: target-ACoS bidding for every campaign in a portfolio
 *
 * Everything is transparent and rule-based; when the Amazon Advertising API is
 * connected, the same engine drives real bid/budget writes.
 */

// Fields usable in rule conditions. Metric fields accept a 30 / 365 suffix.
const METRIC_FIELDS = ['clicks', 'conversions', 'impressions', 'spend', 'sales', 'acos', 'roas', 'cvr', 'ctr', 'cpo'];
const ATTR_FIELDS = ['campaignType', 'campaignStatus', 'campaignName'];

async function computeCampaignMetrics(campaignId, windowDays) {
  const since = new Date();
  since.setDate(since.getDate() - windowDays);
  const rows = await PPCPerformance.findAll({
    where: { campaignId, performanceDate: { [Op.gte]: since.toISOString().slice(0, 10) } },
  });
  const agg = rows.reduce(
    (a, r) => {
      a.clicks += r.clicks;
      a.impressions += r.impressions;
      a.spend += Number(r.spend);
      a.sales += Number(r.sales);
      a.conversions += r.unitsSold;
      return a;
    },
    { clicks: 0, impressions: 0, spend: 0, sales: 0, conversions: 0 }
  );
  return {
    ...agg,
    acos: agg.sales > 0 ? (agg.spend / agg.sales) * 100 : 0,
    roas: agg.spend > 0 ? agg.sales / agg.spend : 0,
    cvr: agg.clicks > 0 ? (agg.conversions / agg.clicks) * 100 : 0,
    ctr: agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0,
    cpo: agg.conversions > 0 ? agg.spend / agg.conversions : 0,
  };
}

function resolveFieldValue(field, campaign, metrics) {
  if (ATTR_FIELDS.includes(field)) {
    if (field === 'campaignType') return campaign.campaignType;
    if (field === 'campaignStatus') return campaign.status;
    if (field === 'campaignName') return campaign.campaignName;
  }
  // Metric field with window suffix, e.g. acos30 / roas365.
  const m = field.match(/^([a-z]+)(30|365)$/i);
  if (m && METRIC_FIELDS.includes(m[1])) {
    return metrics[m[2]][m[1]];
  }
  return undefined;
}

function testOperator(actual, operator, value) {
  const num = Number(value);
  const s = String(actual ?? '').toLowerCase();
  const v = String(value ?? '').toLowerCase();
  switch (operator) {
    case 'gt': return Number(actual) > num;
    case 'lt': return Number(actual) < num;
    case 'gte': return Number(actual) >= num;
    case 'lte': return Number(actual) <= num;
    case 'eq': return Number(actual) === num;
    case 'equals': return s === v;
    case 'contains': return s.includes(v);
    case 'notContains': return !s.includes(v);
    case 'startsWith': return s.startsWith(v);
    case 'notStartsWith': return !s.startsWith(v);
    case 'endsWith': return s.endsWith(v);
    case 'notEndsWith': return !s.endsWith(v);
    default: return false;
  }
}

function evaluateRule(campaign, metrics, rule) {
  const conditions = rule.conditions || [];
  if (conditions.length === 0) return false;
  const results = conditions.map((c) =>
    testOperator(resolveFieldValue(c.field, campaign, metrics), c.operator, c.value)
  );
  return rule.logic === 'any' ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Runs all active Campaign-Mover rules for a user and assigns matching
 * campaigns to their target Smart Portfolio. Returns the list of moves.
 */
async function applyRules(userId) {
  const productIds = (await Product.findAll({ where: { userId }, attributes: ['id'] })).map((p) => p.id);
  if (productIds.length === 0) return [];

  const campaigns = await PPCCampaign.findAll({ where: { productId: { [Op.in]: productIds } } });
  const rules = await AutomationRule.findAll({ where: { userId, active: true } });
  const moves = [];

  for (const campaign of campaigns) {
    // eslint-disable-next-line no-await-in-loop
    const metrics = {
      30: await computeCampaignMetrics(campaign.id, 30),
      365: await computeCampaignMetrics(campaign.id, 365),
    };
    for (const rule of rules) {
      if (evaluateRule(campaign, metrics, rule)) {
        if (campaign.smartPortfolioId !== rule.targetPortfolioId) {
          // eslint-disable-next-line no-await-in-loop
          await campaign.update({ smartPortfolioId: rule.targetPortfolioId });
          moves.push({ campaignId: campaign.id, campaignName: campaign.campaignName, portfolioId: rule.targetPortfolioId, rule: rule.name });
        }
        break; // first matching rule wins
      }
    }
  }

  await AutomationRule.update({ lastRunAt: new Date() }, { where: { userId, active: true } });
  logger.info(`SmartPortfolio: applied rules for user ${userId}, ${moves.length} move(s)`);
  return moves;
}

/**
 * Target-ACoS bidding for every campaign in a portfolio. Uses the portfolio's
 * targetAcos (falling back to each campaign's own target) and adjusts the
 * effective budget/bid up or down based on trailing-7-day ACoS.
 */
async function optimizePortfolio(portfolioId) {
  const portfolio = await SmartPortfolio.findByPk(portfolioId);
  if (!portfolio || portfolio.status !== 'active') return [];
  const campaigns = await PPCCampaign.findAll({ where: { smartPortfolioId: portfolioId, status: 'active' } });
  const results = [];
  for (const c of campaigns) {
    // Align the campaign target to the portfolio, then reuse the bid optimizer.
    if (Number(c.targetAcos) !== Number(portfolio.targetAcos)) {
      // eslint-disable-next-line no-await-in-loop
      await c.update({ targetAcos: portfolio.targetAcos });
    }
    // eslint-disable-next-line no-await-in-loop
    results.push(await ppcService.optimizeBids(c.id));
  }
  return results;
}

async function optimizeAllPortfolios(userId) {
  const portfolios = await SmartPortfolio.findAll({ where: { userId, status: 'active' } });
  const results = [];
  for (const p of portfolios) {
    // eslint-disable-next-line no-await-in-loop
    results.push({ portfolio: p.name, adjustments: await optimizePortfolio(p.id) });
  }
  return results;
}

module.exports = {
  METRIC_FIELDS,
  ATTR_FIELDS,
  computeCampaignMetrics,
  evaluateRule,
  applyRules,
  optimizePortfolio,
  optimizeAllPortfolios,
};
