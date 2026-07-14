const { DailyProfit, Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const profitService = require('../services/profitService');

async function assertOwnsProduct(userId, productId) {
  const product = await Product.findOne({ where: { id: productId, userId } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

const daily = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const today = new Date().toISOString().slice(0, 10);
  const row = await DailyProfit.findOne({
    where: { productId: req.params.productId, profitDate: today },
  });
  res.json({
    success: true,
    data: row || {
      productId: req.params.productId,
      profitDate: today,
      totalRevenue: 0,
      totalCosts: 0,
      totalProfit: 0,
      profitMargin: 0,
      unitsSold: 0,
    },
  });
});

const monthly = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  const metrics = await profitService.analyzeMetrics(req.params.productId, { start, end });
  res.json({ success: true, data: metrics });
});

const yearly = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  const end = now.toISOString().slice(0, 10);
  const metrics = await profitService.analyzeMetrics(req.params.productId, { start, end });
  res.json({ success: true, data: metrics });
});

const forecast = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const data = await profitService.forecastMonthlyProfit(req.params.productId);
  res.json({ success: true, data });
});

const chart = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  let productId = req.query.productId || null;
  if (productId) await assertOwnsProduct(req.user.id, productId);

  // When no product is specified, restrict to this user's products.
  if (!productId) {
    const ids = (await Product.findAll({ where: { userId: req.user.id }, attributes: ['id'] })).map(
      (p) => p.id
    );
    const series = await aggregateForUser(ids, days);
    return res.json({ success: true, data: series });
  }

  const series = await profitService.getProfitChart(productId, days);
  return res.json({ success: true, data: series });
});

// Sum the per-product chart series across all of a user's products.
async function aggregateForUser(productIds, days) {
  const base = [];
  for (const id of productIds) {
    // eslint-disable-next-line no-await-in-loop
    const s = await profitService.getProfitChart(id, days);
    base.push(s);
  }
  if (base.length === 0) return profitService.getProfitChart(null, days).then((s) =>
    s.map((d) => ({ ...d, profit: 0, revenue: 0, units: 0 }))
  );

  return base[0].map((_, i) => {
    const date = base[0][i].date;
    let profit = 0;
    let revenue = 0;
    let units = 0;
    base.forEach((series) => {
      profit += series[i].profit;
      revenue += series[i].revenue;
      units += series[i].units;
    });
    return {
      date,
      profit: Number(profit.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      units,
    };
  });
}

module.exports = { daily, monthly, yearly, forecast, chart };
