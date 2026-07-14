const { Op } = require('sequelize');
const { PPCCampaign, PPCPerformance, Product } = require('../models');
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
  const { productId, campaignName, campaignType, dailyBudget, targetAcos, status } = req.body;
  await assertOwnsProduct(req.user.id, productId);
  const campaign = await PPCCampaign.create({
    productId,
    campaignName,
    campaignType,
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

module.exports = { list, create, getOne, update, performance, optimize };
