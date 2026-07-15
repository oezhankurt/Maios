const { Op } = require('sequelize');
const { PPCCampaign, PPCPerformance, Product, DailySales } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ppcService = require('../services/ppcService');

async function assertOwnsProduct(userId, productId) {
  const product = await Product.findOne({ where: { id: productId, userId } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

async function ownedCampaign(userId, campaignId) {
  const campaign = await PPCCampaign.findByPk(campaignId, {
    include: [{ model: Product, as: 'product' }],
  });
  if (!campaign || !campaign.product || campaign.product.userId !== userId) {
    throw ApiError.notFound('Campaign not found');
  }
  return campaign;
}

const list = asyncHandler(async (req, res) => {
  const productIds = (
    await Product.findAll({ where: { userId: req.user.id }, attributes: ['id'] })
  ).map((p) => p.id);

  const where = { productId: { [Op.in]: productIds } };
  if (req.query.productId) where.productId = req.query.productId;
  if (req.query.status) where.status = req.query.status;

  const campaigns = await PPCCampaign.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: campaigns });
});

const create = asyncHandler(async (req, res) => {
  const { productId, campaignName, campaignType, adPlatform, dailyBudget, targetAcos, status } = req.body;
  await assertOwnsProduct(req.user.id, productId);
  const campaign = await PPCCampaign.create({
    productId,
    campaignName,
    campaignType,
    adPlatform,
    dailyBudget,
    targetAcos,
    status,
  });
  res.status(201).json({ success: true, data: campaign });
});

const getOne = asyncHandler(async (req, res) => {
  const campaign = await ownedCampaign(req.user.id, req.params.id);
  res.json({ success: true, data: campaign });
});

const update = asyncHandler(async (req, res) => {
  const campaign = await ownedCampaign(req.user.id, req.params.id);
  const fields = ['campaignName', 'campaignType', 'dailyBudget', 'targetAcos', 'status'];
  const patch = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) patch[f] = req.body[f];
  });
  await campaign.update(patch);
  res.json({ success: true, data: campaign });
});

const performance = asyncHandler(async (req, res) => {
  const campaign = await ownedCampaign(req.user.id, req.params.id);
  const days = parseInt(req.query.days, 10) || 30;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const rows = await PPCPerformance.findAll({
    where: {
      campaignId: campaign.id,
      performanceDate: { [Op.gte]: start.toISOString().slice(0, 10) },
    },
    order: [['performanceDate', 'ASC']],
  });
  res.json({ success: true, data: rows });
});

const optimize = asyncHandler(async (req, res) => {
  const { campaignId, productId } = req.body;
  if (campaignId) {
    await ownedCampaign(req.user.id, campaignId);
    const result = await ppcService.optimizeBids(campaignId);
    return res.json({ success: true, data: [result] });
  }
  if (productId) await assertOwnsProduct(req.user.id, productId);
  const results = await ppcService.optimizeAll(productId || null);
  return res.json({ success: true, data: results });
});

/**
 * Account-level advertising KPIs — the Adference "Zeitvergleich" dashboard:
 * ACoS, ROAS, TACoS, CTR, CPC, CVR, ad vs. organic sales, plus a daily series.
 */
const overview = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const sinceStr = since.toISOString().slice(0, 10);

  const productIds = (
    await Product.findAll({ where: { userId: req.user.id }, attributes: ['id'] })
  ).map((p) => p.id);

  const campaigns = productIds.length
    ? await PPCCampaign.findAll({ where: { productId: { [Op.in]: productIds } }, attributes: ['id'] })
    : [];
  const campaignIds = campaigns.map((c) => c.id);

  const perf = campaignIds.length
    ? await PPCPerformance.findAll({
        where: { campaignId: { [Op.in]: campaignIds }, performanceDate: { [Op.gte]: sinceStr } },
      })
    : [];

  const ad = perf.reduce(
    (a, r) => {
      a.impressions += r.impressions;
      a.clicks += r.clicks;
      a.spend += Number(r.spend);
      a.sales += Number(r.sales);
      a.conversions += r.unitsSold;
      return a;
    },
    { impressions: 0, clicks: 0, spend: 0, sales: 0, conversions: 0 }
  );

  // Total revenue (ad + organic) for TACoS.
  const dailyRows = productIds.length
    ? await DailySales.findAll({
        where: { productId: { [Op.in]: productIds }, saleDate: { [Op.gte]: sinceStr } },
      })
    : [];
  const totalRevenue = dailyRows.reduce((s, r) => s + Number(r.grossRevenue), 0);
  const organicSales = Math.max(0, totalRevenue - ad.sales);

  const round = (n, d = 2) => Number(n.toFixed(d));
  res.json({
    success: true,
    data: {
      windowDays: days,
      adSpend: round(ad.spend),
      adSales: round(ad.sales),
      organicSales: round(organicSales),
      totalSales: round(totalRevenue),
      impressions: ad.impressions,
      clicks: ad.clicks,
      conversions: ad.conversions,
      acos: ad.sales > 0 ? round((ad.spend / ad.sales) * 100, 1) : 0,
      roas: ad.spend > 0 ? round(ad.sales / ad.spend, 2) : 0,
      tacos: totalRevenue > 0 ? round((ad.spend / totalRevenue) * 100, 1) : 0,
      ctr: ad.impressions > 0 ? round((ad.clicks / ad.impressions) * 100, 2) : 0,
      cpc: ad.clicks > 0 ? round(ad.spend / ad.clicks, 2) : 0,
      cvr: ad.clicks > 0 ? round((ad.conversions / ad.clicks) * 100, 1) : 0,
    },
  });
});

module.exports = { list, create, getOne, update, performance, optimize, overview };
