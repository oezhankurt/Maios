const { Op } = require('sequelize');
const { Product, DailySales, Keyword, Competitor, CompetitorPriceHistory } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const profitService = require('../services/profitService');
const priceOptimizer = require('../services/priceOptimizer');

/** Load a product scoped to the authenticated user or throw 404. */
async function ownedProduct(userId, id) {
  const product = await Product.findOne({ where: { id, userId } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

const list = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const where = { userId: req.user.id };
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { asin: { [Op.iLike]: `%${search}%` } },
      { ean: { [Op.iLike]: `%${search}%` } },
    ];
  }
  const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json({ success: true, data: products });
});

const create = asyncHandler(async (req, res) => {
  const { asin, ean, sku, title, category, imageUrl, price, costPerUnit, fbaStock, fbmStock, status } =
    req.body;
  const product = await Product.create({
    userId: req.user.id,
    asin,
    ean,
    sku,
    title,
    category,
    imageUrl,
    price,
    costPerUnit,
    fbaStock,
    fbmStock,
    status,
  });
  res.status(201).json({ success: true, data: product });
});

const getOne = asyncHandler(async (req, res) => {
  const product = await ownedProduct(req.user.id, req.params.id);
  res.json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const product = await ownedProduct(req.user.id, req.params.id);
  const fields = [
    'asin', 'ean', 'sku', 'title', 'category', 'imageUrl',
    'price', 'costPerUnit', 'fbaStock', 'fbmStock', 'status',
  ];
  const patch = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) patch[f] = req.body[f];
  });
  await product.update(patch);
  res.json({ success: true, data: product });
});

const remove = asyncHandler(async (req, res) => {
  const product = await ownedProduct(req.user.id, req.params.id);
  await product.destroy();
  res.json({ success: true, message: 'Product deleted' });
});

const stats = asyncHandler(async (req, res) => {
  const product = await ownedProduct(req.user.id, req.params.id);

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const metrics = await profitService.analyzeMetrics(product.id, { start: startStr, end: endStr });
  const keywordCount = await Keyword.count({ where: { productId: product.id } });
  const last = await DailySales.findOne({
    where: { productId: product.id },
    order: [['saleDate', 'DESC']],
  });

  res.json({
    success: true,
    data: {
      product,
      last30Days: {
        revenue: metrics.totalRevenue,
        profit: metrics.totalProfit,
        margin: metrics.profitMargin,
        unitsSold: metrics.unitsSold,
      },
      keywordCount,
      lastSale: last,
    },
  });
});

const priceRecommendation = asyncHandler(async (req, res) => {
  await ownedProduct(req.user.id, req.params.id);
  const marketplace = req.query.marketplace || 'amazon';
  const data = await priceOptimizer.recommendPriceAdjustment(req.params.id, marketplace);
  res.json({ success: true, data });
});

const competitors = asyncHandler(async (req, res) => {
  await ownedProduct(req.user.id, req.params.id);
  const rows = await Competitor.findAll({
    where: { productId: req.params.id },
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
  const data = rows.map((c) => ({
    id: c.id,
    marketplace: c.marketplace,
    competitorAsin: c.competitorAsin,
    competitorTitle: c.competitorTitle,
    lastChecked: c.lastChecked,
    price: c.priceHistory && c.priceHistory[0] ? Number(c.priceHistory[0].price) : null,
  }));
  res.json({ success: true, data });
});

const addCompetitor = asyncHandler(async (req, res) => {
  await ownedProduct(req.user.id, req.params.id);
  const { marketplace = 'amazon', competitorAsin, competitorTitle } = req.body;
  const competitor = await Competitor.create({
    productId: req.params.id,
    marketplace,
    competitorAsin,
    competitorTitle,
  });
  res.status(201).json({ success: true, data: competitor });
});

module.exports = {
  list,
  create,
  getOne,
  update,
  remove,
  stats,
  priceRecommendation,
  competitors,
  addCompetitor,
};
