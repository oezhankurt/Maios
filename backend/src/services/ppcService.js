const { Op } = require('sequelize');
const { PPCCampaign, PPCPerformance, Product } = require('../models');
const amazonService = require('./amazonService');
const logger = require('../utils/logger');

/** ACoS % = spend / sales * 100. */
function calculateACoS(spend, sales) {
  const s = Number(sales) || 0;
  if (s === 0) return 0;
  return Number(((Number(spend) / s) * 100).toFixed(2));
}

/** ROAS = sales / spend. */
function calculateROAS(sales, spend) {
  const sp = Number(spend) || 0;
  if (sp === 0) return 0;
  return Number((Number(sales) / sp).toFixed(2));
}

/**
 * Records a day of PPC performance for a campaign, computing derived metrics.
 */
async function recordPerformance(campaignId, data) {
  const {
    performanceDate,
    impressions = 0,
    clicks = 0,
    spend = 0,
    sales = 0,
    unitsSold = 0,
  } = data;

  const cpc = clicks > 0 ? Number((Number(spend) / clicks).toFixed(2)) : 0;
  const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
  const acos = calculateACoS(spend, sales);
  const roas = calculateROAS(sales, spend);

  const [record] = await PPCPerformance.upsert(
    {
      campaignId,
      performanceDate,
      impressions,
      clicks,
      spend,
      sales,
      unitsSold,
      cpc,
      ctr,
      acos,
      roas,
    },
    { returning: true }
  );
  return record;
}

/**
 * Auto-adjust the campaign's effective bid based on how its trailing-7-day
 * ACoS compares to its target. Over target → lower budget/bid; well under
 * target with volume → raise. Returns the recommendation (and applies it to
 * dailyBudget as a proxy for bid control).
 */
async function optimizeBids(campaignId) {
  const campaign = await PPCCampaign.findByPk(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const rows = await PPCPerformance.findAll({
    where: { campaignId, performanceDate: { [Op.gte]: since.toISOString().slice(0, 10) } },
  });

  const agg = rows.reduce(
    (a, r) => {
      a.spend += Number(r.spend);
      a.sales += Number(r.sales);
      a.clicks += r.clicks;
      return a;
    },
    { spend: 0, sales: 0, clicks: 0 }
  );

  const actualAcos = calculateACoS(agg.spend, agg.sales);
  const target = Number(campaign.targetAcos);
  const currentBudget = Number(campaign.dailyBudget);

  let factor = 1;
  let action = 'hold';
  if (agg.sales === 0 && agg.spend > 0) {
    factor = 0.7; // spending with no sales → pull back hard
    action = 'decrease';
  } else if (actualAcos > target * 1.1) {
    factor = 0.85;
    action = 'decrease';
  } else if (actualAcos > 0 && actualAcos < target * 0.7 && agg.clicks > 10) {
    factor = 1.2; // efficient and getting traffic → scale up
    action = 'increase';
  }

  const newBudget = Number((currentBudget * factor).toFixed(2));
  if (factor !== 1) {
    await campaign.update({ dailyBudget: newBudget });
  }

  const result = {
    campaignId,
    action,
    actualAcos,
    targetAcos: target,
    previousBudget: currentBudget,
    newBudget,
    windowDays: 7,
  };
  logger.info(`PPC optimize ${campaign.campaignName}: ${action} (ACoS ${actualAcos}% vs target ${target}%)`);
  return result;
}

/** Optimize every active campaign for a product (or all products if omitted). */
async function optimizeAll(productId = null) {
  const where = { status: 'active' };
  if (productId) where.productId = productId;
  const campaigns = await PPCCampaign.findAll({ where });
  const results = [];
  for (const c of campaigns) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await optimizeBids(c.id));
  }
  return results;
}

/**
 * Suggest a starter set of campaigns for a product based on its price point.
 */
async function generateCampaignSuggestions(productId) {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error('Product not found');
  const price = Number(product.price);
  return [
    {
      campaignName: `${product.title} - Auto SP`,
      campaignType: 'sp',
      dailyBudget: Number((price * 2).toFixed(2)),
      targetAcos: 25,
      rationale: 'Auto-targeting Sponsored Products to discover converting search terms.',
    },
    {
      campaignName: `${product.title} - Brand SB`,
      campaignType: 'sb',
      dailyBudget: Number((price * 1.5).toFixed(2)),
      targetAcos: 20,
      rationale: 'Sponsored Brands to defend branded search and drive awareness.',
    },
  ];
}

/** Pull the latest day of PPC data from Amazon and store it for each campaign. */
async function syncPerformance(campaign, date = new Date()) {
  const data = await amazonService.getPPCData(campaign, date);
  return recordPerformance(campaign.id, {
    performanceDate: date.toISOString().slice(0, 10),
    ...data,
  });
}

module.exports = {
  calculateACoS,
  calculateROAS,
  recordPerformance,
  optimizeBids,
  optimizeAll,
  generateCampaignSuggestions,
  syncPerformance,
};
